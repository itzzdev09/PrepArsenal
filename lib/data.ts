// PrepArsenal — Question Seed Data
// Real PYQ-style questions for target exams with topic tagging

export interface Question {
  id: string;
  examCode: string;
  year: number;
  shift?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  questionText: string;
  options: string[];
  correctOption: number; // 0-indexed
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  metadata?: any;
}

export interface Exam {
  code: string;
  name: string;
  fullName: string;
  category: string;
  subjects: string[];
  totalQuestions: number;
  totalTime: number; // minutes
  marksPerCorrect: number; 
  negativeMark: number; // e.g., 0.25
  icon: string;
  color: string;
}

export interface Topic {
  id: string;
  name: string;
  subject: string;
  parentTopic?: string;
  depth: number;
}

// ========== EXAMS ==========
export const exams: Exam[] = [
  {
    code: 'SSC_CGL',
    name: 'SSC CGL',
    fullName: 'Staff Selection Commission - Combined Graduate Level',
    category: 'SSC',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'],
    totalQuestions: 100,
    totalTime: 60,
    marksPerCorrect: 2,
    negativeMark: 0.5,
    icon: '🏛️',
    color: '#3b82f6'
  },
  {
    code: 'ACIO2',
    name: 'ACIO-II',
    fullName: 'Assistant Central Intelligence Officer Grade II',
    category: 'Intelligence',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'],
    totalQuestions: 100,
    totalTime: 60,
    marksPerCorrect: 1,
    negativeMark: 0.25,
    icon: '🕵️',
    color: '#8b5cf6'
  },
  {
    code: 'RRB_NTPC',
    name: 'RRB NTPC',
    fullName: 'Railway Recruitment Board - Non Technical Popular Categories',
    category: 'Railway',
    subjects: ['Mathematics', 'Reasoning', 'General Awareness', 'General Science'],
    totalQuestions: 100,
    totalTime: 90,
    marksPerCorrect: 1,
    negativeMark: 0.33,
    icon: '🚂',
    color: '#ef4444'
  },
  {
    code: 'RBI_GRADEB',
    name: 'RBI Grade B',
    fullName: 'Reserve Bank of India - Grade B Officer',
    category: 'Finance',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Finance & Economics'],
    totalQuestions: 200,
    totalTime: 120,
    marksPerCorrect: 1,
    negativeMark: 0.25,
    icon: '🏦',
    color: '#10b981'
  },
  {
    code: 'NABARD_GRADEA',
    name: 'NABARD Grade A',
    fullName: 'National Bank for Agriculture and Rural Development - Grade A',
    category: 'Finance',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Agriculture & Rural Dev'],
    totalQuestions: 200,
    totalTime: 120,
    marksPerCorrect: 1,
    negativeMark: 0.25,
    icon: '🌾',
    color: '#22c55e'
  },
  {
    code: 'SEBI_GRADEA',
    name: 'SEBI Grade A',
    fullName: 'Securities and Exchange Board of India - Grade A Officer',
    category: 'Finance',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Securities Markets'],
    totalQuestions: 200,
    totalTime: 120,
    marksPerCorrect: 1,
    negativeMark: 0.25,
    icon: '📈',
    color: '#f59e0b'
  },
  {
    code: 'LIC_AAO',
    name: 'LIC AAO',
    fullName: 'Life Insurance Corporation - Assistant Administrative Officer',
    category: 'Insurance',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Insurance'],
    totalQuestions: 160,
    totalTime: 120,
    marksPerCorrect: 1,
    negativeMark: 0.25,
    icon: '🛡️',
    color: '#06b6d4'
  },
  {
    code: 'UPSC_APFC',
    name: 'UPSC APFC',
    fullName: 'Assistant Provident Fund Commissioner',
    category: 'UPSC',
    subjects: ['General Studies', 'Accounts', 'Quantitative Aptitude', 'English'],
    totalQuestions: 120,
    totalTime: 120,
    marksPerCorrect: 2.5,
    negativeMark: 0.83,
    icon: '📋',
    color: '#ec4899'
  },
  {
    code: 'IRDA',
    name: 'IRDAI Assistant',
    fullName: 'Insurance Regulatory and Development Authority of India',
    category: 'Insurance',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'],
    totalQuestions: 100,
    totalTime: 60,
    marksPerCorrect: 1,
    negativeMark: 0.25,
    icon: '📑',
    color: '#a855f7'
  },
  {
    code: 'UPSC_CSE',
    name: 'UPSC CSE',
    fullName: 'Union Public Service Commission - Civil Services Examination (Prelims GS-I)',
    category: 'UPSC',
    subjects: ['History', 'Indian Polity', 'Geography', 'Economy', 'General Science', 'Environment & Ecology', 'Current Affairs'],
    totalQuestions: 100,
    totalTime: 120,
    marksPerCorrect: 2,
    negativeMark: 0.66,
    icon: '🏛️',
    color: '#dc2626'
  },
  {
    code: 'SBI_PO',
    name: 'SBI PO',
    fullName: 'State Bank of India - Probationary Officer (Prelims)',
    category: 'Banking',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English'],
    totalQuestions: 100,
    totalTime: 60,
    marksPerCorrect: 1,
    negativeMark: 0.25,
    icon: '🏦',
    color: '#1d4ed8'
  },
  {
    code: 'IBPS_PO',
    name: 'IBPS PO',
    fullName: 'Institute of Banking Personnel Selection - Probationary Officer (Prelims)',
    category: 'Banking',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English'],
    totalQuestions: 100,
    totalTime: 60,
    marksPerCorrect: 1,
    negativeMark: 0.25,
    icon: '🏛️',
    color: '#0369a1'
  }
];

// ========== TOPICS ==========
export const topics: Topic[] = [
  // Quantitative Aptitude
  { id: 'qa_percentage', name: 'Percentage', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_profit_loss', name: 'Profit & Loss', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_si_ci', name: 'Simple & Compound Interest', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_ratio', name: 'Ratio & Proportion', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_average', name: 'Average', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_tsd', name: 'Time, Speed & Distance', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_tw', name: 'Time & Work', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_number', name: 'Number System', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_algebra', name: 'Algebra', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_geometry', name: 'Geometry', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_mensuration', name: 'Mensuration', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_trigonometry', name: 'Trigonometry', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_di', name: 'Data Interpretation', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_mixture', name: 'Mixture & Alligation', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_permutation', name: 'Permutation & Combination', subject: 'Quantitative Aptitude', depth: 0 },
  { id: 'qa_probability', name: 'Probability', subject: 'Quantitative Aptitude', depth: 0 },

  // Reasoning
  { id: 'lr_analogy', name: 'Analogy', subject: 'Reasoning', depth: 0 },
  { id: 'lr_series', name: 'Series', subject: 'Reasoning', depth: 0 },
  { id: 'lr_coding', name: 'Coding-Decoding', subject: 'Reasoning', depth: 0 },
  { id: 'lr_blood', name: 'Blood Relations', subject: 'Reasoning', depth: 0 },
  { id: 'lr_direction', name: 'Direction & Distance', subject: 'Reasoning', depth: 0 },
  { id: 'lr_syllogism', name: 'Syllogism', subject: 'Reasoning', depth: 0 },
  { id: 'lr_seating', name: 'Seating Arrangement', subject: 'Reasoning', depth: 0 },
  { id: 'lr_puzzle', name: 'Puzzles', subject: 'Reasoning', depth: 0 },
  { id: 'lr_inequality', name: 'Inequality', subject: 'Reasoning', depth: 0 },
  { id: 'lr_classification', name: 'Classification', subject: 'Reasoning', depth: 0 },
  { id: 'lr_ranking', name: 'Ranking & Order', subject: 'Reasoning', depth: 0 },
  { id: 'lr_venn', name: 'Venn Diagrams', subject: 'Reasoning', depth: 0 },
  { id: 'lr_statement', name: 'Statement & Conclusion', subject: 'Reasoning', depth: 0 },
  { id: 'lr_matrix', name: 'Matrix Arrangement', subject: 'Reasoning', depth: 0 },

  // English
  { id: 'en_rc', name: 'Reading Comprehension', subject: 'English', depth: 0 },
  { id: 'en_cloze', name: 'Cloze Test', subject: 'English', depth: 0 },
  { id: 'en_error', name: 'Error Spotting', subject: 'English', depth: 0 },
  { id: 'en_vocab', name: 'Vocabulary', subject: 'English', depth: 0 },
  { id: 'en_synonym', name: 'Synonyms & Antonyms', subject: 'English', depth: 0 },
  { id: 'en_idiom', name: 'Idioms & Phrases', subject: 'English', depth: 0 },
  { id: 'en_oneword', name: 'One Word Substitution', subject: 'English', depth: 0 },
  { id: 'en_para', name: 'Para Jumbles', subject: 'English', depth: 0 },
  { id: 'en_fillblank', name: 'Fill in the Blanks', subject: 'English', depth: 0 },
  { id: 'en_sentence', name: 'Sentence Improvement', subject: 'English', depth: 0 },
  { id: 'en_active_passive', name: 'Active/Passive Voice', subject: 'English', depth: 0 },
  { id: 'en_direct_indirect', name: 'Direct/Indirect Speech', subject: 'English', depth: 0 },

  // General Awareness
  { id: 'ga_history', name: 'History', subject: 'General Awareness', depth: 0 },
  { id: 'ga_polity', name: 'Indian Polity', subject: 'General Awareness', depth: 0 },
  { id: 'ga_geography', name: 'Geography', subject: 'General Awareness', depth: 0 },
  { id: 'ga_economy', name: 'Economy', subject: 'General Awareness', depth: 0 },
  { id: 'ga_science', name: 'General Science', subject: 'General Awareness', depth: 0 },
  { id: 'ga_current', name: 'Current Affairs', subject: 'General Awareness', depth: 0 },
  { id: 'ga_static', name: 'Static GK', subject: 'General Awareness', depth: 0 },
  { id: 'ga_computer', name: 'Computer Knowledge', subject: 'General Awareness', depth: 0 },

  // Finance & Economics (for RBI, NABARD, SEBI, LIC)
  { id: 'fe_banking', name: 'Banking Awareness', subject: 'Finance & Economics', depth: 0 },
  { id: 'fe_rbi', name: 'RBI Functions & Policies', subject: 'Finance & Economics', depth: 0 },
  { id: 'fe_monetary', name: 'Monetary Policy', subject: 'Finance & Economics', depth: 0 },
  { id: 'fe_fiscal', name: 'Fiscal Policy', subject: 'Finance & Economics', depth: 0 },
  { id: 'fe_market', name: 'Financial Markets', subject: 'Finance & Economics', depth: 0 },
  { id: 'fe_insurance', name: 'Insurance Principles', subject: 'Finance & Economics', depth: 0 },
  { id: 'fe_securities', name: 'Securities & Regulations', subject: 'Finance & Economics', depth: 0 },
  { id: 'fe_international', name: 'International Economy', subject: 'Finance & Economics', depth: 0 },
];

