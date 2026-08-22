// PrepArsenal — Turso Edge Database Sync Script
// Syncs local curated questions and NCERT questions into Turso (libSQL)

import { getTursoClient, initTursoSchema, seedTursoQuestions } from '../lib/turso';
import { SAMPLE_QUESTIONS } from '../lib/data';

async function main() {
  console.log('🔄 Initializing Turso Edge Database Schema...');
  await initTursoSchema();
  console.log('✅ Schema initialized.');

  console.log(`📦 Seeding ${SAMPLE_QUESTIONS.length} curated questions into Turso...`);
  const inserted = await seedTursoQuestions(SAMPLE_QUESTIONS);
  console.log(`🚀 Successfully synced ${inserted} questions to Turso Edge Database!`);

  const client = getTursoClient();
  const countRes = await client.execute('SELECT COUNT(*) as total FROM questions');
  console.log(`📊 Total questions in Turso Edge DB: ${countRes.rows[0].total}`);
}

main().catch(err => {
  console.error('❌ Turso sync error:', err);
  process.exit(1);
});
