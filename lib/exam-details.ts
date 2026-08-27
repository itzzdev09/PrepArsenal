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
  SSC_CGL: {
    code: 'SSC_CGL',
    tagline: 'Premier national recruitment for Group B and Group C Gazetted/Non-Gazetted officers across central ministries.',
    conductedBy: 'Staff Selection Commission (SSC)',
    frequency: 'Once a year (Tier 1 Prelims + Tier 2 Mains)',
    difficultyLevel: 'Moderate',
    difficultyScore: 78,
    difficultyAnalysis: 'High competition (~25-30 lakh applicants). Requires rapid calculation speed in Quant, sharp pattern recognition in Reasoning, and strong command over English & Static GK.',
    eligibility: {
      education: 'Bachelor Degree in any discipline from a recognized University',
      ageLimit: '18–32 years (depending on specific post)',
      attempts: 'No attempt limit within age criteria',
      relaxation: 'OBC: +3 years, SC/ST: +5 years, PwD: +10 years',
    },
    stages: [
      {
        name: 'Tier-1 (Computer Based Test)',
        type: 'MCQ',
        totalQuestions: 100,
        totalMarks: 200,
        duration: 60,
        negativeMark: 0.5,
        description: 'Qualifying preliminary exam testing 4 key sections equally (25Q / 50M each).',
        sections: [
          { name: 'General Intelligence & Reasoning', questions: 25, marks: 50 },
          { name: 'General Awareness', questions: 25, marks: 50 },
          { name: 'Quantitative Aptitude', questions: 25, marks: 50 },
          { name: 'English Comprehension', questions: 25, marks: 50 },
        ],
      },
      {
        name: 'Tier-2 (Mains Exam)',
        type: 'MCQ',
        totalQuestions: 150,
        totalMarks: 390,
        duration: 135,
        negativeMark: 1.0,
        description: 'Final merit-determining stage: Mathematical Abilities, Reasoning, English, General Awareness, and Computer Knowledge.',
      },
    ],
    syllabus: [
      {
        subject: 'Quantitative Aptitude',
        topics: ['Arithmetic — Percentage, Profit & Loss, SI/CI, Ratio, Time & Work, TSD', 'Advanced Math — Algebra, Geometry, Mensuration, Trigonometry, Height & Distance', 'Data Interpretation — Bar Graph, Pie Chart, Histograms'],
        weightage: '25 Questions in Tier 1 / 30 Questions in Tier 2',
      },
      {
        subject: 'Reasoning',
        topics: ['Analogy, Classification, Series (Letter & Number), Coding-Decoding', 'Blood Relations, Syllogisms, Venn Diagrams, Direction Test', 'Matrix, Paper Folding, Mirror Images, Figure Counting'],
        weightage: '25 Questions in Tier 1 / 30 Questions in Tier 2',
      },
      {
        subject: 'English Comprehension',
        topics: ['Grammar & Error Spotting, Sentence Improvement, Active/Passive Voice, Direct/Indirect Speech', 'Vocabulary, Synonyms/Antonyms, One Word Substitution, Idioms & Phrases', 'Reading Comprehension & Cloze Test'],
        weightage: '25 Questions in Tier 1 / 45 Questions in Tier 2',
      },
      {
        subject: 'General Awareness',
        topics: ['Static GK — History, Culture, Geography, Indian Polity, Economy', 'General Science — Physics, Chemistry, Biology', 'Current Affairs (National & International, Schemes, Awards)'],
        weightage: '25 Questions in Tier 1 / 25 Questions in Tier 2',
      },
    ],
    posts: [
      { title: 'Assistant Audit Officer (AAO)', payScale: 'Level 8 (₹47,600–₹1,51,100)', grade: 'Group B Gazetted', department: 'CAG / Indian Audit & Accounts' },
      { title: 'Assistant Section Officer (ASO)', payScale: 'Level 7 (₹44,900–₹1,42,400)', grade: 'Group B', department: 'Central Secretariat Service (CSS) / MEA / IB' },
      { title: 'Inspector of Income Tax', payScale: 'Level 7 (₹44,900–₹1,42,400)', grade: 'Group B', department: 'CBDT' },
      { title: 'Inspector (Central Excise / GST)', payScale: 'Level 7 (₹44,900–₹1,42,400)', grade: 'Group B', department: 'CBIC' },
      { title: 'Assistant Enforcement Officer', payScale: 'Level 7 (₹44,900–₹1,42,400)', grade: 'Group B', department: 'Directorate of Enforcement (ED)' },
    ],
    keyStats: {
      avgVacancies: '15,000–18,000 per year',
      avgApplicants: '~28 Lakhs',
      selectionRatio: '~0.5%',
      lastCutoff: 'Tier-1: ~135–150/200 (Normalized, UR category)',
    },
    pyqMetrics: {
      totalQuestions: 7474,
      totalShifts: '50+ shifts',
      provenance: 'Prepp JSON payload & official shift response sheets (2022–2025)',
      coverageYears: '2022–2025',
      verifiedPercentage: 100,
    },
    tips: [
      'Master formula shortcuts for Advanced Math (Geometry & Trigonometry)',
      'Practice 1 full 60-minute mock every alternate day to build speed',
      'Revise Static GK and NCERT Science basics weekly',
      'Target 155+ in Tier-1 to ensure comfortable qualification',
    ],
  },
  RRB_NTPC: {
    code: 'RRB_NTPC',
    tagline: 'Mega Indian Railways recruitment for Station Masters, Goods Guards, Commercial Apprentices and Clerks.',
    conductedBy: 'Railway Recruitment Control Board (RRB)',
    frequency: 'Periodic (CBT-1 Prelims + CBT-2 Mains + CBAT / Typing)',
    difficultyLevel: 'Moderate',
    difficultyScore: 72,
    difficultyAnalysis: 'Massive scale with over 1 crore applicants. Tests speed, accuracy, and broad General Science & Railway knowledge in 90 minutes for 100 questions.',
    eligibility: {
      education: 'Graduate / 12th Pass (based on specific post levels 2, 3, 4, 5, 6)',
      ageLimit: '18–33 years (Graduate), 18–30 years (Undergraduate)',
      attempts: 'No limit within age criteria',
      relaxation: 'OBC: +3 years, SC/ST: +5 years',
    },
    stages: [
      {
        name: 'CBT-1 (Screening)',
        type: 'MCQ',
        totalQuestions: 100,
        totalMarks: 100,
        duration: 90,
        negativeMark: 0.33,
        description: 'Screening stage covering General Awareness (40Q), Mathematics (30Q), and Reasoning (30Q).',
        sections: [
          { name: 'General Awareness', questions: 40, marks: 40 },
          { name: 'Mathematics', questions: 30, marks: 30 },
          { name: 'General Intelligence & Reasoning', questions: 30, marks: 30 },
        ],
      },
      {
        name: 'CBT-2 (Mains Selection)',
        type: 'MCQ',
        totalQuestions: 120,
        totalMarks: 120,
        duration: 90,
        negativeMark: 0.33,
        description: 'Decisive scoring stage with 120 questions in 90 minutes (GA 50Q, Math 35Q, Reasoning 35Q).',
      },
    ],
    syllabus: [
      {
        subject: 'General Awareness',
        topics: ['Current Events, Games & Sports, Art & Culture of India', 'Indian Literature, Monuments & Places, General Science & Life Sciences (up to 10th CBSE)', 'History of India and Freedom Struggle, Physical, Social and Economic Geography', 'Indian Polity & Governance, Computer and its applications'],
        weightage: '40 Questions in CBT-1 / 50 Questions in CBT-2',
      },
      {
        subject: 'Mathematics',
        topics: ['Number System, Decimals, Fractions, LCM & HCF', 'Ratio & Proportions, Percentage, Mensuration, Time and Work, Time and Distance', 'Simple and Compound Interest, Profit and Loss, Elementary Algebra, Geometry and Trigonometry'],
        weightage: '30 Questions in CBT-1 / 35 Questions in CBT-2',
      },
      {
        subject: 'General Intelligence & Reasoning',
        topics: ['Analogies, Completion of Number and Alphabetical Series, Coding and Decoding', 'Mathematical Operations, Similarities and Differences, Relationships, Analytical Reasoning', 'Syllogism, Jumbling, Venn Diagrams, Puzzle, Data Sufficiency'],
        weightage: '30 Questions in CBT-1 / 35 Questions in CBT-2',
      },
    ],
    posts: [
      { title: 'Station Master', payScale: 'Level 6 (₹35,400 Basic)', grade: 'Group C', department: 'Traffic / Operations' },
      { title: 'Goods Train Manager (Goods Guard)', payScale: 'Level 5 (₹29,200 Basic)', grade: 'Group C', department: 'Operating' },
      { title: 'Senior Commercial cum Ticket Clerk', payScale: 'Level 5 (₹29,200 Basic)', grade: 'Group C', department: 'Commercial' },
      { title: 'Commercial Apprentice', payScale: 'Level 6 (₹35,400 Basic)', grade: 'Group C', department: 'Commercial' },
    ],
    keyStats: {
      avgVacancies: '11,000–35,000 per notification cycle',
      avgApplicants: '~1.2 Crore',
      selectionRatio: '~0.1%',
      lastCutoff: 'CBT-1: ~70–82/100 (Normalized score)',
    },
    pyqMetrics: {
      totalQuestions: 10615,
      totalShifts: '101 shifts',
      provenance: 'Prepp shift-wise JSON payloads & official CBT-1/CBT-2 answer keys',
      coverageYears: '2019–2025',
      verifiedPercentage: 100,
    },
    tips: [
      'Focus intensely on NCERT Class 9-10 General Science — gives an edge in GA section',
      'Solve 90-minute full mock sets to master time distribution',
      'Learn fast arithmetic calculation shortcuts for CBT-2',
    ],
  },
  ACIO2: {
    code: 'ACIO2',
    tagline: 'Executive intelligence officer post in Intelligence Bureau, Ministry of Home Affairs.',
    conductedBy: 'Ministry of Home Affairs (MHA / IB)',
    frequency: 'Periodic (Tier 1 MCQ + Tier 2 Descriptive + Tier 3 Interview)',
    difficultyLevel: 'Hard',
    difficultyScore: 84,
    difficultyAnalysis: 'High analytical rigor with deep current affairs, statement-based General Studies, and negative marking of 0.25.',
    eligibility: {
      education: 'Graduation or equivalent from a recognized University; Knowledge of computers',
      ageLimit: '18–27 years',
      attempts: 'No limit within age criteria',
      relaxation: 'SC/ST: +5 years, OBC: +3 years',
    },
    stages: [
      {
        name: 'Tier-1 (Written MCQ)',
        type: 'MCQ',
        totalQuestions: 100,
        totalMarks: 100,
        duration: 60,
        negativeMark: 0.25,
        description: '100 Objective MCQs across Current Affairs (20Q), General Studies (20Q), Numerical Aptitude (20Q), Reasoning (20Q), and English (20Q).',
        sections: [
          { name: 'Current Affairs', questions: 20, marks: 20 },
          { name: 'General Studies', questions: 20, marks: 20 },
          { name: 'Numerical Aptitude', questions: 20, marks: 20 },
          { name: 'Reasoning & Logical Aptitude', questions: 20, marks: 20 },
          { name: 'English Language', questions: 20, marks: 20 },
        ],
      },
      {
        name: 'Tier-2 (Descriptive Paper)',
        type: 'Descriptive',
        totalMarks: 50,
        duration: 60,
        description: 'Essay (30 marks) on contemporary security/economic issues + English Comprehension & Précis writing (20 marks).',
      },
      {
        name: 'Tier-3 (Interview)',
        type: 'Interview',
        totalMarks: 100,
        duration: 30,
        description: 'Comprehensive personality and psychological assessment by IB panel.',
      },
    ],
    syllabus: [
      {
        subject: 'Current Affairs & General Studies',
        topics: ['National Security, Defense Deals, Geopolitics, Cyber Security', 'Modern Indian History, Constitution & Polity, Macro Economics, Geography', 'Science & Tech Innovations, AI, Space Missions (ISRO)'],
        weightage: '40 Questions (40% of Tier 1)',
      },
      {
        subject: 'Numerical & Reasoning Aptitude',
        topics: ['Arithmetic, Number Series, Profit & Loss, Percentages, SI/CI', 'Logical Puzzles, Statement-Assertion, Coding-Decoding, Seating Arrangements'],
        weightage: '40 Questions (40% of Tier 1)',
      },
      {
        subject: 'English Language',
        topics: ['Grammar, Error Spotting, Sentence Improvement', 'Advanced Vocabulary, Idioms, Cloze Test, Reading Comprehension'],
        weightage: '20 Questions (20% of Tier 1)',
      },
    ],
    posts: [
      { title: 'Assistant Central Intelligence Officer Grade-II/Executive', payScale: 'Level 7 (₹44,900–₹1,42,400)', grade: 'Group C Non-Gazetted / Central Service', department: 'Intelligence Bureau (MHA)' },
    ],
    keyStats: {
      avgVacancies: '1,000–2,000 per recruitment cycle',
      avgApplicants: '~8–10 Lakhs',
      selectionRatio: '~0.15%',
      lastCutoff: 'Tier-1: ~65–72/100 (Unreserved)',
    },
    pyqMetrics: {
      totalQuestions: 2050,
      totalShifts: '16 shifts',
      provenance: 'Prepp official IB ACIO shift papers & Disha Executive Solved Papers',
      coverageYears: '2021–2025',
      verifiedPercentage: 100,
    },
    tips: [
      'Read The Hindu / Indian Express editorials daily for Tier-1 GS and Tier-2 Essay',
      'Practice multi-statement question solving (UPSC style)',
      'Prepare crisp notes on India’s internal security challenges and neighborhood policy',
    ],
  },
  UPSC_APFC: {
    code: 'UPSC_APFC',
    tagline: 'Assistant Provident Fund Commissioner & Enforcement Officer under Employees Provident Fund Organisation (EPFO).',
    conductedBy: 'Union Public Service Commission (UPSC)',
    frequency: 'Periodic (Recruitment Test + Interview)',
    difficultyLevel: 'Hard',
    difficultyScore: 88,
    difficultyAnalysis: 'High level GS combined with specialized domains like Industrial Relations, Labor Laws, Social Security in India, and Accountancy Principles.',
    eligibility: {
      education: 'Bachelor Degree in any subject (Diploma in Company Law/Labor Laws preferred)',
      ageLimit: '21–35 years (APFC), 21–30 years (EO/AO)',
      attempts: 'No attempt limit within age limits',
      relaxation: 'OBC: +3 years, SC/ST: +5 years',
    },
    stages: [
      {
        name: 'Recruitment Test (RT - Single Stage)',
        type: 'MCQ',
        totalQuestions: 120,
        totalMarks: 300,
        duration: 120,
        negativeMark: 0.83,
        description: 'Single comprehensive pen-and-paper OMR / CBT test weighted at 75% in final merit.',
        sections: [
          { name: 'General English', questions: 20, marks: 50 },
          { name: 'General Studies & Current Affairs', questions: 40, marks: 100 },
          { name: 'Labor Laws & Social Security', questions: 25, marks: 62.5 },
          { name: 'General Accounting Principles', questions: 15, marks: 37.5 },
          { name: 'Math & Mental Ability', questions: 20, marks: 50 },
        ],
      },
      {
        name: 'Interview',
        type: 'Interview',
        totalMarks: 100,
        duration: 30,
        description: '25% weightage in final merit assessing suitability for commissioner cadre.',
      },
    ],
    syllabus: [
      {
        subject: 'General English & Mental Ability',
        topics: ['Grammar, Usage, Vocabulary, Comprehension', 'Basic Numeracy, Statistics, Quantitative Aptitude, Logical Reasoning'],
        weightage: '40 Questions (100 Marks)',
      },
      {
        subject: 'General Studies',
        topics: ['Indian Culture, Heritage, Freedom Movements, Current Events', 'Population, Development and Globalization, Indian Constitution and Polity, Economy'],
        weightage: '40 Questions (100 Marks)',
      },
      {
        subject: 'Labor Laws, Social Security & Accounts',
        topics: ['General Accounting Principles, Auditing, Insurance', 'Industrial Relations & Labour Laws, Social Security in India'],
        weightage: '40 Questions (100 Marks)',
      },
    ],
    posts: [
      { title: 'Assistant Provident Fund Commissioner (APFC)', payScale: 'Level 10 (₹56,100–₹1,77,500)', grade: 'Group A Gazetted', department: 'EPFO (Ministry of Labour & Employment)' },
      { title: 'Enforcement Officer / Accounts Officer (EO/AO)', payScale: 'Level 8 (₹47,600–₹1,51,100)', grade: 'Group B Non-Ministerial', department: 'EPFO (Ministry of Labour & Employment)' },
    ],
    keyStats: {
      avgVacancies: '150–600 per notification',
      avgApplicants: '~9.5 Lakhs',
      selectionRatio: '~0.05%',
      lastCutoff: 'RT: ~165–185/300 (UR Category)',
    },
    pyqMetrics: {
      totalQuestions: 1431,
      totalShifts: '6 sittings (2015–2025)',
      provenance: 'Prepp EPFO APFC/EO-AO shifts & Edutap APFC PYQ Books',
      coverageYears: '2015–2025',
      verifiedPercentage: 100,
    },
    tips: [
      'Master the 4 Labour Codes and historical acts (EPF Act 1952, ESI Act 1948)',
      'Revise basic 11th/12th Accounting concepts (Journal, Ledger, Trial Balance, Depreciation)',
      'Practice previous UPSC APFC/EO-AO papers repeatedly for pattern mastery',
    ],
  },
  RBI_GRADEB: {
    code: 'RBI_GRADEB',
    tagline: 'Apex banking regulator career — Manager cadre in Reserve Bank of India.',
    conductedBy: 'Reserve Bank of India Services Board',
    frequency: 'Once a year (Phase 1 Prelims + Phase 2 Mains + Interview)',
    difficultyLevel: 'Very Hard',
    difficultyScore: 92,
    difficultyAnalysis: 'Phase 1 requires extreme speed (200Q in 120 mins). Phase 2 tests in-depth economic analysis, financial markets, and management theory.',
    eligibility: {
      education: 'Minimum 60% marks (50% for SC/ST/PwBD) in Graduation',
      ageLimit: '21–30 years',
      attempts: '6 attempts in Phase-1 for General candidates (no limit for reserved)',
      relaxation: 'OBC: +3 years, SC/ST: +5 years',
    },
    stages: [
      {
        name: 'Phase-1 (Objective Online Exam)',
        type: 'MCQ',
        totalQuestions: 200,
        totalMarks: 200,
        duration: 120,
        negativeMark: 0.25,
        description: 'Screening test with sectional cutoffs: GA (80Q), Reasoning (60Q), English (30Q), Quant (30Q).',
      },
      {
        name: 'Phase-2 (Mains - 3 Papers)',
        type: 'Descriptive',
        totalMarks: 300,
        duration: 270,
        description: 'Paper 1 (ESI), Paper 2 (English Writing Skills), Paper 3 (Finance & Management) — 50% objective + 50% descriptive.',
      },
      {
        name: 'Phase-3 (Interview)',
        type: 'Interview',
        totalMarks: 75,
        duration: 35,
        description: 'In-depth interview on macroeconomics, monetary policy, and personal profile.',
      },
    ],
    syllabus: [
      {
        subject: 'Phase-1 General Awareness',
        topics: ['RBI Notifications, Monetary Policy Committee (MPC) decisions, Union Budget, Economic Survey', 'Banking Awareness, Basel III, NBFCs, Priority Sector Lending', 'National & International Current Affairs (past 6 months)'],
        weightage: '80 Questions (40% of Phase 1)',
      },
      {
        subject: 'Phase-2 Economic & Social Issues (ESI)',
        topics: ['Growth and Development, Sustainable Development, Poverty Alleviation', 'Indian Economy, Monetary & Fiscal Policy, International Financial Institutions (IMF, World Bank, WTO)'],
        weightage: '100 Marks (50 Obj + 50 Desc)',
      },
      {
        subject: 'Phase-2 Finance & Management (FM)',
        topics: ['Financial System, Financial Markets, Primary & Secondary Markets', 'Risk Management in Banking, Corporate Governance, Leadership & Motivation Theories'],
        weightage: '100 Marks (50 Obj + 50 Desc)',
      },
    ],
    posts: [
      { title: 'Manager (Grade B Officer)', payScale: '₹55,200 Basic (Gross CTC ~₹28-30 LPA with perks)', grade: 'Grade B', department: 'Reserve Bank of India' },
    ],
    keyStats: {
      avgVacancies: '150–300 per year',
      avgApplicants: '~2.5 Lakhs',
      selectionRatio: '~0.08%',
      lastCutoff: 'Phase-1: ~54–66/200 (Overall UR Cutoff)',
    },
    pyqMetrics: {
      totalQuestions: 1369,
      totalShifts: '6 annual cycles (Phase 1 & 2)',
      provenance: 'Edutap curated RBI Grade B Phase 1 & 2 PYQ Books',
      coverageYears: '2019–2025',
      verifiedPercentage: 100,
    },
    tips: [
      'Focus 60% of Phase 1 preparation time on GA (read 6 months PIB + RBI website)',
      'Practice typing descriptive answers on a keyboard under timed conditions',
      'Master Management theories and Finance basics thoroughly for Phase 2',
    ],
  },
  NABARD_GRADEA: {
    code: 'NABARD_GRADEA',
    tagline: 'Assistant Manager in India’s apex development bank for agriculture and rural prosperity.',
    conductedBy: 'NABARD',
    frequency: 'Once a year (Phase 1 Prelims + Phase 2 Mains + Interview)',
    difficultyLevel: 'Hard',
    difficultyScore: 86,
    difficultyAnalysis: 'Features merit sections (ESI, ARD, GA) and qualifying sections (Quant, Reasoning, English, Decision Making, Computer).',
    eligibility: {
      education: 'Bachelor Degree in any subject with minimum 60% marks (55% for SC/ST/PWBD)',
      ageLimit: '21–30 years',
      attempts: 'No attempt limit within age limit',
      relaxation: 'OBC: +3 years, SC/ST: +5 years',
    },
    stages: [
      {
        name: 'Phase-1 (Preliminary MCQ)',
        type: 'MCQ',
        totalQuestions: 200,
        totalMarks: 200,
        duration: 120,
        negativeMark: 0.25,
        description: '200 MCQs with Merit ranking based exclusively on GA (20M), ESI (40M), and ARD (40M) totaling 100 Marks.',
      },
      {
        name: 'Phase-2 (Main Examination)',
        type: 'Descriptive',
        totalMarks: 200,
        duration: 180,
        description: 'Paper 1 General English (100M) + Paper 2 ESI & ARD (100M, 50 Obj + 50 Desc).',
      },
    ],
    syllabus: [
      {
        subject: 'Agriculture & Rural Development (ARD)',
        topics: ['Agronomy, Soil & Water Conservation, Horticulture, Animal Husbandry', 'Fisheries, Forestry, Agricultural Economics, Rural Development Schemes (PMAY, MGNREGA, NRLM)'],
        weightage: '40 Questions in Phase 1 / 50% of Phase 2',
      },
      {
        subject: 'Economic & Social Issues (ESI)',
        topics: ['Nature of Indian Economy, Inflation, Fiscal Policy, Agriculture & Industry Policy', 'Social Infrastructure, Education, Health, Rural Banking Institutions'],
        weightage: '40 Questions in Phase 1 / 50% of Phase 2',
      },
    ],
    posts: [
      { title: 'Assistant Manager (Grade A - Rural Development Banking Service)', payScale: '₹44,500 Basic (Gross ~₹1.1 Lakh/month)', grade: 'Grade A Officer', department: 'NABARD' },
    ],
    keyStats: {
      avgVacancies: '150–170 per year',
      avgApplicants: '~1.8 Lakhs',
      selectionRatio: '~0.1%',
      lastCutoff: 'Phase-1 Merit: ~41–48/100',
    },
    pyqMetrics: {
      totalQuestions: 1208,
      totalShifts: '5 annual cycles (2021–2025)',
      provenance: 'Edutap NABARD Grade A PYQ Book & BankersAdda compilations',
      coverageYears: '2021–2025',
      verifiedPercentage: 100,
    },
    tips: [
      'Give top priority to ARD and Rural Schemes — they are the decisive rank differentiators',
      'Clear qualifying cutoff in Decision Making and Computer Knowledge with minimum effort',
      'Follow NABARD annual reports and Krishi Vigyan Kendra updates',
    ],
  },
  SEBI_GRADEA: {
    code: 'SEBI_GRADEA',
    tagline: 'Assistant Manager in Securities and Exchange Board of India — regulator of capital markets.',
    conductedBy: 'SEBI',
    frequency: 'Once a year (Phase 1 Prelims + Phase 2 Mains + Interview)',
    difficultyLevel: 'Very Hard',
    difficultyScore: 90,
    difficultyAnalysis: 'High specialized syllabus covering Commerce, Accountancy, Management, Finance, Costing, Companies Act, and Economics.',
    eligibility: {
      education: 'Master Degree in any discipline / Law / Engineering / CA / CFA / CS / Cost Accountant',
      ageLimit: 'Up to 30 years',
      attempts: 'No attempt limit within age criteria',
      relaxation: 'OBC: +3 years, SC/ST: +5 years',
    },
    stages: [
      {
        name: 'Phase-1 (Online Examination)',
        type: 'MCQ',
        totalQuestions: 180,
        totalMarks: 200,
        duration: 100,
        negativeMark: 0.25,
        description: 'Paper 1 (GA, Quant, Reasoning, English - 100M, 30% cutoff) + Paper 2 (Specialized Commerce/Finance - 100M, 40% cutoff). Aggregate 40% required.',
      },
      {
        name: 'Phase-2 (Mains Selection)',
        type: 'MCQ',
        totalMarks: 200,
        duration: 100,
        description: 'Paper 1 English Descriptive (100M, 1/3rd weightage) + Paper 2 Specialized Stream (100M, 2/3rd weightage).',
      },
    ],
    syllabus: [
      {
        subject: 'Commerce & Financial Regulations',
        topics: ['Accounting Standards, Share Capital, Cash Flow, Depreciation', 'Companies Act 2013, Prospectus, Directors, Meetings, Corporate Governance', 'Securities Law, SEBI ICDR/LODR Regulations, Mutual Funds, Primary & Secondary Markets'],
        weightage: 'Paper 2 in both Phase 1 and Phase 2',
      },
      {
        subject: 'Costing, Finance & Economics',
        topics: ['Marginal Costing, Standard Costing, Budgetary Control', 'Financial System, Derivatives, Forex, Monetary Policy', 'Micro & Macro Economics, Balance of Payments, Foreign Capital'],
        weightage: 'Paper 2 in both Phase 1 and Phase 2',
      },
    ],
    posts: [
      { title: 'Assistant Manager (Grade A - General Stream)', payScale: '₹44,500 Basic (Gross CTC ~₹34 LPA with accommodation)', grade: 'Grade A Officer', department: 'SEBI' },
    ],
    keyStats: {
      avgVacancies: '80–120 per year',
      avgApplicants: '~1.2 Lakhs',
      selectionRatio: '~0.08%',
      lastCutoff: 'Phase-1: Absolute cutoffs (30% P1, 40% P2, 40% Aggregate)',
    },
    pyqMetrics: {
      totalQuestions: 908,
      totalShifts: '6 subject-wise books (2020–2025)',
      provenance: 'Edutap SEBI Grade A Phase 1 & 2 Subject-wise Books',
      coverageYears: '2020–2025',
      verifiedPercentage: 100,
    },
    tips: [
      'Phase-1 has fixed percentage cutoffs (no normalization curve), so ensure you hit 40% aggregate safely',
      'Focus heavily on Companies Act 2013 and Costing formulas for Paper 2',
      'Practice descriptive essay and précis writing on financial topics for Phase-2 Paper 1',
    ],
  },
  LIC_AAO: {
    code: 'LIC_AAO',
    tagline: 'Assistant Administrative Officer in Life Insurance Corporation of India.',
    conductedBy: 'LIC of India',
    frequency: 'Periodic (Prelims MCQ + Mains MCQ/Descriptive + Interview)',
    difficultyLevel: 'Moderate',
    difficultyScore: 76,
    difficultyAnalysis: 'High score cutoff in Prelims. Mains tests specialized Insurance & Financial Market Awareness along with Data Interpretation.',
    eligibility: {
      education: 'Bachelor Degree in any discipline from a recognized Indian University',
      ageLimit: '21–30 years',
      attempts: 'No limit within age criteria',
      relaxation: 'OBC: +3 years, SC/ST: +5 years',
    },
    stages: [
      {
        name: 'Prelims (Online Test)',
        type: 'MCQ',
        totalQuestions: 100,
        totalMarks: 70,
        duration: 60,
        negativeMark: 0.25,
        description: 'Reasoning (35Q/35M), Quant (35Q/35M), English (30Q/Qualifying). Ranking based on 70 marks.',
      },
      {
        name: 'Mains Examination',
        type: 'MCQ',
        totalQuestions: 120,
        totalMarks: 300,
        duration: 120,
        negativeMark: 0.25,
        description: 'Reasoning, GK/Current Affairs, Data Analysis, Insurance and Financial Market Awareness + Descriptive English test.',
      },
    ],
    syllabus: [
      {
        subject: 'Insurance & Financial Market Awareness',
        topics: ['History of Indian Insurance, IRDAI Regulations, Life vs Non-Life Insurance', 'Insurance Terminologies (Underwriting, Actuary, Indemnity, Annuity, Surrender Value)', 'Financial Markets, Monetary Policy, Money Market Instruments'],
        weightage: '30 Questions / 60 Marks in Mains',
      },
      {
        subject: 'Data Analysis & Reasoning',
        topics: ['High-level Data Interpretation (Caselets, Radar DI, Missing DI)', 'Puzzles, Seating Arrangements, Critical Reasoning, Coding'],
        weightage: '60 Questions / 180 Marks in Mains',
      },
    ],
    posts: [
      { title: 'Assistant Administrative Officer (Generalist)', payScale: '₹53,600 Basic (Gross ~₹92,000/month)', grade: 'Class I Officer', department: 'LIC of India' },
    ],
    keyStats: {
      avgVacancies: '300–600 per recruitment',
      avgApplicants: '~6–8 Lakhs',
      selectionRatio: '~0.07%',
      lastCutoff: 'Prelims: ~55–58/70 (UR Category)',
    },
    pyqMetrics: {
      totalQuestions: 319,
      totalShifts: '2019 Prelims/Mains + 2023 Memory-Based',
      provenance: 'BankersAdda / Adda247 official and memory-based papers',
      coverageYears: '2019–2023',
      verifiedPercentage: 100,
    },
    tips: [
      'In Prelims, English is only qualifying — maximize attempts in Quant and Reasoning',
      'Study LIC product types (Endowment, Term, ULIP) and insurance principles for Mains',
      'Practice high-level caselet DIs under strict timing',
    ],
  },
  IRDA: {
    code: 'IRDA',
    tagline: 'Assistant Manager in Insurance Regulatory and Development Authority of India.',
    conductedBy: 'IRDAI',
    frequency: 'Periodic (Phase 1 Prelims + Phase 2 Mains Descriptive + Interview)',
    difficultyLevel: 'Hard',
    difficultyScore: 85,
    difficultyAnalysis: 'Tests comprehensive Insurance domain knowledge, Economics, and Management at regulatory standards.',
    eligibility: {
      education: 'Graduation with minimum 60% marks or professional qualifications (CA/CFA/CS/Actuarial)',
      ageLimit: '21–30 years',
      attempts: 'No limit within age criteria',
      relaxation: 'OBC: +3 years, SC/ST: +5 years',
    },
    stages: [
      {
        name: 'Phase-1 (Online Preliminary Test)',
        type: 'MCQ',
        totalQuestions: 160,
        totalMarks: 160,
        duration: 90,
        negativeMark: 0.25,
        description: 'Quant (40Q), Reasoning (40Q), English (40Q), General Awareness (40Q).',
      },
      {
        name: 'Phase-2 (Descriptive Mains)',
        type: 'Descriptive',
        totalMarks: 300,
        duration: 180,
        description: 'Paper 1 English (100M) + Paper 2 Economic and Social Issues (100M) + Paper 3 Insurance and Management (100M).',
      },
    ],
    syllabus: [
      {
        subject: 'Insurance Principles & Regulations',
        topics: ['IRDAI Act 1999, Insurance Act 1938, Consumer Protection in Insurance', 'Principles of Utmost Good Faith, Insurable Interest, Proximate Cause, Subrogation', 'Solvency Margins, Reinsurance, Actuarial Valuation, Micro-insurance'],
        weightage: 'Paper 3 in Phase 2 Mains',
      },
      {
        subject: 'Economic & Social Issues',
        topics: ['Macroeconomic indicators, Inflation, Union Budget, Financial Inclusion', 'Healthcare Infrastructure, Ayushman Bharat, Social Security Insurance Schemes'],
        weightage: 'Paper 2 in Phase 2 Mains',
      },
    ],
    posts: [
      { title: 'Assistant Manager (Grade A)', payScale: '₹44,500 Basic (Gross ~₹1.3 Lakh/month with allowances)', grade: 'Grade A Officer', department: 'IRDAI (Head Office Hyderabad / Regional Offices)' },
    ],
    keyStats: {
      avgVacancies: '40–50 per cycle',
      avgApplicants: '~1 Lakh',
      selectionRatio: '~0.05%',
      lastCutoff: 'Phase-1: ~90–105/160',
    },
    pyqMetrics: {
      totalQuestions: 392,
      totalShifts: '2023 Assistant Manager Insurance & English shifts',
      provenance: 'Adda247 IRDA Assistant Manager PYQs & Insurance capsules',
      coverageYears: '2021–2023',
      verifiedPercentage: 100,
    },
    tips: [
      'Study IRDAI annual reports, Bima Sugam initiative, and insurance penetration statistics in India',
      'Practice drafting 400-word descriptive answers on insurance regulation and financial inclusion',
      'Understand core actuarial concepts and solvency norms',
    ],
  },
};

export function getExamDetail(code: string): ExamDetail | undefined {
  return examDetails[code];
}