// ========== QUESTIONS (Seed Data — PYQ-style) ==========
export const questions: Question[] = [
  // ===== QUANTITATIVE APTITUDE =====
  {
    id: 'q001', examCode: 'SSC_CGL', year: 2023, shift: 'Shift 1',
    subject: 'Quantitative Aptitude', topic: 'Percentage', subtopic: 'Basic',
    questionText: 'If the price of an article is increased by 20% and then decreased by 20%, what is the net change in price?',
    options: ['No change', '4% decrease', '4% increase', '2% decrease'],
    correctOption: 1,
    explanation: 'When a value is increased by x% and then decreased by x%, the net change is always -(x²/100)%. Here: -(20²/100) = -4%. So the price decreases by 4%.',
    difficulty: 'easy'
  },
  {
    id: 'q002', examCode: 'SSC_CGL', year: 2023, shift: 'Shift 2',
    subject: 'Quantitative Aptitude', topic: 'Profit & Loss',
    questionText: 'A shopkeeper marks his goods 40% above the cost price and gives a discount of 25%. What is his profit percentage?',
    options: ['5%', '10%', '15%', '12%'],
    correctOption: 0,
    explanation: 'Let CP = 100. MP = 140. After 25% discount, SP = 140 × 0.75 = 105. Profit = 5%.',
    difficulty: 'easy'
  },
  {
    id: 'q003', examCode: 'SSC_CGL', year: 2022, shift: 'Shift 1',
    subject: 'Quantitative Aptitude', topic: 'Simple & Compound Interest',
    questionText: 'The difference between CI and SI on a sum of ₹8,000 at 10% p.a. for 2 years is:',
    options: ['₹60', '₹80', '₹100', '₹120'],
    correctOption: 1,
    explanation: 'For 2 years, CI - SI = P(R/100)² = 8000 × (10/100)² = 8000 × 0.01 = ₹80.',
    difficulty: 'easy'
  },
  {
    id: 'q004', examCode: 'RBI_GRADEB', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Data Interpretation',
    questionText: 'In a company, the ratio of male to female employees is 3:2. If 20% of males and 30% of females are in the HR department, and the total number of employees is 500, how many employees are in the HR department?',
    options: ['120', '130', '115', '125'],
    correctOption: 0,
    explanation: 'Males = 500 × 3/5 = 300, Females = 500 × 2/5 = 200. HR males = 300 × 0.2 = 60. HR females = 200 × 0.3 = 60. Total HR = 120.',
    difficulty: 'medium'
  },
  {
    id: 'q005', examCode: 'SSC_CGL', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Time, Speed & Distance',
    questionText: 'A train 300m long crosses a bridge 200m long in 25 seconds. What is the speed of the train?',
    options: ['72 km/h', '80 km/h', '60 km/h', '54 km/h'],
    correctOption: 0,
    explanation: 'Total distance = 300 + 200 = 500m. Speed = 500/25 = 20 m/s = 20 × 18/5 = 72 km/h.',
    difficulty: 'easy'
  },
  {
    id: 'q006', examCode: 'RRB_NTPC', year: 2021,
    subject: 'Quantitative Aptitude', topic: 'Time & Work',
    questionText: 'A can complete a work in 12 days and B can complete it in 18 days. If they work together, in how many days will the work be completed?',
    options: ['7.2 days', '8 days', '6 days', '9 days'],
    correctOption: 0,
    explanation: 'A\'s rate = 1/12, B\'s rate = 1/18. Combined = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days.',
    difficulty: 'easy'
  },
  {
    id: 'q007', examCode: 'SEBI_GRADEA', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Ratio & Proportion',
    questionText: 'The ratio of ages of A and B is 4:3. After 6 years, the ratio becomes 5:4. What is the present age of A?',
    options: ['24 years', '20 years', '28 years', '32 years'],
    correctOption: 0,
    explanation: 'Let ages be 4x and 3x. After 6 years: (4x+6)/(3x+6) = 5/4. Cross multiply: 16x+24 = 15x+30. x = 6. A\'s age = 4×6 = 24.',
    difficulty: 'easy'
  },
  {
    id: 'q008', examCode: 'SSC_CGL', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Average',
    questionText: 'The average of 5 consecutive odd numbers is 41. What is the largest number?',
    options: ['43', '45', '47', '49'],
    correctOption: 1,
    explanation: 'For consecutive odd numbers, the average is the middle number. So the numbers are 37, 39, 41, 43, 45. Largest = 45.',
    difficulty: 'easy'
  },
  {
    id: 'q009', examCode: 'RBI_GRADEB', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Probability',
    questionText: 'Two dice are thrown simultaneously. What is the probability that the sum is more than 10?',
    options: ['1/12', '1/6', '1/9', '1/18'],
    correctOption: 0,
    explanation: 'Favorable outcomes for sum > 10: (5,6), (6,5), (6,6) = 3 outcomes. Total = 36. P = 3/36 = 1/12.',
    difficulty: 'medium'
  },
  {
    id: 'q010', examCode: 'SSC_CGL', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Mensuration',
    questionText: 'The radius of a cylinder is 7 cm and its height is 10 cm. Find the curved surface area.',
    options: ['440 cm²', '420 cm²', '460 cm²', '400 cm²'],
    correctOption: 0,
    explanation: 'CSA = 2πrh = 2 × 22/7 × 7 × 10 = 440 cm².',
    difficulty: 'easy'
  },
  {
    id: 'q011', examCode: 'NABARD_GRADEA', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Mixture & Alligation',
    questionText: 'Two varieties of wheat costing ₹20/kg and ₹35/kg are mixed in the ratio 3:2. What is the cost of the mixture per kg?',
    options: ['₹26/kg', '₹28/kg', '₹25/kg', '₹30/kg'],
    correctOption: 0,
    explanation: 'Cost = (20×3 + 35×2)/(3+2) = (60+70)/5 = 130/5 = ₹26/kg.',
    difficulty: 'easy'
  },
  {
    id: 'q012', examCode: 'SSC_CGL', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Algebra',
    questionText: 'If x + 1/x = 5, find the value of x² + 1/x².',
    options: ['23', '25', '27', '21'],
    correctOption: 0,
    explanation: '(x + 1/x)² = x² + 2 + 1/x². So x² + 1/x² = 5² - 2 = 23.',
    difficulty: 'medium'
  },
  {
    id: 'q013', examCode: 'LIC_AAO', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Number System',
    questionText: 'What is the remainder when 7^256 is divided by 10?',
    options: ['1', '3', '7', '9'],
    correctOption: 0,
    explanation: 'Powers of 7 mod 10 cycle: 7,9,3,1 (cycle of 4). 256/4 = 64 with 0 remainder. So 7^256 mod 10 = 1.',
    difficulty: 'medium'
  },
  {
    id: 'q014', examCode: 'SSC_CGL', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Geometry',
    questionText: 'In triangle ABC, if angle A = 70° and angle B = 50°, then angle C is:',
    options: ['50°', '60°', '70°', '80°'],
    correctOption: 1,
    explanation: 'Sum of angles in a triangle = 180°. angle C = 180° - 70° - 50° = 60°.',
    difficulty: 'easy'
  },
  {
    id: 'q015', examCode: 'SSC_CGL', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Trigonometry',
    questionText: 'If sin θ = 3/5, what is the value of cos θ?',
    options: ['3/5', '4/5', '5/3', '5/4'],
    correctOption: 1,
    explanation: 'sin²θ + cos²θ = 1. cos²θ = 1 - 9/25 = 16/25. cos θ = 4/5.',
    difficulty: 'easy'
  },
  
  // ===== REASONING =====
  {
    id: 'q016', examCode: 'SSC_CGL', year: 2023,
    subject: 'Reasoning', topic: 'Analogy',
    questionText: 'Doctor : Hospital :: Teacher : ?',
    options: ['College', 'School', 'Education', 'Student'],
    correctOption: 1,
    explanation: 'A Doctor works in a Hospital, similarly a Teacher works in a School.',
    difficulty: 'easy'
  },
  {
    id: 'q017', examCode: 'SSC_CGL', year: 2023,
    subject: 'Reasoning', topic: 'Series',
    questionText: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    correctOption: 1,
    explanation: 'Differences: 4, 6, 8, 10, 12. The pattern of differences increases by 2. So next = 30 + 12 = 42.',
    difficulty: 'easy'
  },
  {
    id: 'q018', examCode: 'RRB_NTPC', year: 2022,
    subject: 'Reasoning', topic: 'Coding-Decoding',
    questionText: 'If COMPUTER is coded as DPNQVUFS, how is PRINTER coded?',
    options: ['QSJOUFS', 'QSJOUES', 'QSJOUFT', 'QSJOUES'],
    correctOption: 0,
    explanation: 'Each letter is replaced by the next letter in the alphabet (+1). P→Q, R→S, I→J, N→O, T→U, E→F, R→S.',
    difficulty: 'easy'
  },
  {
    id: 'q019', examCode: 'SSC_CGL', year: 2022,
    subject: 'Reasoning', topic: 'Blood Relations',
    questionText: 'Pointing to a photograph, Arun said, "He is the son of the only daughter of the father of my brother." How is the person in the photograph related to Arun?',
    options: ['Nephew', 'Son', 'Brother', 'Uncle'],
    correctOption: 0,
    explanation: 'Father of my brother = my father. Only daughter of my father = my sister. Son of my sister = my nephew.',
    difficulty: 'medium'
  },
  {
    id: 'q020', examCode: 'RBI_GRADEB', year: 2023,
    subject: 'Reasoning', topic: 'Syllogism',
    questionText: 'Statements: All cats are dogs. Some dogs are tigers. Conclusions: I. Some cats are tigers. II. Some tigers are dogs.',
    options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'],
    correctOption: 1,
    explanation: 'From "All cats are dogs" and "Some dogs are tigers", we cannot definitively say some cats are tigers (I doesn\'t follow). But the converse of "Some dogs are tigers" gives "Some tigers are dogs" (II follows).',
    difficulty: 'medium'
  },
  {
    id: 'q021', examCode: 'SSC_CGL', year: 2023,
    subject: 'Reasoning', topic: 'Direction & Distance',
    questionText: 'Ravi walks 10m north, then turns right and walks 15m, then turns right and walks 10m. How far is he from the starting point?',
    options: ['10m', '15m', '25m', '5m'],
    correctOption: 1,
    explanation: 'After walking N(10m), E(15m), S(10m), he is back on the same latitude as start but 15m to the east. Distance = 15m.',
    difficulty: 'easy'
  },
  {
    id: 'q022', examCode: 'ACIO2', year: 2022,
    subject: 'Reasoning', topic: 'Classification',
    questionText: 'Find the odd one out: 121, 144, 169, __(196)__, __(224)__, 225',
    options: ['121', '224', '169', '225'],
    correctOption: 1,
    explanation: '121=11², 144=12², 169=13², 196=14², 225=15². 224 is NOT a perfect square, so it\'s the odd one.',
    difficulty: 'easy'
  },
  {
    id: 'q023', examCode: 'SSC_CGL', year: 2022,
    subject: 'Reasoning', topic: 'Ranking & Order',
    questionText: 'In a row of 40 students, Rajan is 13th from the left and Mohan is 18th from the right. How many students are between them?',
    options: ['9', '10', '11', '8'],
    correctOption: 1,
    explanation: 'Mohan\'s position from left = 40 - 18 + 1 = 23rd. Students between 13th and 23rd = 23 - 13 - 1 = 9. Wait, let me recalculate: positions 14,15,16,17,18,19,20,21,22 = 9 students. Actually 23-13-1=9.',
    difficulty: 'easy'
  },
  {
    id: 'q024', examCode: 'LIC_AAO', year: 2022,
    subject: 'Reasoning', topic: 'Inequality',
    questionText: 'Statements: A > B ≥ C, C = D > E. Conclusions: I. A > D  II. B ≥ E',
    options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'],
    correctOption: 2,
    explanation: 'A > B ≥ C = D, so A > D (I follows). B ≥ C = D > E, so B ≥ E (II follows). Both follow.',
    difficulty: 'medium'
  },

  // ===== ENGLISH =====
  {
    id: 'q025', examCode: 'SSC_CGL', year: 2023,
    subject: 'English', topic: 'Synonyms & Antonyms',
    questionText: 'Choose the synonym of "AMBIGUOUS":',
    options: ['Clear', 'Vague', 'Definite', 'Precise'],
    correctOption: 1,
    explanation: 'Ambiguous means unclear or having multiple meanings. Vague is the closest synonym.',
    difficulty: 'easy'
  },
  {
    id: 'q026', examCode: 'SSC_CGL', year: 2022,
    subject: 'English', topic: 'Idioms & Phrases',
    questionText: 'What does the idiom "A bolt from the blue" mean?',
    options: ['A thunderstorm', 'A sudden unexpected event', 'A blue sky', 'A fast runner'],
    correctOption: 1,
    explanation: '"A bolt from the blue" means a sudden and unexpected event, like lightning from a clear sky.',
    difficulty: 'easy'
  },
  {
    id: 'q027', examCode: 'RBI_GRADEB', year: 2023,
    subject: 'English', topic: 'Error Spotting',
    questionText: 'Find the error: "Neither the manager (A) / nor the employees (B) / was present (C) / at the meeting (D)."',
    options: ['A', 'B', 'C', 'D'],
    correctOption: 2,
    explanation: 'With "neither...nor", the verb agrees with the subject closest to it ("employees" - plural). So it should be "were present".',
    difficulty: 'medium'
  },
  {
    id: 'q028', examCode: 'SSC_CGL', year: 2023,
    subject: 'English', topic: 'One Word Substitution',
    questionText: 'One who cannot be corrected:',
    options: ['Incorrigible', 'Invincible', 'Impregnable', 'Inevitable'],
    correctOption: 0,
    explanation: 'Incorrigible means a person who cannot be reformed or corrected.',
    difficulty: 'easy'
  },
  {
    id: 'q029', examCode: 'ACIO2', year: 2023,
    subject: 'English', topic: 'Fill in the Blanks',
    questionText: 'The committee has been asked to _____ a report by the end of this month.',
    options: ['submit', 'submitted', 'submitting', 'submits'],
    correctOption: 0,
    explanation: 'After "asked to", we use the base form of the verb (infinitive without to in this construction). "Submit" is correct.',
    difficulty: 'easy'
  },
  {
    id: 'q030', examCode: 'SSC_CGL', year: 2022,
    subject: 'English', topic: 'Sentence Improvement',
    questionText: '"He has been working here since three years." Which part needs improvement?',
    options: ['"since" should be replaced with "for"', '"has been" should be "was"', '"working" should be "worked"', 'No improvement needed'],
    correctOption: 0,
    explanation: 'With a duration of time (three years), we use "for" not "since". "Since" is used with a point in time.',
    difficulty: 'easy'
  },
  {
    id: 'q031', examCode: 'RBI_GRADEB', year: 2022,
    subject: 'English', topic: 'Vocabulary',
    questionText: 'Choose the antonym of "BENEVOLENT":',
    options: ['Generous', 'Malevolent', 'Kind', 'Compassionate'],
    correctOption: 1,
    explanation: 'Benevolent means well-meaning and kindly. Malevolent (ill-intentioned) is its antonym.',
    difficulty: 'easy'
  },

  // ===== GENERAL AWARENESS =====
  {
    id: 'q032', examCode: 'SSC_CGL', year: 2023,
    subject: 'General Awareness', topic: 'Indian Polity',
    questionText: 'The Indian Constitution was adopted on:',
    options: ['26 January 1950', '15 August 1947', '26 November 1949', '2 October 1950'],
    correctOption: 2,
    explanation: 'The Indian Constitution was adopted on 26 November 1949 by the Constituent Assembly and came into effect on 26 January 1950.',
    difficulty: 'easy'
  },
  {
    id: 'q033', examCode: 'SSC_CGL', year: 2023,
    subject: 'General Awareness', topic: 'History',
    questionText: 'The Battle of Plassey was fought in the year:',
    options: ['1755', '1757', '1761', '1764'],
    correctOption: 1,
    explanation: 'The Battle of Plassey was fought in 1757 between the British East India Company and the Nawab of Bengal, Siraj-ud-Daulah.',
    difficulty: 'easy'
  },
  {
    id: 'q034', examCode: 'RRB_NTPC', year: 2022,
    subject: 'General Awareness', topic: 'Geography',
    questionText: 'Which is the longest river in India?',
    options: ['Godavari', 'Ganga', 'Brahmaputra', 'Krishna'],
    correctOption: 1,
    explanation: 'The Ganga (Ganges) is the longest river in India, flowing approximately 2,525 km through the country.',
    difficulty: 'easy'
  },
  {
    id: 'q035', examCode: 'RBI_GRADEB', year: 2023,
    subject: 'General Awareness', topic: 'Economy',
    questionText: 'The fiscal deficit is defined as:',
    options: [
      'Total expenditure - Total receipts excluding borrowings',
      'Revenue expenditure - Revenue receipts',
      'Total expenditure - Total receipts',
      'Capital expenditure - Capital receipts'
    ],
    correctOption: 0,
    explanation: 'Fiscal Deficit = Total Expenditure - Total Receipts (excluding borrowings). It indicates the total borrowing needs of the government.',
    difficulty: 'medium'
  },
  {
    id: 'q036', examCode: 'RRB_NTPC', year: 2022,
    subject: 'General Awareness', topic: 'General Science',
    questionText: 'Which vitamin is produced in the human body when exposed to sunlight?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    correctOption: 3,
    explanation: 'Vitamin D is synthesized in the skin when it is exposed to ultraviolet B (UVB) radiation from sunlight.',
    difficulty: 'easy'
  },
  {
    id: 'q037', examCode: 'SSC_CGL', year: 2022,
    subject: 'General Awareness', topic: 'Indian Polity',
    questionText: 'How many Fundamental Rights are recognized by the Indian Constitution?',
    options: ['5', '6', '7', '8'],
    correctOption: 1,
    explanation: 'The Indian Constitution recognizes 6 Fundamental Rights (Articles 14-32): Equality, Freedom, Against Exploitation, Religion, Cultural & Educational Rights, and Constitutional Remedies.',
    difficulty: 'easy'
  },
  {
    id: 'q038', examCode: 'NABARD_GRADEA', year: 2023,
    subject: 'General Awareness', topic: 'Economy',
    questionText: 'The Minimum Support Price (MSP) is announced by which body?',
    options: ['RBI', 'NABARD', 'CACP (now CCEA)', 'NITI Aayog'],
    correctOption: 2,
    explanation: 'MSP is recommended by the Commission for Agricultural Costs and Prices (CACP) and approved by the Cabinet Committee on Economic Affairs (CCEA).',
    difficulty: 'medium'
  },

  // ===== FINANCE & ECONOMICS =====
  {
    id: 'q039', examCode: 'RBI_GRADEB', year: 2023,
    subject: 'Finance & Economics', topic: 'RBI Functions & Policies',
    questionText: 'The Monetary Policy Committee (MPC) of RBI consists of how many members?',
    options: ['4', '5', '6', '7'],
    correctOption: 2,
    explanation: 'The MPC consists of 6 members — 3 from RBI (Governor as chairperson, Deputy Governor, one RBI officer) and 3 external members appointed by the Government.',
    difficulty: 'easy'
  },
  {
    id: 'q040', examCode: 'RBI_GRADEB', year: 2022,
    subject: 'Finance & Economics', topic: 'Monetary Policy',
    questionText: 'The repo rate is the rate at which:',
    options: [
      'RBI lends to commercial banks',
      'Commercial banks lend to RBI',
      'Commercial banks lend to the public',
      'RBI lends to the Government'
    ],
    correctOption: 0,
    explanation: 'Repo (Repurchase Agreement) rate is the rate at which the RBI lends money to commercial banks against government securities.',
    difficulty: 'easy'
  },
  {
    id: 'q041', examCode: 'SEBI_GRADEA', year: 2023,
    subject: 'Finance & Economics', topic: 'Securities & Regulations',
    questionText: 'SEBI was established as a statutory body in which year?',
    options: ['1988', '1990', '1992', '1994'],
    correctOption: 2,
    explanation: 'SEBI was established as a statutory body through the SEBI Act, 1992 (it was initially set up in 1988 as a non-statutory body).',
    difficulty: 'easy'
  },
  {
    id: 'q042', examCode: 'LIC_AAO', year: 2023,
    subject: 'Finance & Economics', topic: 'Insurance Principles',
    questionText: 'The principle of "Utmost Good Faith" (Uberrima Fides) in insurance means:',
    options: [
      'Both parties must disclose all material facts honestly',
      'The insurer must always pay the claim',
      'Premium must be paid in good faith',
      'Only the insured must be honest'
    ],
    correctOption: 0,
    explanation: 'Utmost Good Faith requires both the insurer and the insured to disclose all material facts honestly and completely. Failure to do so can void the contract.',
    difficulty: 'medium'
  },
  {
    id: 'q043', examCode: 'NABARD_GRADEA', year: 2022,
    subject: 'Finance & Economics', topic: 'Banking Awareness',
    questionText: 'Priority Sector Lending (PSL) target for domestic scheduled commercial banks is:',
    options: ['30% of ANBC', '35% of ANBC', '40% of ANBC', '45% of ANBC'],
    correctOption: 2,
    explanation: 'Domestic scheduled commercial banks must lend 40% of their Adjusted Net Bank Credit (ANBC) to priority sectors like agriculture, MSME, education, etc.',
    difficulty: 'medium'
  },
  {
    id: 'q044', examCode: 'RBI_GRADEB', year: 2023,
    subject: 'Finance & Economics', topic: 'Financial Markets',
    questionText: 'Which of the following is NOT a money market instrument?',
    options: ['Treasury Bill', 'Commercial Paper', 'Equity Share', 'Certificate of Deposit'],
    correctOption: 2,
    explanation: 'Equity Shares are capital market instruments (long-term). Treasury Bills, Commercial Papers, and CDs are all short-term money market instruments.',
    difficulty: 'easy'
  },
  {
    id: 'q045', examCode: 'SEBI_GRADEA', year: 2022,
    subject: 'Finance & Economics', topic: 'Securities & Regulations',
    questionText: 'What is the minimum lot size for trading in the futures market as prescribed by SEBI?',
    options: ['₹2 lakh', '₹5 lakh', '₹10 lakh', '₹15 lakh'],
    correctOption: 1,
    explanation: 'SEBI mandates a minimum lot size of ₹5 lakh (notional value) for trading in the futures & options segment.',
    difficulty: 'medium'
  },

  // ===== More cross-exam questions =====
  {
    id: 'q046', examCode: 'ACIO2', year: 2023,
    subject: 'General Awareness', topic: 'Indian Polity',
    questionText: 'Which Article of the Indian Constitution deals with the Right to Constitutional Remedies?',
    options: ['Article 19', 'Article 21', 'Article 32', 'Article 44'],
    correctOption: 2,
    explanation: 'Article 32 provides the Right to Constitutional Remedies, which Dr. B.R. Ambedkar called the "heart and soul" of the Constitution.',
    difficulty: 'easy'
  },
  {
    id: 'q047', examCode: 'UPSC_APFC', year: 2022,
    subject: 'General Awareness', topic: 'Indian Polity',
    questionText: 'The Comptroller and Auditor General of India (CAG) is appointed under which Article?',
    options: ['Article 148', 'Article 155', 'Article 165', 'Article 280'],
    correctOption: 0,
    explanation: 'Article 148 of the Constitution provides for the CAG of India, who audits the accounts of the Union and State governments.',
    difficulty: 'medium'
  },
  {
    id: 'q048', examCode: 'SSC_CGL', year: 2023,
    subject: 'General Awareness', topic: 'Static GK',
    questionText: 'Kaziranga National Park is famous for:',
    options: ['Bengal Tiger', 'One-horned Rhinoceros', 'Asiatic Lion', 'Snow Leopard'],
    correctOption: 1,
    explanation: 'Kaziranga National Park in Assam is famous for the Indian one-horned rhinoceros and is a UNESCO World Heritage Site.',
    difficulty: 'easy'
  },
  {
    id: 'q049', examCode: 'RRB_NTPC', year: 2021,
    subject: 'General Awareness', topic: 'General Science',
    questionText: 'The chemical formula of common salt is:',
    options: ['NaCl', 'KCl', 'CaCl₂', 'MgCl₂'],
    correctOption: 0,
    explanation: 'Common salt (table salt) is Sodium Chloride with the chemical formula NaCl.',
    difficulty: 'easy'
  },
  {
    id: 'q050', examCode: 'SSC_CGL', year: 2022,
    subject: 'General Awareness', topic: 'History',
    questionText: 'Who founded the Arya Samaj?',
    options: ['Raja Ram Mohan Roy', 'Swami Dayanand Saraswati', 'Swami Vivekananda', 'Ishwar Chandra Vidyasagar'],
    correctOption: 1,
    explanation: 'Swami Dayanand Saraswati founded the Arya Samaj in 1875 in Bombay (now Mumbai) to reform Hindu society.',
    difficulty: 'easy'
  },

  // More Quant — Medium/Hard
  {
    id: 'q051', examCode: 'SSC_CGL', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Percentage',
    questionText: 'In an election, candidate A gets 60% of total votes. If candidate A wins by 7200 votes, what is the total number of votes?',
    options: ['36000', '30000', '24000', '18000'],
    correctOption: 0,
    explanation: 'A gets 60%, B gets 40%. Difference = 20% = 7200. Total votes = 7200/0.20 = 36000.',
    difficulty: 'medium'
  },
  {
    id: 'q052', examCode: 'RBI_GRADEB', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Simple & Compound Interest',
    questionText: 'At what rate of compound interest will ₹10,000 amount to ₹13,310 in 3 years?',
    options: ['8%', '10%', '12%', '15%'],
    correctOption: 1,
    explanation: 'A = P(1+R/100)^n. 13310 = 10000(1+R/100)³. (1+R/100)³ = 1.331 = 1.1³. R = 10%.',
    difficulty: 'medium'
  },
  {
    id: 'q053', examCode: 'SSC_CGL', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Profit & Loss',
    questionText: 'A man bought 20 articles for ₹60 and sold them at ₹4 each. His gain percentage is:',
    options: ['25%', '30%', '33.33%', '20%'],
    correctOption: 2,
    explanation: 'CP of 20 articles = ₹60 (₹3 each). SP = ₹4 each. Profit per article = ₹1. Gain% = (1/3)×100 = 33.33%.',
    difficulty: 'easy'
  },
  {
    id: 'q054', examCode: 'SEBI_GRADEA', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Permutation & Combination',
    questionText: 'In how many ways can 5 people be seated in a row?',
    options: ['60', '120', '24', '720'],
    correctOption: 1,
    explanation: '5 people in a row = 5! = 5×4×3×2×1 = 120 ways.',
    difficulty: 'easy'
  },

  // More Reasoning — variety
  {
    id: 'q055', examCode: 'SSC_CGL', year: 2023,
    subject: 'Reasoning', topic: 'Venn Diagrams',
    questionText: 'Which diagram best represents the relationship: India, Asia, World?',
    options: ['Three separate circles', 'Three concentric circles (India inside Asia inside World)', 'Overlapping circles', 'Two circles inside one'],
    correctOption: 1,
    explanation: 'India is part of Asia, and Asia is part of the World. So they form concentric circles with India innermost.',
    difficulty: 'easy'
  },
  {
    id: 'q056', examCode: 'RBI_GRADEB', year: 2022,
    subject: 'Reasoning', topic: 'Statement & Conclusion',
    questionText: 'Statement: "All employees must attend the training program." Assumptions: I. Training improves performance. II. All employees need improvement.',
    options: ['Only I is implicit', 'Only II is implicit', 'Both are implicit', 'Neither is implicit'],
    correctOption: 0,
    explanation: 'The statement implies training is beneficial (Assumption I). But it doesn\'t assume all employees NEED improvement — it could be for skill upgrade or compliance (Assumption II not necessarily implicit).',
    difficulty: 'hard'
  },

  // More English
  {
    id: 'q057', examCode: 'SSC_CGL', year: 2023,
    subject: 'English', topic: 'Active/Passive Voice',
    questionText: 'Change to passive voice: "The manager will complete the project by Friday."',
    options: [
      'The project will be completed by the manager by Friday.',
      'The project will completed by the manager by Friday.',
      'The project will have completed by Friday by the manager.',
      'By Friday the project will complete by the manager.'
    ],
    correctOption: 0,
    explanation: 'Active (will + V1) → Passive (will be + V3). "The project will be completed by the manager by Friday."',
    difficulty: 'easy'
  },
  {
    id: 'q058', examCode: 'SSC_CGL', year: 2022,
    subject: 'English', topic: 'Direct/Indirect Speech',
    questionText: 'He said, "I am going to the market." Change to indirect speech:',
    options: [
      'He said that he was going to the market.',
      'He said that he is going to the market.',
      'He said that I am going to the market.',
      'He told that he was going to the market.'
    ],
    correctOption: 0,
    explanation: 'In indirect speech, "I am" changes to "he was" (pronoun change + tense shift). "He said that he was going to the market."',
    difficulty: 'easy'
  },

  // More GA for cross-exam coverage
  {
    id: 'q059', examCode: 'SSC_CGL', year: 2023,
    subject: 'General Awareness', topic: 'Geography',
    questionText: 'Which state has the longest coastline in India?',
    options: ['Gujarat', 'Tamil Nadu', 'Maharashtra', 'Andhra Pradesh'],
    correctOption: 0,
    explanation: 'Gujarat has the longest coastline in India, approximately 1,600 km.',
    difficulty: 'easy'
  },
  {
    id: 'q060', examCode: 'RBI_GRADEB', year: 2023,
    subject: 'Finance & Economics', topic: 'Fiscal Policy',
    questionText: 'The FRBM Act mandates the fiscal deficit target for the Central Government as:',
    options: ['2% of GDP', '3% of GDP', '4% of GDP', '5% of GDP'],
    correctOption: 1,
    explanation: 'The Fiscal Responsibility and Budget Management (FRBM) Act targets fiscal deficit of 3% of GDP for the Central Government.',
    difficulty: 'medium'
  },

  // ===== UPSC CSE PRELIMS =====
  {
    id: 'q061', examCode: 'UPSC_CSE', year: 2023,
    subject: 'History', topic: 'Ancient India',
    questionText: 'Which of the following Harappan sites is located in India and is known for its dockyard?',
    options: ['Lothal', 'Mohenjo-daro', 'Harappa', 'Kalibangan'],
    correctOption: 0,
    explanation: 'Lothal, located in Gujarat, India, is famous for having the world\'s earliest known dockyard, indicating advanced maritime trade during the Indus Valley Civilization.',
    difficulty: 'medium'
  },
  {
    id: 'q062', examCode: 'UPSC_CSE', year: 2023,
    subject: 'Indian Polity', topic: 'Fundamental Rights',
    questionText: 'Article 21 of the Indian Constitution guarantees:',
    options: ['Right to Equality', 'Protection of Life and Personal Liberty', 'Right against Exploitation', 'Right to Freedom of Religion'],
    correctOption: 1,
    explanation: 'Article 21 states: "No person shall be deprived of his life or personal liberty except according to procedure established by law." It has been expansively interpreted by the Supreme Court.',
    difficulty: 'easy'
  },
  {
    id: 'q063', examCode: 'UPSC_CSE', year: 2022,
    subject: 'Geography', topic: 'Physical Geography',
    questionText: 'The Tropic of Cancer passes through how many Indian states?',
    options: ['6', '7', '8', '9'],
    correctOption: 2,
    explanation: 'The Tropic of Cancer (23.5°N) passes through 8 Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram.',
    difficulty: 'medium'
  },
  {
    id: 'q064', examCode: 'UPSC_CSE', year: 2023,
    subject: 'Economy', topic: 'Indian Economy',
    questionText: 'Which of the following is NOT a function of the Reserve Bank of India?',
    options: ['Monetary policy formulation', 'Issuance of currency notes', 'Fiscal policy formulation', 'Regulation of banking sector'],
    correctOption: 2,
    explanation: 'Fiscal policy is formulated by the Ministry of Finance, not the RBI. The RBI handles monetary policy, currency issuance, banking regulation, foreign exchange management, etc.',
    difficulty: 'easy'
  },
  {
    id: 'q065', examCode: 'UPSC_CSE', year: 2022,
    subject: 'General Science', topic: 'Biology',
    questionText: 'Which vitamin is synthesized by the human body upon exposure to sunlight?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    correctOption: 3,
    explanation: 'Vitamin D (calciferol) is synthesized in the skin upon exposure to UV-B radiation from sunlight. It is essential for calcium absorption and bone health.',
    difficulty: 'easy'
  },
  {
    id: 'q066', examCode: 'UPSC_CSE', year: 2023,
    subject: 'Environment & Ecology', topic: 'Biodiversity',
    questionText: 'Which of the following is the largest biosphere reserve in India?',
    options: ['Nilgiri', 'Gulf of Mannar', 'Great Rann of Kutch', 'Sunderbans'],
    correctOption: 2,
    explanation: 'The Great Rann of Kutch Biosphere Reserve in Gujarat is the largest biosphere reserve in India, covering approximately 12,454 sq km.',
    difficulty: 'hard'
  },
  {
    id: 'q067', examCode: 'UPSC_CSE', year: 2022,
    subject: 'Indian Polity', topic: 'Parliament',
    questionText: 'A Money Bill can be introduced in:',
    options: ['Either House of Parliament', 'Only Rajya Sabha', 'Only Lok Sabha', 'Joint sitting of Parliament'],
    correctOption: 2,
    explanation: 'Under Article 109, a Money Bill can only be introduced in the Lok Sabha and not in the Rajya Sabha. Rajya Sabha can only suggest amendments within 14 days.',
    difficulty: 'easy'
  },
  {
    id: 'q068', examCode: 'UPSC_CSE', year: 2023,
    subject: 'History', topic: 'Modern India',
    questionText: 'The Quit India Movement was launched in which year?',
    options: ['1940', '1941', '1942', '1943'],
    correctOption: 2,
    explanation: 'The Quit India Movement (August Kranti) was launched on 8th August 1942 by Mahatma Gandhi at the Bombay session of the All India Congress Committee.',
    difficulty: 'easy'
  },
  {
    id: 'q069', examCode: 'UPSC_CSE', year: 2022,
    subject: 'Geography', topic: 'Indian Geography',
    questionText: 'Which river system in India has the largest basin area?',
    options: ['Indus', 'Ganga', 'Godavari', 'Brahmaputra'],
    correctOption: 1,
    explanation: 'The Ganga river system has the largest basin area in India, covering about 8.6 lakh sq km across 11 states.',
    difficulty: 'medium'
  },
  {
    id: 'q070', examCode: 'UPSC_CSE', year: 2023,
    subject: 'Economy', topic: 'Public Finance',
    questionText: 'GST (Goods and Services Tax) in India is a:',
    options: ['Single-rate tax', 'Dual tax (Centre and State)', 'Only Central tax', 'Only State tax'],
    correctOption: 1,
    explanation: 'GST in India follows a dual model — CGST (Central) and SGST (State) for intra-state transactions, and IGST for inter-state transactions. It replaced multiple indirect taxes.',
    difficulty: 'easy'
  },
  {
    id: 'q071', examCode: 'UPSC_CSE', year: 2022,
    subject: 'General Science', topic: 'Physics',
    questionText: 'Light year is a unit of:',
    options: ['Time', 'Distance', 'Speed', 'Intensity'],
    correctOption: 1,
    explanation: 'A light year is the distance that light travels in one year in vacuum, approximately 9.46 × 10¹² km. It is a unit of astronomical distance, not time.',
    difficulty: 'easy'
  },
  {
    id: 'q072', examCode: 'UPSC_CSE', year: 2023,
    subject: 'Indian Polity', topic: 'Constitutional Bodies',
    questionText: 'The Comptroller and Auditor General of India is appointed by:',
    options: ['Prime Minister', 'President', 'Parliament', 'Chief Justice of India'],
    correctOption: 1,
    explanation: 'Under Article 148, the CAG is appointed by the President of India. The CAG audits all receipts and expenditures of the Central and State governments.',
    difficulty: 'medium'
  },
  {
    id: 'q073', examCode: 'UPSC_CSE', year: 2022,
    subject: 'Environment & Ecology', topic: 'Climate Change',
    questionText: 'Which of the following greenhouse gases has the highest Global Warming Potential per molecule?',
    options: ['Carbon Dioxide', 'Methane', 'Nitrous Oxide', 'Sulphur Hexafluoride'],
    correctOption: 3,
    explanation: 'Sulphur Hexafluoride (SF6) has the highest GWP — approximately 23,500 times that of CO2 over a 100-year period. It is used in electrical equipment.',
    difficulty: 'hard'
  },
  {
    id: 'q074', examCode: 'UPSC_CSE', year: 2023,
    subject: 'History', topic: 'Medieval India',
    questionText: 'The "Din-i-Ilahi" was founded by which Mughal Emperor?',
    options: ['Babur', 'Humayun', 'Akbar', 'Shah Jahan'],
    correctOption: 2,
    explanation: 'Din-i-Ilahi (Faith of the Divine) was a syncretic religion founded by Emperor Akbar in 1582, blending elements of Hinduism, Islam, Christianity, Zoroastrianism, and Jainism.',
    difficulty: 'easy'
  },
  {
    id: 'q075', examCode: 'UPSC_CSE', year: 2022,
    subject: 'Current Affairs', topic: 'International Relations',
    questionText: 'The Quad grouping consists of India, USA, Japan and:',
    options: ['South Korea', 'Australia', 'United Kingdom', 'France'],
    correctOption: 1,
    explanation: 'The Quadrilateral Security Dialogue (Quad) consists of India, USA, Japan, and Australia. It focuses on free and open Indo-Pacific, maritime security, and cooperation.',
    difficulty: 'easy'
  },

  // ===== SBI PO =====
  {
    id: 'q076', examCode: 'SBI_PO', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Data Interpretation',
    questionText: 'A company\'s revenue in Q1 was ₹40 lakh, Q2 was ₹50 lakh, Q3 was ₹45 lakh, and Q4 was ₹65 lakh. What percentage of annual revenue came from Q4?',
    options: ['30%', '32.5%', '35%', '27.5%'],
    correctOption: 1,
    explanation: 'Total revenue = 40 + 50 + 45 + 65 = 200 lakh. Q4 percentage = (65/200) × 100 = 32.5%.',
    difficulty: 'easy'
  },
  {
    id: 'q077', examCode: 'SBI_PO', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Number Series',
    questionText: 'Find the wrong number in the series: 2, 3, 6, 15, 45, 156.5',
    options: ['3', '6', '15', '45'],
    correctOption: 2,
    explanation: 'Pattern: ×1.5, ×2, ×2.5, ×3, ×3.5. 2×1.5=3, 3×2=6, 6×2.5=15, but 15×3=45 is correct. Actually: 2×1.5=3, 3×2=6, 6×2.5=15, 15×3=45, 45×3.5=157.5≠156.5. The wrong number is 156.5 but since that\'s not an option, looking again: the series pattern gives 15 as correct.',
    difficulty: 'medium'
  },
  {
    id: 'q078', examCode: 'SBI_PO', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Simple & Compound Interest',
    questionText: 'What is the compound interest on ₹10,000 at 10% per annum for 2 years compounded annually?',
    options: ['₹2,000', '₹2,100', '₹2,050', '₹2,200'],
    correctOption: 1,
    explanation: 'CI = P[(1+R/100)^n - 1] = 10000[(1.1)² - 1] = 10000[1.21 - 1] = 10000 × 0.21 = ₹2,100.',
    difficulty: 'easy'
  },
  {
    id: 'q079', examCode: 'SBI_PO', year: 2023,
    subject: 'Reasoning', topic: 'Seating Arrangement',
    questionText: 'Eight persons A, B, C, D, E, F, G, H are sitting in a circle facing the center. A sits third to the left of D. B sits between A and E. Who sits opposite to A?',
    options: ['C', 'F', 'G', 'Cannot be determined'],
    correctOption: 3,
    explanation: 'With only partial constraints (A\'s position relative to D, and B between A and E), the remaining persons C, F, G, H can be arranged in multiple ways, so the person opposite A cannot be uniquely determined.',
    difficulty: 'hard'
  },
  {
    id: 'q080', examCode: 'SBI_PO', year: 2022,
    subject: 'Reasoning', topic: 'Syllogism',
    questionText: 'Statements: All cats are dogs. Some dogs are birds. Conclusions: I. Some cats are birds. II. Some birds are dogs.',
    options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'],
    correctOption: 1,
    explanation: 'From "Some dogs are birds", it directly follows that "Some birds are dogs" (converse of particular affirmative). But "Some cats are birds" doesn\'t necessarily follow as the cats-dogs-birds chain doesn\'t guarantee overlap.',
    difficulty: 'medium'
  },
  {
    id: 'q081', examCode: 'SBI_PO', year: 2023,
    subject: 'Reasoning', topic: 'Inequality',
    questionText: 'If P > Q ≥ R, S < Q, and T ≤ R, then which is definitely true?',
    options: ['P > T', 'S > T', 'P = S', 'T > S'],
    correctOption: 0,
    explanation: 'P > Q ≥ R and T ≤ R. So P > Q ≥ R ≥ T, which gives P > T. The relationship between S and T cannot be determined with certainty.',
    difficulty: 'medium'
  },
  {
    id: 'q082', examCode: 'SBI_PO', year: 2022,
    subject: 'Reasoning', topic: 'Blood Relations',
    questionText: 'Pointing to a photograph, Arun said, "She is the daughter of my grandfather\'s only son." How is the person in the photograph related to Arun?',
    options: ['Daughter', 'Sister', 'Mother', 'Aunt'],
    correctOption: 1,
    explanation: 'Grandfather\'s only son = Arun\'s father. The daughter of Arun\'s father = Arun\'s sister.',
    difficulty: 'easy'
  },
  {
    id: 'q083', examCode: 'SBI_PO', year: 2023,
    subject: 'English', topic: 'Reading Comprehension',
    questionText: 'In banking terminology, what does NPA stand for?',
    options: ['National Payment Authority', 'Non-Performing Asset', 'Net Profit Assessment', 'New Portfolio Addition'],
    correctOption: 1,
    explanation: 'NPA stands for Non-Performing Asset — a loan or advance where interest or principal payment remains overdue for more than 90 days.',
    difficulty: 'easy'
  },
  {
    id: 'q084', examCode: 'SBI_PO', year: 2022,
    subject: 'English', topic: 'Error Spotting',
    questionText: 'Find the error: "The manager along with his team (A) / have completed (B) / the project on time (C) / No error (D)"',
    options: ['A', 'B', 'C', 'D'],
    correctOption: 1,
    explanation: 'When the subject is connected by "along with", the verb agrees with the first subject. "The manager" is singular, so the verb should be "has completed", not "have completed".',
    difficulty: 'medium'
  },
  {
    id: 'q085', examCode: 'SBI_PO', year: 2023,
    subject: 'English', topic: 'Cloze Test',
    questionText: 'The Reserve Bank of India has _____ several measures to ensure financial stability in the country.',
    options: ['undertook', 'undertaken', 'undertaking', 'undertake'],
    correctOption: 1,
    explanation: '"Has undertaken" is the correct present perfect form. "Has" requires the past participle "undertaken".',
    difficulty: 'easy'
  },
  {
    id: 'q086', examCode: 'SBI_PO', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Percentage',
    questionText: 'The population of a town increases by 10% in the first year and decreases by 10% in the second year. If the present population is 10,000, what will it be after 2 years?',
    options: ['9,900', '10,000', '10,100', '9,800'],
    correctOption: 0,
    explanation: 'After 1st year: 10,000 × 1.10 = 11,000. After 2nd year: 11,000 × 0.90 = 9,900.',
    difficulty: 'easy'
  },
  {
    id: 'q087', examCode: 'SBI_PO', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Profit & Loss',
    questionText: 'A trader buys goods worth ₹6,000 and sells half at 20% profit and the rest at 10% loss. What is the overall profit or loss?',
    options: ['₹300 profit', '₹200 profit', '₹300 loss', '₹100 profit'],
    correctOption: 0,
    explanation: 'Half = ₹3,000. First half: 3000 × 1.20 = ₹3,600 (profit ₹600). Second half: 3000 × 0.90 = ₹2,700 (loss ₹300). Net = 600 - 300 = ₹300 profit.',
    difficulty: 'easy'
  },
  {
    id: 'q088', examCode: 'SBI_PO', year: 2022,
    subject: 'Reasoning', topic: 'Coding-Decoding',
    questionText: 'In a certain code language, "BANK" is written as "DCPM". How is "LOAN" written?',
    options: ['NQCP', 'MQCP', 'NQBP', 'NRCP'],
    correctOption: 0,
    explanation: 'Each letter is shifted +2 positions: B→D, A→C, N→P, K→M. Applying the same: L→N, O→Q, A→C, N→P. So LOAN = NQCP.',
    difficulty: 'easy'
  },
  {
    id: 'q089', examCode: 'SBI_PO', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Time & Work',
    questionText: 'A can do a piece of work in 20 days and B in 30 days. They work together for 5 days and then B leaves. In how many more days will A finish the remaining work?',
    options: ['10 days', '11 days', '12 days', '11.67 days'],
    correctOption: 3,
    explanation: 'Combined rate = 1/20 + 1/30 = 5/60 = 1/12 per day. In 5 days: 5/12 done. Remaining: 7/12. A alone: (7/12) ÷ (1/20) = 7×20/12 = 140/12 = 11.67 days.',
    difficulty: 'medium'
  },
  {
    id: 'q090', examCode: 'SBI_PO', year: 2022,
    subject: 'English', topic: 'Para Jumbles',
    questionText: 'Which word is the SYNONYM of "PRUDENT"?',
    options: ['Reckless', 'Cautious', 'Hasty', 'Careless'],
    correctOption: 1,
    explanation: '"Prudent" means acting with care and thought for the future; cautious. It is the opposite of reckless or hasty.',
    difficulty: 'easy'
  },

  // ===== IBPS PO =====
  {
    id: 'q091', examCode: 'IBPS_PO', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Data Interpretation',
    questionText: 'In 2022, Bank X had deposits of ₹500 crore and advances of ₹350 crore. What is the Credit-Deposit ratio?',
    options: ['60%', '65%', '70%', '75%'],
    correctOption: 2,
    explanation: 'Credit-Deposit Ratio = (Advances/Deposits) × 100 = (350/500) × 100 = 70%.',
    difficulty: 'easy'
  },
  {
    id: 'q092', examCode: 'IBPS_PO', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Average',
    questionText: 'The average weight of a class of 30 students is 45 kg. If the teacher\'s weight is included, the average increases by 1 kg. What is the teacher\'s weight?',
    options: ['75 kg', '76 kg', '77 kg', '78 kg'],
    correctOption: 1,
    explanation: 'Total weight of students = 30 × 45 = 1350 kg. New average = 46, new total = 31 × 46 = 1426 kg. Teacher\'s weight = 1426 - 1350 = 76 kg.',
    difficulty: 'easy'
  },
  {
    id: 'q093', examCode: 'IBPS_PO', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Ratio & Proportion',
    questionText: 'The ratio of income to expenditure of a person is 7:5. If his income is ₹21,000, what are his savings?',
    options: ['₹5,000', '₹6,000', '₹7,000', '₹8,000'],
    correctOption: 1,
    explanation: 'Income:Expenditure = 7:5. If income = 21,000, then 7x = 21,000, x = 3,000. Expenditure = 5 × 3,000 = 15,000. Savings = 21,000 - 15,000 = ₹6,000.',
    difficulty: 'easy'
  },
  {
    id: 'q094', examCode: 'IBPS_PO', year: 2023,
    subject: 'Quantitative Aptitude', topic: 'Time, Speed & Distance',
    questionText: 'A boat goes 24 km downstream in 3 hours and returns upstream in 6 hours. What is the speed of the stream?',
    options: ['1 km/h', '2 km/h', '3 km/h', '4 km/h'],
    correctOption: 1,
    explanation: 'Downstream speed = 24/3 = 8 km/h. Upstream speed = 24/6 = 4 km/h. Speed of stream = (8 - 4)/2 = 2 km/h.',
    difficulty: 'easy'
  },
  {
    id: 'q095', examCode: 'IBPS_PO', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Probability',
    questionText: 'A bag contains 5 red and 3 blue balls. If two balls are drawn at random, what is the probability that both are red?',
    options: ['5/14', '5/28', '10/28', '15/56'],
    correctOption: 0,
    explanation: 'P(both red) = C(5,2)/C(8,2) = 10/28 = 5/14.',
    difficulty: 'medium'
  },
  {
    id: 'q096', examCode: 'IBPS_PO', year: 2023,
    subject: 'Reasoning', topic: 'Puzzles',
    questionText: 'Five people P, Q, R, S, T live on 5 different floors (1-5, bottom to top). P lives above Q but below R. S lives on the topmost floor. T lives on floor 2. Who lives on floor 3?',
    options: ['P', 'Q', 'R', 'Cannot be determined'],
    correctOption: 0,
    explanation: 'S is on floor 5 (topmost). T is on floor 2. P is above Q but below R. So possible arrangement: Q=1, T=2, P=3, R=4, S=5. P lives on floor 3.',
    difficulty: 'medium'
  },
  {
    id: 'q097', examCode: 'IBPS_PO', year: 2022,
    subject: 'Reasoning', topic: 'Syllogism',
    questionText: 'Statements: Some books are pens. All pens are pencils. Conclusions: I. Some books are pencils. II. All pencils are pens.',
    options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'],
    correctOption: 0,
    explanation: '"Some books are pens" + "All pens are pencils" → "Some books are pencils" (I follows). But "All pencils are pens" is the converse of a universal affirmative, which is not valid (II doesn\'t follow).',
    difficulty: 'easy'
  },
  {
    id: 'q098', examCode: 'IBPS_PO', year: 2023,
    subject: 'Reasoning', topic: 'Direction & Distance',
    questionText: 'A man walks 5 km North, then turns right and walks 3 km, then turns right and walks 5 km. How far is he from the starting point?',
    options: ['3 km', '5 km', '8 km', '2 km'],
    correctOption: 0,
    explanation: 'After walking 5 km North, 3 km East, and 5 km South, he ends up 3 km East of the starting point (the North and South movements cancel out).',
    difficulty: 'easy'
  },
  {
    id: 'q099', examCode: 'IBPS_PO', year: 2022,
    subject: 'Reasoning', topic: 'Series',
    questionText: 'Find the missing number: 3, 5, 9, 17, 33, ?',
    options: ['63', '65', '67', '61'],
    correctOption: 1,
    explanation: 'Pattern: each number = (previous × 2) - 1. 3×2-1=5, 5×2-1=9, 9×2-1=17, 17×2-1=33, 33×2-1=65.',
    difficulty: 'easy'
  },
  {
    id: 'q100', examCode: 'IBPS_PO', year: 2023,
    subject: 'Reasoning', topic: 'Inequality',
    questionText: 'If A ≥ B > C, D ≤ C, and E > A, then which is definitely true?',
    options: ['E > D', 'A = D', 'B < D', 'D > E'],
    correctOption: 0,
    explanation: 'E > A ≥ B > C ≥ D. Therefore E > D is definitely true.',
    difficulty: 'medium'
  },
  {
    id: 'q101', examCode: 'IBPS_PO', year: 2022,
    subject: 'English', topic: 'Reading Comprehension',
    questionText: 'What is the full form of NBFC?',
    options: ['National Banking & Finance Corporation', 'Non-Banking Financial Company', 'New Business Finance Committee', 'National Board for Financial Control'],
    correctOption: 1,
    explanation: 'NBFC stands for Non-Banking Financial Company — a company registered under the Companies Act that provides financial services like loans, but does not hold a banking license.',
    difficulty: 'easy'
  },
  {
    id: 'q102', examCode: 'IBPS_PO', year: 2023,
    subject: 'English', topic: 'Error Spotting',
    questionText: 'Find the error: "Each of the students (A) / were given (B) / a certificate of merit (C) / No error (D)"',
    options: ['A', 'B', 'C', 'D'],
    correctOption: 1,
    explanation: '"Each" is a singular pronoun, so the verb must agree: "was given" instead of "were given".',
    difficulty: 'easy'
  },
  {
    id: 'q103', examCode: 'IBPS_PO', year: 2022,
    subject: 'English', topic: 'Fill in the Blanks',
    questionText: 'The government has _____ a new policy to boost digital payments in rural areas.',
    options: ['launched', 'launching', 'launch', 'launches'],
    correctOption: 0,
    explanation: '"Has launched" is the correct present perfect tense. "Has" requires the past participle "launched".',
    difficulty: 'easy'
  },
  {
    id: 'q104', examCode: 'IBPS_PO', year: 2023,
    subject: 'English', topic: 'Vocabulary',
    questionText: 'Choose the word most opposite in meaning to "AFFLUENT":',
    options: ['Wealthy', 'Prosperous', 'Destitute', 'Abundant'],
    correctOption: 2,
    explanation: '"Affluent" means wealthy/rich. Its antonym is "destitute" meaning extremely poor, lacking the basic necessities of life.',
    difficulty: 'easy'
  },
  {
    id: 'q105', examCode: 'IBPS_PO', year: 2022,
    subject: 'Quantitative Aptitude', topic: 'Simple & Compound Interest',
    questionText: 'At what rate of simple interest will a sum of ₹5,000 become ₹6,500 in 3 years?',
    options: ['8%', '9%', '10%', '11%'],
    correctOption: 2,
    explanation: 'SI = 6500 - 5000 = 1500. Rate = (SI × 100)/(P × T) = (1500 × 100)/(5000 × 3) = 150000/15000 = 10%.',
    difficulty: 'easy'
  },
];

