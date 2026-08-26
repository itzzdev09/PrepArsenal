"""Import a second curated question batch — expert-authored, exam-pattern
practice questions written directly (no Groq/Gemini or any LLM API call).

Unlike scripts/import_curated_pyq_samples.py, these are NOT transcriptions of a
specific paper PDF, so they are labelled source_type='expert_authored' with
is_verified_pyq=False. That keeps them out of ML trend/PYQ-frequency predictions
(same treatment as memory_based records) while still growing practice depth for
every exam, subject and topic.
"""

from db_client import get_db_client

BATCH = 'curated_pyq_batch2_2026_08'

TOPICS = {
    'qa_number': ('Number System', 'Quantitative Aptitude'),
    'qa_percentage': ('Percentage', 'Quantitative Aptitude'),
    'qa_profit_loss': ('Profit & Loss', 'Quantitative Aptitude'),
    'qa_tsd': ('Time, Speed & Distance', 'Quantitative Aptitude'),
    'qa_average': ('Average', 'Quantitative Aptitude'),
    'qa_trigonometry': ('Trigonometry', 'Quantitative Aptitude'),
    'qa_mensuration': ('Mensuration', 'Quantitative Aptitude'),
    'qa_algebra': ('Algebra', 'Quantitative Aptitude'),
    'qa_geometry': ('Geometry', 'Quantitative Aptitude'),
    'qa_di': ('Data Interpretation', 'Quantitative Aptitude'),
    'qa_interest': ('Simple & Compound Interest', 'Quantitative Aptitude'),
    'qa_time_work': ('Time & Work', 'Quantitative Aptitude'),
    'lr_analogy': ('Analogy', 'Reasoning'),
    'lr_classification': ('Classification', 'Reasoning'),
    'lr_ranking': ('Ranking & Order', 'Reasoning'),
    'lr_math_operators': ('Mathematical Operators', 'Reasoning'),
    'lr_syllogism': ('Syllogism', 'Reasoning'),
    'lr_blood_relation': ('Blood Relations', 'Reasoning'),
    'lr_coding': ('Coding-Decoding', 'Reasoning'),
    'lr_series': ('Letter/Alpha-Numeric Series', 'Reasoning'),
    'lr_venn_diagram': ('Venn Diagram', 'Reasoning'),
    'lr_word_sequence': ('Logical Word Sequence', 'Reasoning'),
    'lr_number_series': ('Number Series', 'Reasoning'),
    'en_error': ('Error Spotting', 'English'),
    'en_idiom': ('Idioms & Phrases', 'English'),
    'en_vocab': ('Vocabulary', 'English'),
    'ga_polity': ('Indian Polity', 'General Awareness'),
    'ga_static': ('Static GK', 'General Awareness'),
    'ga_economy': ('Economy', 'General Awareness'),
    'ga_science': ('General Science', 'General Awareness'),
    'fe_banking': ('Banking Awareness', 'Finance & Economics'),
    'fe_securities': ('Securities & Regulations', 'Finance & Economics'),
}


def q(exam_code, year, subject, topic_id, text, options, correct, explanation, *, difficulty='medium'):
    return {
        'exam_code': exam_code,
        'year': year,
        'subject': subject,
        'topic_id': topic_id,
        'question_text': text,
        'options': options,
        'correct_option': correct,
        'explanation': explanation,
        'difficulty': difficulty,
        'metadata': {
            'source': 'PrepArsenal editorial — pattern-matched practice question',
            'source_type': 'expert_authored',
            'is_verified_pyq': False,
            'language': 'English',
            'import_batch': BATCH,
        },
    }


