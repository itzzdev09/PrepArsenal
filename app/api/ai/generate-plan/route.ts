import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserProfile, getTrends, updateStudyPlan } from '@/lib/db';
import { analyzeUserWeaknesses } from '@/lib/ai/weakness-analyzer';
import { generateAIStudyPlan } from '@/lib/ai/study-plan-generator';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user reviews with questions join
    const { data: reviews } = await supabase
      .from('user_question_reviews')
      .select('question_id, is_correct, time_taken_seconds, last_reviewed_at, questions(exam_code, subject, topic_id, difficulty)')
      .eq('user_id', user.id)
      .order('last_reviewed_at', { ascending: false })
      .limit(300);

    // 2. Fetch trends and profile
    const [profile, trends] = await Promise.all([
      getUserProfile(supabase, user.id),
      getTrends(supabase),
    ]);

    const targetExams = profile?.target_exams || ['SSC_CGL'];
    const examDates = profile?.exam_dates || {};

    // 3. Analyze cognitive weaknesses & graph propagation
    const weaknessProfile = analyzeUserWeaknesses((reviews || []) as any, trends);

    // 4. Generate AI Study Plan via LLM / Heuristics
    const planResponse = await generateAIStudyPlan(weaknessProfile, targetExams, examDates);

    // 5. Persist the generated plan to user's profile
    if (planResponse.dbItems.length > 0) {
      await updateStudyPlan(supabase, user.id, planResponse.dbItems);
    }

    return NextResponse.json({
      success: true,
      weaknessProfile,
      plan: planResponse,
    });
  } catch (error: any) {
    console.error('Error generating AI study plan:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
