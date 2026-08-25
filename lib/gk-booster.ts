// PrepArsenal — GK Booster: static (evergreen) general knowledge content.
// Same authoring style as lib/ncert-booster.ts: condensed, elaborated notes
// (not copied verbatim from any single source) plus quick-check questions.

export interface GkQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface GkChapter {
  id: string;
  order: number;
  title: string;
  book: string;
  notes: string[];
  questions: GkQuestion[];
}

export interface GkTrack {
  id: string;
  subject: string;
  title: string;
  description: string;
  chapters: GkChapter[];
}

export const GK_TRACKS: GkTrack[] = [
  {
    id: 'awards', subject: 'Awards & Honours', title: 'Awards & Honours: Static GK',
    description: 'National honours, gallantry awards, sports and literary awards frequently asked in GA/GK sections.',
    chapters: [
      { id: 'awd-1', order: 1, title: 'National Civilian Honours', book: 'Static GK — Civilian Awards', notes: [
        'Bharat Ratna is India\'s highest civilian award, instituted in 1954, for exceptional service in any field including public service — it is not awarded posthumously by rule, though this has been amended by government resolution multiple times in practice.',
        'The Padma Awards (instituted 1954) are announced annually on Republic Day and have three tiers in descending order: Padma Vibhushan (exceptional and distinguished service), Padma Bhushan (distinguished service of high order), Padma Shri (distinguished service).',
        'Padma Awards are given in fields such as art, social work, public affairs, science and engineering, trade and industry, medicine, literature and education, sports, and civil service.',
        'The awards are announced by the President of India based on recommendations of the Padma Awards Committee, constituted every year by the Prime Minister.',
        'Bharat Ratna and Padma Awards are not "titles" under Article 18 of the Constitution (which prohibits titles) — the Supreme Court has upheld their constitutional validity as they cannot be used as prefixes/suffixes to a recipient\'s name.',
      ], questions: [{ id: 'awd-1q1', questionText: "India's highest civilian award is:", options: ['Padma Vibhushan', 'Bharat Ratna', 'Padma Bhushan', 'Ashoka Chakra'], correctOption: 1, explanation: 'Bharat Ratna, instituted in 1954, is India\'s highest civilian honour.' }] },
      { id: 'awd-2', order: 2, title: 'Gallantry & Defence Awards', book: 'Static GK — Gallantry Awards', notes: [
        'Param Vir Chakra (instituted 1950) is India\'s highest wartime gallantry award, given for the most conspicuous bravery in the presence of the enemy.',
        'The order of peacetime gallantry awards (highest to lower): Ashoka Chakra, Kirti Chakra, Shaurya Chakra — equivalent in prestige tier to Param Vir Chakra, Maha Vir Chakra, Vir Chakra respectively for wartime.',
        'Wartime gallantry award hierarchy: Param Vir Chakra > Maha Vir Chakra > Vir Chakra.',
        'The Param Vir Chakra was designed by Savitri Khanolkar; Major Somnath Sharma was the first recipient (posthumous), for actions during the 1947-48 Kashmir operations.',
      ], questions: [{ id: 'awd-2q1', questionText: "India's highest wartime gallantry award is:", options: ['Ashoka Chakra', 'Param Vir Chakra', 'Vir Chakra', 'Kirti Chakra'], correctOption: 1, explanation: 'Param Vir Chakra is the highest wartime gallantry award; Ashoka Chakra is its peacetime equivalent.' }] },
      { id: 'awd-3', order: 3, title: 'Sports & Literary Awards', book: 'Static GK — Sports & Literary Awards', notes: [
        'Major Dhyan Chand Khel Ratna (renamed from Rajiv Gandhi Khel Ratna in 2021) is India\'s highest sporting honour, given for the most spectacular and outstanding performance in the field of sports over a period of four years.',
        'Arjuna Award recognises consistently outstanding performance in a sport over a four-year period; Dronacharya Award honours coaches for producing medal-winning performances.',
        'The Sahitya Akademi Award is India\'s highest literary honour given by the Sahitya Akademi (National Academy of Letters) across 24 recognised Indian languages.',
        'The Jnanpith Award is India\'s oldest and highest literary honour for an Indian citizen\'s outstanding contribution to literature, instituted in 1965 by the Bharatiya Jnanpith trust — G. Sankara Kurup (Malayalam) was its first recipient in 1965.',
        'The Nobel Prize (instituted per Alfred Nobel\'s will, first awarded 1901) is awarded in six categories: Physics, Chemistry, Physiology or Medicine, Literature, Peace, and Economic Sciences (added later, 1969, technically the "Sveriges Riksbank Prize in Economic Sciences") — the Peace Prize is awarded in Oslo, Norway; all others in Stockholm, Sweden.',
        'Rabindranath Tagore (1913, Literature) was the first Indian and first non-European to win a Nobel Prize; other Indian/Indian-origin laureates include C.V. Raman (1930, Physics), Mother Teresa (1979, Peace), Amartya Sen (1998, Economics), Kailash Satyarthi (2014, Peace), Abhijit Banerjee (2019, Economics).',
      ], questions: [{ id: 'awd-3q1', questionText: "India's highest sporting honour is currently named after which figure?", options: ['Milkha Singh', 'Major Dhyan Chand', 'Sachin Tendulkar', 'P.T. Usha'], correctOption: 1, explanation: 'The Rajiv Gandhi Khel Ratna was renamed the Major Dhyan Chand Khel Ratna in 2021, honouring the hockey legend.' }, { id: 'awd-3q2', questionText: 'Who was the first Indian to win a Nobel Prize?', options: ['C.V. Raman', 'Rabindranath Tagore', 'Mother Teresa', 'Amartya Sen'], correctOption: 1, explanation: 'Rabindranath Tagore won the Nobel Prize in Literature in 1913, becoming the first Indian and first non-European laureate.' }] },
    ]
  },
  {
    id: 'sports', subject: 'Sports', title: 'Sports: Static GK',
    description: 'Major championships, terminology, records and India-specific sporting facts.',
    chapters: [
      { id: 'spt-1', order: 1, title: 'Major International Championships', book: 'Static GK — Championships', notes: [
        'The Olympic Games are held every four years, alternating between Summer and Winter editions (staggered two years apart); overseen by the International Olympic Committee (IOC), headquartered in Lausanne, Switzerland.',
        'The FIFA World Cup (football) is held every four years; the ICC Cricket World Cup (ODI format) is also held roughly every four years, organised by the International Cricket Council.',
        'The Commonwealth Games are held every four years among Commonwealth nations; the Asian Games are held every four years among Asian nations, organised by the Olympic Council of Asia.',
        'Grand Slam tennis tournaments (four annually): Australian Open (hard court), French Open/Roland Garros (clay court), Wimbledon (grass court, oldest, held in England since 1877), US Open (hard court).',
        'The Ryder Cup (golf, biennial, USA vs Europe) and the Davis Cup (tennis, men\'s team event) are notable team-format international tournaments distinct from individual Grand Slams.',
      ], questions: [{ id: 'spt-1q1', questionText: 'Which Grand Slam tennis tournament is played on a grass court and is the oldest of the four?', options: ['US Open', 'French Open', 'Wimbledon', 'Australian Open'], correctOption: 2, explanation: 'Wimbledon, held in England since 1877, is the oldest Grand Slam and the only one played on grass.' }] },
      { id: 'spt-2', order: 2, title: 'India in Sports', book: 'Static GK — India Sporting Facts', notes: [
        'Hockey is India\'s national sport by long-standing tradition (though there is no formal government notification declaring an official national sport) — India has won 8 Olympic gold medals in men\'s hockey, most recently in 1980 (Moscow).',
        'India won its first individual Olympic gold medal through Abhinav Bindra (10m air rifle shooting, Beijing 2008); Neeraj Chopra won India\'s first Olympic gold in athletics (javelin throw, Tokyo 2020/held in 2021).',
        'The Indian Premier League (IPL), a Twenty20 cricket league, was founded in 2008 by the Board of Control for Cricket in India (BCCI).',
        'Major domestic cricket tournaments in India: Ranji Trophy (first-class, inter-state), Duleep Trophy (zonal), Irani Cup, Vijay Hazare Trophy (List A/ODI format), Syed Mushtaq Ali Trophy (T20 format).',
        'The Khelo India Youth Games (launched 2018) is a national-level multi-sport event to promote grassroots sports talent across Indian states.',
      ], questions: [{ id: 'spt-2q1', questionText: 'Who won India\'s first individual Olympic gold medal?', options: ['Neeraj Chopra', 'Abhinav Bindra', 'Rajyavardhan Singh Rathore', 'Milkha Singh'], correctOption: 1, explanation: 'Abhinav Bindra won India\'s first individual Olympic gold medal in 10m air rifle shooting at the Beijing 2008 Olympics.' }] },
    ]
  },
  {
    id: 'important-days', subject: 'Important Days', title: 'Important Days & Themes',
    description: 'National and international observance days commonly asked as one-liners.',
    chapters: [
      { id: 'day-1', order: 1, title: 'National Observance Days', book: 'Static GK — National Days', notes: [
        'Republic Day — 26 January (Constitution of India came into force on this date in 1950, chosen to commemorate Purna Swaraj declared by the INC on 26 January 1930).',
        'Independence Day — 15 August (India gained independence from British rule in 1947).',
        'Gandhi Jayanti — 2 October (birth anniversary of Mahatma Gandhi; also observed globally as the International Day of Non-Violence since 2007).',
        'National Youth Day — 12 January (birth anniversary of Swami Vivekananda); National Science Day — 28 February (commemorates C.V. Raman\'s discovery of the "Raman Effect" in 1928, for which he won the 1930 Nobel Prize in Physics).',
        'National Girl Child Day — 24 January; National Voters\' Day — 25 January (Election Commission of India\'s foundation day, 1950); Teachers\' Day — 5 September (birth anniversary of Dr. Sarvepalli Radhakrishnan).',
      ], questions: [{ id: 'day-1q1', questionText: 'National Science Day (28 February) commemorates which scientific discovery?', options: ['Chandrasekhar Limit', 'Raman Effect', 'Bose-Einstein Statistics', 'Green Revolution'], correctOption: 1, explanation: 'National Science Day marks C.V. Raman\'s 1928 discovery of the Raman Effect, for which he won the 1930 Nobel Prize in Physics.' }] },
      { id: 'day-2', order: 2, title: 'International Observance Days', book: 'Static GK — International Days', notes: [
        'World Health Day — 7 April (anniversary of WHO\'s founding in 1948); World Environment Day — 5 June (UN Environment Programme).',
        'International Women\'s Day — 8 March; International Yoga Day — 21 June (established by the UN in 2014 following a proposal by India).',
        'World Population Day — 11 July; World Water Day — 22 March; Earth Day — 22 April.',
        'International Literacy Day — 8 September (UNESCO); World Wildlife Day — 3 March; International Day of Peace — 21 September.',
        'United Nations Day — 24 October (anniversary of the UN Charter coming into force, 1945); Human Rights Day — 10 December (anniversary of the UN\'s adoption of the Universal Declaration of Human Rights, 1948).',
      ], questions: [{ id: 'day-2q1', questionText: 'International Day of Yoga (21 June) was established by the United Nations following a proposal by which country?', options: ['China', 'Nepal', 'India', 'Sri Lanka'], correctOption: 2, explanation: 'The UN General Assembly adopted 21 June as International Yoga Day in 2014 following a proposal by India\'s Prime Minister.' }] },
    ]
  },
  {
    id: 'schemes', subject: 'Govt Schemes', title: 'Government Schemes: Static GK',
    description: 'Major central government schemes, their launch year and core objective.',
    chapters: [
      { id: 'sch-1', order: 1, title: 'Flagship Welfare & Financial Inclusion Schemes', book: 'Static GK — Central Schemes', notes: [
        'Pradhan Mantri Jan Dhan Yojana (PMJDY, launched 2014) — financial inclusion scheme providing universal access to banking facilities, a basic savings account, RuPay debit card and accident insurance cover.',
        'Pradhan Mantri Awas Yojana (PMAY, launched 2015) — "Housing for All" mission, with rural (PMAY-Gramin) and urban (PMAY-Urban) components.',
        'Ayushman Bharat / Pradhan Mantri Jan Arogya Yojana (PM-JAY, launched 2018) — world\'s largest government-funded health insurance scheme, providing health cover up to ₹5 lakh per family per year for secondary/tertiary hospitalisation.',
        'Pradhan Mantri Fasal Bima Yojana (PMFBY, launched 2016) — crop insurance scheme to support farmers against crop loss/damage due to unforeseen events.',
        'Pradhan Mantri Ujjwala Yojana (launched 2016) — provides free LPG connections to women from below-poverty-line households, aiming to replace unclean cooking fuels.',
        'Atal Pension Yojana (APY, launched 2015) — pension scheme targeted at unorganised sector workers, guaranteeing a fixed monthly pension after age 60.',
        'Pradhan Mantri Mudra Yojana (PMMY, launched 2015) — provides collateral-free loans up to ₹10 lakh to non-corporate, non-farm micro/small enterprises, categorised as Shishu, Kishor and Tarun based on loan size.',
      ], questions: [{ id: 'sch-1q1', questionText: 'Which scheme provides health insurance cover of up to ₹5 lakh per family per year?', options: ['PMJDY', 'PM-JAY (Ayushman Bharat)', 'PMFBY', 'PMAY'], correctOption: 1, explanation: 'Ayushman Bharat / PM-JAY provides health cover up to ₹5 lakh per family per year for secondary and tertiary care hospitalisation.' }] },
      { id: 'sch-2', order: 2, title: 'Skill, Employment & Rural Development Schemes', book: 'Static GK — Employment & Rural Schemes', notes: [
        'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA, 2005) — legally guarantees 100 days of wage employment per year to rural households willing to do unskilled manual work.',
        'Pradhan Mantri Kaushal Vikas Yojana (PMKVY, launched 2015) — flagship skill development scheme to enable Indian youth to take up industry-relevant skill training.',
        'Pradhan Mantri Gram Sadak Yojana (PMGSY, launched 2000) — aims to provide all-weather road connectivity to unconnected rural habitations.',
        'Jal Jeevan Mission (launched 2019) — aims to provide functional household tap water connections to every rural household ("Har Ghar Jal").',
        'Swachh Bharat Mission (launched 2014) — nationwide sanitation campaign to eliminate open defecation and improve solid waste management.',
        'Digital India (launched 2015) — umbrella programme to transform India into a digitally empowered society, covering digital infrastructure, governance and services.',
        'Startup India (launched 2016) — initiative to promote and support entrepreneurship and startup ecosystem via tax benefits, easier compliance and funding support.',
      ], questions: [{ id: 'sch-2q1', questionText: 'MGNREGA legally guarantees how many days of wage employment per year to rural households?', options: ['50 days', '100 days', '150 days', '200 days'], correctOption: 1, explanation: 'MGNREGA (2005) guarantees a minimum of 100 days of wage employment per financial year to every rural household willing to do unskilled manual work.' }] },
    ]
  },
  {
    id: 'books-authors', subject: 'Books & Authors', title: 'Books & Authors: Static GK',
    description: 'Notable books, autobiographies and their authors — a recurring GA/GK question type.',
    chapters: [
      { id: 'bka-1', order: 1, title: 'Autobiographies & Political Writings', book: 'Static GK — Books & Authors', notes: [
        '"The Story of My Experiments with Truth" — autobiography of Mahatma Gandhi.',
        '"India Wins Freedom" — Maulana Abul Kalam Azad, an account of the independence movement and Partition.',
        '"My Country My Life" — L.K. Advani; "Wings of Fire" — autobiography of Dr. A.P.J. Abdul Kalam (co-written with Arun Tiwari).',
        '"The Discovery of India" and "Glimpses of World History" — Jawaharlal Nehru, written during his imprisonment.',
        '"An Autobiography: The Story of My Experiments with Truth" is distinct from "Hind Swaraj" (Gandhi\'s treatise on self-rule, written in 1909).',
        '"Indomitable Spirit" and "Ignited Minds" — further works by Dr. A.P.J. Abdul Kalam, focused on youth empowerment and India\'s development vision.',
      ], questions: [{ id: 'bka-1q1', questionText: '"Wings of Fire" is the autobiography of which former President of India?', options: ['Pratibha Patil', 'A.P.J. Abdul Kalam', 'R. Venkataraman', 'Zakir Husain'], correctOption: 1, explanation: '"Wings of Fire" is the autobiography of Dr. A.P.J. Abdul Kalam, India\'s 11th President, known as the "Missile Man of India."' }] },
      { id: 'bka-2', order: 2, title: 'Indian Literature & Nobel/Booker Winners', book: 'Static GK — Literary Works', notes: [
        '"Gitanjali" — Rabindranath Tagore (won him the 1913 Nobel Prize in Literature); Tagore also wrote India\'s national anthem "Jana Gana Mana" and Bangladesh\'s national anthem "Amar Shonar Bangla."',
        '"Godan" and "Nirmala" — Munshi Premchand, prominent Hindi/Urdu novelist known for realistic depictions of rural India.',
        '"Malgudi Days" and "The Guide" — R.K. Narayan; "The Guide" won the Sahitya Akademi Award in 1960.',
        '"Midnight\'s Children" — Salman Rushdie, won the Booker Prize in 1981 and was later named the "Booker of Bookers."',
        '"The God of Small Things" — Arundhati Roy, won the Booker Prize in 1997; "The White Tiger" — Aravind Adiga, won the Booker Prize in 2008.',
        '"Interpreter of Maladies" — Jhumpa Lahiri, won the Pulitzer Prize for Fiction in 2000.',
      ], questions: [{ id: 'bka-2q1', questionText: 'Which Indian-origin author won the Booker Prize in 1997 for "The God of Small Things"?', options: ['Kiran Desai', 'Arundhati Roy', 'Jhumpa Lahiri', 'Vikram Seth'], correctOption: 1, explanation: 'Arundhati Roy won the Booker Prize in 1997 for her debut novel "The God of Small Things."' }] },
    ]
  },
  {
    id: 'committees', subject: 'Committees', title: 'Committees & Commissions: Static GK',
    description: 'Key constitutional/statutory bodies and landmark committees frequently tested in Polity-adjacent GK.',
    chapters: [
      { id: 'com-1', order: 1, title: 'Constitutional Bodies', book: 'Static GK — Constitutional Bodies', notes: [
        'Election Commission of India (Article 324) — conducts elections to Parliament, state legislatures and the offices of President/Vice-President; a permanent, independent constitutional body established in 1950.',
        'Union Public Service Commission (UPSC, Article 315-323) — conducts recruitment examinations for All India Services and Central Civil Services (e.g. the Civil Services Examination).',
        'Comptroller and Auditor General of India (CAG, Article 148) — audits all receipts and expenditure of the Government of India and state governments, often called the "guardian of the public purse."',
        'Finance Commission (Article 280) — constituted every five years by the President to recommend distribution of tax revenues between the Union and the States.',
        'National Commission for Scheduled Castes and National Commission for Scheduled Tribes (Articles 338 and 338A) — safeguard the interests of SCs and STs respectively.',
      ], questions: [{ id: 'com-1q1', questionText: 'Which constitutional authority is often referred to as the "guardian of the public purse"?', options: ['Election Commission', 'UPSC', 'Comptroller and Auditor General (CAG)', 'Finance Commission'], correctOption: 2, explanation: 'The CAG audits all government expenditure and receipts, earning the description "guardian of the public purse."' }] },
      { id: 'com-2', order: 2, title: 'Statutory & Regulatory Bodies', book: 'Static GK — Statutory Bodies', notes: [
        'Reserve Bank of India (RBI, established 1935 under the RBI Act 1934) — India\'s central bank, headquartered in Mumbai; regulates monetary policy, currency issuance and the banking sector.',
        'Securities and Exchange Board of India (SEBI, established 1988, statutory status in 1992) — regulates the securities and capital markets in India.',
        'Insurance Regulatory and Development Authority of India (IRDAI, established 1999) — regulates and promotes the insurance industry in India, headquartered in Hyderabad.',
        'Competition Commission of India (CCI, established 2003 under the Competition Act 2002) — enforces the Competition Act to prevent anti-competitive practices.',
        'National Human Rights Commission (NHRC, established 1993 under the Protection of Human Rights Act) — a statutory (not constitutional) body safeguarding human rights.',
      ], questions: [{ id: 'com-2q1', questionText: 'SEBI is the regulatory body for which sector in India?', options: ['Banking', 'Insurance', 'Securities and capital markets', 'Telecommunications'], correctOption: 2, explanation: 'SEBI (Securities and Exchange Board of India) regulates India\'s securities and capital markets.' }] },
    ]
  },
  {
    id: 'banking-economy', subject: 'Banking & Economy', title: 'Banking & Economy: Static GK',
    description: 'Currency, financial institutions and core banking facts distinct from the dynamic Economics NCERT track.',
    chapters: [
      { id: 'bke-1', order: 1, title: 'RBI, Currency and Monetary Tools', book: 'Static GK — RBI & Currency', notes: [
        'The Reserve Bank of India is the sole authority for issuing currency notes in India (other than the ₹1 note and coins, which are issued by the Government of India under the Coinage Act, though ₹1 notes bear the Finance Secretary\'s signature, not the RBI Governor\'s).',
        'Repo rate is the rate at which RBI lends short-term funds to commercial banks; reverse repo rate is the rate at which RBI borrows from banks — repo rate is a key tool to control inflation and liquidity.',
        'Cash Reserve Ratio (CRR) is the minimum percentage of a bank\'s deposits that must be kept as reserves with the RBI in cash form; Statutory Liquidity Ratio (SLR) is the minimum percentage that must be maintained in the form of liquid assets (cash, gold, approved securities).',
        'The Monetary Policy Committee (MPC), constituted in 2016, is a six-member body (three from RBI, three external) responsible for setting the policy repo rate to maintain price stability, targeting inflation at 4% (+/- 2% band).',
        'NABARD (National Bank for Agriculture and Rural Development, established 1982) is the apex development bank for rural credit and agricultural finance in India.',
      ], questions: [{ id: 'bke-1q1', questionText: 'Which committee is responsible for setting India\'s policy repo rate?', options: ['Finance Commission', 'Monetary Policy Committee (MPC)', 'Planning Commission', 'Public Accounts Committee'], correctOption: 1, explanation: 'The Monetary Policy Committee (MPC), constituted in 2016, sets the policy repo rate to maintain price stability/inflation targeting.' }] },
      { id: 'bke-2', order: 2, title: 'Banking Structure & Financial Institutions', book: 'Static GK — Banking Structure', notes: [
        'India follows a multi-tier banking structure: RBI (central bank) at the apex, followed by Scheduled Commercial Banks (public sector, private sector, foreign, regional rural banks, small finance banks, payments banks) and cooperative banks.',
        'The State Bank of India (SBI) is India\'s largest public sector bank by assets and branch network.',
        'Regional Rural Banks (RRBs) were established under the RRB Act, 1976, to provide banking services in rural areas, jointly owned by the central government, a sponsor bank and the concerned state government.',
        'The Insolvency and Bankruptcy Code (IBC), 2016 provides a time-bound process for resolving insolvency of companies and individuals in India.',
        'Basel III norms (international, developed by the Basel Committee on Banking Supervision) prescribe capital adequacy, stress testing and liquidity risk requirements for banks, adopted by Indian banks in a phased manner.',
      ], questions: [{ id: 'bke-2q1', questionText: 'Which act established Regional Rural Banks (RRBs) in India?', options: ['Banking Regulation Act 1949', 'RRB Act 1976', 'RBI Act 1934', 'SBI Act 1955'], correctOption: 1, explanation: 'Regional Rural Banks were established under the RRB Act, 1976, to extend banking services to rural areas.' }] },
    ]
  },
];

export const GK_QUESTION_TEXTS = GK_TRACKS.flatMap(track =>
  track.chapters.flatMap(chapter => chapter.questions.map(question => question.questionText))
);
