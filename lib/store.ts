// PrepArsenal — Store (localStorage-based state management)
// Will be migrated to Supabase when credentials are provided

export interface UserProfile {
  id: string;
  name: string;
  targetExams: string[];
  examDates: Record<string, string>; // examCode -> date
  joinedAt: string;
  streak: number;
  lastStudyDate: string | null;
  totalStudyMinutes: number;
}

export interface PracticeSession {
  id: string;
  examCode: string;
  subject: string;
  topic?: string;
  questionIds: string[];
  answers: Record<string, number>; // questionId -> selected option
  startedAt: string;
  completedAt?: string;
  timeTaken: number; // seconds
  score: number;
  totalQuestions: number;
}

export interface StudyPlanTask {
  id: string;
  date: string;
  subject: string;
  topic: string;
  duration: number; // minutes
  type: 'practice' | 'revision' | 'notes' | 'mock';
  completed: boolean;
  examCode: string;
}

const STORAGE_KEYS = {
  USER_PROFILE: 'prep_user_profile',
  PRACTICE_SESSIONS: 'prep_practice_sessions',
  STUDY_PLAN: 'prep_study_plan',
  FSRS_CARDS: 'prep_fsrs_cards',
  CHAT_HISTORY: 'prep_chat_history',
  BOOKMARKS: 'prep_bookmarks',
} as const;

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
}

// === User Profile ===
export function getUserProfile(): UserProfile | null {
  return getStorage<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
}

export function saveUserProfile(profile: UserProfile): void {
  setStorage(STORAGE_KEYS.USER_PROFILE, profile);
}

export function createDefaultProfile(name: string, targetExams: string[]): UserProfile {
  const profile: UserProfile = {
    id: crypto.randomUUID(),
    name,
    targetExams,
    examDates: {},
    joinedAt: new Date().toISOString(),
    streak: 0,
    lastStudyDate: null,
    totalStudyMinutes: 0,
  };
  saveUserProfile(profile);
  return profile;
}

// === Practice Sessions ===
export function getPracticeSessions(): PracticeSession[] {
  return getStorage<PracticeSession[]>(STORAGE_KEYS.PRACTICE_SESSIONS, []);
}

export function savePracticeSession(session: PracticeSession): void {
  const sessions = getPracticeSessions();
  const existingIdx = sessions.findIndex(s => s.id === session.id);
  if (existingIdx >= 0) {
    sessions[existingIdx] = session;
  } else {
    sessions.push(session);
  }
  setStorage(STORAGE_KEYS.PRACTICE_SESSIONS, sessions);
}

// === Study Plan ===
export function getStudyPlan(): StudyPlanTask[] {
  return getStorage<StudyPlanTask[]>(STORAGE_KEYS.STUDY_PLAN, []);
}

export function saveStudyPlan(tasks: StudyPlanTask[]): void {
  setStorage(STORAGE_KEYS.STUDY_PLAN, tasks);
}

// === FSRS Cards ===
export function getFSRSCards(): Record<string, unknown>[] {
  return getStorage<Record<string, unknown>[]>(STORAGE_KEYS.FSRS_CARDS, []);
}

export function saveFSRSCards(cards: Record<string, unknown>[]): void {
  setStorage(STORAGE_KEYS.FSRS_CARDS, cards);
}

// === Chat History ===
export interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  questionId?: string;
}

export function getChatHistory(): ChatEntry[] {
  return getStorage<ChatEntry[]>(STORAGE_KEYS.CHAT_HISTORY, []);
}

export function saveChatMessage(entry: ChatEntry): void {
  const history = getChatHistory();
  history.push(entry);
  // Keep last 200 messages
  if (history.length > 200) {
    history.splice(0, history.length - 200);
  }
  setStorage(STORAGE_KEYS.CHAT_HISTORY, history);
}

export function clearChatHistory(): void {
  setStorage(STORAGE_KEYS.CHAT_HISTORY, []);
}

// === Bookmarks ===
export function getBookmarks(): string[] {
  return getStorage<string[]>(STORAGE_KEYS.BOOKMARKS, []);
}

export function toggleBookmark(questionId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(questionId);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    setStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
    return false;
  } else {
    bookmarks.push(questionId);
    setStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
    return true;
  }
}

// === Streak Management ===
export function updateStreak(): number {
  const profile = getUserProfile();
  if (!profile) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const lastDate = profile.lastStudyDate;
  
  if (lastDate === today) {
    return profile.streak; // Already studied today
  }
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (lastDate === yesterday) {
    profile.streak += 1;
  } else if (lastDate !== today) {
    profile.streak = 1; // Streak broken, restart
  }
  
  profile.lastStudyDate = today;
  saveUserProfile(profile);
  return profile.streak;
}

// === Analytics Helpers ===
export function getAccuracyBySubject(): Record<string, { correct: number; total: number }> {
  const sessions = getPracticeSessions();
  const result: Record<string, { correct: number; total: number }> = {};
  
  for (const session of sessions) {
    if (!result[session.subject]) {
      result[session.subject] = { correct: 0, total: 0 };
    }
    result[session.subject].correct += session.score;
    result[session.subject].total += session.totalQuestions;
  }
  
  return result;
}

export function getTotalQuestionsAttempted(): number {
  const sessions = getPracticeSessions();
  return sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
}

export function getOverallAccuracy(): number {
  const sessions = getPracticeSessions();
  const total = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const correct = sessions.reduce((sum, s) => sum + s.score, 0);
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}
