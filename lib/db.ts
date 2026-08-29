import { SupabaseClient } from '@supabase/supabase-js';
import { 
  getTursoExams, 
  getTursoTopics, 
  getTursoQuestions, 
  insertTursoQuestion, 
  deleteTursoQuestion, 
  getTursoDatabaseMetrics 
} from './turso';
import { questions as seedQuestions, exams as seedExams, type Question } from './data';
import {
  getCachedQuestions,
  cacheQuestions,
  getCachedExams,
  cacheExams,
  getCachedTopics,
  cacheTopics,
  checkRateLimit,
  invalidateQuestionsCache,
  invalidateExamsCache,
  invalidateTopicsCache
} from './cache/redis-cache';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  target_exams: string[];
  exam_dates: Record<string, any>;
  streak_count: number;
  last_study_date: string | null;
  total_study_minutes: number;
  created_at: string;
  xp?: number;
  current_level?: number;
  role?: 'user' | 'admin';
}

export async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  
  const examDates = (data.exam_dates as Record<string, any>) || {};
  return {
    ...data,
    phone_number: examDates.phone_number || '',
    bio: examDates.bio || '',
    role: data.role || 'user',
    xp: examDates.xp || 0,
    current_level: examDates.current_level || 1
  } as UserProfile;
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: {
    full_name?: string;
    phone_number?: string;
    bio?: string;
    target_exams?: string[];
  }
): Promise<boolean> {
  const profile = await getUserProfile(supabase, userId);
  const currentExamDates = profile?.exam_dates || {};

  const updatedExamDates = {
    ...currentExamDates,
    ...(updates.phone_number !== undefined ? { phone_number: updates.phone_number } : {}),
    ...(updates.bio !== undefined ? { bio: updates.bio } : {}),
  };

  const payload: any = {
    exam_dates: updatedExamDates,
  };

  if (updates.full_name !== undefined) {
    payload.full_name = updates.full_name;
  }
  if (updates.target_exams !== undefined) {
    payload.target_exams = updates.target_exams;
  }

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
  return true;
}

export async function getAllUserProfiles(supabase: SupabaseClient): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return data.map(d => {
      const ed = (d.exam_dates as Record<string, any>) || {};
      return {
        ...d,
        phone_number: ed.phone_number || '',
        bio: ed.bio || '',
        role: d.role || 'user',
        xp: ed.xp || 0,
        current_level: ed.current_level || 1
      } as UserProfile;
    });
  } catch (err) {
    console.error('Error fetching all user profiles:', err);
    return [];
  }
}

export async function saveAdminQuestion(
  supabase: SupabaseClient,
  question: Question
): Promise<boolean> {
  // Sync to Turso Edge DB
  await insertTursoQuestion(question);

  // Sync to Supabase
  try {
    await supabase.from('questions').upsert({
      id: question.id,
      exam_code: question.examCode,
      subject: question.subject,
      topic: question.topic,
      year: question.year,
      difficulty: question.difficulty,
      question_text: question.questionText,
      options: question.options,
      correct_option: question.correctOption,
      explanation: question.explanation,
    });
  } catch (err) {
    console.warn('Supabase question upsert notice:', err);
  }

  // Invalidate relevant cache entries
  await invalidateQuestionsCache({
    examCode: question.examCode,
    subject: question.subject,
    topic: question.topic,
  });

  return true;
}

export async function deleteAdminQuestion(
  supabase: SupabaseClient,
  questionId: string
): Promise<boolean> {
  await deleteTursoQuestion(questionId);

  try {
    await supabase.from('questions').delete().eq('id', questionId);
  } catch (err) {
    console.warn('Supabase question delete notice:', err);
  }

  // Invalidate all question caches since we don't have the question details
  await invalidateQuestionsCache();

  return true;
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

export async function updateTargetExams(
  supabase: SupabaseClient, 
  userId: string, 
  targetExams: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ target_exams: targetExams })
    .eq('id', userId);

  if (error) {
    console.error('Error updating target exams:', error);
    return false;
  }
  return true;
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

