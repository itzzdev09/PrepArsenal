// PrepArsenal — Comprehensive Exam Details Data
// Structure, syllabus, posts, eligibility for each exam

export interface ExamStage {
  name: string;
  type: 'MCQ' | 'Descriptive' | 'Interview' | 'Physical' | 'Skill';
  totalQuestions?: number;
  totalMarks: number;
  duration: number; // minutes
  sections?: { name: string; questions: number; marks: number }[];
  negativeMark?: number;
  description: string;
}

export interface ExamPost {
  title: string;
  payScale: string;
  grade?: string;
  department?: string;
}

export interface ExamSyllabusSection {
  subject: string;
  topics: string[];
  weightage?: string;
}

export interface PYQMetric {
  totalQuestions: number;
  totalShifts: number | string;
  provenance: string;
  coverageYears: string;
  verifiedPercentage: number;
}

export interface ExamDetail {
  code: string;
  tagline: string;
  conductedBy: string;
  frequency: string;
  difficultyLevel: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
  difficultyScore: number; // 1-100
  difficultyAnalysis: string;
  eligibility: {
    education: string;
    ageLimit: string;
    attempts?: string;
    relaxation?: string;
  };
  stages: ExamStage[];
  syllabus: ExamSyllabusSection[];
  posts: ExamPost[];
  keyStats: {
    avgVacancies?: string;
    avgApplicants?: string;
    selectionRatio?: string;
    lastCutoff?: string;
  };
  pyqMetrics?: PYQMetric;
  importantLinks?: { label: string; url: string }[];
  tips: string[];
}

