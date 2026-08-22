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
]


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