export async function getUserAnalytics(supabase: SupabaseClient, userId: string) {
  // Fetch profile for XP/Level
  const profile = await getUserProfile(supabase, userId);
  
  // Fetch up to 500 recent reviews for charts
  const { data: reviews } = await supabase
    .from('user_question_reviews')
    .select('is_correct, last_reviewed_at, questions(subject)')
    .eq('user_id', userId)
    .order('last_reviewed_at', { ascending: false })
    .limit(500);
    
  return {
    profile,
    reviews: reviews || []
  };
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
  
  // Award XP and Level up
  const profileData = await supabase.from('profiles').select('exam_dates').eq('id', userId).single();
  const examDates = (profileData.data?.exam_dates as Record<string, any>) || {};
  
  let currentXp = examDates.xp || 0;
  let currentLevel = examDates.current_level || 1;
  
  const correctCount = sessionData.questionIds.filter(qid => sessionData.answers[qid] === sessionData.correctOptions[qid]).length;
  const wrongCount = sessionData.questionIds.length - correctCount;
  
  // 10 XP per correct, 2 XP per wrong (effort points)
  const xpGained = (correctCount * 10) + (wrongCount * 2);
  currentXp += xpGained;
  
  // Simple leveling formula: Level N requires (N * 100) XP. 
  // For example, Level 1 -> 2 needs 100 XP, 2 -> 3 needs 200 XP.
  while (currentXp >= currentLevel * 100) {
    currentXp -= currentLevel * 100;
    currentLevel += 1;
  }
  
  examDates.xp = currentXp;
  examDates.current_level = currentLevel;
  
  await supabase.from('profiles').update({ exam_dates: examDates }).eq('id', userId);
  
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

// Data Fetching for Practice Mode (Edge Turso with Supabase & local fallback)
export async function getExams(supabase: SupabaseClient) {
  // Check Redis cache first
  const cached = await getCachedExams();
  if (cached && cached.length > 0) {
    return cached;
  }

  // Rate limiting check
  const rateLimit = await checkRateLimit('getExams', 'global', 200);
  if (!rateLimit.allowed) {
    console.warn('Rate limit exceeded for getExams, serving stale cache if available');
    return cached || [];
  }

  try {
    const tursoExams = await getTursoExams();
    if (tursoExams && tursoExams.length > 0) {
      await cacheExams(tursoExams);
      return tursoExams;
    }
  } catch {
    // Fallback to Supabase
  }

  const { data } = await supabase.from('exams').select('*');
  const result = data || [];
  
  // Cache the result
  if (result.length > 0) {
    await cacheExams(result);
  }
  
  return result;
}

export async function getTopics(supabase: SupabaseClient, subject?: string) {
  // Check Redis cache first
  const cached = await getCachedTopics(subject);
  if (cached && cached.length > 0) {
    return cached;
  }

  // Rate limiting check
  const rateLimit = await checkRateLimit('getTopics', `global:${subject || 'all'}`, 300);
  if (!rateLimit.allowed) {
    console.warn('Rate limit exceeded for getTopics, serving stale cache if available');
    return cached || [];
  }

  try {
    const tursoTopics = await getTursoTopics(subject);
    if (tursoTopics && tursoTopics.length > 0) {
      await cacheTopics(tursoTopics, subject);
      return tursoTopics;
    }
  } catch {
    // Fallback to Supabase
  }

  let query = supabase.from('topics').select('*');
  if (subject) query = query.eq('subject', subject);
  
  const { data } = await query;
  const result = data || [];
  
  // Cache the result
  if (result.length > 0) {
    await cacheTopics(result, subject);
  }
  
  return result;
}

export async function getQuestions(
  supabase: SupabaseClient, 
  filters?: { examCode?: string; subject?: string; topic?: string; tier?: string; limit?: number }
) {
  // Check Redis cache first
  const cacheFilters = {
    examCode: filters?.examCode,
    subject: filters?.subject,
    topic: filters?.topic,
    limit: filters?.limit || 100,
  };
  
  const cached = await getCachedQuestions(cacheFilters);
  if (cached && cached.data.length > 0) {
    return cached.data;
  }

  // Rate limiting check
  const rateLimitKey = `${filters?.examCode || 'all'}:${filters?.subject || 'all'}:${filters?.topic || 'all'}`;
  const rateLimit = await checkRateLimit('getQuestions', rateLimitKey, 500);
  if (!rateLimit.allowed) {
    console.warn('Rate limit exceeded for getQuestions, serving stale cache if available');
    return cached?.data || [];
  }

  try {
    const tursoQuestions = await getTursoQuestions({
      examCode: filters?.examCode,
      subject: filters?.subject,
      topic: filters?.topic,
      limit: filters?.limit || 100,
    });
    if (tursoQuestions && tursoQuestions.length > 0) {
      await cacheQuestions(cacheFilters, tursoQuestions);
      return tursoQuestions;
    }
  } catch {
    // Fallback to Supabase
  }

  let query = supabase.from('questions').select('*');
  
  if (filters?.examCode) query = query.eq('exam_code', filters.examCode);
  if (filters?.subject) query = query.eq('subject', filters.subject);
  if (filters?.topic) query = query.eq('topic_id', filters.topic);
  
  if (filters?.tier) {
    query = query.contains('metadata', { tier: filters.tier });
  }
  
  const { data, error } = await query.limit(filters?.limit || 100);

  if (error || !data || data.length === 0) {
    if (error) console.error('Error fetching questions from Supabase fallback:', error);
    // Last resort only: the bundled demo set, filtered to what was asked for.
    let seeded = [...seedQuestions];
    if (filters?.examCode) seeded = seeded.filter(q => q.examCode === filters.examCode);
    if (filters?.subject) seeded = seeded.filter(q => q.subject === filters.subject);
    if (filters?.topic) seeded = seeded.filter(q => q.topic === filters.topic);
    const result = seeded.slice(0, filters?.limit || 100);
    
    // Cache even the seed data
    await cacheQuestions(cacheFilters, result);
    return result;
  }

  const result = data.map(q => ({
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
    metadata: q.metadata,
  }));
  
  // Cache the result
  await cacheQuestions(cacheFilters, result);
  return result;
}

export interface QuestionTextMatch {
  question_text: string;
  exam_code: string;
  year: number;
}

export async function getQuestionMatchesByText(
  supabase: SupabaseClient,
  questionTexts: string[]
): Promise<QuestionTextMatch[]> {
  if (questionTexts.length === 0) return [];

  const { data, error } = await supabase
    .from('questions')
    .select('question_text, exam_code, year')
    .in('question_text', questionTexts);

  if (error || !data) {
    console.error('Error fetching matching PYQs:', error);
    return [];
  }

  return data as QuestionTextMatch[];
}

export async function getExamQuestionCounts(supabase: SupabaseClient): Promise<Record<string, number>> {
  // Count server-side, one exact HEAD query per exam. Fetching every row and
  // counting client-side silently undercounted: PostgREST caps a response at
  // 1000 rows, so once the pool grew past that only the exams appearing in the
  // first page were counted at all — the rest reported zero questions.
  const entries = await Promise.all(
    seedExams.map(async exam => {
      const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('exam_code', exam.code);

      if (error) {
        console.error(`Error counting questions for ${exam.code}:`, error);
        return [exam.code, 0] as const;
      }
      return [exam.code, count || 0] as const;
    })
  );

  return Object.fromEntries(entries);
}

// ===== PHASE 5: TRENDS & STUDY PLANNER =====

export interface TrendAnalytics {
  id: string;
  topic_id: string;
  exam_code: string;
  /** Questions seen per exam year, e.g. { "2021": 7, "2022": 4 }. */
  yearly_frequencies: Record<string, number>;
  prediction_score: number;
  last_analyzed_at: string;
}

/** Mean questions per year, derived from the yearly breakdown. */
export function averagePerYear(trend: TrendAnalytics): number {
  const counts = Object.values(trend.yearly_frequencies || {});
  if (counts.length === 0) return 0;
  return counts.reduce((sum, n) => sum + n, 0) / counts.length;
}

/** Exam years covered by a set of trends, ascending. */
export function trendYears(trends: TrendAnalytics[]): number[] {
  const years = new Set<number>();
  trends.forEach(t => Object.keys(t.yearly_frequencies || {}).forEach(y => years.add(Number(y))));
  return [...years].sort((a, b) => a - b);
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

// ===== NCERT BOOSTER: chapter-read progress & generated chapter tests =====

export interface NcertChapterProgress {
  readAt: string;
  lastTestScore?: number;
  testedAt?: string;
}

export interface NcertGeneratedQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  /** Set by /api/ncert/generate-questions when the item was pulled from a
   * neighbouring chapter to fill out the test. Absent for curated rows. */
  origin?: 'chapter' | 'revision';
  sourceChapterTitle?: string;
}

export async function getNcertProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, NcertChapterProgress>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();

  if (error || !data || !data.exam_dates) return {};

  const examDates = data.exam_dates as Record<string, any>;
  return (examDates.ncert_progress as Record<string, NcertChapterProgress>) || {};
}

