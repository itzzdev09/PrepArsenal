// PrepArsenal — RAG Knowledge Base Corpus
// Indexed reference materials from NCERT, Standard Textbooks, and PYQ Citations

export interface KnowledgeChunk {
  id: string;
  title: string;
  book: string;
  editionOrClass: string;
  chapter: string;
  pageNumber: number;
  subject: string;
  topic: string;
  content: string;
  tags: string[];
  pyqFrequency: 'High' | 'Very High' | 'Medium' | 'Essential';
  examMentions: string[];
}

export const KNOWLEDGE_CORPUS: KnowledgeChunk[] = [
  {
    id: 'ncert-polity-art32',
    title: 'Article 32 & Constitutional Remedies (Writs)',
    book: 'NCERT Indian Constitution at Work (Class 11) & M. Laxmikanth',
    editionOrClass: 'Class 11, Ch. 2 / 6th Edition, Ch. 7',
    chapter: 'Chapter 2: Rights in the Indian Constitution / Chapter 7: Fundamental Rights',
    pageNumber: 38,
    subject: 'Polity',
    topic: 'Fundamental Rights & Writs',
    content: `Dr. B.R. Ambedkar called Article 32 the "Heart and Soul of the Constitution". It confers the right to move the Supreme Court by appropriate proceedings for the enforcement of Fundamental Rights.
The Supreme Court (under Art 32) and High Courts (under Art 226) can issue 5 types of prerogative writs:
1. Habeas Corpus: "To have the body of" — protects against unlawful detention. Can be issued against both public and private entities.
2. Mandamus: "We command" — orders a public official or body to perform a mandatory legal duty. Cannot be issued against private individuals, President, or Governors.
3. Prohibition: "To forbid" — issued by a higher court to a lower court/tribunal to prevent exceeding jurisdiction. Issued during ongoing proceedings.
4. Certiorari: "To be certified" — quashes an order passed by a lower court/tribunal without jurisdiction or in violation of natural justice. Both preventive and curative.
5. Quo-Warranto: "By what authority" — inquires into the legality of a claim by a person to a public office. Can be sought by any interested citizen, not just the aggrieved party.`,
    tags: ['article 32', 'writs', 'habeas corpus', 'mandamus', 'certiorari', 'prohibition', 'quo warranto', 'fundamental rights', 'supreme court'],
    pyqFrequency: 'Very High',
    examMentions: ['SSC CGL 2022', 'UPSC Prelims 2019', 'ACIO-II 2021', 'RRB NTPC 2021', 'RBI Grade B 2020']
  },
  {
    id: 'ncert-polity-preamble',
    title: 'Preamble and Basic Structure Doctrine',
    book: 'M. Laxmikanth Indian Polity',
    editionOrClass: '6th Edition, Ch. 4',
    chapter: 'Chapter 4: Preamble of the Constitution',
    pageNumber: 42,
    subject: 'Polity',
    topic: 'Preamble & Basic Structure',
    content: `The Preamble is based on the 'Objectives Resolution' drafted and moved by Pandit Jawaharlal Nehru on December 13, 1946, and adopted unanimously by the Constituent Assembly on January 22, 1947.
Amended only once by the 42nd Constitutional Amendment Act (1976), which added three new words: Socialist, Secular, and Integrity.
Key Judicial Pronouncements:
1. Berubari Union Case (1960): SC held that Preamble is NOT a part of the Constitution.
2. Kesavananda Bharati Case (1973): SC overturned Berubari and held that Preamble IS an integral part of the Constitution and can be amended under Art 368 without altering the 'Basic Structure'.
3. LIC of India Case (1995): SC again reaffirmed that Preamble is an integral part of the Constitution.
The Preamble is neither a source of power to legislature nor a prohibition upon powers of legislature. It is non-justiciable (not enforceable in courts).`,
    tags: ['preamble', '42nd amendment', 'kesavananda bharati', 'socialist', 'secular', 'integrity', 'basic structure', 'berubari union'],
    pyqFrequency: 'Very High',
    examMentions: ['SSC CGL 2023', 'UPSC Prelims 2020', 'UPSC Prelims 2017', 'LIC AAO 2019']
  },
  {
    id: 'ncert-econ-monetary-policy',
    title: 'Monetary Policy Instruments: Repo, Reverse Repo & CRR',
    book: 'NCERT Macroeconomics (Class 12) & Ramesh Singh Indian Economy',
    editionOrClass: 'Class 12, Ch. 3 / 14th Edition',
    chapter: 'Money and Banking / Monetary Policy in India',
    pageNumber: 74,
    subject: 'Economics',
    topic: 'Monetary Policy & RBI',
    content: `The Reserve Bank of India (RBI) controls money supply and inflation using Quantitative and Qualitative tools:
Quantitative Tools:
1. Repo Rate (Repurchase Option): The interest rate at which RBI lends short-term money to commercial banks against government securities. Raising Repo Rate makes borrowing expensive, curbing inflation.
2. Reverse Repo Rate: The rate at which RBI borrows short-term funds from commercial banks. (Now largely absorbed into the Standing Deposit Facility - SDF rate).
3. Cash Reserve Ratio (CRR): Percentage of net demand and time liabilities (NDTL) that commercial banks must maintain as cash reserves with the RBI. No interest is paid by RBI on CRR.
4. Statutory Liquidity Ratio (SLR): Percentage of NDTL that banks must maintain in liquid assets (cash, gold, approved government securities) with themselves before granting credit.
5. Marginal Standing Facility (MSF): Penal rate at which banks borrow overnight funds from RBI against eligible SLR securities above the reserve requirement limit.`,
    tags: ['repo rate', 'reverse repo', 'crr', 'slr', 'rbi', 'monetary policy', 'inflation', 'ndtl', 'msf', 'banking'],
    pyqFrequency: 'Very High',
    examMentions: ['RBI Grade B 2023', 'NABARD 2022', 'SSC CGL 2021', 'SEBI Grade A 2022']
  },
  {
    id: 'ncert-history-plassey-buxar',
    title: 'Battles of Plassey (1757) and Buxar (1764)',
    book: 'NCERT Our Pasts - III (Class 8) & Spectrum Modern India',
    editionOrClass: 'Spectrum Ch. 5 / Class 8 Ch. 2',
    chapter: 'Expansion and Consolidation of British Power in India',
    pageNumber: 88,
    subject: 'History',
    topic: 'Modern History & British Expansion',
    content: `1. Battle of Plassey (23 June 1757):
Fought between Nawab of Bengal Siraj-ud-Daulah and the British East India Company led by Robert Clive. Mir Jafar (Commander-in-Chief), Rai Durlabh, and Jagat Seth betrayed Siraj-ud-Daulah. British established political supremacy in Bengal and installed Mir Jafar as puppet Nawab.
2. Battle of Buxar (22 October 1764):
Fought between the combined forces of Mir Qasim (former Nawab of Bengal), Shuja-ud-Daulah (Nawab of Awadh), and Mughal Emperor Shah Alam II against the British forces commanded by Major Hector Munro.
Outcome: The British victory led to the Treaty of Allahabad (1765) signed by Robert Clive with Shah Alam II and Shuja-ud-Daulah.
Significance of Treaty of Allahabad:
- Diwani Rights (right to collect civil revenue) of Bengal, Bihar, and Orissa granted to East India Company.
- Dual Government of Bengal (1765-1772) instituted by Robert Clive.`,
    tags: ['battle of plassey', 'battle of buxar', 'treaty of allahabad', 'siraj-ud-daulah', 'mir jafar', 'mir qasim', 'robert clive', 'hector munro', 'diwani rights'],
    pyqFrequency: 'High',
    examMentions: ['SSC CGL 2020', 'SSC CGL 2022', 'RRB NTPC 2021', 'ACIO-II 2017']
  },
  {
    id: 'ncert-science-optics',
    title: 'Optics: Reflection, Refraction, Lenses & Human Eye',
    book: 'NCERT Science (Class 10)',
    editionOrClass: 'Class 10, Ch. 10 & 11',
    chapter: 'Light - Reflection and Refraction / Human Eye and Colourful World',
    pageNumber: 160,
    subject: 'General Science',
    topic: 'Physics - Optics',
    content: `1. Mirror Formula: 1/f = 1/v + 1/u (f = focal length, v = image distance, u = object distance).
2. Lens Formula: 1/f = 1/v - 1/u.
3. Power of Lens (P): P = 1 / f (in metres). Unit is Dioptre (D). Convex lens has positive power; concave lens has negative power.
4. Vision Defects and Corrections:
- Myopia (Short-sightedness): Distant objects cannot be seen clearly. Image forms in front of the retina. Corrected using Concave Lens (diverging lens).
- Hypermetropia (Far-sightedness): Nearby objects cannot be seen clearly. Image forms behind the retina. Corrected using Convex Lens (converging lens).
- Presbyopia: Loss of accommodation due to aging and weakening ciliary muscles. Corrected using Bifocal Lenses.
- Astigmatism: Irregular curvature of cornea. Corrected using Cylindrical Lens.
5. Phenomena:
- Total Internal Reflection (TIR): Responsible for sparkle of diamonds, optical fibres, and mirages. Occurs when light travels from denser to rarer medium and angle of incidence > critical angle.
- Atmospheric Refraction: Causes twinkling of stars and early sunrise/delayed sunset by ~2 minutes.`,
    tags: ['optics', 'myopia', 'hypermetropia', 'concave lens', 'convex lens', 'power of lens', 'dioptre', 'total internal reflection', 'refraction'],
    pyqFrequency: 'Very High',
    examMentions: ['RRB NTPC 2022', 'SSC CGL 2021', 'LIC AAO 2021', 'ACIO-II 2021']
  },
  {
    id: 'ncert-geo-rivers-monsoon',
    title: 'Indian Drainage System & Southwest Monsoon',
    book: 'NCERT India: Physical Environment (Class 11)',
    editionOrClass: 'Class 11, Ch. 3 & 4',
    chapter: 'Drainage System / Climate of India',
    pageNumber: 52,
    subject: 'Geography',
    topic: 'Indian Drainage & Climate',
    content: `1. Himalayan Rivers vs Peninsular Rivers:
- Himalayan (Indus, Ganga, Brahmaputra): Perennial (fed by glaciers and rain), antecedent drainage, deep V-shaped valleys and gorges, form large deltas.
- Peninsular (Godavari, Krishna, Mahanadi, Cauvery, Narmada, Tapi): Non-perennial/seasonal, mature graded profile.
- West Flowing Rivers: Narmada and Tapi flow through rift valleys into Arabian Sea and form Estuaries (NOT deltas).
- Godavari is called 'Dakshin Ganga' or 'Vridha Ganga' (longest peninsular river, 1,465 km).
2. Southwest Monsoon:
- Originates from the Indian Ocean due to differential heating of land and sea and the northward shift of the Inter-Tropical Convergence Zone (ITCZ).
- Splits into two branches: Arabian Sea Branch and Bay of Bengal Branch.
- Mawsynram (Meghalaya) receives highest rainfall in the world due to funnel-shaped Khasi hills.
- Tamil Nadu coast remains dry during SW monsoon because it lies parallel to Bay of Bengal branch and in the rain shadow of Western Ghats (receives rain in Oct-Dec from Northeast/Retreating monsoon).`,
    tags: ['drainage system', 'ganga', 'godavari', 'narmada', 'tapi', 'southwest monsoon', 'itcz', 'mawsynram', 'rain shadow', 'retreating monsoon'],
    pyqFrequency: 'Very High',
    examMentions: ['SSC CGL 2023', 'UPSC Prelims 2021', 'ACIO-II 2021', 'RRB NTPC 2020']
  },
  {
    id: 'quant-shortcuts-percentage-pl',
    title: 'Quantitative Aptitude: Percentage Fractions & Profit-Loss Shortcuts',
    book: 'PrepArsenal Quant Playbook & RS Aggarwal Quantitative Aptitude',
    editionOrClass: 'Competitive Edition',
    chapter: 'Percentages, Profit & Loss, Successive Discount',
    pageNumber: 12,
    subject: 'Quantitative Aptitude',
    topic: 'Percentages & Profit Loss',
    content: `1. Essential Fractional Equivalents:
1/2 = 50%, 1/3 = 33.33%, 1/4 = 25%, 1/5 = 20%, 1/6 = 16.66%, 1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%, 1/11 = 9.09%, 1/12 = 8.33%, 1/15 = 6.66%, 1/16 = 6.25%.
2. Net Percentage Change Formula:
Net Change = a + b + (a * b)/100 % (Use negative for decrease/discount).
3. If Price increases by x%, Reduction in Consumption to keep Expenditure constant:
Reduction % = [x / (100 + x)] * 100%.
If Price decreases by x%, Increase in Consumption:
Increase % = [x / (100 - x)] * 100%.
4. Dishonest Dealer / False Weights:
Gain % = [Error / (True Value - Error)] * 100%.
5. Selling two items at same SP: One at x% profit, another at x% loss:
Always results in an overall Loss % = (x / 10)^2 %.`,
    tags: ['percentage shortcuts', 'profit and loss', 'successive percentage', 'dishonest dealer', 'fraction percentage', 'quant tricks'],
    pyqFrequency: 'Essential',
    examMentions: ['SSC CGL 2023', 'SSC CGL 2022', 'RRB NTPC 2021', 'RBI Grade B 2022']
  }
];