export const examDetails: Record<string, ExamDetail> = {
  UPSC_CSE: {
    code: 'UPSC_CSE',
    tagline: 'The most prestigious civil services examination in India — gateway to IAS, IPS, IFS and 20+ services.',
    conductedBy: 'Union Public Service Commission (UPSC)',
    frequency: 'Once a year (May–June Prelims)',
    difficultyLevel: 'Very Hard',
    difficultyScore: 95,
    difficultyAnalysis: 'UPSC CSE is considered the toughest exam in India with an extremely low selection ratio (~0.1%). The Prelims tests breadth of knowledge across all subjects, Mains tests analytical depth, and the Interview evaluates personality. Multi-year preparation is common.',
    eligibility: {
      education: 'Graduate in any discipline from a recognized university',
      ageLimit: '21–32 years (General)',
      attempts: '6 attempts (General), 9 (OBC), Unlimited (SC/ST till age limit)',
      relaxation: 'OBC: +3 years, SC/ST: +5 years, PwBD: +10 years',
    },
    stages: [
      {
        name: 'Prelims (GS Paper-I)',
        type: 'MCQ',
        totalQuestions: 100,
        totalMarks: 200,
        duration: 120,
        negativeMark: 0.66,
        description: 'General Studies paper covering History, Geography, Polity, Economy, Science, Environment, and Current Affairs.',
        sections: [
          { name: 'History & Culture', questions: 15, marks: 30 },
          { name: 'Indian Polity & Governance', questions: 18, marks: 36 },
          { name: 'Geography', questions: 12, marks: 24 },
          { name: 'Economy', questions: 15, marks: 30 },
          { name: 'General Science', questions: 10, marks: 20 },
          { name: 'Environment & Ecology', questions: 15, marks: 30 },
          { name: 'Current Affairs', questions: 15, marks: 30 },
        ],
      },
      {
        name: 'Prelims (CSAT Paper-II)',
        type: 'MCQ',
        totalQuestions: 80,
        totalMarks: 200,
        duration: 120,
        negativeMark: 0.83,
        description: 'Civil Services Aptitude Test — qualifying paper (33% minimum). Covers comprehension, logical reasoning, decision making, basic numeracy, and data interpretation.',
      },
      {
        name: 'Mains (9 Papers)',
        type: 'Descriptive',
        totalMarks: 1750,
        duration: 180,
        description: '9 descriptive papers including Essay, 4 GS papers, Optional Subject (2 papers), and 2 qualifying language papers. Tests analytical ability and structured writing.',
      },
      {
        name: 'Personality Test (Interview)',
        type: 'Interview',
        totalMarks: 275,
        duration: 30,
        description: 'Board interview assessing mental alertness, critical thinking, depth of knowledge, social traits, and integrity. Not a test of knowledge but of personality.',
      },
    ],
    syllabus: [
      {
        subject: 'History',
        topics: ['Ancient India — Indus Valley, Vedic Period, Maurya, Gupta', 'Medieval India — Delhi Sultanate, Mughals, Bhakti & Sufi', 'Modern India — British Rule, Freedom Struggle, Social Reform', 'World History — Industrial Revolution, World Wars, Colonialism', 'Art & Culture — Architecture, Dance, Music, Literature'],
        weightage: '12–18 questions in Prelims',
      },
      {
        subject: 'Indian Polity & Governance',
        topics: ['Constitution — Preamble, Features, Amendments', 'Fundamental Rights & Directive Principles', 'Parliament — Lok Sabha, Rajya Sabha, Legislation', 'Judiciary — Supreme Court, High Courts, PIL', 'Federalism, Centre-State Relations', 'Constitutional Bodies — EC, CAG, UPSC, Finance Commission', 'Local Self Government — Panchayats, Municipalities'],
        weightage: '15–20 questions in Prelims',
      },
      {
        subject: 'Geography',
        topics: ['Physical Geography — Geomorphology, Climatology, Oceanography', 'Indian Geography — Rivers, Soils, Natural Vegetation', 'Human Geography — Population, Urbanization, Migration', 'Economic Geography — Agriculture, Industry, Resources', 'Mapping & Current Geographical Events'],
        weightage: '10–15 questions in Prelims',
      },
      {
        subject: 'Economy',
        topics: ['Basic Concepts — GDP, Inflation, Fiscal & Monetary Policy', 'Banking & Finance — RBI, SEBI, NABARD, NBFCs', 'Budget & Taxation — GST, Direct/Indirect Taxes', 'Planning — NITI Aayog, Five Year Plans legacy', 'International Economy — WTO, IMF, World Bank', 'Government Schemes — PM-KISAN, Make in India, PLI'],
        weightage: '12–18 questions in Prelims',
      },
      {
        subject: 'Environment & Ecology',
        topics: ['Biodiversity — Hotspots, Endemic Species, Red Data Book', 'Climate Change — UNFCCC, Paris Agreement, NDCs', 'Pollution — Air, Water, Soil, Noise', 'Conservation — National Parks, Tiger Reserves, Biosphere Reserves', 'Environmental Laws & Policies — EPA, Forest Rights Act', 'Sustainable Development Goals (SDGs)'],
        weightage: '12–18 questions in Prelims',
      },
      {
        subject: 'General Science',
        topics: ['Physics — Mechanics, Optics, Electricity, Magnetism', 'Chemistry — Periodic Table, Acids & Bases, Polymers', 'Biology — Cell, Human Body, Diseases, Nutrition', 'Space & Technology — ISRO missions, Satellite Technology', 'Emerging Technologies — AI, Blockchain, Quantum Computing'],
        weightage: '8–12 questions in Prelims',
      },
    ],
    posts: [
      { title: 'Indian Administrative Service (IAS)', payScale: '₹56,100–₹2,50,000', grade: 'Group A', department: 'General Administration' },
      { title: 'Indian Police Service (IPS)', payScale: '₹56,100–₹2,25,000', grade: 'Group A', department: 'Police & Law Enforcement' },
      { title: 'Indian Foreign Service (IFS)', payScale: '₹56,100–₹2,25,000', grade: 'Group A', department: 'Foreign Affairs' },
      { title: 'Indian Revenue Service (IRS)', payScale: '₹56,100–₹2,25,000', grade: 'Group A', department: 'Income Tax / Customs' },
      { title: 'Indian Audit & Accounts Service (IA&AS)', payScale: '₹56,100–₹2,25,000', grade: 'Group A', department: 'Audit & Accounts' },
      { title: 'Indian Railway Traffic Service (IRTS)', payScale: '₹56,100–₹2,25,000', grade: 'Group A', department: 'Railways' },
      { title: 'Indian Defence Accounts Service (IDAS)', payScale: '₹56,100–₹2,25,000', grade: 'Group A', department: 'Defence Accounts' },
      { title: 'Indian Postal Service (IPoS)', payScale: '₹56,100–₹2,25,000', grade: 'Group A', department: 'Postal Services' },
    ],
    keyStats: {
      avgVacancies: '~1,000 per year',
      avgApplicants: '~10–12 lakh',
      selectionRatio: '~0.1%',
      lastCutoff: 'Prelims: ~90–100/200 (varies by category)',
    },
    tips: [
      'Start with NCERT textbooks (Class 6–12) for building fundamentals',
      'Read The Hindu / Indian Express daily for Current Affairs',
      'Focus on answer writing practice for Mains from Day 1',
      'Solve at least 10 years of Previous Year Questions (PYQs)',
      'Choose your Optional Subject wisely — scoring potential and interest both matter',
    ],
  },

  SBI_PO: {
    code: 'SBI_PO',
    tagline: 'Premier banking exam for Probationary Officer positions in India\'s largest public sector bank.',
    conductedBy: 'State Bank of India (SBI)',
    frequency: 'Once a year (typically June–August)',
    difficultyLevel: 'Hard',
    difficultyScore: 72,
    difficultyAnalysis: 'SBI PO is considered tougher than IBPS PO due to higher competition, more challenging questions, and SBI\'s brand value. The Prelims is a speed test, while Mains tests depth. The interview round is moderately demanding.',
    eligibility: {
      education: 'Graduate in any discipline from a recognized university',
      ageLimit: '21–30 years (General)',
      relaxation: 'OBC: +3 years, SC/ST: +5 years, PwBD: +10 years',
    },
    stages: [
      {
        name: 'Prelims',
        type: 'MCQ',
        totalQuestions: 100,
        totalMarks: 100,
        duration: 60,
        negativeMark: 0.25,
        description: 'Online objective test with sectional timing (20 minutes per section). Tests basic aptitude and English skills.',
        sections: [
          { name: 'English Language', questions: 30, marks: 30 },
          { name: 'Quantitative Aptitude', questions: 35, marks: 35 },
          { name: 'Reasoning Ability', questions: 35, marks: 35 },
        ],
      },
      {
        name: 'Mains',
        type: 'MCQ',
        totalQuestions: 155,
        totalMarks: 200,
        duration: 180,
        negativeMark: 0.25,
        description: 'Descriptive + Objective test covering reasoning, DI, English (with letter/essay writing), general awareness, and computer knowledge.',
        sections: [
          { name: 'Reasoning & Computer Aptitude', questions: 45, marks: 60 },
          { name: 'Data Analysis & Interpretation', questions: 35, marks: 60 },
          { name: 'General/Economy/Banking Awareness', questions: 40, marks: 40 },
          { name: 'English Language', questions: 35, marks: 40 },
        ],
      },
      {
        name: 'Interview / Group Exercise',
        type: 'Interview',
        totalMarks: 50,
        duration: 20,
        description: 'Group discussion and personal interview assessing communication, banking knowledge, and personality.',
      },
    ],
    syllabus: [
      {
        subject: 'Quantitative Aptitude',
        topics: ['Simplification & Approximation', 'Number Series', 'Data Interpretation (Tables, Graphs, Charts)', 'Quadratic Equations', 'Percentage, Profit & Loss, SI/CI', 'Ratio & Proportion, Mixtures', 'Time & Work, Pipes & Cisterns', 'Time, Speed & Distance, Boats & Streams', 'Probability, Permutation & Combination'],
        weightage: '35 questions in Prelims',
      },
      {
        subject: 'Reasoning Ability',
        topics: ['Puzzles & Seating Arrangement (Linear, Circular)', 'Syllogism', 'Inequality', 'Coding-Decoding', 'Blood Relations', 'Direction & Distance', 'Order & Ranking', 'Data Sufficiency', 'Input-Output', 'Machine Input'],
        weightage: '35 questions in Prelims',
      },
      {
        subject: 'English Language',
        topics: ['Reading Comprehension', 'Cloze Test', 'Error Spotting / Sentence Correction', 'Para Jumbles', 'Fill in the Blanks (Single/Double)', 'Vocabulary — Synonyms, Antonyms, Idioms', 'Column Matching', 'Sentence Rearrangement'],
        weightage: '30 questions in Prelims',
      },
      {
        subject: 'General Awareness',
        topics: ['Banking Awareness — RBI, SEBI, NABARD, NPA, Basel Norms', 'Current Affairs — Last 6 months', 'Static GK — Countries, Capitals, Currencies', 'Financial Awareness — Budget, Monetary Policy', 'Government Schemes & Policies'],
        weightage: '40 questions in Mains only',
      },
    ],
    posts: [
      { title: 'Probationary Officer', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'State Bank of India' },
    ],
    keyStats: {
      avgVacancies: '~2,000 per year',
      avgApplicants: '~20–25 lakh',
      selectionRatio: '~0.08%',
      lastCutoff: 'Prelims: ~45–55/100 (varies by category)',
    },
    tips: [
      'Speed is key in Prelims — practice with strict 20-min sectional timers',
      'Focus heavily on Puzzles & DI for Mains — they carry maximum marks',
      'Read financial newspapers (Economic Times, Mint) for Banking Awareness',
      'Attempt at least 80–85% questions with high accuracy for a good score',
      'Practice mock tests from the exact SBI PO pattern to build exam temperament',
    ],
  },

  IBPS_PO: {
    code: 'IBPS_PO',
    tagline: 'Common recruitment process for Probationary Officer posts across 11 major public sector banks.',
    conductedBy: 'Institute of Banking Personnel Selection (IBPS)',
    frequency: 'Once a year (September–November)',
    difficultyLevel: 'Hard',
    difficultyScore: 68,
    difficultyAnalysis: 'IBPS PO is slightly easier than SBI PO in terms of question difficulty, but the competition is still intense with lakhs of applicants. Sectional timing in Prelims makes speed crucial. The allocation to specific banks adds another layer of preference.',
    eligibility: {
      education: 'Graduate in any discipline from a recognized university',
      ageLimit: '20–30 years (General)',
      relaxation: 'OBC: +3 years, SC/ST: +5 years, PwBD: +10 years',
    },
    stages: [
      {
        name: 'Prelims',
        type: 'MCQ',
        totalQuestions: 100,
        totalMarks: 100,
        duration: 60,
        negativeMark: 0.25,
        description: 'Online objective test with sectional timing. Similar pattern to SBI PO Prelims but slightly easier.',
        sections: [
          { name: 'English Language', questions: 30, marks: 30 },
          { name: 'Quantitative Aptitude', questions: 35, marks: 35 },
          { name: 'Reasoning Ability', questions: 35, marks: 35 },
        ],
      },
      {
        name: 'Mains',
        type: 'MCQ',
        totalQuestions: 155,
        totalMarks: 200,
        duration: 180,
        negativeMark: 0.25,
        description: 'Objective + descriptive test with sectional timing. Covers 4 objective sections and 1 descriptive section (letter/essay writing).',
        sections: [
          { name: 'Reasoning & Computer Aptitude', questions: 45, marks: 60 },
          { name: 'Data Analysis & Interpretation', questions: 35, marks: 60 },
          { name: 'General/Economy/Banking Awareness', questions: 40, marks: 40 },
          { name: 'English Language', questions: 35, marks: 40 },
        ],
      },
      {
        name: 'Interview',
        type: 'Interview',
        totalMarks: 100,
        duration: 15,
        description: 'Personal interview conducted by participating banks. Focuses on general awareness, banking knowledge, communication skills, and personality.',
      },
    ],
    syllabus: [
      {
        subject: 'Quantitative Aptitude',
        topics: ['Simplification & Approximation', 'Number Series', 'Data Interpretation — Bar, Line, Pie, Tabular', 'Quadratic Equations', 'Percentage, Profit & Loss, SI/CI', 'Ratio & Proportion, Partnership', 'Time & Work, Pipes & Cisterns', 'Time, Speed & Distance', 'Mensuration & Geometry', 'Probability'],
        weightage: '35 questions in Prelims',
      },
      {
        subject: 'Reasoning Ability',
        topics: ['Puzzles — Floor, Box, Day-based', 'Seating Arrangement — Linear, Circular, Square', 'Syllogism — Direct & Reverse', 'Inequality — Coded & Direct', 'Coding-Decoding', 'Blood Relations', 'Direction & Distance', 'Alphanumeric Series', 'Order & Ranking', 'Input-Output'],
        weightage: '35 questions in Prelims',
      },
      {
        subject: 'English Language',
        topics: ['Reading Comprehension — Passage-based', 'Cloze Test', 'Error Detection / Correction', 'Para Jumbles', 'Fill in the Blanks', 'Vocabulary — Synonym, Antonym, Idiom', 'Sentence Completion', 'Word Swap'],
        weightage: '30 questions in Prelims',
      },
      {
        subject: 'General Awareness',
        topics: ['Banking & Financial Awareness', 'Current Affairs — Last 3–6 months', 'Static GK — Important Days, Books, Awards', 'Economy — RBI Policies, Budget Highlights', 'Government Schemes — Financial Inclusion, Digital India'],
        weightage: '40 questions in Mains only',
      },
    ],
    posts: [
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Bank of Baroda' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Punjab National Bank' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Canara Bank' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Union Bank of India' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Indian Overseas Bank' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Bank of India' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Central Bank of India' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Indian Bank' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Bank of Maharashtra' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'UCO Bank' },
      { title: 'Probationary Officer (PO)', payScale: '₹36,000–₹63,840 (Basic Pay)', grade: 'JMGS-I', department: 'Punjab & Sind Bank' },
    ],
    keyStats: {
      avgVacancies: '~3,000–4,000 per year (across all banks)',
      avgApplicants: '~15–20 lakh',
      selectionRatio: '~0.2%',
      lastCutoff: 'Prelims: ~40–50/100 (varies by category)',
    },
    tips: [
      'Practice sectional mock tests with 20-minute timer per section',
      'Master Puzzles and DI — they decide Mains rank',
      'Read Oliveboard/Adda247 current affairs capsules for General Awareness',
      'Maintain 85%+ accuracy even if you attempt fewer questions',
      'Understand bank allocation preference — list preferences wisely after results',
    ],
  },
};

export function getExamDetail(code: string): ExamDetail | undefined {
  return examDetails[code];
}
