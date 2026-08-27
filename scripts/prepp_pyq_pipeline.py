"""Import full shift-wise previous-year papers from prepp.in into Supabase.

Each prepp paper page is one exam sitting — a single date and shift — carrying
the complete paper (typically 100 questions) with the correct option flagged and
a worked solution. This imports them whole, preserving date/shift so a mock test
can replay an actual sitting rather than a topic-shuffled sample.

No LLM is used anywhere: question structure comes from the page's own JSON, and
topic assignment reuses the keyword rules in pyq_parser.

Usage:
    python scripts/prepp_pyq_pipeline.py --dry-run
    python scripts/prepp_pyq_pipeline.py --exam SSC_CGL
    python scripts/prepp_pyq_pipeline.py --limit 5      # papers per exam
"""

from __future__ import annotations

import argparse
import json
import re
import time
import uuid
from pathlib import Path

import requests

from db_client import get_db_client
from prepp_scraper import list_paper_urls, scrape_paper
from pyq_parser import TOPICS, classify, estimate_difficulty

REPORT_PATH = Path(__file__).resolve().parent / 'prepp_import_report.json'
BATCH = f"prepp_shiftwise_{time.strftime('%Y_%m_%d')}"

# Stable namespace for deterministic question ids (see to_row).
QUESTION_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_URL, 'https://preparsenal.app/prepp-pyq')

# Exam code -> prepp practice-papers listing. Only exams prepp actually indexes
# shift-wise are listed; RBI/NABARD/SEBI are covered by the Edutap PYQ books in
# pdf_pyq_pipeline.py instead.
LISTINGS = {
    'SSC_CGL': 'https://prepp.in/ssc-cgl-exam/practice-papers',
    'ACIO2': 'https://prepp.in/ib-acio-exam/practice-papers',
    'RRB_NTPC': 'https://prepp.in/rrb-ntpc-exam/practice-papers',
    'UPSC_APFC': 'https://prepp.in/upsc-epfo-exam/practice-papers',
}

# Papers whose text is predominantly Devanagari are skipped: the app is
# English-only and the topic classifier is keyed on English keywords.
DEVANAGARI = re.compile(r'[ऀ-ॿ]')


def is_english(paper) -> bool:
    sample = ' '.join(q.text for q in paper.questions[:25])
    if not sample:
        return False
    return len(DEVANAGARI.findall(sample)) / max(len(sample), 1) < 0.05


def to_row(question, exam_code: str, paper) -> dict:
    subject, topic_id = classify(question.text, question.options, question.subject)
    dedupe_key = re.sub(r'\s+', ' ', question.text.lower())[:400]

    # questions.id is a UUID column, so derive a deterministic UUIDv5 from the
    # sitting plus the question text. Re-running the import then upserts over
    # the same rows instead of duplicating them.
    qid = str(uuid.uuid5(
        QUESTION_NAMESPACE,
        f'{exam_code}|{paper.year}|{paper.shift or ""}|{dedupe_key}',
    ))

    return {
        'id': qid,
        'exam_code': exam_code,
        'year': paper.year,
        'shift': paper.shift,
        'subject': subject,
        'topic_id': topic_id,
        'question_text': question.text,
        'options': question.options,
        'correct_option': question.correct_option,
        'explanation': question.explanation or 'Answer as published in the source question paper.',
        'difficulty': estimate_difficulty(question.text, topic_id),
        'metadata': {
            'source': paper.name,
            'source_url': paper.url,
            'source_type': 'pyq',
            'is_verified_pyq': True,
            'language': 'English',
            'shift': paper.shift,
            'section': question.section,
            'import_batch': BATCH,
        },
        '_dedupe_key': dedupe_key,
    }


# supabase/schema.sql declares questions.shift, but deployed databases created
# before that line exists without it. The shift is also carried in
# metadata.shift, so drop the top-level column rather than require a migration.
# Run supabase/add_questions_shift_column.sql to get it as a real column.
_HAS_SHIFT_COLUMN = True


def _upsert(db, chunk: list[dict]) -> int:
    global _HAS_SHIFT_COLUMN

    if _HAS_SHIFT_COLUMN:
        try:
            db.table('questions').upsert(chunk, on_conflict='id').execute()
            return len(chunk)
        except Exception as error:
            if 'shift' not in str(error):
                raise
            print("  [note] this database has no questions.shift column — "
                  "keeping shift in metadata.shift only")
            _HAS_SHIFT_COLUMN = False

    trimmed = [{k: v for k, v in row.items() if k != 'shift'} for row in chunk]
    db.table('questions').upsert(trimmed, on_conflict='id').execute()
    return len(trimmed)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--exam', help='Only this exam code')
    parser.add_argument('--limit', type=int, help='Max papers per exam')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--delay', type=float, default=1.5, help='Seconds between page fetches')
    args = parser.parse_args()

    exam_codes = [args.exam] if args.exam else list(LISTINGS)
    session = requests.Session()
    db = None if args.dry_run else get_db_client()

    if db:
        for topic_id, (name, subject) in TOPICS.items():
            db.table('topics').upsert({'id': topic_id, 'name': name, 'subject': subject}).execute()

    report = {'batch': BATCH, 'exams': {}}
    grand_total = 0

    for exam_code in exam_codes:
        listing = LISTINGS.get(exam_code)
        if not listing:
            print(f'[{exam_code}] no prepp listing configured, skipping')
            continue

        urls = list_paper_urls(listing, session)
        if args.limit:
            urls = urls[:args.limit]
        print(f'\n[{exam_code}] {len(urls)} paper page(s) to fetch')

        rows: dict[str, dict] = {}
        papers_done = 0
        skipped_hindi = 0

        for i, url in enumerate(urls, 1):
            paper = scrape_paper(url, session)
            time.sleep(args.delay)
            if not paper or not paper.questions:
                print(f'  [{i}/{len(urls)}] no questions: {url.rsplit("/", 1)[-1][:60]}')
                continue
            if not is_english(paper):
                skipped_hindi += 1
                print(f'  [{i}/{len(urls)}] skipped (Hindi): {paper.name[:60]}')
                continue

            for question in paper.questions:
                row = to_row(question, exam_code, paper)
                if row['year'] is None:
                    continue
                rows[row['_dedupe_key']] = row
            papers_done += 1
            print(f'  [{i}/{len(urls)}] {paper.name[:58]} -> {len(paper.questions)}q (running unique: {len(rows)})')

        payload = list(rows.values())
        for row in payload:
            row.pop('_dedupe_key', None)

        print(f'[{exam_code}] {papers_done} papers, {len(payload)} unique questions'
              f'{f", {skipped_hindi} Hindi papers skipped" if skipped_hindi else ""}')

        if db and payload:
            written = 0
            for start in range(0, len(payload), 200):
                chunk = payload[start:start + 200]
                written += _upsert(db, chunk)
            print(f'[{exam_code}] wrote {written} questions to Supabase')
            grand_total += written

        report['exams'][exam_code] = {
            'papers': papers_done,
            'hindi_skipped': skipped_hindi,
            'questions': len(payload),
        }

    REPORT_PATH.write_text(json.dumps(report, indent=2))
    print(f'\nReport written to {REPORT_PATH}')
    if not args.dry_run:
        print(f'Total questions written: {grand_total}')


if __name__ == '__main__':
    main()