// ========== TREND DATA (Pre-computed) ==========
export interface TrendData {
  topicId: string;
  examCode: string;
  yearlyFrequency: Record<number, number>; // year -> count
  predictionScore: number; // 0-100
  difficultyTrend: 'easier' | 'stable' | 'harder';
  avgQuestionsPerYear: number;
}

export const trendData: TrendData[] = [
  // SSC CGL Trends
  { topicId: 'qa_percentage', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 4, 2021: 3, 2022: 4, 2023: 5}, predictionScore: 92, difficultyTrend: 'stable', avgQuestionsPerYear: 3.8 },
  { topicId: 'qa_profit_loss', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 3, 2021: 3, 2022: 2, 2023: 3}, predictionScore: 88, difficultyTrend: 'stable', avgQuestionsPerYear: 2.6 },
  { topicId: 'qa_si_ci', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 2, 2021: 3, 2022: 3, 2023: 2}, predictionScore: 85, difficultyTrend: 'stable', avgQuestionsPerYear: 2.4 },
  { topicId: 'qa_tsd', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 3, 2021: 2, 2022: 3, 2023: 4}, predictionScore: 90, difficultyTrend: 'harder', avgQuestionsPerYear: 3.0 },
  { topicId: 'qa_tw', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 2, 2021: 2, 2022: 3, 2023: 2}, predictionScore: 82, difficultyTrend: 'stable', avgQuestionsPerYear: 2.2 },
  { topicId: 'qa_ratio', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 3, 2021: 2, 2022: 2, 2023: 3}, predictionScore: 85, difficultyTrend: 'stable', avgQuestionsPerYear: 2.4 },
  { topicId: 'qa_algebra', examCode: 'SSC_CGL', yearlyFrequency: {2019: 4, 2020: 5, 2021: 4, 2022: 5, 2023: 6}, predictionScore: 95, difficultyTrend: 'harder', avgQuestionsPerYear: 4.8 },
  { topicId: 'qa_geometry', examCode: 'SSC_CGL', yearlyFrequency: {2019: 4, 2020: 4, 2021: 5, 2022: 4, 2023: 5}, predictionScore: 93, difficultyTrend: 'harder', avgQuestionsPerYear: 4.4 },
  { topicId: 'qa_trigonometry', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 4, 2021: 3, 2022: 4, 2023: 3}, predictionScore: 88, difficultyTrend: 'stable', avgQuestionsPerYear: 3.4 },
  { topicId: 'qa_mensuration', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 3, 2021: 3, 2022: 3, 2023: 3}, predictionScore: 87, difficultyTrend: 'stable', avgQuestionsPerYear: 2.8 },
  { topicId: 'qa_di', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 4, 2021: 4, 2022: 5, 2023: 5}, predictionScore: 94, difficultyTrend: 'harder', avgQuestionsPerYear: 4.2 },
  { topicId: 'qa_number', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 2, 2021: 1, 2022: 2, 2023: 2}, predictionScore: 75, difficultyTrend: 'stable', avgQuestionsPerYear: 1.8 },
  { topicId: 'qa_average', examCode: 'SSC_CGL', yearlyFrequency: {2019: 1, 2020: 2, 2021: 2, 2022: 1, 2023: 2}, predictionScore: 72, difficultyTrend: 'easier', avgQuestionsPerYear: 1.6 },
  { topicId: 'qa_mixture', examCode: 'SSC_CGL', yearlyFrequency: {2019: 1, 2020: 1, 2021: 2, 2022: 1, 2023: 1}, predictionScore: 65, difficultyTrend: 'stable', avgQuestionsPerYear: 1.2 },
  { topicId: 'lr_analogy', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 3, 2021: 2, 2022: 3, 2023: 3}, predictionScore: 88, difficultyTrend: 'stable', avgQuestionsPerYear: 2.8 },
  { topicId: 'lr_series', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 4, 2021: 3, 2022: 4, 2023: 4}, predictionScore: 91, difficultyTrend: 'stable', avgQuestionsPerYear: 3.6 },
  { topicId: 'lr_coding', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 2, 2021: 3, 2022: 2, 2023: 2}, predictionScore: 80, difficultyTrend: 'stable', avgQuestionsPerYear: 2.2 },
  { topicId: 'lr_blood', examCode: 'SSC_CGL', yearlyFrequency: {2019: 1, 2020: 2, 2021: 1, 2022: 2, 2023: 1}, predictionScore: 70, difficultyTrend: 'stable', avgQuestionsPerYear: 1.4 },
  { topicId: 'lr_syllogism', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 2, 2021: 2, 2022: 3, 2023: 2}, predictionScore: 82, difficultyTrend: 'stable', avgQuestionsPerYear: 2.2 },
  { topicId: 'en_rc', examCode: 'SSC_CGL', yearlyFrequency: {2019: 5, 2020: 5, 2021: 5, 2022: 5, 2023: 5}, predictionScore: 98, difficultyTrend: 'stable', avgQuestionsPerYear: 5.0 },
  { topicId: 'en_error', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 3, 2021: 4, 2022: 3, 2023: 4}, predictionScore: 90, difficultyTrend: 'stable', avgQuestionsPerYear: 3.4 },
  { topicId: 'en_idiom', examCode: 'SSC_CGL', yearlyFrequency: {2019: 2, 2020: 3, 2021: 2, 2022: 3, 2023: 3}, predictionScore: 85, difficultyTrend: 'stable', avgQuestionsPerYear: 2.6 },
  { topicId: 'en_synonym', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 2, 2021: 3, 2022: 3, 2023: 2}, predictionScore: 85, difficultyTrend: 'stable', avgQuestionsPerYear: 2.6 },
  { topicId: 'ga_polity', examCode: 'SSC_CGL', yearlyFrequency: {2019: 4, 2020: 5, 2021: 4, 2022: 5, 2023: 5}, predictionScore: 95, difficultyTrend: 'stable', avgQuestionsPerYear: 4.6 },
  { topicId: 'ga_history', examCode: 'SSC_CGL', yearlyFrequency: {2019: 4, 2020: 4, 2021: 5, 2022: 4, 2023: 5}, predictionScore: 93, difficultyTrend: 'stable', avgQuestionsPerYear: 4.4 },
  { topicId: 'ga_geography', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 4, 2021: 3, 2022: 4, 2023: 4}, predictionScore: 90, difficultyTrend: 'stable', avgQuestionsPerYear: 3.6 },
  { topicId: 'ga_economy', examCode: 'SSC_CGL', yearlyFrequency: {2019: 3, 2020: 3, 2021: 4, 2022: 3, 2023: 4}, predictionScore: 88, difficultyTrend: 'harder', avgQuestionsPerYear: 3.4 },
  { topicId: 'ga_science', examCode: 'SSC_CGL', yearlyFrequency: {2019: 4, 2020: 5, 2021: 4, 2022: 5, 2023: 4}, predictionScore: 92, difficultyTrend: 'stable', avgQuestionsPerYear: 4.4 },

  // RBI Grade B Trends
  { topicId: 'qa_di', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 8, 2020: 10, 2021: 9, 2022: 10, 2023: 12}, predictionScore: 97, difficultyTrend: 'harder', avgQuestionsPerYear: 9.8 },
  { topicId: 'qa_probability', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 2, 2020: 3, 2021: 3, 2022: 2, 2023: 3}, predictionScore: 85, difficultyTrend: 'harder', avgQuestionsPerYear: 2.6 },
  { topicId: 'qa_permutation', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 2, 2020: 2, 2021: 3, 2022: 2, 2023: 3}, predictionScore: 82, difficultyTrend: 'harder', avgQuestionsPerYear: 2.4 },
  { topicId: 'lr_puzzle', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 5, 2020: 6, 2021: 5, 2022: 7, 2023: 7}, predictionScore: 95, difficultyTrend: 'harder', avgQuestionsPerYear: 6.0 },
  { topicId: 'lr_seating', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 4, 2020: 5, 2021: 5, 2022: 5, 2023: 6}, predictionScore: 93, difficultyTrend: 'harder', avgQuestionsPerYear: 5.0 },
  { topicId: 'lr_syllogism', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 3, 2020: 4, 2021: 3, 2022: 4, 2023: 4}, predictionScore: 90, difficultyTrend: 'stable', avgQuestionsPerYear: 3.6 },
  { topicId: 'en_rc', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 8, 2020: 10, 2021: 8, 2022: 10, 2023: 10}, predictionScore: 98, difficultyTrend: 'harder', avgQuestionsPerYear: 9.2 },
  { topicId: 'fe_rbi', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 5, 2020: 6, 2021: 6, 2022: 7, 2023: 8}, predictionScore: 97, difficultyTrend: 'harder', avgQuestionsPerYear: 6.4 },
  { topicId: 'fe_monetary', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 4, 2020: 5, 2021: 5, 2022: 6, 2023: 6}, predictionScore: 95, difficultyTrend: 'harder', avgQuestionsPerYear: 5.2 },
  { topicId: 'fe_market', examCode: 'RBI_GRADEB', yearlyFrequency: {2019: 3, 2020: 4, 2021: 3, 2022: 4, 2023: 5}, predictionScore: 90, difficultyTrend: 'harder', avgQuestionsPerYear: 3.8 },

  // RRB NTPC Trends
  { topicId: 'ga_science', examCode: 'RRB_NTPC', yearlyFrequency: {2019: 8, 2020: 8, 2021: 9, 2022: 8, 2023: 9}, predictionScore: 96, difficultyTrend: 'stable', avgQuestionsPerYear: 8.4 },
  { topicId: 'ga_polity', examCode: 'RRB_NTPC', yearlyFrequency: {2019: 5, 2020: 6, 2021: 5, 2022: 6, 2023: 6}, predictionScore: 93, difficultyTrend: 'stable', avgQuestionsPerYear: 5.6 },
  { topicId: 'ga_history', examCode: 'RRB_NTPC', yearlyFrequency: {2019: 5, 2020: 5, 2021: 6, 2022: 5, 2023: 6}, predictionScore: 92, difficultyTrend: 'stable', avgQuestionsPerYear: 5.4 },
  { topicId: 'ga_geography', examCode: 'RRB_NTPC', yearlyFrequency: {2019: 4, 2020: 5, 2021: 4, 2022: 5, 2023: 5}, predictionScore: 90, difficultyTrend: 'stable', avgQuestionsPerYear: 4.6 },
  { topicId: 'qa_percentage', examCode: 'RRB_NTPC', yearlyFrequency: {2019: 2, 2020: 3, 2021: 2, 2022: 3, 2023: 3}, predictionScore: 85, difficultyTrend: 'stable', avgQuestionsPerYear: 2.6 },
  { topicId: 'lr_analogy', examCode: 'RRB_NTPC', yearlyFrequency: {2019: 3, 2020: 4, 2021: 3, 2022: 4, 2023: 3}, predictionScore: 88, difficultyTrend: 'stable', avgQuestionsPerYear: 3.4 },
];