export async function markChapterRead(
  supabase: SupabaseClient,
  userId: string,
  chapterId: string
): Promise<boolean> {
  const { data, error: fetchErr } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();

  if (fetchErr) return false;

  const examDates = (data.exam_dates as Record<string, any>) || {};
  const progress = (examDates.ncert_progress as Record<string, NcertChapterProgress>) || {};

  if (!progress[chapterId]) {
    progress[chapterId] = { readAt: new Date().toISOString() };
  }
  examDates.ncert_progress = progress;

  const { error } = await supabase
    .from('profiles')
    .update({ exam_dates: examDates })
    .eq('id', userId);

  return !error;
}

export async function recordChapterTestResult(
  supabase: SupabaseClient,
  userId: string,
  chapterId: string,
  scorePercent: number
): Promise<boolean> {
  const { data, error: fetchErr } = await supabase
    .from('profiles')
    .select('exam_dates')
    .eq('id', userId)
    .single();

  if (fetchErr) return false;

  const examDates = (data.exam_dates as Record<string, any>) || {};
  const progress = (examDates.ncert_progress as Record<string, NcertChapterProgress>) || {};

  progress[chapterId] = {
    readAt: progress[chapterId]?.readAt || new Date().toISOString(),
    lastTestScore: scorePercent,
    testedAt: new Date().toISOString(),
  };
  examDates.ncert_progress = progress;

  const { error } = await supabase
    .from('profiles')
    .update({ exam_dates: examDates })
    .eq('id', userId);

  if (error) {
    console.error('Error recording chapter test result:', error);
    return false;
  }

  await updateStreak(supabase, userId);
  return true;
}

