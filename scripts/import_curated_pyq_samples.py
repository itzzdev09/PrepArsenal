"""Import a small English-only, source-attributed PYQ starter set.

Each record preserves its source URL and confidence level. `memory_based` records
are intentionally excluded from ML predictions until an official paper confirms them.
"""

from db_client import get_db_client

BATCH = 'curated_pyq_starter_2026_08'

TOPICS = {
    'qa_number': ('Number System', 'Quantitative Aptitude'),
    'qa_percentage': ('Percentage', 'Quantitative Aptitude'),
    'qa_profit_loss': ('Profit & Loss', 'Quantitative Aptitude'),
    'qa_tsd': ('Time, Speed & Distance', 'Quantitative Aptitude'),
    'qa_average': ('Average', 'Quantitative Aptitude'),
    'lr_analogy': ('Analogy', 'Reasoning'),
    'lr_classification': ('Classification', 'Reasoning'),
    'lr_ranking': ('Ranking & Order', 'Reasoning'),
    'en_error': ('Error Spotting', 'English'),
    'en_idiom': ('Idioms & Phrases', 'English'),
    'en_vocab': ('Vocabulary', 'English'),
    'ga_polity': ('Indian Polity', 'General Awareness'),
    'ga_static': ('Static GK', 'General Awareness'),
    'ga_economy': ('Economy', 'General Awareness'),
    'fe_banking': ('Banking Awareness', 'Finance & Economics'),
    'fe_securities': ('Securities & Regulations', 'Finance & Economics'),
}


def question(exam_code, year, subject, topic_id, text, options, correct, source_url, source_label, *, source_type='pyq', verified=True):
    return {
        'exam_code': exam_code,
        'year': year,
        'subject': subject,
        'topic_id': topic_id,
        'question_text': text,
        'options': options,
        'correct_option': correct,
        'explanation': 'Answer retained from the cited English-language question paper or source-attributed reconstruction.',
        'difficulty': 'medium',
        'metadata': {
            'source': source_label,
            'source_url': source_url,
            'source_type': source_type,
            'is_verified_pyq': verified,
            'language': 'English',
            'import_batch': BATCH,
            'reconstructed_options': source_type == 'memory_based',
        },
    }


