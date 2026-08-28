// PrepArsenal — Default question set for warming the persistent semantic cache.
// These are high-frequency, syllabus-stable questions across SSC / Banking /
// Railway / UPSC-prelims style exams. Running them once through the gateway
// (see POST /api/admin/prewarm-cache) stores grounded answers in Supabase so the
// most common student queries are served without touching an LLM provider.
//
// Plain data — safe to import anywhere.

export const DEFAULT_PREWARM_QUERIES: string[] = [
  // --- Polity ---
  'Explain Article 32 of the Indian Constitution and the five writs',
  'What is the difference between Fundamental Rights and Directive Principles of State Policy',
  'Explain the Preamble of the Indian Constitution and the 42nd Amendment',
  'What is the basic structure doctrine and the Kesavananda Bharati case',
  'Difference between the Rajya Sabha and the Lok Sabha',
  'What are the emergency provisions in the Indian Constitution (Articles 352, 356, 360)',
  'Explain the procedure for amending the Indian Constitution under Article 368',
  'What is the difference between a money bill and an ordinary bill',
  'Powers and functions of the President of India',
  'What is the anti-defection law and the Tenth Schedule',

  // --- Economy ---
  'Difference between repo rate and reverse repo rate',
  'What is the difference between fiscal deficit, revenue deficit and primary deficit',
  'Explain CRR and SLR and how the RBI uses them',
  'What is inflation and what are its main types',
  'Difference between GDP and GNP',
  'What is the difference between direct tax and indirect tax with examples',
  'Explain the functions of the Reserve Bank of India',
  'What is the balance of payments and its components',
  'What is disinvestment and how is it different from privatisation',
  'Explain the difference between fixed and floating exchange rates',

  // --- Quantitative Aptitude ---
  'Shortcut tricks for percentage problems in competitive exams',
  'Explain the concept of ratio and proportion with shortcuts',
  'How to solve time and work problems quickly',
  'Speed, time and distance formulas and shortcuts',
  'How to calculate simple interest and compound interest quickly',
  'Profit and loss formulas and shortcut methods',
  'How to find the average and use the deviation method',
  'Explain partnership problems and how to divide profit',
  'How to solve problems on pipes and cisterns',
  'Explain permutation and combination basics with examples',

  // --- Reasoning ---
  'How to solve blood relation problems in reasoning',
  'Explain syllogism and how to solve using Venn diagrams',
  'How to solve seating arrangement problems step by step',
  'Explain coding-decoding tricks for competitive exams',
  'How to solve direction sense test problems',

  // --- History ---
  'Causes and effects of the Revolt of 1857',
  'Explain the main sessions and resolutions of the Indian National Congress',
  'What were the Gandhian movements: Non-Cooperation, Civil Disobedience and Quit India',
  'Explain the Government of India Act 1935',
  'Key features of the Indus Valley Civilisation',
  'Explain the Buddhist councils and their significance',

  // --- Geography ---
  'Explain the types of rainfall: convectional, orographic and cyclonic',
  'What are the major soil types of India',
  'Explain the Indian monsoon mechanism',
  'Difference between weather and climate',
  'Explain latitudes, longitudes and time zones',
  'What are the major ocean currents and how do they affect climate',

  // --- Science / GK ---
  'Explain Newton\'s three laws of motion with examples',
  'What is the difference between mass and weight',
  'Explain the human digestive system briefly',
  'What are vitamins and their deficiency diseases',
  'Explain photosynthesis and its importance',
  'Difference between AC and DC current',
];
