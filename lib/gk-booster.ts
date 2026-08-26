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
      ], questions: [{ id: 'awd-1q1', questionText: "India's highest civilian award is:", options: ['Padma Vibhushan', 'Bharat Ratna', 'Padma Bhushan', 'Ashoka Chakra'], correctOption: 1, explanation: 'Bharat Ratna, instituted in 1954, is India\'s highest civilian honour.' }, { id: 'awd-1q2', questionText: 'Which of the following correctly orders the Padma Awards from highest to lowest?', options: ['Padma Shri, Padma Bhushan, Padma Vibhushan', 'Padma Vibhushan, Padma Bhushan, Padma Shri', 'Padma Bhushan, Padma Vibhushan, Padma Shri', 'Padma Vibhushan, Padma Shri, Padma Bhushan'], correctOption: 1, explanation: 'The descending order is Padma Vibhushan, then Padma Bhushan, then Padma Shri.' }, { id: 'awd-1q3', questionText: 'Padma Awards are announced annually on which day?', options: ['Independence Day', 'Republic Day', 'Gandhi Jayanti', 'Constitution Day'], correctOption: 1, explanation: 'The Padma Awards are announced each year on Republic Day, 26 January.' }] },
      { id: 'awd-2', order: 2, title: 'Gallantry & Defence Awards', book: 'Static GK — Gallantry Awards', notes: [
        'Param Vir Chakra (instituted 1950) is India\'s highest wartime gallantry award, given for the most conspicuous bravery in the presence of the enemy.',
        'The order of peacetime gallantry awards (highest to lower): Ashoka Chakra, Kirti Chakra, Shaurya Chakra — equivalent in prestige tier to Param Vir Chakra, Maha Vir Chakra, Vir Chakra respectively for wartime.',
        'Wartime gallantry award hierarchy: Param Vir Chakra > Maha Vir Chakra > Vir Chakra.',
        'The Param Vir Chakra was designed by Savitri Khanolkar; Major Somnath Sharma was the first recipient (posthumous), for actions during the 1947-48 Kashmir operations.',
      ], questions: [{ id: 'awd-2q1', questionText: "India's highest wartime gallantry award is:", options: ['Ashoka Chakra', 'Param Vir Chakra', 'Vir Chakra', 'Kirti Chakra'], correctOption: 1, explanation: 'Param Vir Chakra is the highest wartime gallantry award; Ashoka Chakra is its peacetime equivalent.' }, { id: 'awd-2q2', questionText: 'Who was the first recipient of the Param Vir Chakra?', options: ['Major Somnath Sharma', 'Captain Vikram Batra', 'Abdul Hamid', 'Major Shaitan Singh'], correctOption: 0, explanation: 'Major Somnath Sharma received the first Param Vir Chakra posthumously for the 1947-48 Kashmir operations.' }, { id: 'awd-2q3', questionText: 'Which is the highest peacetime gallantry award in India?', options: ['Kirti Chakra', 'Ashoka Chakra', 'Shaurya Chakra', 'Vir Chakra'], correctOption: 1, explanation: 'The Ashoka Chakra is the highest peacetime gallantry award, ranking above Kirti Chakra and Shaurya Chakra.' }] },
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
      ], questions: [{ id: 'spt-1q1', questionText: 'Which Grand Slam tennis tournament is played on a grass court and is the oldest of the four?', options: ['US Open', 'French Open', 'Wimbledon', 'Australian Open'], correctOption: 2, explanation: 'Wimbledon, held in England since 1877, is the oldest Grand Slam and the only one played on grass.' }, { id: 'spt-1q2', questionText: 'The International Olympic Committee (IOC) is headquartered in:', options: ['Paris, France', 'Lausanne, Switzerland', 'Athens, Greece', 'Rome, Italy'], correctOption: 1, explanation: 'The IOC has been headquartered in Lausanne, Switzerland since 1915.' }, { id: 'spt-1q3', questionText: 'The French Open (Roland Garros) is played on which surface?', options: ['Grass', 'Clay', 'Hard court', 'Carpet'], correctOption: 1, explanation: 'Roland Garros is the only Grand Slam played on clay; the Australian and US Opens use hard courts.' }] },
      { id: 'spt-2', order: 2, title: 'India in Sports', book: 'Static GK — India Sporting Facts', notes: [
        'Hockey is India\'s national sport by long-standing tradition (though there is no formal government notification declaring an official national sport) — India has won 8 Olympic gold medals in men\'s hockey, most recently in 1980 (Moscow).',
        'India won its first individual Olympic gold medal through Abhinav Bindra (10m air rifle shooting, Beijing 2008); Neeraj Chopra won India\'s first Olympic gold in athletics (javelin throw, Tokyo 2020/held in 2021).',
        'The Indian Premier League (IPL), a Twenty20 cricket league, was founded in 2008 by the Board of Control for Cricket in India (BCCI).',
        'Major domestic cricket tournaments in India: Ranji Trophy (first-class, inter-state), Duleep Trophy (zonal), Irani Cup, Vijay Hazare Trophy (List A/ODI format), Syed Mushtaq Ali Trophy (T20 format).',
        'The Khelo India Youth Games (launched 2018) is a national-level multi-sport event to promote grassroots sports talent across Indian states.',
      ], questions: [{ id: 'spt-2q1', questionText: 'Who won India\'s first individual Olympic gold medal?', options: ['Neeraj Chopra', 'Abhinav Bindra', 'Rajyavardhan Singh Rathore', 'Milkha Singh'], correctOption: 1, explanation: 'Abhinav Bindra won India\'s first individual Olympic gold medal in 10m air rifle shooting at the Beijing 2008 Olympics.' }, { id: 'spt-2q2', questionText: 'Neeraj Chopra won India\'s first Olympic gold in athletics in which discipline?', options: ['Long jump', 'Javelin throw', '400m hurdles', 'Shot put'], correctOption: 1, explanation: 'Neeraj Chopra won gold in the javelin throw at the Tokyo Olympics (held in 2021).' }, { id: 'spt-2q3', questionText: 'The Ranji Trophy is associated with which sport?', options: ['Hockey', 'Cricket', 'Football', 'Badminton'], correctOption: 1, explanation: 'The Ranji Trophy is India\'s premier first-class inter-state cricket tournament.' }] },
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
      ], questions: [{ id: 'day-1q1', questionText: 'National Science Day (28 February) commemorates which scientific discovery?', options: ['Chandrasekhar Limit', 'Raman Effect', 'Bose-Einstein Statistics', 'Green Revolution'], correctOption: 1, explanation: 'National Science Day marks C.V. Raman\'s 1928 discovery of the Raman Effect, for which he won the 1930 Nobel Prize in Physics.' }, { id: 'day-1q2', questionText: 'National Youth Day (12 January) marks the birth anniversary of:', options: ['Bhagat Singh', 'Swami Vivekananda', 'Subhas Chandra Bose', 'Jawaharlal Nehru'], correctOption: 1, explanation: 'National Youth Day is observed on Swami Vivekananda\'s birth anniversary.' }, { id: 'day-1q3', questionText: 'Teachers\' Day in India is celebrated on the birth anniversary of:', options: ['Dr. Sarvepalli Radhakrishnan', 'Dr. A.P.J. Abdul Kalam', 'Maulana Abul Kalam Azad', 'Rabindranath Tagore'], correctOption: 0, explanation: 'Teachers\' Day (5 September) marks the birth anniversary of Dr. Sarvepalli Radhakrishnan, philosopher and India\'s second President.' }] },
      { id: 'day-2', order: 2, title: 'International Observance Days', book: 'Static GK — International Days', notes: [
        'World Health Day — 7 April (anniversary of WHO\'s founding in 1948); World Environment Day — 5 June (UN Environment Programme).',
        'International Women\'s Day — 8 March; International Yoga Day — 21 June (established by the UN in 2014 following a proposal by India).',
        'World Population Day — 11 July; World Water Day — 22 March; Earth Day — 22 April.',
        'International Literacy Day — 8 September (UNESCO); World Wildlife Day — 3 March; International Day of Peace — 21 September.',
        'United Nations Day — 24 October (anniversary of the UN Charter coming into force, 1945); Human Rights Day — 10 December (anniversary of the UN\'s adoption of the Universal Declaration of Human Rights, 1948).',
      ], questions: [{ id: 'day-2q1', questionText: 'International Day of Yoga (21 June) was established by the United Nations following a proposal by which country?', options: ['China', 'Nepal', 'India', 'Sri Lanka'], correctOption: 2, explanation: 'The UN General Assembly adopted 21 June as International Yoga Day in 2014 following a proposal by India\'s Prime Minister.' }, { id: 'day-2q2', questionText: 'World Health Day (7 April) marks the founding anniversary of which organisation?', options: ['UNICEF', 'World Health Organization', 'Red Cross', 'UNESCO'], correctOption: 1, explanation: 'World Health Day commemorates the founding of the WHO in 1948.' }, { id: 'day-2q3', questionText: 'Human Rights Day (10 December) commemorates the adoption of:', options: ['The UN Charter', 'The Universal Declaration of Human Rights', 'The Geneva Conventions', 'The Paris Agreement'], correctOption: 1, explanation: 'The UN adopted the Universal Declaration of Human Rights on 10 December 1948.' }] },
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
      ], questions: [{ id: 'sch-1q1', questionText: 'Which scheme provides health insurance cover of up to ₹5 lakh per family per year?', options: ['PMJDY', 'PM-JAY (Ayushman Bharat)', 'PMFBY', 'PMAY'], correctOption: 1, explanation: 'Ayushman Bharat / PM-JAY provides health cover up to ₹5 lakh per family per year for secondary and tertiary care hospitalisation.' }, { id: 'sch-1q2', questionText: 'Under Pradhan Mantri Mudra Yojana, loans are categorised into which three tiers?', options: ['Shishu, Kishor, Tarun', 'Bronze, Silver, Gold', 'Micro, Small, Medium', 'Alpha, Beta, Gamma'], correctOption: 0, explanation: 'PMMY loans are classified as Shishu, Kishor and Tarun by loan size, up to ₹10 lakh.' }, { id: 'sch-1q3', questionText: 'Pradhan Mantri Ujjwala Yojana provides below-poverty-line households with:', options: ['Free electricity connections', 'Free LPG connections', 'Interest-free loans', 'Subsidised housing'], correctOption: 1, explanation: 'PMUY (2016) gives free LPG connections to women from BPL households to replace unclean cooking fuels.' }] },
      { id: 'sch-2', order: 2, title: 'Skill, Employment & Rural Development Schemes', book: 'Static GK — Employment & Rural Schemes', notes: [
        'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA, 2005) — legally guarantees 100 days of wage employment per year to rural households willing to do unskilled manual work.',
        'Pradhan Mantri Kaushal Vikas Yojana (PMKVY, launched 2015) — flagship skill development scheme to enable Indian youth to take up industry-relevant skill training.',
        'Pradhan Mantri Gram Sadak Yojana (PMGSY, launched 2000) — aims to provide all-weather road connectivity to unconnected rural habitations.',
        'Jal Jeevan Mission (launched 2019) — aims to provide functional household tap water connections to every rural household ("Har Ghar Jal").',
        'Swachh Bharat Mission (launched 2014) — nationwide sanitation campaign to eliminate open defecation and improve solid waste management.',
        'Digital India (launched 2015) — umbrella programme to transform India into a digitally empowered society, covering digital infrastructure, governance and services.',
        'Startup India (launched 2016) — initiative to promote and support entrepreneurship and startup ecosystem via tax benefits, easier compliance and funding support.',
      ], questions: [{ id: 'sch-2q1', questionText: 'MGNREGA legally guarantees how many days of wage employment per year to rural households?', options: ['50 days', '100 days', '150 days', '200 days'], correctOption: 1, explanation: 'MGNREGA (2005) guarantees a minimum of 100 days of wage employment per financial year to every rural household willing to do unskilled manual work.' }, { id: 'sch-2q2', questionText: 'The Jal Jeevan Mission aims to provide every rural household with:', options: ['A toilet', 'A functional tap water connection', 'An LPG connection', 'A pucca house'], correctOption: 1, explanation: 'Jal Jeevan Mission (2019) targets "Har Ghar Jal" — a functional household tap water connection for every rural home.' }, { id: 'sch-2q3', questionText: 'Pradhan Mantri Gram Sadak Yojana, launched in 2000, focuses on:', options: ['Rural electrification', 'All-weather road connectivity to rural habitations', 'Rural housing', 'Rural banking'], correctOption: 1, explanation: 'PMGSY provides all-weather road connectivity to unconnected rural habitations.' }] },
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
      ], questions: [{ id: 'bka-1q1', questionText: '"Wings of Fire" is the autobiography of which former President of India?', options: ['Pratibha Patil', 'A.P.J. Abdul Kalam', 'R. Venkataraman', 'Zakir Husain'], correctOption: 1, explanation: '"Wings of Fire" is the autobiography of Dr. A.P.J. Abdul Kalam, India\'s 11th President, known as the "Missile Man of India."' }, { id: 'bka-1q2', questionText: '"India Wins Freedom" was written by:', options: ['Jawaharlal Nehru', 'Maulana Abul Kalam Azad', 'Sardar Patel', 'Rajendra Prasad'], correctOption: 1, explanation: 'Maulana Abul Kalam Azad wrote "India Wins Freedom", an account of the freedom struggle and Partition.' }, { id: 'bka-1q3', questionText: '"The Discovery of India" was written during its author\'s imprisonment by:', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'B.R. Ambedkar', 'Subhas Chandra Bose'], correctOption: 1, explanation: 'Jawaharlal Nehru wrote "The Discovery of India" while imprisoned at Ahmednagar Fort.' }] },
      { id: 'bka-2', order: 2, title: 'Indian Literature & Nobel/Booker Winners', book: 'Static GK — Literary Works', notes: [
        '"Gitanjali" — Rabindranath Tagore (won him the 1913 Nobel Prize in Literature); Tagore also wrote India\'s national anthem "Jana Gana Mana" and Bangladesh\'s national anthem "Amar Shonar Bangla."',
        '"Godan" and "Nirmala" — Munshi Premchand, prominent Hindi/Urdu novelist known for realistic depictions of rural India.',
        '"Malgudi Days" and "The Guide" — R.K. Narayan; "The Guide" won the Sahitya Akademi Award in 1960.',
        '"Midnight\'s Children" — Salman Rushdie, won the Booker Prize in 1981 and was later named the "Booker of Bookers."',
        '"The God of Small Things" — Arundhati Roy, won the Booker Prize in 1997; "The White Tiger" — Aravind Adiga, won the Booker Prize in 2008.',
        '"Interpreter of Maladies" — Jhumpa Lahiri, won the Pulitzer Prize for Fiction in 2000.',
      ], questions: [{ id: 'bka-2q1', questionText: 'Which Indian-origin author won the Booker Prize in 1997 for "The God of Small Things"?', options: ['Kiran Desai', 'Arundhati Roy', 'Jhumpa Lahiri', 'Vikram Seth'], correctOption: 1, explanation: 'Arundhati Roy won the Booker Prize in 1997 for her debut novel "The God of Small Things."' }, { id: 'bka-2q2', questionText: 'Rabindranath Tagore won the 1913 Nobel Prize in Literature for which work?', options: ['Gora', 'Gitanjali', 'The Home and the World', 'Chokher Bali'], correctOption: 1, explanation: '"Gitanjali" won Tagore the Nobel Prize in Literature in 1913.' }, { id: 'bka-2q3', questionText: '"Midnight\'s Children", winner of the 1981 Booker Prize, was written by:', options: ['Vikram Seth', 'Salman Rushdie', 'Amitav Ghosh', 'Aravind Adiga'], correctOption: 1, explanation: 'Salman Rushdie\'s "Midnight\'s Children" won the 1981 Booker and was later named the "Booker of Bookers".' }] },
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
      ], questions: [{ id: 'com-1q1', questionText: 'Which constitutional authority is often referred to as the "guardian of the public purse"?', options: ['Election Commission', 'UPSC', 'Comptroller and Auditor General (CAG)', 'Finance Commission'], correctOption: 2, explanation: 'The CAG audits all government expenditure and receipts, earning the description "guardian of the public purse."' }, { id: 'com-1q2', questionText: 'The Election Commission of India is established under which Article?', options: ['Article 280', 'Article 324', 'Article 148', 'Article 315'], correctOption: 1, explanation: 'Article 324 establishes the Election Commission and vests it with superintendence of elections.' }, { id: 'com-1q3', questionText: 'The Finance Commission is constituted by the President every:', options: ['Three years', 'Five years', 'Ten years', 'Year'], correctOption: 1, explanation: 'Under Article 280, a Finance Commission is constituted every five years to recommend Union–State tax devolution.' }] },
      { id: 'com-2', order: 2, title: 'Statutory & Regulatory Bodies', book: 'Static GK — Statutory Bodies', notes: [
        'Reserve Bank of India (RBI, established 1935 under the RBI Act 1934) — India\'s central bank, headquartered in Mumbai; regulates monetary policy, currency issuance and the banking sector.',
        'Securities and Exchange Board of India (SEBI, established 1988, statutory status in 1992) — regulates the securities and capital markets in India.',
        'Insurance Regulatory and Development Authority of India (IRDAI, established 1999) — regulates and promotes the insurance industry in India, headquartered in Hyderabad.',
        'Competition Commission of India (CCI, established 2003 under the Competition Act 2002) — enforces the Competition Act to prevent anti-competitive practices.',
        'National Human Rights Commission (NHRC, established 1993 under the Protection of Human Rights Act) — a statutory (not constitutional) body safeguarding human rights.',
      ], questions: [{ id: 'com-2q1', questionText: 'SEBI is the regulatory body for which sector in India?', options: ['Banking', 'Insurance', 'Securities and capital markets', 'Telecommunications'], correctOption: 2, explanation: 'SEBI (Securities and Exchange Board of India) regulates India\'s securities and capital markets.' }, { id: 'com-2q2', questionText: 'The National Human Rights Commission (NHRC) is best described as a:', options: ['Constitutional body', 'Statutory body', 'Executive body', 'Judicial body'], correctOption: 1, explanation: 'The NHRC was created by the Protection of Human Rights Act, 1993, making it statutory rather than constitutional.' }, { id: 'com-2q3', questionText: 'IRDAI, the insurance regulator, was established in which year?', options: ['1992', '1999', '2003', '2016'], correctOption: 1, explanation: 'The Insurance Regulatory and Development Authority of India was established in 1999.' }] },
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
      ], questions: [{ id: 'bke-1q1', questionText: 'Which committee is responsible for setting India\'s policy repo rate?', options: ['Finance Commission', 'Monetary Policy Committee (MPC)', 'Planning Commission', 'Public Accounts Committee'], correctOption: 1, explanation: 'The Monetary Policy Committee (MPC), constituted in 2016, sets the policy repo rate to maintain price stability/inflation targeting.' }, { id: 'bke-1q2', questionText: 'Which ratio requires banks to hold a minimum share of deposits as cash reserves with the RBI?', options: ['Statutory Liquidity Ratio (SLR)', 'Cash Reserve Ratio (CRR)', 'Capital Adequacy Ratio', 'Credit-Deposit Ratio'], correctOption: 1, explanation: 'CRR is the share of deposits held as cash with the RBI; SLR is held in liquid assets such as gold and approved securities.' }, { id: 'bke-1q3', questionText: 'NABARD, the apex rural development bank, was established in:', options: ['1969', '1982', '1991', '2000'], correctOption: 1, explanation: 'NABARD was established in 1982 as the apex institution for agricultural and rural credit.' }] },
      { id: 'bke-2', order: 2, title: 'Banking Structure & Financial Institutions', book: 'Static GK — Banking Structure', notes: [
        'India follows a multi-tier banking structure: RBI (central bank) at the apex, followed by Scheduled Commercial Banks (public sector, private sector, foreign, regional rural banks, small finance banks, payments banks) and cooperative banks.',
        'The State Bank of India (SBI) is India\'s largest public sector bank by assets and branch network.',
        'Regional Rural Banks (RRBs) were established under the RRB Act, 1976, to provide banking services in rural areas, jointly owned by the central government, a sponsor bank and the concerned state government.',
        'The Insolvency and Bankruptcy Code (IBC), 2016 provides a time-bound process for resolving insolvency of companies and individuals in India.',
        'Basel III norms (international, developed by the Basel Committee on Banking Supervision) prescribe capital adequacy, stress testing and liquidity risk requirements for banks, adopted by Indian banks in a phased manner.',
      ], questions: [{ id: 'bke-2q1', questionText: 'Which act established Regional Rural Banks (RRBs) in India?', options: ['Banking Regulation Act 1949', 'RRB Act 1976', 'RBI Act 1934', 'SBI Act 1955'], correctOption: 1, explanation: 'Regional Rural Banks were established under the RRB Act, 1976, to extend banking services to rural areas.' }, { id: 'bke-2q2', questionText: 'The Insolvency and Bankruptcy Code (IBC) was enacted in which year?', options: ['2013', '2016', '2018', '2020'], correctOption: 1, explanation: 'The IBC, 2016 created a single, time-bound framework for resolving corporate and individual insolvency.' }, { id: 'bke-2q3', questionText: 'Which international framework prescribes capital adequacy and liquidity norms adopted by Indian banks?', options: ['Bretton Woods norms', 'Basel III norms', 'IFRS 9', 'GATT rules'], correctOption: 1, explanation: 'Basel III, from the Basel Committee on Banking Supervision, prescribes capital adequacy, stress testing and liquidity requirements.' }] },
    ]
  },
  {
    id: 'geography', subject: 'Geography', title: 'Geography: Static GK',
    description: 'Indian physical geography, rivers, climate and world geography facts that recur across GA sections.',
    chapters: [
      { id: 'geo-1', order: 1, title: 'Indian Rivers & Drainage', book: 'Static GK — Rivers', notes: [
        'The Ganga rises as the Bhagirathi from the Gangotri glacier in Uttarakhand; it is joined by the Alaknanda at Devprayag, from where the combined stream is called the Ganga.',
        'The Ganga–Brahmaputra–Meghna system forms the Sundarbans, the world\'s largest delta, shared between India and Bangladesh.',
        'The Brahmaputra is known as the Yarlung Tsangpo in Tibet, the Siang/Dihang in Arunachal Pradesh, and the Jamuna in Bangladesh.',
        'Peninsular rivers flowing east into the Bay of Bengal — Mahanadi, Godavari, Krishna and Kaveri — form deltas; the Godavari is the longest peninsular river and is called the "Dakshina Ganga".',
        'The Narmada and Tapi are the two major peninsular rivers flowing west into the Arabian Sea; both flow through rift valleys and form estuaries rather than deltas.',
        'The Indus system rivers — Indus, Jhelum, Chenab, Ravi, Beas and Sutlej — are governed by the Indus Waters Treaty (1960) brokered by the World Bank, which allots the three eastern rivers (Ravi, Beas, Sutlej) to India and the three western rivers (Indus, Jhelum, Chenab) largely to Pakistan.',
      ], questions: [
        { id: 'geo-1q1', questionText: 'Which is the longest river flowing entirely within India?', options: ['Ganga', 'Godavari', 'Narmada', 'Krishna'], correctOption: 1, explanation: 'The Godavari is the longest peninsular river and the longest flowing entirely within India; the Ganga is longer overall but continues into Bangladesh.' },
        { id: 'geo-1q2', questionText: 'The Narmada and Tapi rivers are distinctive among major Indian rivers because they:', options: ['Flow west into the Arabian Sea through rift valleys', 'Form the largest delta in the world', 'Originate in the Himalayas', 'Are entirely seasonal'], correctOption: 0, explanation: 'Both flow westward through rift valleys and form estuaries rather than deltas.' },
        { id: 'geo-1q3', questionText: 'The Indus Waters Treaty of 1960 was brokered by which institution?', options: ['United Nations', 'World Bank', 'International Court of Justice', 'Asian Development Bank'], correctOption: 1, explanation: 'The World Bank brokered and is a signatory to the 1960 Indus Waters Treaty between India and Pakistan.' },
        { id: 'geo-1q4', questionText: 'In Tibet, the Brahmaputra is known as:', options: ['Yarlung Tsangpo', 'Sutlej', 'Meghna', 'Dihang'], correctOption: 0, explanation: 'The river is called the Yarlung Tsangpo in Tibet, the Siang/Dihang in Arunachal Pradesh, and the Jamuna in Bangladesh.' },
      ] },
      { id: 'geo-2', order: 2, title: 'Physical Features & Climate', book: 'Static GK — Physiography', notes: [
        'India\'s physiography is conventionally divided into six divisions: the Northern Mountains (Himalayas), the Northern Plains, the Peninsular Plateau, the Indian Desert, the Coastal Plains, and the Islands.',
        'The Himalayas run in three roughly parallel ranges: the Himadri (Greater Himalayas, containing the highest peaks), the Himachal (Lesser Himalayas, including Pir Panjal and Dhauladhar), and the Shivaliks (Outer Himalayas).',
        'Kanchenjunga (8,586 m) in Sikkim is the highest peak entirely within India and the third-highest in the world; K2, higher still, lies in the disputed Gilgit-Baltistan region.',
        'The Western Ghats (a UNESCO World Heritage biodiversity hotspot) run parallel to the west coast and are higher and more continuous than the Eastern Ghats, which are broken by peninsular rivers.',
        'India has a tropical monsoon climate. The South-West Monsoon (June–September) delivers the great majority of annual rainfall; the retreating or North-East Monsoon (October–December) brings rain chiefly to Tamil Nadu and the south-east coast.',
        'Mawsynram and Cherrapunji (Sohra) in the Meghalaya hills are among the wettest inhabited places on Earth, owing to the funnelling of moist monsoon winds up the Khasi Hills.',
      ], questions: [
        { id: 'geo-2q1', questionText: 'Which is the highest mountain peak located entirely within India?', options: ['K2', 'Kanchenjunga', 'Nanda Devi', 'Mount Everest'], correctOption: 1, explanation: 'Kanchenjunga (8,586 m) in Sikkim is the highest peak entirely within India and third-highest in the world.' },
        { id: 'geo-2q2', questionText: 'The majority of India\'s annual rainfall is delivered by:', options: ['The North-East (retreating) monsoon', 'The South-West monsoon', 'Western disturbances', 'Cyclonic depressions'], correctOption: 1, explanation: 'The South-West Monsoon from June to September accounts for the bulk of India\'s annual rainfall.' },
        { id: 'geo-2q3', questionText: 'Which of these is a distinguishing feature of the Eastern Ghats compared with the Western Ghats?', options: ['They are higher and continuous', 'They are discontinuous, broken by rivers', 'They lie along the west coast', 'They are entirely volcanic'], correctOption: 1, explanation: 'The Eastern Ghats are lower and discontinuous, dissected by the major east-flowing peninsular rivers.' },
      ] },
      { id: 'geo-3', order: 3, title: 'World Geography Essentials', book: 'Static GK — World Geography', notes: [
        'The Equator (0° latitude) passes through 13 countries, including Ecuador, Brazil, Kenya and Indonesia; the Tropic of Cancer (23.5° N) passes through eight Indian states.',
        'The Prime Meridian (0° longitude) passes through Greenwich, London. Indian Standard Time is based on 82°30′ E, which passes near Mirzapur, Uttar Pradesh, making IST = UTC + 5:30.',
        'The world\'s largest ocean is the Pacific; the largest desert is Antarctica (a cold desert), while the Sahara is the largest hot desert.',
        'The longest river in the world is generally cited as the Nile (with the Amazon the largest by discharge volume); the highest waterfall is Angel Falls in Venezuela.',
        'The Ring of Fire is a horseshoe-shaped belt around the Pacific Ocean accounting for the majority of the world\'s earthquakes and active volcanoes, caused by convergent plate boundaries.',
      ], questions: [
        { id: 'geo-3q1', questionText: 'Indian Standard Time is calculated from which longitude?', options: ['0° (Greenwich)', '82°30′ E', '90° E', '75° E'], correctOption: 1, explanation: 'IST is based on the 82°30′ E meridian passing near Mirzapur, giving UTC + 5:30.' },
        { id: 'geo-3q2', questionText: 'Which is the largest desert in the world by area?', options: ['Sahara', 'Antarctica', 'Gobi', 'Arabian'], correctOption: 1, explanation: 'Antarctica is the largest desert overall (a cold desert); the Sahara is the largest hot desert.' },
        { id: 'geo-3q3', questionText: 'The "Ring of Fire" is associated with which ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correctOption: 2, explanation: 'The Ring of Fire encircles the Pacific Ocean and hosts most of the world\'s earthquakes and active volcanoes.' },
      ] },
    ]
  },
  {
    id: 'history', subject: 'History', title: 'Indian History: Static GK',
    description: 'Landmark events, movements and figures from ancient, medieval and modern Indian history.',
    chapters: [
      { id: 'his-1', order: 1, title: 'Ancient & Medieval India', book: 'Static GK — Ancient & Medieval', notes: [
        'The Indus Valley (Harappan) Civilisation (c. 2600–1900 BCE) was notable for planned cities, standardised baked bricks, covered drainage and the Great Bath at Mohenjo-daro; its script remains undeciphered.',
        'The Mauryan Empire was founded by Chandragupta Maurya (c. 322 BCE) with Chanakya (Kautilya) as his adviser, author of the Arthashastra. Ashoka, his grandson, embraced Buddhism after the Kalinga War (c. 261 BCE) and spread dhamma through rock and pillar edicts.',
        'The Gupta period (c. 320–550 CE) is often called the "Golden Age" of India for achievements in mathematics (Aryabhata\'s work on zero and the decimal system), astronomy, literature (Kalidasa) and temple architecture.',
        'The Delhi Sultanate (1206–1526) spanned five dynasties: Slave/Mamluk, Khalji, Tughlaq, Sayyid and Lodi. Qutb-ud-din Aibak founded the Slave dynasty and began the Qutb Minar.',
        'The Mughal Empire was founded by Babur after the First Battle of Panipat (1526). Akbar consolidated it with the mansabdari system and a policy of religious accommodation; Shah Jahan built the Taj Mahal; Aurangzeb\'s long reign marked its greatest extent and the onset of decline.',
        'The Vijayanagara Empire (founded 1336, capital Hampi) and the Bahmani Sultanate dominated the Deccan; the Battle of Talikota (1565) broke Vijayanagara\'s power.',
      ], questions: [
        { id: 'his-1q1', questionText: 'The Arthashastra, a treatise on statecraft and economics, is attributed to:', options: ['Kalidasa', 'Chanakya (Kautilya)', 'Aryabhata', 'Banabhatta'], correctOption: 1, explanation: 'Chanakya, adviser to Chandragupta Maurya, is credited with the Arthashastra.' },
        { id: 'his-1q2', questionText: 'Ashoka embraced Buddhism after which war?', options: ['Battle of Hydaspes', 'Kalinga War', 'First Battle of Panipat', 'Battle of Talikota'], correctOption: 1, explanation: 'The bloodshed of the Kalinga War (c. 261 BCE) led Ashoka to adopt Buddhism and propagate dhamma.' },
        { id: 'his-1q3', questionText: 'The Mughal Empire was founded after which battle?', options: ['Second Battle of Panipat', 'First Battle of Panipat (1526)', 'Battle of Haldighati', 'Battle of Plassey'], correctOption: 1, explanation: 'Babur defeated Ibrahim Lodi at the First Battle of Panipat in 1526, founding the Mughal Empire.' },
        { id: 'his-1q4', questionText: 'Which period is commonly described as the "Golden Age" of India?', options: ['Mauryan', 'Gupta', 'Delhi Sultanate', 'Harappan'], correctOption: 1, explanation: 'The Gupta period (c. 320–550 CE) saw landmark advances in mathematics, astronomy, literature and art.' },
      ] },
      { id: 'his-2', order: 2, title: 'The Freedom Struggle', book: 'Static GK — Modern India', notes: [
        'The Revolt of 1857, beginning at Meerut, is regarded as the first large-scale challenge to British rule; it led to the end of East India Company rule and direct Crown administration under the Government of India Act, 1858.',
        'The Indian National Congress was founded in 1885 by A.O. Hume, with W.C. Bonnerjee as its first president.',
        'The Partition of Bengal (1905) by Lord Curzon triggered the Swadeshi and Boycott movements; the partition was annulled in 1911.',
        'Gandhi\'s major mass movements: Non-Cooperation (1920–22, withdrawn after Chauri Chaura), Civil Disobedience (1930, launched with the Dandi Salt March), and Quit India (1942, "Do or Die").',
        'The Jallianwala Bagh massacre (13 April 1919, Amritsar) under General Dyer followed the Rowlatt Act protests and was a turning point in nationalist sentiment.',
        'Subhas Chandra Bose formed the Azad Hind Fauj (Indian National Army) and the Provisional Government of Free India; his slogan was "Give me blood, and I shall give you freedom."',
        'Independence came on 15 August 1947 under the Indian Independence Act, 1947, with Lord Mountbatten as the last Viceroy and India\'s first Governor-General.',
      ], questions: [
        { id: 'his-2q1', questionText: 'The Non-Cooperation Movement was withdrawn by Gandhi following which incident?', options: ['Jallianwala Bagh massacre', 'Chauri Chaura incident', 'Partition of Bengal', 'Dandi March'], correctOption: 1, explanation: 'Gandhi called off the movement in 1922 after protesters killed policemen at Chauri Chaura, insisting on non-violence.' },
        { id: 'his-2q2', questionText: 'The Civil Disobedience Movement was launched with which event?', options: ['Quit India resolution', 'The Dandi Salt March', 'Formation of the INA', 'The Lahore Session'], correctOption: 1, explanation: 'Gandhi launched Civil Disobedience in 1930 with the Dandi March, breaking the salt law.' },
        { id: 'his-2q3', questionText: 'Who was the first president of the Indian National Congress?', options: ['A.O. Hume', 'W.C. Bonnerjee', 'Dadabhai Naoroji', 'Gopal Krishna Gokhale'], correctOption: 1, explanation: 'W.C. Bonnerjee presided over the first INC session in 1885; A.O. Hume was its founder.' },
        { id: 'his-2q4', questionText: 'The slogan "Give me blood, and I shall give you freedom" is associated with:', options: ['Bhagat Singh', 'Subhas Chandra Bose', 'Bal Gangadhar Tilak', 'Lala Lajpat Rai'], correctOption: 1, explanation: 'Subhas Chandra Bose used this call while raising the Indian National Army.' },
      ] },
    ]
  },
  {
    id: 'science-tech', subject: 'Science & Tech', title: 'Science & Technology: Static GK',
    description: 'Space programme milestones, defence technology and everyday applied science asked in GA sections.',
    chapters: [
      { id: 'sci-1', order: 1, title: 'India\'s Space Programme', book: 'Static GK — ISRO', notes: [
        'The Indian Space Research Organisation (ISRO) was established in 1969 and is headquartered in Bengaluru; Vikram Sarabhai is regarded as the father of India\'s space programme.',
        'Aryabhata (1975) was India\'s first satellite, launched with Soviet assistance. Rohini (1980) was the first satellite placed in orbit by an Indian launch vehicle, the SLV-3.',
        'Chandrayaan-1 (2008) confirmed the presence of water molecules on the Moon. Chandrayaan-3 (2023) achieved a soft landing near the lunar south pole, making India the first country to land in that region.',
        'The Mars Orbiter Mission (Mangalyaan, 2013) made India the first country to reach Mars orbit on its first attempt, and did so at a famously low cost.',
        'Key launch vehicles: PSLV (Polar Satellite Launch Vehicle), the workhorse for polar/sun-synchronous orbits; GSLV and LVM3 for heavier geostationary payloads.',
        'NavIC (Navigation with Indian Constellation) is India\'s regional satellite navigation system, the Indian counterpart to GPS.',
      ], questions: [
        { id: 'sci-1q1', questionText: 'Who is regarded as the father of India\'s space programme?', options: ['Homi Bhabha', 'Vikram Sarabhai', 'A.P.J. Abdul Kalam', 'Satish Dhawan'], correctOption: 1, explanation: 'Vikram Sarabhai founded and shaped India\'s space programme; ISRO was established in 1969.' },
        { id: 'sci-1q2', questionText: 'Chandrayaan-3 made India the first country to soft-land in which lunar region?', options: ['The far side', 'The south polar region', 'The Sea of Tranquility', 'The north pole'], correctOption: 1, explanation: 'In 2023, Chandrayaan-3 achieved the first soft landing near the Moon\'s south pole.' },
        { id: 'sci-1q3', questionText: 'India\'s regional satellite navigation system is called:', options: ['GAGAN', 'NavIC', 'BHUVAN', 'IRS'], correctOption: 1, explanation: 'NavIC (Navigation with Indian Constellation) is India\'s regional navigation satellite system.' },
        { id: 'sci-1q4', questionText: 'Which mission made India the first country to reach Mars orbit on its first attempt?', options: ['Chandrayaan-1', 'Mangalyaan (Mars Orbiter Mission)', 'Aditya-L1', 'Gaganyaan'], correctOption: 1, explanation: 'The Mars Orbiter Mission, launched in 2013, entered Mars orbit successfully on India\'s first attempt.' },
      ] },
      { id: 'sci-2', order: 2, title: 'Everyday & Applied Science', book: 'Static GK — Applied Science', notes: [
        'SI base units frequently tested: metre (length), kilogram (mass), second (time), ampere (electric current), kelvin (temperature), mole (amount of substance), candela (luminous intensity).',
        'Common vitamin deficiencies: Vitamin A — night blindness; Vitamin B1 (thiamine) — beriberi; Vitamin C — scurvy; Vitamin D — rickets in children and osteomalacia in adults; Vitamin K — impaired blood clotting.',
        'Blood groups follow the ABO system plus the Rh factor. O-negative is the universal donor for red cells; AB-positive is the universal recipient.',
        'The greenhouse gases chiefly responsible for global warming are carbon dioxide, methane, nitrous oxide and water vapour; chlorofluorocarbons (CFCs) additionally deplete stratospheric ozone and are controlled by the Montreal Protocol (1987).',
        'Everyday chemistry: common salt is sodium chloride (NaCl); baking soda is sodium bicarbonate (NaHCO₃); washing soda is sodium carbonate (Na₂CO₃); quicklime is calcium oxide (CaO).',
      ], questions: [
        { id: 'sci-2q1', questionText: 'Deficiency of which vitamin causes scurvy?', options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K'], correctOption: 1, explanation: 'Scurvy results from a deficiency of Vitamin C (ascorbic acid).' },
        { id: 'sci-2q2', questionText: 'Which blood group is known as the universal donor for red blood cells?', options: ['AB-positive', 'O-negative', 'A-positive', 'B-negative'], correctOption: 1, explanation: 'O-negative red cells lack A, B and Rh antigens, so they can be given to almost any recipient.' },
        { id: 'sci-2q3', questionText: 'The Montreal Protocol (1987) controls substances that deplete:', options: ['Groundwater', 'The ozone layer', 'Forest cover', 'Marine fisheries'], correctOption: 1, explanation: 'The Montreal Protocol phases out ozone-depleting substances such as chlorofluorocarbons.' },
        { id: 'sci-2q4', questionText: 'The chemical name of baking soda is:', options: ['Sodium carbonate', 'Sodium bicarbonate', 'Calcium oxide', 'Sodium chloride'], correctOption: 1, explanation: 'Baking soda is sodium bicarbonate (NaHCO₃); washing soda is sodium carbonate.' },
      ] },
    ]
  },
  {
    id: 'organisations', subject: 'Organisations', title: 'International Organisations & HQs',
    description: 'Global bodies, their headquarters, heads and founding years — a dependable one-liner question type.',
    chapters: [
      { id: 'org-1', order: 1, title: 'The United Nations System', book: 'Static GK — UN System', notes: [
        'The United Nations was founded on 24 October 1945; its headquarters is in New York, and it currently has 193 member states. India was a founding member.',
        'The six principal organs are the General Assembly, Security Council, Economic and Social Council (ECOSOC), Trusteeship Council, International Court of Justice, and the Secretariat.',
        'The Security Council has 15 members: five permanent with veto power (China, France, Russia, the United Kingdom, the United States) and ten non-permanent members elected for two-year terms.',
        'The International Court of Justice, the UN\'s principal judicial organ, sits at The Hague, Netherlands — the only principal organ not headquartered in New York.',
        'Key specialised agencies and their headquarters: WHO (Geneva), UNESCO (Paris), ILO (Geneva), FAO (Rome), IMF and World Bank (Washington D.C.), UNICEF (New York), IAEA (Vienna).',
      ], questions: [
        { id: 'org-1q1', questionText: 'How many permanent members does the UN Security Council have?', options: ['Ten', 'Five', 'Fifteen', 'Seven'], correctOption: 1, explanation: 'Five permanent members — China, France, Russia, the UK and the USA — hold veto power.' },
        { id: 'org-1q2', questionText: 'The International Court of Justice is headquartered in:', options: ['New York', 'The Hague', 'Geneva', 'Vienna'], correctOption: 1, explanation: 'The ICJ sits at the Peace Palace in The Hague, the only principal UN organ outside New York.' },
        { id: 'org-1q3', questionText: 'UNESCO is headquartered in which city?', options: ['Geneva', 'Paris', 'Rome', 'Vienna'], correctOption: 1, explanation: 'UNESCO has its headquarters in Paris; WHO and ILO are in Geneva, and FAO is in Rome.' },
        { id: 'org-1q4', questionText: 'United Nations Day is observed on which date?', options: ['10 December', '24 October', '8 September', '21 September'], correctOption: 1, explanation: 'UN Day marks the UN Charter coming into force on 24 October 1945.' },
      ] },
      { id: 'org-2', order: 2, title: 'Economic & Regional Groupings', book: 'Static GK — Economic Groupings', notes: [
        'The World Trade Organization (WTO), established in 1995 as successor to GATT, is headquartered in Geneva and administers global trade rules.',
        'The International Monetary Fund and the World Bank, both created at the Bretton Woods Conference (1944), are headquartered in Washington D.C.; the IMF focuses on macroeconomic stability and balance-of-payments support, the World Bank on development lending.',
        'BRICS originally comprised Brazil, Russia, India, China and South Africa; the group established the New Development Bank, headquartered in Shanghai.',
        'SAARC (South Asian Association for Regional Cooperation) was founded in 1985 with its secretariat in Kathmandu, Nepal; its eight members include India, Pakistan, Bangladesh, Nepal, Bhutan, Sri Lanka, Maldives and Afghanistan.',
        'ASEAN (founded 1967, secretariat in Jakarta) promotes South-East Asian economic and political cooperation; OPEC (founded 1960, headquarters Vienna) coordinates petroleum policy among major oil exporters.',
        'The G20 is a forum of major economies covering the bulk of world GDP and trade; India held its presidency and hosted the leaders\' summit in New Delhi in 2023.',
      ], questions: [
        { id: 'org-2q1', questionText: 'The IMF and the World Bank were both established at which conference?', options: ['Yalta Conference', 'Bretton Woods Conference', 'Bandung Conference', 'Doha Round'], correctOption: 1, explanation: 'Both institutions were created at the 1944 Bretton Woods Conference and are based in Washington D.C.' },
        { id: 'org-2q2', questionText: 'The New Development Bank was established by which grouping?', options: ['ASEAN', 'BRICS', 'SAARC', 'OPEC'], correctOption: 1, explanation: 'BRICS established the New Development Bank, headquartered in Shanghai.' },
        { id: 'org-2q3', questionText: 'The SAARC secretariat is located in which city?', options: ['New Delhi', 'Kathmandu', 'Dhaka', 'Colombo'], correctOption: 1, explanation: 'SAARC, founded in 1985, has its secretariat in Kathmandu, Nepal.' },
        { id: 'org-2q4', questionText: 'The WTO, established in 1995, succeeded which arrangement?', options: ['GATT', 'NAFTA', 'Bretton Woods system', 'COMECON'], correctOption: 0, explanation: 'The WTO replaced the General Agreement on Tariffs and Trade (GATT) in 1995.' },
      ] },
    ]
  },
];

export const GK_QUESTION_TEXTS = GK_TRACKS.flatMap(track =>
  track.chapters.flatMap(chapter => chapter.questions.map(question => question.questionText))
);