SAMPLES = [
    question('SSC_CGL', 2023, 'Reasoning', 'lr_analogy', 'Skin : Touch :: Nose : ?', ['Smell', 'Taste', 'Nose ring', 'Sweat'], 0, 'https://cdn-images.prepp.in/public/image/SSC_CGL_July_14_Shift_1_0fcbfcb87b5c32678d38fc8592d8751f.pdf', 'SSC CGL Tier I, 14 July 2023 Shift 1 (Prepp)'),
    question('SSC_CGL', 2023, 'General Awareness', 'ga_polity', 'Which Articles of the Indian Constitution are related to citizenship?', ['Articles 15 to 21', 'Articles 5 to 11', 'Articles 2 to 4', 'Articles 25 to 31'], 1, 'https://cdn-images.prepp.in/public/image/SSC_CGL_July_14_Shift_1_0fcbfcb87b5c32678d38fc8592d8751f.pdf', 'SSC CGL Tier I, 14 July 2023 Shift 1 (Prepp)'),
    question('ACIO2', 2021, 'Quantitative Aptitude', 'qa_number', 'In 87659_21, what is the least digit that can fill the blank to make the number divisible by 11?', ['3', '1', '2', '7'], 1, 'https://freedownloads.dishapublication.com/wp-content/uploads/2024/01/IB-ACIO-Solved-Paper-2021_interior.pdf', 'IB ACIO Grade-II Executive Tier I 2021 (Disha)'),
    question('ACIO2', 2021, 'Quantitative Aptitude', 'qa_percentage', 'Twenty-five percent of a number, when subtracted from 100, gives the number itself. Find the number.', ['32', '100', '75', '80'], 3, 'https://freedownloads.dishapublication.com/wp-content/uploads/2024/01/IB-ACIO-Solved-Paper-2021_interior.pdf', 'IB ACIO Grade-II Executive Tier I 2021 (Disha)'),
    question('RRB_NTPC', 2025, 'Reasoning', 'lr_classification', 'Which letter cluster does not follow the same alphabetical-gap pattern as HKO, ZCG and BEI?', ['HKO', 'ZCG', 'BEI', 'VZC'], 3, 'https://prepp.in/question/based-on-the-english-alphabetical-order-three-of-the-followi-6a478c43e5ef60070874dfd3', 'RRB NTPC 2025 UG CBT 1, 16 June Shift 2 (Prepp)'),
    question('RRB_NTPC', 2025, 'Reasoning', 'lr_ranking', 'In a row of 195 people, Rt is 143rd from the left and Kl is 36th from the right. How many people are between them?', ['14', '12', '13', '16'], 3, 'https://prepp.in/question/all-195-people-are-standing-in-a-row-facing-north-rt-is-143r-6a48a5e9b85142b563bf9117', 'RRB NTPC 2025 UG CBT 1, 16 June Shift 2 (Prepp)'),
    question('RBI_GRADEB', 2016, 'General Awareness', 'ga_static', 'The 2019 Cricket World Cup was hosted by:', ['South Africa and Zimbabwe', 'England and Wales', 'South Africa and West Indies', 'India, Sri Lanka and Bangladesh', 'Australia and New Zealand'], 1, 'https://cdn-images.prepp.in/public/image/2016_que_636098392ac6336bae84876ae28bec7a.pdf', 'RBI Grade B 2016 General Awareness paper (Prepp)'),
    question('RBI_GRADEB', 2016, 'General Awareness', 'ga_economy', 'SETU, created to support start-ups and self-employment activities, was set up under:', ['Mudra Bank', 'NABARD', 'RBI', 'SIDBI', 'NITI Aayog'], 4, 'https://cdn-images.prepp.in/public/image/2016_que_636098392ac6336bae84876ae28bec7a.pdf', 'RBI Grade B 2016 General Awareness paper (Prepp)'),
    question('NABARD_GRADEA', 2021, 'English', 'en_error', 'For the word “Sluggish”, which sentences use it incorrectly or contextually incorrectly?', ['Only (ii)', 'Both (i) and (ii)', 'Both (i) and (iii)', 'Both (iv) and (i)', 'None is incorrect'], 3, 'https://www.bankersadda.com/wp-content/uploads/multisite/2022/07/13163733/Formatted-NABARD-Grade-A-Previous-Year-Question-Paper-2021-English-Language-.pdf', 'NABARD Grade A 2021 English paper (BankersAdda)'),
    question('NABARD_GRADEA', 2021, 'English', 'en_vocab', 'For the word “Stimulus”, which sentences use it incorrectly or contextually incorrectly?', ['Both (i) and (iii)', 'Both (i) and (ii)', 'Only (iv)', 'Both (iv) and (i)', 'None is incorrect'], 3, 'https://www.bankersadda.com/wp-content/uploads/multisite/2022/07/13163733/Formatted-NABARD-Grade-A-Previous-Year-Question-Paper-2021-English-Language-.pdf', 'NABARD Grade A 2021 English paper (BankersAdda)'),
    question('SEBI_GRADEA', 2024, 'Finance & Economics', 'fe_securities', 'Which organisation is the regulator for Real Estate Investment Trusts (REITs) in India?', ['RBI', 'SEBI', 'IRDAI', 'PFRDA'], 1, 'https://cdn-images.prepp.in/public/image/SEBI_Grade_A_Paper_1_July_27_2024_Memory_Based_Questions_64b00bd321f5eaea823b53faed515ef7.pdf', 'SEBI Grade A Paper 1, 27 July 2024 (Prepp memory-based)', source_type='memory_based', verified=False),
    question('SEBI_GRADEA', 2024, 'Finance & Economics', 'fe_banking', 'What is the maximum investment limit in National Savings Certificates (NSC)?', ['₹5 lakh', '₹10 lakh', '₹15 lakh', 'No upper limit'], 3, 'https://cdn-images.prepp.in/public/image/SEBI_Grade_A_Paper_1_July_27_2024_Memory_Based_Questions_64b00bd321f5eaea823b53faed515ef7.pdf', 'SEBI Grade A Paper 1, 27 July 2024 (Prepp memory-based)', source_type='memory_based', verified=False),
    question('LIC_AAO', 2019, 'Quantitative Aptitude', 'qa_profit_loss', 'The total cost price of two products is ₹4,400. One is sold at 15% profit and the other at 18% loss. If there is no overall profit or loss, find the cost price of the first product.', ['₹2,400', '₹2,200', '₹3,000', '₹3,400', '₹2,800'], 0, 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/01/02153424/LIC-AAO-Prelims-Previous-Year-Paper-2019.pdf', 'LIC AAO Prelims 2019 (Adda247)'),
    question('LIC_AAO', 2019, 'Quantitative Aptitude', 'qa_tsd', 'A boat sailing at 10 km/h in still water starts 10 km behind another boat travelling upstream at 4 km/h. If stream speed is 2 km/h, after how many hours will it catch up?', ['4 h', '2.5 h', '2 h', '3.5 h', 'None of these'], 1, 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/01/02153424/LIC-AAO-Prelims-Previous-Year-Paper-2019.pdf', 'LIC AAO Prelims 2019 (Adda247)'),
    question('UPSC_APFC', 2015, 'English', 'en_idiom', 'What does the expression “I gave him a piece of my mind” indicate?', ['Appreciation', 'Learning', 'Greeting', 'Scolding'], 3, 'https://freedownloads.dishapublication.com/wp-content/uploads/2025/03/UPSC-EPFO-APFC-Previous-Year-Question-Paper-processedlightpdf.com-output-output-output-output-1.pdf', 'UPSC EPFO APFC 2015 topic-wise paper (Adda247)'),
    question('UPSC_APFC', 2015, 'English', 'en_vocab', 'What is the meaning of the expression “blue blood”?', ['Polluted industrial wastewater', 'Sap of teak wood', 'An aristocrat', 'A costly object'], 2, 'https://freedownloads.dishapublication.com/wp-content/uploads/2025/03/UPSC-EPFO-APFC-Previous-Year-Question-Paper-processedlightpdf.com-output-output-output-output-1.pdf', 'UPSC EPFO APFC 2015 topic-wise paper (Adda247)'),
    question('IRDA', 2023, 'English', 'en_vocab', 'Choose the word that best expresses the meaning of “Prolific”.', ['Fertile', 'Barren', 'Impregnable', 'Abundant', 'Fragile'], 3, 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/04/11184351/IRDA-Assistant-Manager-Memory-Based-Paper-English.pdf', 'IRDA Assistant Manager English memory-based paper (Adda247)', source_type='memory_based', verified=False),
    question('IRDA', 2023, 'English', 'en_vocab', 'Choose the word most opposite in meaning to “Inevitable”.', ['Predictable', 'Avoidable', 'Inescapable', 'Unavoidable', 'Necessary'], 1, 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/04/11184351/IRDA-Assistant-Manager-Memory-Based-Paper-English.pdf', 'IRDA Assistant Manager English memory-based paper (Adda247)', source_type='memory_based', verified=False),
    # Three distinct English PYQ years for the first evidence-backed trend cohorts.
    question('SSC_CGL', 2019, 'Reasoning', 'lr_analogy', 'Select the letter that replaces the question mark in the series: A, E, I, ?, Q, U.', ['O', 'M', 'K', 'N'], 1, 'https://prepp.in/paper/ssc-cgl-tier-1-question-paper-06-mar-2020-shift-1-65e04ff9d5a684356e931802/', 'SSC CGL Tier I 2019, 6 March 2020 Shift 1 (Prepp)'),
    question('ACIO2', 2013, 'Quantitative Aptitude', 'qa_percentage', 'If increasing 20 by P percent gives the same result as decreasing 60 by P percent, what is P percent of 70?', ['50', '140', '14', '35'], 3, 'https://prepp.in/paper/ib-acio-grade-2-executive-question-paper-15-sep-2013-645d2c33e8610180957de022', 'IB ACIO Grade-II Executive 2013 Tier I, 15 September 2013 (Prepp)'),
    question('ACIO2', 2017, 'Quantitative Aptitude', 'qa_average', 'The average price of 80 mobile phones is Rs. 30,000. Removing the highest and lowest leaves an average of Rs. 29,500 for 78 phones. If the highest price is Rs. 80,000, what is the lowest price?', ['Rs. 18,000', 'Rs. 15,000', 'Rs. 19,000', 'Cannot be determined'], 2, 'https://prepp.in/paper/ib-acio-grade-2-executive-question-paper-15-oct-2017-628b201bde8ad21111a4dbe5', 'IB ACIO Grade-II Executive 2017 Tier I, 15 October 2017 (Prepp)'),
]

# SSC CGL 2021 Tier I, 13 April 2022 Shift 2: English section.
# These are transcribed only where the text/options are readable and the answer
# can be checked from the paper's grammar or vocabulary rule. Figure-dependent
# items are intentionally left out.
SSC_CGL_2021_ENGLISH = [
    ('en_error', 'Select the option that improves: Many a man has succumbed to his temptations.', ['No improvement required', 'man has', 'a men have', 'men has'], 0),
    ('en_error', 'Identify the segment containing the grammatical error: You should / have respond / to my query / sooner.', ['sooner', 'to my query', 'have respond', 'You should'], 2),
    ('en_error', 'Select the correct active voice: Rohan was pushed into the pool by Karan.', ['Karan was pushing Rohan into the pool.', 'Karan pushed Rohan into the pool.', 'Rohan had pushed Karan into the pool.', 'Rohan pushed Karan into the pool.'], 1),
    ('en_error', 'Select the correct passive voice: She is making a beautiful beaded curtain.', ['A beautiful beaded curtain was being made by her.', 'A beautiful beaded curtain is being made by her.', 'A beautiful beaded curtain is made by her.', 'A beautiful beaded curtain was made by her.'], 1),
    ('en_error', 'Identify the segment containing the grammatical error: The crew / of sailors / were not perturbed / by the strong gale.', ['The crew', 'by the strong gale', 'were not perturbed', 'of sailors'], 2),
    ('en_vocab', 'Choose the one-word substitute for sharpness and accuracy of judgment.', ['Experience', 'Estimation', 'Knowledge', 'Acumen'], 3),
    ('en_error', 'Select the incorrectly spelt word.', ['Correspondence', 'Exclaimation', 'Disciplinarian', 'Miscellaneous'], 1),
    ('en_error', 'Select the correct indirect speech: The teacher said, “You must work hard for your exams.”', ['The teacher was telling her students to work hard for their exams.', 'The teacher told students for working hard for their exams.', 'The teacher advised her students to work hard for their exams.', 'The teacher was advising her students to do work hard for their exams.'], 2),
    ('en_error', 'Identify the error: The manager said, “Could you please / confirm me whether you / have received all the items / that you had ordered?”', ['have received all the items', 'that you had ordered', 'confirm me whether you', 'The manager said, “Could you please'], 2),
    ('en_vocab', 'Select the most appropriate antonym of “Negligent”.', ['Faithful', 'Careful', 'Indifferent', 'Strange'], 1),
    ('en_error', 'Arrange the statements to make a meaningful paragraph: A. But, in developed societies, childhood and adolescence is extended. B. In rural communities, customs are more uniform. C. This provides more opportunities for education and character development. D. Practices of child rearing vary from culture to culture.', ['BCDA', 'DABC', 'DBAC', 'BADC'], 1),
    ('en_error', 'Identify the error: My neighbour’s grandson / is only / five month old.', ['five month old', 'is only', 'No error', 'My neighbour’s grandson'], 0),
    ('en_error', 'Select the incorrectly spelt word.', ['Contrary', 'Longitude', 'Terribal', 'Manners'], 2),
    ('en_vocab', 'Select the most appropriate antonym of “Rectify”.', ['Correct', 'Assist', 'Corrupt', 'Select'], 2),
    ('en_idiom', 'Select the meaning of the idiom “Hold the key”.', ['To own a property', 'To have control of something', 'To have the right of succession', 'To keep a secret'], 1),
    ('en_error', 'Select the option that improves: My father was always ordering about my sister.', ['ordering my sister about', 'giving order for my sister', 'No improvement required', 'ordering on my sister'], 0),
    ('en_vocab', 'Select the most appropriate synonym of “Succulent”.', ['Coarse', 'Foul', 'Juicy', 'Decent'], 2),
    ('en_vocab', 'Select the most appropriate synonym of “Disrupt”.', ['Breach', 'Arrange', 'Organise', 'Injure'], 0),
    ('en_idiom', 'Select the meaning of “left no stone unturned”.', ['Looked in different places', 'Proposed good plans', 'Depended on many people', 'Made every possible effort'], 3),
    ('en_vocab', 'Choose the one-word substitute for something strong that lasts a long time without breaking or becoming weaker.', ['Durable', 'Pliable', 'Harsh', 'Secure'], 0),
]

SAMPLES.extend(
    question(
        'SSC_CGL', 2021, 'English', topic_id, text, options, correct,
        'https://cdn-images.prepp.in/public/image/SSC_CGL_2021_Tier_1_Shift_2_English_Question_Paper_and_Answer_Key_PDF_Apr_13_2022_1_45_a81e5e50199b9e1412b733ebb907f66a.pdf',
        'SSC CGL Tier I 2021, 13 April 2022 Shift 2, English (Prepp)',
    )
    for topic_id, text, options, correct in SSC_CGL_2021_ENGLISH
)

SSC_CGL_2021_REASONING_AND_QUANT = [
    ('Reasoning', 'lr_ranking', 'Sahasra runs north, then turns left, then right, then right. In which direction is she running finally?', ['West', 'South', 'North', 'East'], 3),
    ('Reasoning', 'lr_classification', 'Given: Some pencils are pens; all pens are papers; all pencils are colours. Which conclusions follow? I. All colours are pens. II. Some colours are pencils. III. Some papers are pens.', ['Only II', 'I, II and III', 'Only II and III', 'Only I and II'], 2),
    ('Reasoning', 'qa_number', 'Which two numbers must be interchanged to make this equation correct: 7 + 56 ÷ 8 × 2 − 13 = 11?', ['7 and 2', '8 and 2', '7 and 13', '7 and 8'], 3),
    ('Reasoning', 'qa_number', 'Find the next number: 298, 217, 168, 143, ?', ['134', '112', '138', '128'], 0),
    ('Reasoning', 'lr_classification', 'Mahesh is Riva’s father and Vansh’s paternal grandfather. Aakash is Riva’s brother and the father of Vansh and Ritu. Ritu is the only daughter of Aakash and Maya. How is Maya related to Mahesh?', ['Sister', 'Daughter', 'Aunt', 'Daughter-in-law'], 3),
    ('Reasoning', 'lr_analogy', "In a code language, 'first of all' is 'kan dan san', 'who is first' is 'zan kan ven', and 'this is pale' is 'ven gen len'. How is 'who' written?", ['kan', 'gen', 'zan', 'yen'], 2),
    ('Reasoning', 'lr_classification', 'Select the odd letter-cluster: BFJNR, KOSWA, QUYCG, VZDHN.', ['BFJNR', 'KOSWA', 'QUYCG', 'VZDHN'], 3),
    ('Reasoning', 'lr_analogy', "If FLASK is coded as IPFYR, how is TOURS coded?", ['WSZXZ', 'WSYYZ', 'WTZXZ', 'WRZXY'], 0),
    ('Reasoning', 'qa_number', 'A cube of side 49 cm is painted on all faces and cut into cubes of side 7 cm. How many small cubes have exactly one painted face?', ['50', '25', '150', '100'], 2),
    ('Reasoning', 'qa_number', 'Choose signs to make the equation correct: 88 * 120 * 42 * 240 * 48 * 2.', ['+, ÷, −, =, ×', '=, ×, +, ÷, −', '×, ÷, =, −, +', '=, −, +, ÷, ×'], 3),
    ('Reasoning', 'lr_ranking', 'Arrange in logical order: Treatment, Recovery, Virus, Symptoms, Infection.', ['3, 5, 4, 2, 1', '3, 5, 4, 1, 2', '4, 5, 3, 1, 2', '2, 5, 1, 4, 5'], 1),
    ('Reasoning', 'qa_number', 'Find the next number: 61, 99, 152, 222, 312, ?', ['426', '398', '452', '412'], 0),
    ('Reasoning', 'lr_analogy', "If ONION is coded as 201 and POTATO as 261, how is MANGO coded?", ['178', '228', '208', '150'], 3),
    ('Reasoning', 'lr_analogy', 'Complete the analogy: RJB : TGF :: QPG : ?', ['TNJ', 'RMK', 'SOJ', 'SMK'], 3),
    ('Quantitative Aptitude', 'qa_number', 'A and B are primes with A > B and LCM(A, B) = 209. Find B² − A.', ['109', '111', '102', '121'], 2),
    ('Quantitative Aptitude', 'qa_number', 'A sum of Rs. 4,620 is repaid in two equal annual instalments at 10% compound interest. Find each instalment.', ['2,552', '2,750', '2,420', '2,662'], 3),
    ('Quantitative Aptitude', 'qa_profit_loss', 'An article is marked 20% above cost price and sold at a 10% discount. Find the gain percentage.', ['10%', '9%', '8%', '9.5%'], 2),
    ('Quantitative Aptitude', 'qa_number', 'If 8A5146B is divisible by 88, find AB.', ['9', '12', '15', '20'], 1),
]

SAMPLES.extend(
    question(
        'SSC_CGL', 2021, subject, topic_id, text, options, correct,
        'https://cdn-images.prepp.in/public/image/SSC_CGL_2021_Tier_1_Shift_2_English_Question_Paper_and_Answer_Key_PDF_Apr_13_2022_1_45_a81e5e50199b9e1412b733ebb907f66a.pdf',
        'SSC CGL Tier I 2021, 13 April 2022 Shift 2 (Prepp)',
    )
    for subject, topic_id, text, options, correct in SSC_CGL_2021_REASONING_AND_QUANT
)

SSC_CGL_2021_GENERAL_AWARENESS = [
    ('ga_static', "'Ummatt-aat' is a folk dance form performed in ____.", ['Itanagar', 'Kasauli', 'Coorg', 'Gangtok'], 3),
    ('ga_economy', 'What GDP growth rate for India in 2021 was projected by the IMF in April 2021?', ['10.2%', '12.5%', '13.7%', '11.6%'], 1),
    ('ga_static', "Which Indian not-for-profit organisation works on sustainable sanitation and water access?", ['Goonj', 'Pratham', 'Sulabh International', 'HelpAge India'], 2),
    ('ga_science', 'What is the temperature to which air must cool at constant pressure and water-vapour content to reach saturation?', ['Surface temperature', 'Air temperature', 'Dew point temperature', 'Relative humidity'], 2),
    ('ga_static', 'Who became the first player to hit 350 sixes during IPL 2021?', ['Chris Gayle', 'Rohit Sharma', 'MS Dhoni', 'AB de Villiers'], 0),
    ('ga_static', 'Which book was written by Avni Doshi?', ['Burnt Sugar', 'Unaccustomed Earth', 'Interpreter of Maladies', 'In Other Words'], 0),
    ('ga_polity', 'India banned unregulated deposit schemes through an Act passed in which year?', ['2019', '2018', '2017', '2016'], 0),
    ('ga_economy', 'According to Economic Survey 2020–21, India first entered the top 50 innovation countries in which year?', ['2019', '2017', '2018', '2020'], 3),
    ('ga_science', 'Ocean-water salinity is calculated as grams of salt dissolved in how many grams of seawater?', ['10,000', '100', '1,000', '10'], 2),
]

SAMPLES.extend(
    question(
        'SSC_CGL', 2021, 'General Awareness', topic_id, text, options, correct,
        'https://cdn-images.prepp.in/public/image/SSC_CGL_2021_Tier_1_Shift_2_English_Question_Paper_and_Answer_Key_PDF_Apr_13_2022_1_45_a81e5e50199b9e1412b733ebb907f66a.pdf',
        'SSC CGL Tier I 2021, 13 April 2022 Shift 2, General Awareness (Prepp)',
    )
    for topic_id, text, options, correct in SSC_CGL_2021_GENERAL_AWARENESS
)


def main():
    db = get_db_client()
    for topic_id, (name, subject) in TOPICS.items():
        db.table('topics').upsert({'id': topic_id, 'name': name, 'subject': subject}).execute()

    db.table('questions').delete().contains('metadata', {'import_batch': BATCH}).execute()
    response = db.table('questions').insert(SAMPLES).execute()
    inserted = len(response.data or [])
    if inserted != len(SAMPLES):
        raise RuntimeError(f'Expected {len(SAMPLES)} inserted questions, received {inserted}.')
    verified = sum(item['metadata']['is_verified_pyq'] for item in SAMPLES)
    print(f'Imported {inserted} English PYQ samples ({verified} source-attributed, {inserted - verified} memory-based and excluded from ML).')


if __name__ == '__main__':
    main()
