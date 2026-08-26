import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { buildChapterTest } from '@/lib/ncert-test-builder';

const TEST_SIZE = 5;

/**
 * Assembles a chapter test from hand-authored NCERT questions. No language
 * model is involved: previously this route asked Gemini (falling back to Groq)
 * to write five MCQs from the chapter notes, which cost a paid API call per
 * uncached chapter and could introduce facts the notes never stated. Curated
 * rows in `ncert_chapter_tests` still take precedence so an admin can override
 * any chapter; the rest is filled deterministically from the chapter's own
 * authored questions and its nearest neighbours in the same track.
 */
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

  const { data: curated } = await supabase
    .from('ncert_chapter_tests')
    .select('id, question_text, options, correct_option, explanation')
    .eq('chapter_id', chapterId)
    .limit(TEST_SIZE);

  if (curated && curated.length >= TEST_SIZE) {
    return NextResponse.json({ questions: curated });
  }

  const built = buildChapterTest(chapterId, TEST_SIZE);
  if (built.length === 0) {
    return NextResponse.json({ error: 'Unknown chapterId' }, { status: 404 });
  }

  const seen = new Set((curated ?? []).map(row => row.question_text));
  const questions = [
    ...(curated ?? []),
    ...built.filter(question => !seen.has(question.question_text)),
  ].slice(0, TEST_SIZE);

  return NextResponse.json({ questions });
}