export async function getNcertChapterTest(
  supabase: SupabaseClient,
  chapterId: string
): Promise<NcertGeneratedQuestion[]> {
  const { data, error } = await supabase
    .from('ncert_chapter_tests')
    .select('id, question_text, options, correct_option, explanation')
    .eq('chapter_id', chapterId);

  if (error || !data) return [];
  return data as NcertGeneratedQuestion[];
}

// ===== GK BOOSTER: daily current-affairs review queue =====

export interface GkDailyItem {
  id: string;
  item_date: string;
  category: string;
  headline: string;
  summary: string;
  source_url: string | null;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export async function getPendingGkItems(supabase: SupabaseClient): Promise<GkDailyItem[]> {
  const { data, error } = await supabase
    .from('gk_daily_items')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as GkDailyItem[];
}

export async function getApprovedGkItems(
  supabase: SupabaseClient,
  limit = 30
): Promise<GkDailyItem[]> {
  const { data, error } = await supabase
    .from('gk_daily_items')
    .select('*')
    .eq('status', 'approved')
    .order('item_date', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as GkDailyItem[];
}

export async function approveGkItem(
  supabase: SupabaseClient,
  itemId: string,
  reviewerId: string,
  edits?: Partial<Pick<GkDailyItem, 'summary' | 'question_text' | 'options' | 'correct_option' | 'explanation'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('gk_daily_items')
    .update({
      ...edits,
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq('id', itemId);

  if (error) {
    console.error('Error approving GK item:', error);
    return false;
  }
  return true;
}

export async function recordGkQuizResult(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  return updateStreak(supabase, userId);
}

export async function rejectGkItem(
  supabase: SupabaseClient,
  itemId: string,
  reviewerId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('gk_daily_items')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq('id', itemId);

  if (error) {
    console.error('Error rejecting GK item:', error);
    return false;
  }
  return true;
}
