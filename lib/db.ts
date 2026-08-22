import { SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  target_exams: string[];
  exam_dates: Record<string, any>;
  streak_count: number;
  last_study_date: string | null;
  total_study_minutes: number;
  created_at: string;
}

export async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function createUserProfile(
  supabase: SupabaseClient, 
  userId: string, 
  fullName: string, 
  targetExams: string[]
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        full_name: fullName,
        target_exams: targetExams,
        streak_count: 0,
        total_study_minutes: 0,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', JSON.stringify(error, null, 2));
    return null;
  }
  return data as UserProfile;
}

export async function updateStreak(supabase: SupabaseClient, userId: string): Promise<number> {
  const profile = await getUserProfile(supabase, userId);
  if (!profile) return 0;

  const today = new Date().toISOString().split('T')[0];
  const lastDate = profile.last_study_date ? new Date(profile.last_study_date).toISOString().split('T')[0] : null;

  if (lastDate === today) {
    return profile.streak_count; // Already studied today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newStreak = profile.streak_count;

  if (lastDate === yesterday) {
    newStreak += 1;
  } else if (lastDate !== today) {
    newStreak = 1; // Streak broken
  }

  const { error } = await supabase
    .from('profiles')
    .update({ streak_count: newStreak, last_study_date: today })
    .eq('id', userId);

  if (error) {
    console.error('Error updating streak:', error);
  }

  return newStreak;
}

// Analytics Helpers
export async function getOverallAccuracy(supabase: SupabaseClient, userId: string): Promise<number> {
  // Wait, our DB tracks 'user_question_reviews' which has 'is_correct' boolean
  const { data, error } = await supabase
    .from('user_question_reviews')
    .select('is_correct')
    .eq('user_id', userId);

  if (error || !data || data.length === 0) return 0;

  const correct = data.filter(r => r.is_correct).length;
  return Math.round((correct / data.length) * 100);
}

export async function getTotalQuestionsAttempted(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_question_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) return 0;
  return count || 0;
}

// Practice Session / FSRS
export async function savePracticeSession(
  supabase: SupabaseClient,
  userId: string,
  sessionData: {
    questionIds: string[];
    answers: Record<string, number>;
    correctOptions: Record<string, number>;
    timeTaken: number;
  }
): Promise<boolean> {
  const avgTimePerQuestion = Math.max(1, Math.round(sessionData.timeTaken / sessionData.questionIds.length));
  
  const reviews = sessionData.questionIds.map(qid => {
    const isCorrect = sessionData.answers[qid] === sessionData.correctOptions[qid];
    
    // Very basic FSRS initial mock state (since we aren't running the full FSRS algo here yet)
    // We will just increment next_review_due by 1 day for wrong, 3 days for correct
    const nextReviewDays = isCorrect ? 3 : 1;
    const nextReviewDue = new Date(Date.now() + nextReviewDays * 86400000).toISOString();

    return {
      user_id: userId,
      question_id: qid,
      is_correct: isCorrect,
      time_taken_seconds: avgTimePerQuestion,
      fsrs_state: { stability: isCorrect ? 2 : 1, difficulty: isCorrect ? 5 : 7 }, // placeholder
      next_review_due: nextReviewDue,
      review_count: 1, // Note: In a real app, you'd fetch the existing review and increment this
      last_reviewed_at: new Date().toISOString()
    };
  });

  // Upsert the reviews
  const { error } = await supabase
    .from('user_question_reviews')
    .upsert(reviews, { onConflict: 'user_id, question_id' });

  if (error) {
    console.error('Error saving practice session:', error);
    return false;
  }
  
  return true;
}

// AI Tutor Chat History
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  questionId?: string;
}

export async function getChatHistory(supabase: SupabaseClient, userId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('messages')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return [];
  return data.messages as ChatMessage[];
}

