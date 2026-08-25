"""Minimal Turso (libSQL) HTTP writer.

Uses the sqld/Hrana-over-HTTP v2 pipeline API directly (no extra SDK dependency —
just `requests`, which the pipeline already needs for PDF downloads). Questions
belong in Turso only; Supabase stays reserved for user/auth/site data.
"""

import os
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(REPO_ROOT / '.env.local')
load_dotenv(Path(__file__).resolve().parent / '.env', override=False)

TURSO_URL = os.getenv('TURSO_DATABASE_URL') or os.getenv('NEXT_PUBLIC_TURSO_DATABASE_URL') or os.getenv('TURSO_URL')
TURSO_TOKEN = os.getenv('TURSO_AUTH_TOKEN') or os.getenv('NEXT_PUBLIC_TURSO_AUTH_TOKEN') or os.getenv('TURSO_TOKEN')

SCHEMA_STATEMENTS = [
    """CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        description TEXT,
        total_questions INTEGER DEFAULT 0
    );""",
    """CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        name TEXT NOT NULL,
        weightage INTEGER DEFAULT 1
    );""",
    """CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        exam_code TEXT,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        year INTEGER,
        difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
        question_text TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_option INTEGER NOT NULL,
        explanation TEXT,
        source_url TEXT,
        source_label TEXT,
        source_type TEXT,
        is_verified_pyq INTEGER DEFAULT 1,
        import_batch TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );""",
    "CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_code);",
    "CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);",
    "CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);",
]

# Columns that may be missing if the table was created earlier by lib/turso.ts's
# narrower schema. Adding them is best-effort; "duplicate column" errors are ignored.
EXTRA_COLUMNS = [
    "ALTER TABLE questions ADD COLUMN source_url TEXT;",
    "ALTER TABLE questions ADD COLUMN source_label TEXT;",
    "ALTER TABLE questions ADD COLUMN source_type TEXT;",
    "ALTER TABLE questions ADD COLUMN is_verified_pyq INTEGER DEFAULT 1;",
    "ALTER TABLE questions ADD COLUMN import_batch TEXT;",
]


class TursoWriter:
    def __init__(self):
        if not TURSO_URL:
            raise ValueError(
                'Missing TURSO_DATABASE_URL (or NEXT_PUBLIC_TURSO_DATABASE_URL) in .env.local'
            )
        self.endpoint = TURSO_URL.replace('libsql://', 'https://').rstrip('/') + '/v2/pipeline'
        self.headers = {'Content-Type': 'application/json'}
        if TURSO_TOKEN:
            self.headers['Authorization'] = f'Bearer {TURSO_TOKEN}'

    @staticmethod
    def _arg(value: Any) -> dict:
        if value is None:
            return {'type': 'null'}
        if isinstance(value, bool):
            return {'type': 'integer', 'value': str(int(value))}
        if isinstance(value, int):
            return {'type': 'integer', 'value': str(value)}
        if isinstance(value, float):
            return {'type': 'float', 'value': value}
        return {'type': 'text', 'value': str(value)}

    def _pipeline(self, statements: list[tuple[str, list]]) -> list[dict]:
        requests_payload = [
            {'type': 'execute', 'stmt': {'sql': sql, 'args': [self._arg(a) for a in args]}}
            for sql, args in statements
        ]
        requests_payload.append({'type': 'close'})

        resp = requests.post(
            self.endpoint,
            headers=self.headers,
            json={'requests': requests_payload},
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        results = data.get('results', [])
        for i, r in enumerate(results):
            if r.get('type') == 'error':
                sql_preview = statements[i][0][:100] if i < len(statements) else '(close)'
                raise RuntimeError(f"Turso error on statement [{sql_preview}]: {r.get('error')}")
        return results

    def ensure_schema(self) -> None:
        for stmt in SCHEMA_STATEMENTS:
            self._pipeline([(stmt, [])])
        for stmt in EXTRA_COLUMNS:
            try:
                self._pipeline([(stmt, [])])
            except RuntimeError as e:
                if 'duplicate column' not in str(e).lower():
                    raise

    def upsert_topics(self, topics: list[dict]) -> None:
        statements = [
            (
                'INSERT OR REPLACE INTO topics (id, subject, name, weightage) VALUES (?, ?, ?, ?)',
                [t['id'], t['subject'], t['name'], t.get('weightage', 1)],
            )
            for t in topics
        ]
        for i in range(0, len(statements), 50):
            self._pipeline(statements[i:i + 50])

    def upsert_questions(self, rows: list[dict]) -> int:
        statements = [
            (
                """INSERT OR REPLACE INTO questions (
                    id, exam_code, subject, topic, year, difficulty, question_text, options,
                    correct_option, explanation, source_url, source_label, source_type,
                    is_verified_pyq, import_batch
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    r['id'], r['exam_code'], r['subject'], r['topic'], r['year'], r['difficulty'],
                    r['question_text'], r['options'], r['correct_option'], r.get('explanation', ''),
                    r.get('source_url'), r.get('source_label'), r.get('source_type', 'third_party'),
                    1 if r.get('is_verified_pyq', True) else 0, r.get('import_batch'),
                ],
            )
            for r in rows
        ]
        inserted = 0
        for i in range(0, len(statements), 50):
            self._pipeline(statements[i:i + 50])
            inserted += len(statements[i:i + 50])
        return inserted

    def count_questions(self, exam_code: str | None = None) -> int:
        if exam_code:
            results = self._pipeline([
                ('SELECT COUNT(*) as total FROM questions WHERE exam_code = ?', [exam_code])
            ])
        else:
            results = self._pipeline([('SELECT COUNT(*) as total FROM questions', [])])
        row = results[0]['response']['result']['rows'][0]
        return int(row[0]['value'])
