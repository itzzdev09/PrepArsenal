"""PrepArsenal — PYQ PDF Pipeline

Downloads previous-year-question PDF papers one at a time for every exam listed
in lib/data.ts, extracts every question in each paper (no sampling), structures
them with an LLM, and bulk-writes them into Turso only. Supabase is left alone —
it stays reserved for auth/profile/site data per project convention.

Usage:
    python scripts/pdf_pyq_pipeline.py                 # run all exams, all papers
    python scripts/pdf_pyq_pipeline.py --exam SSC_CGL   # just one exam
    python scripts/pdf_pyq_pipeline.py --dry-run        # extract + print, skip Turso writes
"""

import argparse
import hashlib
import json
import re
import sys
import time
from pathlib import Path

import fitz  # PyMuPDF
import requests
from dotenv import load_dotenv
import os

REPO_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(REPO_ROOT / '.env.local')
load_dotenv(Path(__file__).resolve().parent / '.env', override=False)

from turso_writer import TursoWriter  # noqa: E402

CACHE_DIR = Path(__file__).resolve().parent / 'pdf_cache'
CACHE_DIR.mkdir(exist_ok=True)
REPORT_PATH = Path(__file__).resolve().parent / 'pyq_import_report.json'

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

IMPORT_BATCH = f"pdf_pyq_{time.strftime('%Y_%m_%d')}"

SUBJECTS = ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Finance & Economics']

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