SSC_CGL = [
    q('SSC_CGL', 2024, 'Quantitative Aptitude', 'qa_percentage', 'A student scores 480 marks out of 750 in an exam. What percentage of marks did the student get?', ['62%', '64%', '66%', '68%'], 1, '480/750 = 0.64, i.e. 64%.', difficulty='easy'),
    q('SSC_CGL', 2024, 'Quantitative Aptitude', 'qa_profit_loss', 'A shopkeeper marks an article 40% above cost price and allows a discount of 25%. Find the profit percent.', ['5%', '10%', '15%', '20%'], 0, 'Let CP = 100. MP = 140. SP = 140 × 0.75 = 105. Profit = 5%.'),
    q('SSC_CGL', 2023, 'Quantitative Aptitude', 'qa_time_work', 'A can finish a job in 12 days and B in 18 days. They work together for 4 days. What fraction of the work is left?', ['4/9', '5/9', '7/18', '1/2'], 0, 'Combined rate = 1/12 + 1/18 = 5/36 per day. In 4 days, 20/36 = 5/9 is done, so 4/9 remains.'),
    q('SSC_CGL', 2023, 'Quantitative Aptitude', 'qa_interest', 'Find the compound interest on ₹10,000 at 10% per annum for 2 years, compounded annually.', ['₹2,000', '₹2,100', '₹2,200', '₹1,900'], 1, 'A = 10000(1.1)² = 12100, so CI = 12100 − 10000 = ₹2,100.', difficulty='easy'),
    q('SSC_CGL', 2023, 'Quantitative Aptitude', 'qa_mensuration', 'The radius of a sphere is 7 cm. Find its surface area. (π = 22/7)', ['154 cm²', '308 cm²', '616 cm²', '462 cm²'], 2, 'Surface area = 4πr² = 4 × 22/7 × 49 = 616 cm².'),
    q('SSC_CGL', 2023, 'Reasoning', 'lr_series', 'Find the next term: 2, 6, 12, 20, 30, ?', ['40', '42', '44', '46'], 1, 'The differences are 4, 6, 8, 10, 12; the next term is 30 + 12 = 42.', difficulty='easy'),
    q('SSC_CGL', 2023, 'Reasoning', 'lr_coding', "If 'CHAIR' is coded as 'DIBJS', how is 'TABLE' coded in the same language?", ['UBCMF', 'UBMCF', 'UCBMF', 'VBCMF'], 0, 'Each letter shifts forward by one: T→U, A→B, B→C, L→M, E→F, giving UBCMF.'),
    q('SSC_CGL', 2022, 'Reasoning', 'lr_blood_relation', "Pointing to a photograph, Rina said, 'He is the son of my grandfather's only son.' How is he related to Rina?", ['Father', 'Brother', 'Uncle', 'Cousin'], 1, "Rina's grandfather's only son is Rina's father; his son is therefore Rina's brother."),
    q('SSC_CGL', 2022, 'Reasoning', 'lr_venn_diagram', 'Which relationship best describes the classes: Mammals, Whales, Fish?', ['All three overlap fully', 'Whales lie entirely within Mammals; Fish is separate', 'Three mutually intersecting circles', 'Fish lies within Whales'], 1, 'Whales are a subset of Mammals, while Fish is a wholly separate class with no overlap.'),
    q('SSC_CGL', 2022, 'English', 'en_vocab', 'Choose the word most opposite in meaning to "Frugal".', ['Thrifty', 'Extravagant', 'Economical', 'Prudent'], 1, '"Frugal" means sparing with money or resources; "Extravagant" is its opposite.'),
    q('SSC_CGL', 2022, 'English', 'en_idiom', 'What does the idiom "to bell the cat" mean?', ['To take a risky action on behalf of a group', 'To decorate an animal', 'To raise a false alarm', 'To flatter someone in authority'], 0, '"To bell the cat" means to undertake a dangerous or difficult task for the benefit of others.'),
    q('SSC_CGL', 2022, 'English', 'en_error', 'Select the segment containing the error: One of my friend / has been / selected for / the national team.', ['One of my friend', 'has been', 'selected for', 'the national team'], 0, 'After "one of", a plural noun is required: "One of my friends".'),
    q('SSC_CGL', 2024, 'General Awareness', 'ga_polity', 'Under which Article can the President promulgate an Ordinance when Parliament is not in session?', ['Article 356', 'Article 123', 'Article 352', 'Article 370'], 1, 'Article 123 empowers the President to promulgate Ordinances during the recess of Parliament.'),
    q('SSC_CGL', 2024, 'General Awareness', 'ga_static', 'The Sun Temple at Konark, a UNESCO World Heritage Site, is located in which state?', ['Tamil Nadu', 'Odisha', 'Karnataka', 'Gujarat'], 1, 'The 13th-century Konark Sun Temple is in Odisha.', difficulty='easy'),
    q('SSC_CGL', 2024, 'General Awareness', 'ga_science', 'Which vitamin does the human body synthesise on exposure to sunlight?', ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K'], 2, 'UVB sunlight triggers synthesis of Vitamin D in the skin.', difficulty='easy'),
    q('SSC_CGL', 2023, 'General Awareness', 'ga_economy', 'Large banks deemed "too big to fail" are classified by the RBI under which framework?', ['CRAR', 'D-SIB (Domestic Systemically Important Banks)', 'PCA (Prompt Corrective Action)', 'Basel I'], 1, 'RBI designates certain large banks as D-SIBs, which must hold additional capital buffers.'),
]

ACIO2 = [
    q('ACIO2', 2024, 'Quantitative Aptitude', 'qa_average', 'The average age of 5 family members is 24 years. Excluding the youngest, the average rises by 3 years. Find the youngest member\'s age.', ['8 years', '10 years', '12 years', '9 years'], 2, 'Total for 5 = 120. Remaining 4 average 27, totalling 108. Youngest = 120 − 108 = 12.'),
    q('ACIO2', 2024, 'Quantitative Aptitude', 'qa_number', 'Find the smallest number which leaves remainder 5 when divided by 8, 12 and 16.', ['53', '48', '43', '51'], 0, 'LCM(8, 12, 16) = 48; the required number is 48 + 5 = 53.'),
    q('ACIO2', 2023, 'Reasoning', 'lr_classification', 'Select the odd one out: Delhi, Mumbai, Chennai, Maharashtra.', ['Delhi', 'Mumbai', 'Chennai', 'Maharashtra'], 3, 'The first three are cities; Maharashtra is a state.', difficulty='easy'),
    q('ACIO2', 2023, 'Reasoning', 'lr_syllogism', 'Statements: All spies are agents. All agents are officers. Conclusions: I. All spies are officers. II. Some officers are spies. Which follow?', ['Only I', 'Only II', 'Both I and II', 'Neither'], 2, 'Both conclusions follow from the chained universal statements.'),
    q('ACIO2', 2022, 'General Awareness', 'ga_static', "The Intelligence Bureau (IB) functions under which ministry?", ['Ministry of Defence', 'Ministry of External Affairs', 'Ministry of Home Affairs', 'Cabinet Secretariat'], 2, 'The IB, India\'s internal intelligence agency, operates under the Ministry of Home Affairs.'),
    q('ACIO2', 2022, 'General Awareness', 'ga_polity', 'The National Investigation Agency (NIA) was constituted in the aftermath of which event?', ['2001 Parliament attack', '2008 Mumbai attacks', '2016 Uri attack', '2019 Pulwama attack'], 1, 'The NIA Act was enacted in 2008 following the 26/11 Mumbai terror attacks.'),
    q('ACIO2', 2021, 'English', 'en_error', 'Select the segment containing the error: The committee / have decided / to postpone / the meeting.', ['The committee', 'have decided', 'to postpone', 'the meeting'], 1, 'The collective noun "committee" acts as a single unit here, so "has decided" is correct.'),
    q('ACIO2', 2021, 'English', 'en_vocab', 'Choose the synonym of "Covert".', ['Open', 'Secret', 'Loud', 'Obvious'], 1, '"Covert" means concealed or secret.', difficulty='easy'),
]

RRB_NTPC = [
    q('RRB_NTPC', 2024, 'Quantitative Aptitude', 'qa_tsd', 'A train 150 m long crosses a 250 m platform in 20 seconds. Find its speed in km/h.', ['54 km/h', '60 km/h', '72 km/h', '80 km/h'], 2, 'Distance = 400 m in 20 s = 20 m/s = 20 × 18/5 = 72 km/h.'),
    q('RRB_NTPC', 2024, 'Quantitative Aptitude', 'qa_percentage', 'The price of an item rises from ₹250 to ₹300. Find the percentage increase.', ['16.67%', '20%', '25%', '18%'], 1, 'Increase = 50 on 250 = 20%.', difficulty='easy'),
    q('RRB_NTPC', 2023, 'Reasoning', 'lr_ranking', 'In a queue, Aman is 15th from the front and 22nd from the back. How many people are in the queue?', ['36', '37', '35', '38'], 0, 'Total = 15 + 22 − 1 = 36.', difficulty='easy'),
    q('RRB_NTPC', 2023, 'Reasoning', 'lr_number_series', 'Find the missing term: 5, 11, 23, 47, ?', ['93', '94', '95', '96'], 2, 'Each term is twice the previous plus one: 47 × 2 + 1 = 95.'),
    q('RRB_NTPC', 2023, 'Reasoning', 'lr_analogy', 'Doctor : Hospital :: Teacher : ?', ['Student', 'School', 'Book', 'Lesson'], 1, 'A doctor works in a hospital as a teacher works in a school — the relation is worker to workplace.', difficulty='easy'),
    q('RRB_NTPC', 2022, 'General Awareness', 'ga_static', 'Indian Railways operates under which ministry?', ['Ministry of Road Transport and Highways', 'Ministry of Railways', 'Ministry of Commerce and Industry', 'NITI Aayog'], 1, 'Indian Railways is administered by the Ministry of Railways through the Railway Board.', difficulty='easy'),
    q('RRB_NTPC', 2022, 'General Awareness', 'ga_static', "India's first high-speed 'bullet train' corridor connects which two cities?", ['Delhi and Mumbai', 'Mumbai and Ahmedabad', 'Chennai and Bengaluru', 'Kolkata and Patna'], 1, 'The Mumbai–Ahmedabad High Speed Rail Corridor is India\'s first bullet train project.'),
    q('RRB_NTPC', 2021, 'General Awareness', 'ga_science', 'What is the SI unit of electric current?', ['Volt', 'Ampere', 'Ohm', 'Watt'], 1, 'The ampere (A) is the SI base unit of electric current.', difficulty='easy'),
]

RBI_GRADEB = [
    q('RBI_GRADEB', 2025, 'Finance & Economics', 'fe_banking', "What is the inflation target band mandated for the RBI's Monetary Policy Committee?", ['2% ± 1%', '4% ± 2%', '5% ± 2%', '6% ± 1%'], 1, 'India\'s flexible inflation-targeting framework sets a 4% CPI target with a ±2% tolerance band.'),
    q('RBI_GRADEB', 2025, 'Finance & Economics', 'fe_banking', 'Which committee recommended the framework that led to the creation of the Monetary Policy Committee?', ['Narasimham Committee', 'Urjit Patel Committee', 'Tarapore Committee', 'Chakravarty Committee'], 1, 'The Urjit Patel Committee (2014) recommended flexible inflation targeting; the MPC was constituted in 2016.'),
    q('RBI_GRADEB', 2024, 'General Awareness', 'ga_economy', 'What does "SLR" stand for in Indian banking regulation?', ['Statutory Liquidity Ratio', 'Standard Lending Rate', 'Systemic Liquidity Reserve', 'State Lending Regulation'], 0, 'SLR is the minimum share of deposits banks must hold in liquid assets such as cash, gold or approved securities.', difficulty='easy'),
    q('RBI_GRADEB', 2024, 'General Awareness', 'ga_economy', "India's Balance of Payments statistics are compiled and published by:", ['Ministry of Finance', 'Reserve Bank of India', 'NITI Aayog', 'SEBI'], 1, 'The RBI compiles and publishes quarterly Balance of Payments data for India.'),
    q('RBI_GRADEB', 2023, 'Finance & Economics', 'fe_banking', 'A loan is classified as a Non-Performing Asset (NPA) when repayment is overdue for how long?', ['30 days', '60 days', '90 days', '180 days'], 2, 'Under RBI norms, an advance becomes an NPA when interest or principal is overdue for more than 90 days.'),
    q('RBI_GRADEB', 2023, 'General Awareness', 'ga_polity', 'The Reserve Bank of India was nationalised in which year?', ['1935', '1949', '1969', '1991'], 1, 'Established in 1935 as a privately owned bank, the RBI was nationalised in 1949.'),
]

NABARD = [
    q('NABARD_GRADEA', 2025, 'General Awareness', 'ga_economy', 'NABARD was established in which year, on the recommendation of the Sivaraman Committee?', ['1975', '1982', '1990', '1969'], 1, 'NABARD was set up in 1982 following the B. Sivaraman Committee\'s recommendations.'),
    q('NABARD_GRADEA', 2025, 'General Awareness', 'ga_economy', 'Which NABARD-administered fund finances rural infrastructure projects of state governments?', ['Rural Infrastructure Development Fund (RIDF)', 'MUDRA Fund', 'PM-KISAN Fund', 'National Investment Fund'], 0, 'The RIDF, set up in 1995-96, is administered by NABARD to finance rural infrastructure.'),
    q('NABARD_GRADEA', 2024, 'General Awareness', 'ga_economy', 'The Kisan Credit Card (KCC) scheme was introduced primarily to give farmers:', ['Subsidised fertiliser', 'Timely and adequate credit for agricultural needs', 'Free crop insurance', 'Direct income transfers'], 1, 'The KCC scheme (1998) provides farmers with timely, adequate and hassle-free credit.'),
    q('NABARD_GRADEA', 2024, 'English', 'en_vocab', 'Choose the word closest in meaning to "Augment".', ['Diminish', 'Increase', 'Postpone', 'Ignore'], 1, '"Augment" means to make greater by adding to it.', difficulty='easy'),
    q('NABARD_GRADEA', 2023, 'Quantitative Aptitude', 'qa_interest', 'A farmer takes a ₹80,000 loan at 8% simple interest per annum. Find the interest payable after 3 years.', ['₹16,800', '₹19,200', '₹20,000', '₹17,600'], 1, 'SI = P × R × T / 100 = 80000 × 8 × 3 / 100 = ₹19,200.', difficulty='easy'),
    q('NABARD_GRADEA', 2023, 'General Awareness', 'ga_economy', 'Priority Sector Lending targets for scheduled commercial banks are prescribed by:', ['NABARD', 'RBI', 'SEBI', 'Ministry of Agriculture'], 1, 'The RBI prescribes Priority Sector Lending norms, with agriculture forming a major sub-target.'),
]

SEBI = [
    q('SEBI_GRADEA', 2025, 'Finance & Economics', 'fe_securities', 'SEBI was granted statutory powers under which Act?', ['Companies Act, 1956', 'SEBI Act, 1992', 'Securities Contracts (Regulation) Act, 1956', 'RBI Act, 1934'], 1, 'SEBI, set up in 1988 as a non-statutory body, became statutory through the SEBI Act, 1992.'),
    q('SEBI_GRADEA', 2025, 'Finance & Economics', 'fe_securities', 'Which entity acts as a central counterparty and guarantees settlement of exchange trades?', ['Depository', 'Clearing Corporation', 'Registrar and Transfer Agent', 'Merchant Banker'], 1, 'A Clearing Corporation guarantees the settlement of trades executed on a stock exchange.'),
    q('SEBI_GRADEA', 2024, 'Finance & Economics', 'fe_securities', 'What is the minimum public shareholding requirement for most listed Indian companies?', ['10%', '15%', '25%', '49%'], 2, 'Listed companies must generally maintain a minimum public shareholding of 25%.'),
    q('SEBI_GRADEA', 2024, 'Finance & Economics', 'fe_banking', 'A Systematic Investment Plan (SIP) is a facility most commonly associated with:', ['Fixed deposits', 'Mutual funds', 'Government bonds', 'Real estate'], 1, 'A SIP allows periodic fixed-amount investment into a mutual fund scheme.', difficulty='easy'),
    q('SEBI_GRADEA', 2023, 'Finance & Economics', 'fe_securities', 'In an "IPO", what does the term stand for?', ['Internal Profit Organisation', 'Initial Public Offering', 'Investor Protection Order', 'Index Price Option'], 1, 'An Initial Public Offering is a company\'s first sale of shares to the public.', difficulty='easy'),
    q('SEBI_GRADEA', 2023, 'Finance & Economics', 'fe_securities', 'Insider trading in India is prohibited primarily under which SEBI regulations?', ['SEBI (LODR) Regulations', 'SEBI (Prohibition of Insider Trading) Regulations', 'SEBI (Mutual Funds) Regulations', 'SEBI (Takeover) Regulations'], 1, 'The SEBI (Prohibition of Insider Trading) Regulations govern trading on unpublished price-sensitive information.'),
]

LIC_AAO = [
    q('LIC_AAO', 2024, 'Quantitative Aptitude', 'qa_di', "A budget pie chart shows Food 30%, Rent 25%, Savings 20%, Others 25%. If monthly income is ₹60,000, how much goes to Rent?", ['₹12,000', '₹15,000', '₹18,000', '₹20,000'], 1, '25% of ₹60,000 = ₹15,000.', difficulty='easy'),
    q('LIC_AAO', 2024, 'Quantitative Aptitude', 'qa_average', 'The average of 5 consecutive odd numbers is 61. Find the largest of them.', ['61', '63', '65', '67'], 2, 'The average equals the middle number, so the numbers are 57, 59, 61, 63, 65; the largest is 65.'),
    q('LIC_AAO', 2023, 'Reasoning', 'lr_math_operators', "If 'A' means '÷', 'B' means '×', 'C' means '+' and 'D' means '−', evaluate 18 A 3 B 4 C 6 D 2.", ['28', '26', '30', '24'], 0, '18 ÷ 3 = 6; 6 × 4 = 24; 24 + 6 = 30; 30 − 2 = 28.'),
    q('LIC_AAO', 2023, 'General Awareness', 'ga_static', 'The Life Insurance Corporation of India was formed in which year?', ['1947', '1956', '1969', '1972'], 1, 'LIC was created in 1956 by nationalising and merging 245 private life insurers and provident societies.'),
    q('LIC_AAO', 2022, 'General Awareness', 'ga_economy', 'IRDAI regulates which sector?', ['Banking', 'Insurance', 'Stock markets', 'Pension funds only'], 1, 'The Insurance Regulatory and Development Authority of India regulates the insurance industry.', difficulty='easy'),
    q('LIC_AAO', 2022, 'English', 'en_error', 'Select the segment containing the error: Each of the candidates / were asked / to submit / their documents.', ['Each of the candidates', 'were asked', 'to submit', 'their documents'], 1, '"Each" is singular, so the verb should be "was asked".'),
]

UPSC_APFC = [
    q('UPSC_APFC', 2024, 'General Awareness', 'ga_polity', "The Employees' Provident Fund Organisation administers schemes under which Act?", ["Employees' Provident Funds and Miscellaneous Provisions Act, 1952", 'Payment of Gratuity Act, 1972', 'Industrial Disputes Act, 1947', 'Minimum Wages Act, 1948'], 0, 'EPFO administers the EPF, EPS and EDLI schemes under the EPF & MP Act, 1952.'),
    q('UPSC_APFC', 2024, 'General Awareness', 'ga_polity', "What is the minimum monthly pension fixed under the Employees' Pension Scheme, 1995?", ['₹1,000', '₹2,000', '₹1,500', '₹3,000'], 0, 'A minimum monthly pension of ₹1,000 under EPS-95 took effect from September 2014.'),
    q('UPSC_APFC', 2023, 'General Awareness', 'ga_polity', 'The Code on Social Security, 2020 consolidated how many existing central labour laws?', ['5', '9', '13', '17'], 1, 'The Code on Social Security, 2020 subsumed nine central labour laws relating to social security.'),
    q('UPSC_APFC', 2015, 'English', 'en_error', 'Select the segment containing the error: Neither the manager / nor the workers / was aware / of the new policy.', ['Neither the manager', 'nor the workers', 'was aware', 'of the new policy'], 2, 'With "neither…nor", the verb agrees with the nearer subject "the workers", so "were aware" is correct.'),
    q('UPSC_APFC', 2015, 'English', 'en_idiom', 'What does "to read between the lines" mean?', ['To read carefully word by word', 'To grasp an implied or hidden meaning', 'To skip unimportant parts', 'To read aloud'], 1, 'The idiom means detecting a meaning that is implied rather than stated.'),
]

IRDA = [
    q('IRDA', 2023, 'General Awareness', 'ga_economy', 'IRDAI is headquartered in which Indian city?', ['New Delhi', 'Mumbai', 'Hyderabad', 'Chennai'], 2, 'IRDAI has its headquarters in Hyderabad.'),
    q('IRDA', 2023, 'General Awareness', 'ga_economy', 'A standard term insurance plan is characterised by:', ['A maturity benefit if the insured survives the term', 'Pure risk cover with no survival benefit', 'Guaranteed investment returns', 'A compulsory annual bonus'], 1, 'Term insurance provides only a death benefit; a standard plan pays nothing if the insured survives the term.'),
    q('IRDA', 2023, 'English', 'en_vocab', 'Choose the word closest in meaning to "Indemnify".', ['Punish', 'Compensate for loss or damage', 'Ignore', 'Postpone'], 1, '"Indemnify" means to compensate for harm or loss — a core principle of insurance contracts.'),
    q('IRDA', 2022, 'English', 'en_vocab', 'In financial usage, which word is opposite in meaning to "Solvent"?', ['Liquid', 'Insolvent', 'Stable', 'Secure'], 1, '"Solvent" means able to meet debts; "Insolvent" is its antonym.', difficulty='easy'),
    q('IRDA', 2022, 'General Awareness', 'ga_economy', 'What does the "free-look period" in an insurance policy allow a policyholder to do?', ['Skip one premium payment', 'Review and cancel the policy shortly after receiving it', 'Increase the sum assured for free', 'Claim without documentation'], 1, 'The free-look period lets a policyholder review a newly issued policy and return it for a refund if unsatisfied.'),
]

SAMPLES = SSC_CGL + ACIO2 + RRB_NTPC + RBI_GRADEB + NABARD + SEBI + LIC_AAO + UPSC_APFC + IRDA


def main():
    db = get_db_client()
    for topic_id, (name, subject) in TOPICS.items():
        db.table('topics').upsert({'id': topic_id, 'name': name, 'subject': subject}).execute()

    db.table('questions').delete().contains('metadata', {'import_batch': BATCH}).execute()
    response = db.table('questions').insert(SAMPLES).execute()
    inserted = len(response.data or [])
    if inserted != len(SAMPLES):
        raise RuntimeError(f'Expected {len(SAMPLES)} inserted questions, received {inserted}.')
    exams = sorted({s['exam_code'] for s in SAMPLES})
    print(f'Imported {inserted} expert-authored practice questions across {len(exams)} exams: {", ".join(exams)}')


if __name__ == '__main__':
    main()
