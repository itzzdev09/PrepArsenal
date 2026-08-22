// PrepArsenal — Turso (libSQL/SQLite at Edge) Client
// High-performance edge database for static read-heavy exam data (9GB storage scaling)

import { createClient, type Client } from '@libsql/client/web';
import { questions as seedQuestions, exams as seedExams, topics as seedTopics, type Question } from './data';

let tursoClient: Client | null = null;

export function getTursoClient(): Client | null {
  if (tursoClient) return tursoClient;

  const url = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || 
              process.env.TURSO_DATABASE_URL || 
              process.env.TURSO_URL;

  const authToken = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || 
                    process.env.TURSO_AUTH_TOKEN || 
                    process.env.TURSO_TOKEN;

  if (!url) {
    // If no Turso credentials configured, return null to use graceful fallback
    return null;
  }

  try {
    tursoClient = createClient({
      url,
      authToken: authToken || undefined,
    });
    return tursoClient;
  } catch (err) {
    console.warn('Failed to initialize remote Turso client, using local in-memory fallback', err);
    return null;
  }
}

/**
 * Initializes the SQLite schema on Turso
 */
export async function initTursoSchema(): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

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
  const client = getTursoClient();
  if (!client) {
    return seedExams.map(e => ({ id: e.code, code: e.code, name: e.name, icon: e.icon }));
  }

  try {
    const result = await client.execute('SELECT * FROM exams ORDER BY name ASC');
    if (result.rows.length === 0) {
      return seedExams.map(e => ({ id: e.code, code: e.code, name: e.name, icon: e.icon }));
    }
    return result.rows.map(row => ({
      id: String(row.id),
      code: String(row.code),
      name: String(row.name),
      icon: String(row.icon || '📝'),
    }));
  } catch (error) {
    console.warn('Turso getTursoExams fallback:', error);
    return seedExams.map(e => ({ id: e.code, code: e.code, name: e.name, icon: e.icon }));
  }
}

/**
 * Fetch topics from Turso
 */
export async function getTursoTopics(subject?: string): Promise<Array<{ id: string; subject: string; name: string }>> {
  const client = getTursoClient();
  if (!client) {
    return seedTopics.filter(t => !subject || t.subject.toLowerCase() === subject.toLowerCase()).map(t => ({
      id: t.id,
      subject: t.subject,
      name: t.name,
    }));
  }

  try {
    let query = 'SELECT * FROM topics';
    const args: string[] = [];

    if (subject) {
      query += ' WHERE subject = ?';
      args.push(subject);
    }
    query += ' ORDER BY name ASC';

    const result = await client.execute({ sql: query, args });
    if (result.rows.length === 0) {
      return seedTopics.filter(t => !subject || t.subject.toLowerCase() === subject.toLowerCase()).map(t => ({
        id: t.id,
        subject: t.subject,
        name: t.name,
      }));
    }

    return result.rows.map(row => ({
      id: String(row.id),
      subject: String(row.subject),
      name: String(row.name),
    }));
  } catch (error) {
    console.warn('Turso getTursoTopics fallback:', error);
    return seedTopics.filter(t => !subject || t.subject.toLowerCase() === subject.toLowerCase()).map(t => ({
      id: t.id,
      subject: t.subject,
      name: t.name,
    }));
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
  const client = getTursoClient();
  if (!client) {
    let filtered = [...seedQuestions];
    if (filters.examCode) filtered = filtered.filter(q => q.examCode === filters.examCode);
    if (filters.subject) filtered = filtered.filter(q => q.subject === filters.subject);
    if (filters.topic) filtered = filtered.filter(q => q.topic === filters.topic);
    return filtered.slice(0, filters.limit || 500);
  }

  try {
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
      return seedQuestions;
    }

    return result.rows.map(row => {
      let parsedOptions: string[] = [];
      try {
        parsedOptions = typeof row.options === 'string' ? JSON.parse(row.options) : (row.options as unknown as string[]);
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
    return seedQuestions;
  }
}

/**
 * Ingest / seed questions into Turso
 */
export async function seedTursoQuestions(questionsToSeed: Question[]): Promise<number> {
  const client = getTursoClient();
  if (!client) {
    throw new Error('Turso client not configured. Please check your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local');
  }

  await initTursoSchema();

  // Also seed exams and topics
  for (const ex of seedExams) {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO exams (id, code, name, icon, description, total_questions) VALUES (?, ?, ?, ?, ?, ?)',
      args: [ex.code, ex.code, ex.name, ex.icon, ex.fullName, ex.totalQuestions],
    });
  }

  for (const top of seedTopics) {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO topics (id, subject, name, weightage) VALUES (?, ?, ?, ?)',
      args: [top.id, top.subject, top.name, top.depth || 1],
    });
  }

  const statements = questionsToSeed.map(q => ({
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

/**
 * Insert or update a single question into Turso (Admin)
 */
export async function insertTursoQuestion(q: Question): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
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
    });
    return true;
  } catch (err) {
    console.error('Failed to insert Turso question:', err);
    return false;
  }
}

/**
 * Delete a single question from Turso (Admin)
 */
export async function deleteTursoQuestion(id: string): Promise<boolean> {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
      sql: 'DELETE FROM questions WHERE id = ?',
      args: [id],
    });
    return true;
  } catch (err) {
    console.error('Failed to delete Turso question:', err);
    return false;
  }
}

/**
 * Get count metrics for Turso Edge DB
 */
export async function getTursoDatabaseMetrics(): Promise<{
  totalQuestions: number;
  totalExams: number;
  totalTopics: number;
  isOnline: boolean;
}> {
  const client = getTursoClient();
  if (!client) {
    return {
      totalQuestions: seedQuestions.length,
      totalExams: seedExams.length,
      totalTopics: seedTopics.length,
      isOnline: false,
    };
  }

  try {
    const [qRes, eRes, tRes] = await Promise.all([
      client.execute('SELECT COUNT(*) as total FROM questions'),
      client.execute('SELECT COUNT(*) as total FROM exams'),
      client.execute('SELECT COUNT(*) as total FROM topics'),
    ]);

    return {
      totalQuestions: Number(qRes.rows[0].total) || 0,
      totalExams: Number(eRes.rows[0].total) || 0,
      totalTopics: Number(tRes.rows[0].total) || 0,
      isOnline: true,
    };
  } catch {
    return {
      totalQuestions: seedQuestions.length,
      totalExams: seedExams.length,
      totalTopics: seedTopics.length,
      isOnline: false,
    };
  }
}