export async function saveChatHistory(supabase: SupabaseClient, userId: string, messages: ChatMessage[]): Promise<boolean> {
  const { data: existing } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('ai_conversations')
      .update({ messages, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    return !error;
  } else {
    const { error } = await supabase
      .from('ai_conversations')
      .insert([{ user_id: userId, messages }]);
    return !error;
  }
}

// Data Fetching for Practice Mode
export async function getExams(supabase: SupabaseClient) {
  const { data } = await supabase.from('exams').select('*');
  return data || [];
}

export async function getTopics(supabase: SupabaseClient) {
  const { data } = await supabase.from('topics').select('*');
  return data || [];
}

export async function getQuestions(
  supabase: SupabaseClient, 
  filters?: { examCode?: string; subject?: string; topic?: string; limit?: number }
) {
  let query = supabase.from('questions').select('*');
  
  if (filters?.examCode) query = query.eq('exam_code', filters.examCode);
  if (filters?.subject) query = query.eq('subject', filters.subject);
  if (filters?.topic) query = query.eq('topic_id', filters.topic);
  
  // Note: For real random selection, you'd use a postgres function or just fetch and shuffle.
  // We'll fetch up to 100 and shuffle on the client.
  const { data, error } = await query.limit(100);
  
  if (error || !data) {
    console.error('Error fetching questions:', error);
    return [];
  }
  
  // Map snake_case from DB to camelCase for UI
  return data.map(q => ({
    id: q.id,
    examCode: q.exam_code,
    year: q.year,
    shift: q.shift,
    subject: q.subject,
    topic: q.topic_id,
    subtopic: q.subtopic,
    questionText: q.question_text,
    options: q.options,
    correctOption: q.correct_option,
    explanation: q.explanation,
    difficulty: q.difficulty,
  }));
}

// ===== PHASE 5: TRENDS & STUDY PLANNER =====

export interface TrendAnalytics {
  id: string;
  topic_id: string;
  exam_code: string;
  frequency_score: number;
  recency_weight: number;
  prediction_score: number;
  difficulty_trend: 'easier' | 'harder' | 'stable';
  last_analyzed_at: string;
}

export async function getTrends(supabase: SupabaseClient, examCodes?: string[]): Promise<TrendAnalytics[]> {
  let query = supabase.from('trend_analytics').select('*');
  
  if (examCodes && examCodes.length > 0) {
    query = query.in('exam_code', examCodes);
  }
  
  // Get the top highest predictions
  const { data, error } = await query.order('prediction_score', { ascending: false }).limit(20);
  
  if (error) {
    console.error('Error fetching trends:', error);
    return [];
  }
  
  return data as TrendAnalytics[];
}

export interface StudyPlanItem {
  id: string;
  topicId: string;
  topicName: string;
  subject: string;
  status: 'todo' | 'in-progress' | 'mastered';
  addedAt: string;
}

export async function getStudyPlan(supabase: SupabaseClient, userId: string): Promise<StudyPlanItem[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();
    
  if (error || !data || !data.exam_dates) return [];
  
  const examDates = data.exam_dates as Record<string, any>;
  return (examDates.study_plan as StudyPlanItem[]) || [];
}

export async function updateStudyPlan(
  supabase: SupabaseClient, 
  userId: string, 
  plan: StudyPlanItem[]
): Promise<boolean> {
  // First fetch existing exam_dates to merge
  const { data, error: fetchErr } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();
    
  if (fetchErr) return false;
  
  const examDates = (data.exam_dates as Record<string, any>) || {};
  examDates.study_plan = plan;
  
  const { error } = await supabase
    .from('profiles')
    .update({ exam_dates: examDates })
    .eq('id', userId);
    
    if (error) {
    console.error('Error updating study plan:', error);
    return false;
  }
  return true;
}

// ===== PHASE 6: SMART NOTES & FORMULA VAULT =====

export interface SmartNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  updatedAt: string;
}

export async function getSmartNotes(supabase: SupabaseClient, userId: string): Promise<SmartNote[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();
    
  if (error || !data || !data.exam_dates) return [];
  
  const examDates = data.exam_dates as Record<string, any>;
  return (examDates.smart_notes as SmartNote[]) || [];
}

export async function updateSmartNotes(
  supabase: SupabaseClient, 
  userId: string, 
  notes: SmartNote[]
): Promise<boolean> {
  const { data, error: fetchErr } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();
    
  if (fetchErr) return false;
  
  const examDates = (data.exam_dates as Record<string, any>) || {};
  examDates.smart_notes = notes;
  
  const { error } = await supabase
    .from('profiles')
    .update({ exam_dates: examDates })
    .eq('id', userId);
    
  return !error;
}

export async function getFavoriteFormulas(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();
    
  if (error || !data || !data.exam_dates) return [];
  
  const examDates = data.exam_dates as Record<string, any>;
  return (examDates.favorite_formulas as string[]) || [];
}

export async function updateFavoriteFormulas(
  supabase: SupabaseClient, 
  userId: string, 
  formulaIds: string[]
): Promise<boolean> {
  const { data, error: fetchErr } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();
    
  if (fetchErr) return false;
  
  const examDates = (data.exam_dates as Record<string, any>) || {};
  examDates.favorite_formulas = formulaIds;
  
  const { error } = await supabase
    .from('profiles')
    .update({ exam_dates: examDates })
    .eq('id', userId);
    
  return !error;
}
