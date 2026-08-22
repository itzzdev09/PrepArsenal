// PrepArsenal — Turso (libSQL/SQLite at Edge) Client
// High-performance edge database for static read-heavy exam data (9GB storage scaling)

import { createClient, type Client } from '@libsql/client';
import { SAMPLE_QUESTIONS, type Question } from './data';

let tursoClient: Client | null = null;

export function getTursoClient(): Client {
  if (tursoClient) return tursoClient;

  const url = process.env.TURSO_DATABASE_URL || 'file:preparsenal-local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

  try {
    tursoClient = createClient({
      url,
      authToken,
    });
    return tursoClient;
  } catch (err) {
    console.warn('Failed to initialize remote Turso client, using local in-memory fallback', err);
    tursoClient = createClient({
      url: ':memory:',
    });
    return tursoClient;
  }
}

/**
 * Initializes the SQLite schema on Turso
 */
export async function initTursoSchema(): Promise<void> {
  const client = getTursoClient();

  await client.batch([
    `CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      total_questions INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      name TEXT NOT NULL,
      weightage INTEGER DEFAULT 1
    );`,
    `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      exam_code TEXT,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      year INTEGER,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      question_text TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON array of strings
      correct_option INTEGER NOT NULL,
      explanation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_code);`,
    `CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);`,
    `CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);`,
  ]);
}

/**
 * Fetch all available exams from Turso Edge DB
 */
export async function getTursoExams(): Promise<Array<{ id: string; code: string; name: string; icon: string }>> {
  try {
    const client = getTursoClient();
    const result = await client.execute('SELECT * FROM exams ORDER BY name ASC');
    if (result.rows.length === 0) {
      return [
        { id: '1', code: 'SSC_CGL', name: 'SSC CGL', icon: '🏛️' },
        { id: '2', code: 'RBI_GRADE_B', name: 'RBI Grade B', icon: '🏦' },
        { id: '3', code: 'RRB_NTPC', name: 'RRB NTPC', icon: '🚆' },
        { id: '4', code: 'ACIO_II', name: 'IB ACIO-II', icon: '🕵️' },
        { id: '5', code: 'NABARD', name: 'NABARD Grade A', icon: '🌾' },
        { id: '6', code: 'UPSC_APFC', name: 'UPSC APFC', icon: '⚖️' },
      ];
    }
    return result.rows.map(row => ({
      id: String(row.id),
      code: String(row.code),
      name: String(row.name),
      icon: String(row.icon || '📝'),
    }));
  } catch (error) {
    console.warn('Turso getTursoExams fallback:', error);
    return [
      { id: '1', code: 'SSC_CGL', name: 'SSC CGL', icon: '🏛️' },
      { id: '2', code: 'RBI_GRADE_B', name: 'RBI Grade B', icon: '🏦' },
      { id: '3', code: 'RRB_NTPC', name: 'RRB NTPC', icon: '🚆' },
      { id: '4', code: 'ACIO_II', name: 'IB ACIO-II', icon: '🕵️' },
      { id: '5', code: 'NABARD', name: 'NABARD Grade A', icon: '🌾' },
      { id: '6', code: 'UPSC_APFC', name: 'UPSC APFC', icon: '⚖️' },
    ];
  }
}

/**
 * Fetch topics from Turso
 */
export async function getTursoTopics(subject?: string): Promise<Array<{ id: string; subject: string; name: string }>> {
  try {
    const client = getTursoClient();
    let query = 'SELECT * FROM topics';
    const args: string[] = [];

    if (subject) {
      query += ' WHERE subject = ?';
      args.push(subject);
    }
    query += ' ORDER BY name ASC';

    const result = await client.execute({ sql: query, args });
    return result.rows.map(row => ({
      id: String(row.id),
      subject: String(row.subject),
      name: String(row.name),
    }));
  } catch (error) {
    console.warn('Turso getTursoTopics error:', error);
    return [];
  }
}

/**
 * Fetch questions from Turso Edge DB
 */
export async function getTursoQuestions(filters: {
  examCode?: string;
  subject?: string;
  topic?: string;
  limit?: number;
} = {}): Promise<Question[]> {
  try {
    const client = getTursoClient();
    let query = 'SELECT * FROM questions WHERE 1=1';
    const args: Array<string | number> = [];

    if (filters.examCode) {
      query += ' AND exam_code = ?';
      args.push(filters.examCode);
    }
    if (filters.subject) {
      query += ' AND subject = ?';
      args.push(filters.subject);
    }
    if (filters.topic) {
      query += ' AND topic = ?';
      args.push(filters.topic);
    }

    query += ' LIMIT ?';
    args.push(filters.limit || 500);

    const result = await client.execute({ sql: query, args });

    if (result.rows.length === 0) {
      // Return sample questions if table empty
      return SAMPLE_QUESTIONS;
    }

    return result.rows.map(row => {
      let parsedOptions: string[] = [];
      try {
        parsedOptions = typeof row.options === 'string' ? JSON.parse(row.options) : (row.options as string[]);
      } catch {
        parsedOptions = ['Option A', 'Option B', 'Option C', 'Option D'];
      }

      return {
        id: String(row.id),
        examCode: String(row.exam_code || 'SSC_CGL'),
        subject: String(row.subject),
        topic: String(row.topic),
        year: Number(row.year) || 2023,
        difficulty: (row.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        questionText: String(row.question_text),
        options: parsedOptions,
        correctOption: Number(row.correct_option),
        explanation: String(row.explanation || ''),
      };
    });
  } catch (error) {
    console.warn('Turso getTursoQuestions fallback to local dataset:', error);
    return SAMPLE_QUESTIONS;
  }
}

/**
 * Ingest / seed questions into Turso
 */
export async function seedTursoQuestions(questions: Question[]): Promise<number> {
  const client = getTursoClient();
  await initTursoSchema();

  const statements = questions.map(q => ({
    sql: `INSERT OR REPLACE INTO questions (
      id, exam_code, subject, topic, year, difficulty, question_text, options, correct_option, explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      q.id,
      q.examCode || 'SSC_CGL',
      q.subject,
      q.topic,
      q.year || 2023,
      q.difficulty || 'medium',
      q.questionText,
      JSON.stringify(q.options),
      q.correctOption,
      q.explanation || '',
    ],
  }));

  const res = await client.batch(statements);
  return res.length;
}
