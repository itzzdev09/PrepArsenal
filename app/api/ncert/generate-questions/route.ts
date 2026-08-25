import { NextResponse } from 'next/server';
import { generateChapterMCQs } from '@/lib/llm';
import { createClient } from '@/utils/supabase/server';
import { NCERT_TRACKS } from '@/lib/ncert-booster';

const CACHE_TARGET = 5;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const chapterId: string | undefined = body?.chapterId;
  if (!chapterId) {
    return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });
  }

  let chapter, track;
  for (const t of NCERT_TRACKS) {
    const c = t.chapters.find(ch => ch.id === chapterId);
    if (c) { chapter = c; track = t; break; }
  }
  if (!chapter || !track) {
    return NextResponse.json({ error: 'Unknown chapterId' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('ncert_chapter_tests')
    .select('id, question_text, options, correct_option, explanation')
    .eq('chapter_id', chapterId)
    .limit(CACHE_TARGET);

  if (existing && existing.length >= CACHE_TARGET) {
    return NextResponse.json({ questions: existing });
  }

  const generated = await generateChapterMCQs(chapter.title, track.subject, chapter.notes);

  const rows = generated.map(q => ({
    chapter_id: chapterId,
    subject: track.subject,
    question_text: q.questionText,
    options: q.options,
    correct_option: q.correctOption,
    explanation: q.explanation,
  }));

  const { data: inserted, error } = await supabase
    .from('ncert_chapter_tests')
    .insert(rows)
    .select('id, question_text, options, correct_option, explanation');

  if (error || !inserted) {
    console.error('Error caching generated chapter test:', error);
    return NextResponse.json({ questions: rows });
  }

  return NextResponse.json({ questions: inserted });
}