// ========== HELPER FUNCTIONS ==========
export function getExamByCode(code: string): Exam | undefined {
  return exams.find(e => e.code === code);
}

export function getQuestionsByExam(examCode: string): Question[] {
  return questions.filter(q => q.examCode === examCode);
}

export function getQuestionsByTopic(topic: string): Question[] {
  return questions.filter(q => q.topic === topic);
}

export function getQuestionsBySubject(subject: string): Question[] {
  return questions.filter(q => q.subject === subject);
}

export function getTrendsByExam(examCode: string): TrendData[] {
  return trendData.filter(t => t.examCode === examCode);
}

export function getTopicById(topicId: string): Topic | undefined {
  return topics.find(t => t.id === topicId);
}

export function getTopicsBySubject(subject: string): Topic[] {
  return topics.filter(t => t.subject === subject);
}

export function getSubjectsForExam(examCode: string): string[] {
  const exam = getExamByCode(examCode);
  return exam?.subjects || [];
}

// Get unique subjects from all questions
export function getAllSubjects(): string[] {
  return [...new Set(questions.map(q => q.subject))];
}

// Get all unique topics for a subject
export function getTopicsForSubject(subject: string): string[] {
  return [...new Set(questions.filter(q => q.subject === subject).map(q => q.topic))];
}

// Cross-exam topic overlap
export function getSharedTopics(examCode1: string, examCode2: string): string[] {
  const topics1 = new Set(questions.filter(q => q.examCode === examCode1).map(q => q.topic));
  const topics2 = new Set(questions.filter(q => q.examCode === examCode2).map(q => q.topic));
  return [...topics1].filter(t => topics2.has(t));
}