# One or more source PDFs per exam, tried one at a time ("paper by paper").
# Mix of official (ssc.nic.in) and reputable third-party aggregators — see
# metadata.source_type on each imported question for provenance.
PAPERS = {
    'SSC_CGL': [
        {'url': 'https://ssc.nic.in/SSCFileServer/PortalManagement/UploadedFiles/Final_Answer_Key_CGLE2023_16122023.pdf', 'year': 2023, 'label': 'SSC CGL 2023 Final Answer Key (Official, ssc.nic.in)', 'source_type': 'official'},
        {'url': 'https://ssc.nic.in/SSCFileServer/PortalManagement/UploadedFiles/FinalAnswerkey_CGLE2022_tier1_27022023.pdf', 'year': 2022, 'label': 'SSC CGL 2022 Tier-1 Final Answer Key (Official, ssc.nic.in)', 'source_type': 'official'},
    ],
    'ACIO2': [
        {'url': 'https://blogmedia.testbook.com/blog/wp-content/uploads/2017/10/IB-ACIO-Question-Papers-for-15th-October-2017.pdf', 'year': 2017, 'label': 'IB ACIO-II 2017 Tier-1 (Testbook)', 'source_type': 'third_party'},
    ],
    'RRB_NTPC': [
        {'url': 'https://wpassets.adda247.com/wp-content/uploads/multisite/sites/2/2020/12/15111519/RRB-NTPC-Previous-Year-Paper-07-Hindi.pdf', 'year': 2016, 'label': 'RRB NTPC 2016 CBT1 (Adda247)', 'source_type': 'third_party'},
        {'url': 'https://www.sscadda.com/wp-content/uploads/multisite/sites/2/2020/10/31140026/Formatted-RRB-NTPC-Previous-Year-Question-Paper-Mock-Solutions-2.pdf', 'year': 2019, 'label': 'RRB NTPC Mock Solutions Compilation (SSCAdda)', 'source_type': 'third_party'},
        {'url': 'https://www.oswaal360.com/pluginfile.php/10939/mod_folder/content/0/RRB%20-%20NTPC/RRB%20-%20NTPC%20SOLVED%20PAPER%20FEB.%202021.pdf', 'year': 2021, 'label': 'RRB NTPC Feb 2021 Solved Paper (Oswaal)', 'source_type': 'third_party'},
    ],
    'RBI_GRADEB': [
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/RBI-Grade-B-PYQ-2025-Phase-12.pdf', 'year': 2025, 'label': 'RBI Grade B 2025 Phase 1&2 (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/RBI-Grade-B-PYQ-2024-Phase-12.pdf', 'year': 2024, 'label': 'RBI Grade B 2024 Phase 1&2 (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/RBI-Grade-B-PYQ-2023-Phase-12.pdf', 'year': 2023, 'label': 'RBI Grade B 2023 Phase 1&2 (Edutap)', 'source_type': 'third_party'},
    ],
    'NABARD_GRADEA': [
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/NABARD-Grade-A-Phase-1-2-2025-PYQs-Book.pdf', 'year': 2025, 'label': 'NABARD Grade A 2025 (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/NABARD-Grade-A-Phase-1-2-2024-PYQs-Book.pdf', 'year': 2024, 'label': 'NABARD Grade A 2024 (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/NABARD-Grade-A-Phase-1-2-2023-PYQs-Book.pdf', 'year': 2023, 'label': 'NABARD Grade A 2023 (Edutap)', 'source_type': 'third_party'},
    ],
    'SEBI_GRADEA': [
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/SEBI-Grade-A-Phase-1-Previous-Year-Papers-Book.pdf', 'year': 2024, 'label': 'SEBI Grade A Phase 1 PYQ Book (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/SEBI-Grade-A-Phase-2-Previous-Year-Papers-Book.pdf', 'year': 2024, 'label': 'SEBI Grade A Phase 2 PYQ Book (Edutap)', 'source_type': 'third_party'},
    ],
    'LIC_AAO': [
        {'url': 'https://www.bankersadda.com/wp-content/uploads/multisite/2023/02/21182142/LIC-AAO-Mains-Previous-Year-Paper-of-Reasoning-2019.pdf', 'year': 2019, 'label': 'LIC AAO Mains 2019 Reasoning (BankersAdda)', 'source_type': 'third_party'},
        {'url': 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/02/17182755/LIC-AAO-Prelims-Memory-Based-Paper-2023-Based-on-17-February.pdf', 'year': 2023, 'label': 'LIC AAO Prelims 2023 Memory-Based (Adda247)', 'source_type': 'memory_based'},
    ],
    'UPSC_APFC': [
        {'url': 'https://edutap.in/wp-content/uploads/2026/05/UPSC-EPFO-APFC-2023-PYQ-Book.pdf', 'year': 2023, 'label': 'UPSC EPFO APFC 2023 (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://edutap.in/wp-content/uploads/2026/05/UPSC-EPFO-APFC-2015-PYQ-Book.pdf', 'year': 2015, 'label': 'UPSC EPFO APFC 2015 (Edutap)', 'source_type': 'third_party'},
    ],
    'IRDA': [
        {'url': 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/04/17171403/Insurance-Questions-for-IRDA-Assistant-Manager-Exam-2023.pdf', 'year': 2023, 'label': 'IRDA Assistant Manager Insurance PYQ 2023 (Adda247)', 'source_type': 'third_party'},
    ],
}

EXTRACTION_PROMPT = """You are transcribing an Indian government competitive exam ({exam_code}, {year}) previous-year question paper into structured data.

Below is raw text extracted from one chunk of the paper's PDF. It may contain OCR noise, headers, footers, or page numbers — ignore those.

Extract EVERY multiple-choice question found in this text. Do not skip any, do not summarize, do not invent questions that aren't there. If a question's answer key is present elsewhere in the text (e.g. a separate answer-key section), match it to its question by number. If you cannot determine the correct option for a question with confidence, still include the question but set "correct_option" to -1.

For each question, classify it into exactly one of these subjects: {subjects}
And exactly one of these topic ids: {topic_ids}
(pick the closest match; if nothing fits well, use "ga_static" for General Awareness or the most generic topic id for its subject)

Respond with ONLY a JSON array (no markdown fences, no commentary), in this exact shape:
[{{"question_text": string, "options": [string, ...], "correct_option": integer (0-indexed, -1 if unknown), "subject": string, "topic_id": string, "difficulty": "easy"|"medium"|"hard", "explanation": string}}]

Text chunk:
---
{chunk}
---"""


def download_pdf(url: str) -> Path | None:
    cache_key = hashlib.md5(url.encode()).hexdigest()
    dest = CACHE_DIR / f'{cache_key}.pdf'
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        resp = requests.get(url, headers=headers, timeout=45)
        resp.raise_for_status()
        if resp.headers.get('Content-Type', '').lower().find('pdf') == -1 and not resp.content[:4] == b'%PDF':
            print(f'  [skip] Not a PDF response: {url}')
            return None
        dest.write_bytes(resp.content)
        return dest
    except requests.RequestException as e:
        print(f'  [fail] Download failed for {url}: {e}')
        return None


def extract_text(pdf_path: Path) -> str:
    doc = fitz.open(pdf_path)
    pages = [page.get_text() for page in doc]
    doc.close()
    text = '\n'.join(pages)
    return re.sub(r'[ \t]+', ' ', text)


def chunk_text(text: str, max_chars: int = 9000, overlap: int = 400) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - overlap
    return chunks


def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError('GEMINI_API_KEY not configured')
    resp = requests.post(
        f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}',
        json={
            'contents': [{'role': 'user', 'parts': [{'text': prompt}]}],
            'generationConfig': {'temperature': 0.2, 'maxOutputTokens': 8192, 'responseMimeType': 'application/json'},
        },
        timeout=90,
    )
    resp.raise_for_status()
    data = resp.json()
    return data['candidates'][0]['content']['parts'][0]['text']


def call_groq(prompt: str) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError('GROQ_API_KEY not configured')
    resp = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={'Authorization': f'Bearer {GROQ_API_KEY}'},
        json={
            'model': 'llama3-70b-8192',
            'messages': [
                {'role': 'system', 'content': 'You output only valid JSON arrays, no markdown fences, no commentary.'},
                {'role': 'user', 'content': prompt},
            ],
            'temperature': 0.2,
            'max_tokens': 8192,
        },
        timeout=90,
    )
    resp.raise_for_status()
    data = resp.json()
    return data['choices'][0]['message']['content']


def parse_json_array(raw: str) -> list[dict]:
    cleaned = raw.strip()
    cleaned = re.sub(r'^```(?:json)?', '', cleaned).strip()
    cleaned = re.sub(r'```$', '', cleaned).strip()
    match = re.search(r'\[.*\]', cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)
    return json.loads(cleaned)


def extract_questions_from_chunk(chunk: str, exam_code: str, year: int) -> list[dict]:
    prompt = EXTRACTION_PROMPT.format(
        exam_code=exam_code,
        year=year,
        subjects=', '.join(SUBJECTS),
        topic_ids=', '.join(TOPICS.keys()),
        chunk=chunk,
    )
    for attempt, call in enumerate([call_gemini, call_groq]):
        try:
            raw = call(prompt)
            items = parse_json_array(raw)
            if isinstance(items, list):
                return items
        except Exception as e:
            print(f'    [llm attempt {attempt + 1} failed] {e}')
            time.sleep(2)
    return []


def normalize_question(item: dict, exam_code: str, year: int, source: dict) -> dict | None:
    text = str(item.get('question_text', '')).strip()
    options = item.get('options') or []
    options = [str(o).strip() for o in options if str(o).strip()]
    correct = item.get('correct_option', -1)
    if not text or len(options) < 2 or not isinstance(correct, int):
        return None

    subject = item.get('subject') if item.get('subject') in SUBJECTS else SUBJECTS[0]
    topic_id = item.get('topic_id') if item.get('topic_id') in TOPICS else next(
        (tid for tid, (_, subj) in TOPICS.items() if subj == subject), 'ga_static'
    )
    difficulty = item.get('difficulty') if item.get('difficulty') in ('easy', 'medium', 'hard') else 'medium'

    dedupe_key = re.sub(r'\s+', ' ', text.lower())
    qid = f"{exam_code}_{year}_{hashlib.md5(dedupe_key.encode()).hexdigest()[:12]}"

    return {
        'id': qid,
        'exam_code': exam_code,
        'subject': subject,
        'topic': topic_id,
        'year': year,
        'difficulty': difficulty,
        'question_text': text,
        'options': json.dumps(options),
        'correct_option': max(correct, 0),
        'explanation': str(item.get('explanation', ''))[:2000],
        'source_url': source['url'],
        'source_label': source['label'],
        'source_type': source['source_type'],
        'is_verified_pyq': correct >= 0 and source['source_type'] != 'memory_based',
        'import_batch': IMPORT_BATCH,
        '_dedupe_key': dedupe_key,
    }


def process_paper(exam_code: str, source: dict, dry_run: bool) -> list[dict]:
    print(f"[{exam_code}] {source['label']}")
    pdf_path = download_pdf(source['url'])
    if not pdf_path:
        return []

    try:
        text = extract_text(pdf_path)
    except Exception as e:
        print(f'  [fail] Could not read PDF text: {e}')
        return []

    if len(text.strip()) < 200:
        print('  [warn] Almost no extractable text — likely a scanned/image PDF; OCR not configured, skipping.')
        return []

    chunks = chunk_text(text)
    print(f'  extracted {len(text)} chars across {len(chunks)} chunk(s)')

    all_rows: dict[str, dict] = {}
    for i, chunk in enumerate(chunks):
        items = extract_questions_from_chunk(chunk, exam_code, source['year'])
        for item in items:
            row = normalize_question(item, exam_code, source['year'], source)
            if row:
                all_rows[row['_dedupe_key']] = row
        print(f'  chunk {i + 1}/{len(chunks)}: {len(items)} raw items, {len(all_rows)} unique so far')
        time.sleep(1.5)

    rows = list(all_rows.values())
    for r in rows:
        r.pop('_dedupe_key', None)
    print(f'  -> {len(rows)} questions extracted from this paper')
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--exam', help='Only process this exam code (e.g. SSC_CGL)')
    parser.add_argument('--dry-run', action='store_true', help='Extract and print only, skip Turso writes')
    args = parser.parse_args()

    exam_codes = [args.exam] if args.exam else list(PAPERS.keys())

    writer = None
    if not args.dry_run:
        writer = TursoWriter()
        writer.ensure_schema()
        writer.upsert_topics([{'id': tid, 'name': name, 'subject': subj} for tid, (name, subj) in TOPICS.items()])

    report = {'batch': IMPORT_BATCH, 'exams': {}}
    total_inserted = 0

    for exam_code in exam_codes:
        papers = PAPERS.get(exam_code, [])
        if not papers:
            print(f'[{exam_code}] no configured source papers, skipping')
            continue

        exam_rows: list[dict] = []
        paper_reports = []
        for source in papers:
            rows = process_paper(exam_code, source, args.dry_run)
            exam_rows.extend(rows)
            paper_reports.append({'label': source['label'], 'url': source['url'], 'questions': len(rows)})
            time.sleep(2)

        if not args.dry_run and exam_rows:
            inserted = writer.upsert_questions(exam_rows)
            total_inserted += inserted
            print(f'[{exam_code}] wrote {inserted} questions to Turso')
        elif args.dry_run:
            print(f'[{exam_code}] dry-run: would write {len(exam_rows)} questions')

        report['exams'][exam_code] = {'papers': paper_reports, 'total_questions': len(exam_rows)}

    REPORT_PATH.write_text(json.dumps(report, indent=2))
    print(f'\nReport written to {REPORT_PATH}')
    if not args.dry_run:
        print(f'Total questions written this run: {total_inserted}')


if __name__ == '__main__':
    main()
