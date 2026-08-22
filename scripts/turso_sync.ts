// PrepArsenal — Turso Edge Database Sync Script
// Syncs local curated questions, exams, and topics into remote Turso (libSQL) database

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually if not loaded
function loadEnv() {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const envPath = path.resolve(process.cwd(), '.env');

  const filesToTry = [envLocalPath, envPath];
  for (const file of filesToTry) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      });
    }
  }
}

loadEnv();

import { getTursoClient, initTursoSchema, seedTursoQuestions } from '../lib/turso';
import { questions } from '../lib/data';

async function main() {
  console.log('🚀 Connecting to Turso Edge Database...');
  const url = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || process.env.TURSO_URL;
  console.log(`🔗 Target URL: ${url ? url.replace(/\/\/.*@/, '//***@') : '(Local / Embedded Fallback)'}`);

  const client = getTursoClient();
  if (!client) {
    console.error('❌ Could not connect to Turso. Please check TURSO_DATABASE_URL / TURSO_AUTH_TOKEN in .env.local');
    process.exit(1);
  }

  console.log('🔄 Initializing Turso Edge Database Schema (exams, topics, questions)...');
  await initTursoSchema();
  console.log('✅ Schema successfully verified & initialized.');

  console.log(`📦 Seeding ${questions.length} curated questions into Turso...`);
  const inserted = await seedTursoQuestions(questions);
  console.log(`🎉 Successfully synced ${inserted} questions, exams, and topics to Turso Edge Database!`);

  const countRes = await client.execute('SELECT COUNT(*) as total FROM questions');
  const examCountRes = await client.execute('SELECT COUNT(*) as total FROM exams');
  const topicCountRes = await client.execute('SELECT COUNT(*) as total FROM topics');

  console.log('----------------------------------------------------');
  console.log(`📊 Turso Database Status:`);
  console.log(`   • Questions: ${countRes.rows[0].total}`);
  console.log(`   • Target Exams: ${examCountRes.rows[0].total}`);
  console.log(`   • Topics: ${topicCountRes.rows[0].total}`);
  console.log('----------------------------------------------------');
  console.log('✨ PrepArsenal is now actively using Turso Edge DB!');
}

main().catch(err => {
  console.error('❌ Turso sync error:', err);
  process.exit(1);
});
