"""PrepArsenal — PYQ PDF Pipeline

Downloads previous-year-question PDF papers one at a time for every exam listed
in lib/data.ts, extracts every question in each paper, and bulk-writes them to
Turso (default) or Supabase.

Extraction is fully deterministic — see scripts/pyq_parser.py. There are no
Gemini, Groq or other LLM API calls anywhere in this pipeline: question stems,
options, answer keys, explanations, subject and topic all come from regex
structure and keyword rules. The same PDF therefore always yields the same rows,
and ingestion costs nothing and cannot hallucinate a question that is not in the
paper.

Usage:
    python scripts/pdf_pyq_pipeline.py                      # all exams, all papers
    python scripts/pdf_pyq_pipeline.py --exam SSC_CGL       # just one exam
    python scripts/pdf_pyq_pipeline.py --dry-run            # parse + report, no writes
    python scripts/pdf_pyq_pipeline.py --target supabase    # write to Supabase instead
    python scripts/pdf_pyq_pipeline.py --require-answers    # skip questions with no answer key
"""

import argparse
import hashlib
import json
import re
import time
from pathlib import Path

import pymupdf
import requests

from pyq_parser import TOPICS, parse_paper

REPO_ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = Path(__file__).resolve().parent / 'pdf_cache'
CACHE_DIR.mkdir(exist_ok=True)
REPORT_PATH = Path(__file__).resolve().parent / 'pyq_import_report.json'

IMPORT_BATCH = f"pdf_pyq_{time.strftime('%Y_%m_%d')}"

# One or more source PDFs per exam, processed paper by paper. Mix of official
# (ssc.nic.in) and reputable third-party aggregators — provenance is recorded on
# every imported question via source_url / source_label / source_type.
PAPERS = {
    'SSC_CGL': [
        {'url': 'https://cdn1.byjus.com/wp-content/uploads/2019/10/General-Awareness-2017-SSC-CGL-Previous-Year-Question-Paper-.pdf', 'year': 2017, 'label': "SSC CGL 2017 General Awareness (BYJU'S)", 'source_type': 'third_party'},
        {'url': 'https://cdn1.byjus.com/wp-content/uploads/2019/10/English-2017-SSC-CGL-Previous-Year-Question-Paper.pdf', 'year': 2017, 'label': "SSC CGL 2017 English (BYJU'S)", 'source_type': 'third_party'},
        {'url': 'https://cdn1.byjus.com/wp-content/uploads/2019/10/Quantitative-Aptitude-2017-SSC-CGL-Previous-Year-Question-Paper.pdf', 'year': 2017, 'label': "SSC CGL 2017 Quantitative Aptitude (BYJU'S)", 'source_type': 'third_party'},
        {'url': 'https://cdn1.byjus.com/wp-content/uploads/2019/10/Reasoning-2017-SSC-CGL-Previous-Year-Question-Paper.pdf', 'year': 2017, 'label': "SSC CGL 2017 Reasoning (BYJU'S)", 'source_type': 'third_party'},
        {'url': 'https://cdn1.byjus.com/wp-content/uploads/2020/09/SSC-CGL-Question-Paper-2018-Reasoning-Ability.pdf', 'year': 2018, 'label': "SSC CGL 2018 Reasoning Ability (BYJU'S)", 'source_type': 'third_party'},
        {'url': 'https://cdn1.byjus.com/wp-content/uploads/2020/09/SSC-CGL-Question-Paper-2018-General-Awareness.pdf', 'year': 2018, 'label': "SSC CGL 2018 General Awareness (BYJU'S)", 'source_type': 'third_party'},
        {'url': 'https://cdn1.byjus.com/wp-content/uploads/2020/09/SSC-CGL-Question-Paper-2018-Quantitative-Aptitude.pdf', 'year': 2018, 'label': "SSC CGL 2018 Quantitative Aptitude (BYJU'S)", 'source_type': 'third_party'},
        {'url': 'https://cdn1.byjus.com/wp-content/uploads/2020/09/SSC-CGL-Question-Paper-2018-English-Comprehension.pdf', 'year': 2018, 'label': "SSC CGL 2018 English Comprehension (BYJU'S)", 'source_type': 'third_party'},
    ],
    'ACIO2': [
        {'url': 'https://freedownloads.dishapublication.com/wp-content/uploads/2024/01/IB-ACIO-Solved-Paper-2021_interior.pdf', 'year': 2021, 'label': 'IB ACIO Grade-II Executive Tier I 2021 (Disha)', 'source_type': 'third_party'},
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
        {'url': 'https://www.bankersadda.com/wp-content/uploads/multisite/2022/07/13163733/Formatted-NABARD-Grade-A-Previous-Year-Question-Paper-2021-English-Language-.pdf', 'year': 2021, 'label': 'NABARD Grade A 2021 English (BankersAdda)', 'source_type': 'third_party'},
    ],
    'SEBI_GRADEA': [
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/SEBI-Grade-A-Phase-1-Previous-Year-Papers-Book.pdf', 'year': 2024, 'label': 'SEBI Grade A Phase 1 PYQ Book (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://edutap.in/wp-content/uploads/2026/06/SEBI-Grade-A-Phase-2-Previous-Year-Papers-Book.pdf', 'year': 2024, 'label': 'SEBI Grade A Phase 2 PYQ Book (Edutap)', 'source_type': 'third_party'},
    ],
    'LIC_AAO': [
        {'url': 'https://www.bankersadda.com/wp-content/uploads/multisite/2023/02/21182142/LIC-AAO-Mains-Previous-Year-Paper-of-Reasoning-2019.pdf', 'year': 2019, 'label': 'LIC AAO Mains 2019 Reasoning (BankersAdda)', 'source_type': 'third_party'},
        {'url': 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/01/02153424/LIC-AAO-Prelims-Previous-Year-Paper-2019.pdf', 'year': 2019, 'label': 'LIC AAO Prelims 2019 (Adda247)', 'source_type': 'third_party'},
        {'url': 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/02/17182755/LIC-AAO-Prelims-Memory-Based-Paper-2023-Based-on-17-February.pdf', 'year': 2023, 'label': 'LIC AAO Prelims 2023 Memory-Based (Adda247)', 'source_type': 'memory_based'},
    ],
    'UPSC_APFC': [
        {'url': 'https://edutap.in/wp-content/uploads/2026/05/UPSC-EPFO-APFC-2023-PYQ-Book.pdf', 'year': 2023, 'label': 'UPSC EPFO APFC 2023 (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://edutap.in/wp-content/uploads/2026/05/UPSC-EPFO-APFC-2015-PYQ-Book.pdf', 'year': 2015, 'label': 'UPSC EPFO APFC 2015 (Edutap)', 'source_type': 'third_party'},
        {'url': 'https://freedownloads.dishapublication.com/wp-content/uploads/2025/03/UPSC-EPFO-APFC-Previous-Year-Question-Paper-processedlightpdf.com-output-output-output-output-1.pdf', 'year': 2015, 'label': 'UPSC EPFO APFC topic-wise solved paper (Disha)', 'source_type': 'third_party'},
    ],
    'IRDA': [
        {'url': 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/04/17171403/Insurance-Questions-for-IRDA-Assistant-Manager-Exam-2023.pdf', 'year': 2023, 'label': 'IRDA Assistant Manager Insurance PYQ 2023 (Adda247)', 'source_type': 'third_party'},
        {'url': 'https://wpassets.adda247.com/wp-content/uploads/multisite/2023/04/11184351/IRDA-Assistant-Manager-Memory-Based-Paper-English.pdf', 'year': 2023, 'label': 'IRDA Assistant Manager English memory-based (Adda247)', 'source_type': 'memory_based'},
    ],
}


def download_pdf(url: str) -> Path | None:
    dest = CACHE_DIR / f'{hashlib.md5(url.encode()).hexdigest()}.pdf'
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    try:
        # Several aggregator CDNs reject requests without a full browser UA string.
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf,*/*',
        }
        resp = requests.get(url, headers=headers, timeout=45)
        resp.raise_for_status()
        if 'pdf' not in resp.headers.get('Content-Type', '').lower() and resp.content[:4] != b'%PDF':
            print(f'  [skip] Not a PDF response: {url}')
            return None
        dest.write_bytes(resp.content)
        return dest
    except requests.RequestException as e:
        print(f'  [fail] Download failed for {url}: {e}')
        return None


def extract_text(pdf_path: Path) -> str:
    doc = pymupdf.open(pdf_path)
    try:
        return '\n'.join(page.get_text() for page in doc)
    finally:
        doc.close()


def to_row(parsed, exam_code: str, year: int, source: dict) -> dict:
    dedupe_key = re.sub(r'\s+', ' ', parsed.question_text.lower())
    qid = f'{exam_code}_{year}_{hashlib.md5(dedupe_key.encode()).hexdigest()[:12]}'
    return {
        'id': qid,
        'exam_code': exam_code,
        'subject': parsed.subject,
        'topic': parsed.topic_id,
        'year': year,
        'difficulty': parsed.difficulty,
        'question_text': parsed.question_text,
        'options': json.dumps(parsed.options),
        'correct_option': max(parsed.correct_option, 0),
        'explanation': parsed.explanation,
        'source_url': source['url'],
        'source_label': source['label'],
        'source_type': source['source_type'],
        # Only a question whose answer we actually read from the paper counts as
        # a verified PYQ; those feed the ML trend engine.
        'is_verified_pyq': parsed.correct_option >= 0 and source['source_type'] != 'memory_based',
        'import_batch': IMPORT_BATCH,
        '_dedupe_key': dedupe_key,
        '_has_answer': parsed.correct_option >= 0,
    }


def process_paper(exam_code: str, source: dict, require_answers: bool) -> list[dict]:
    print(f"[{exam_code}] {source['label']}")
    pdf_path = download_pdf(source['url'])
    if not pdf_path:
        return []

    try:
        text = extract_text(pdf_path)
    except Exception as e:
        print(f'  [fail] Could not read PDF text: {e}')
        return []

    if len(text.strip()) < 500:
        print('  [warn] Almost no extractable text — likely a scanned/image PDF; OCR not configured, skipping.')
        return []

    parsed = parse_paper(text)
    rows: dict[str, dict] = {}
    for item in parsed:
        row = to_row(item, exam_code, source['year'], source)
        if require_answers and not row['_has_answer']:
            continue
        rows[row['_dedupe_key']] = row

    answered = sum(1 for r in rows.values() if r['_has_answer'])
    print(f'  -> {len(rows)} unique questions ({answered} with a confirmed answer key)')
    return list(rows.values())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--exam', help='Only process this exam code (e.g. SSC_CGL)')
    parser.add_argument('--dry-run', action='store_true', help='Parse and report only, skip writes')
    parser.add_argument('--target', choices=['turso', 'supabase'], default='turso', help='Where to write questions')
    parser.add_argument('--require-answers', action='store_true', help='Drop questions whose answer key could not be found')
    args = parser.parse_args()

    exam_codes = [args.exam] if args.exam else list(PAPERS.keys())

    writer = None
    if not args.dry_run:
        writer = _open_writer(args.target)

    report = {'batch': IMPORT_BATCH, 'extractor': 'deterministic (scripts/pyq_parser.py)', 'exams': {}}
    total_written = 0

    for exam_code in exam_codes:
        papers = PAPERS.get(exam_code, [])
        if not papers:
            print(f'[{exam_code}] no configured source papers, skipping')
            continue

        exam_rows: dict[str, dict] = {}
        paper_reports = []
        for source in papers:
            rows = process_paper(exam_code, source, args.require_answers)
            for row in rows:
                exam_rows.setdefault(row['_dedupe_key'], row)
            paper_reports.append({
                'label': source['label'],
                'url': source['url'],
                'questions': len(rows),
                'answered': sum(1 for r in rows if r['_has_answer']),
            })

        final_rows = list(exam_rows.values())
        for row in final_rows:
            row.pop('_dedupe_key', None)
            row.pop('_has_answer', None)

        if not args.dry_run and final_rows:
            total_written += writer(final_rows)
            print(f'[{exam_code}] wrote {len(final_rows)} questions to {args.target}')
        elif args.dry_run:
            print(f'[{exam_code}] dry-run: would write {len(final_rows)} questions')

        report['exams'][exam_code] = {'papers': paper_reports, 'total_questions': len(final_rows)}

    REPORT_PATH.write_text(json.dumps(report, indent=2))
    print(f'\nReport written to {REPORT_PATH}')
    if not args.dry_run:
        print(f'Total questions written this run: {total_written}')


def _open_writer(target: str):
    """Return a callable that persists rows to the chosen backend."""
    if target == 'turso':
        from turso_writer import TursoWriter

        writer = TursoWriter()
        writer.ensure_schema()
        writer.upsert_topics([
            {'id': tid, 'name': name, 'subject': subj} for tid, (name, subj) in TOPICS.items()
        ])
        return writer.upsert_questions

    from db_client import get_db_client

    db = get_db_client()
    for topic_id, (name, subject) in TOPICS.items():
        db.table('topics').upsert({'id': topic_id, 'name': name, 'subject': subject}).execute()

    def write(rows: list[dict]) -> int:
        payload = [
            {
                'exam_code': r['exam_code'],
                'year': r['year'],
                'subject': r['subject'],
                'topic_id': r['topic'],
                'question_text': r['question_text'],
                'options': json.loads(r['options']),
                'correct_option': r['correct_option'],
                'explanation': r['explanation'] or 'Answer taken from the cited question paper.',
                'difficulty': r['difficulty'],
                'metadata': {
                    'source': r['source_label'],
                    'source_url': r['source_url'],
                    'source_type': r['source_type'],
                    'is_verified_pyq': r['is_verified_pyq'],
                    'import_batch': r['import_batch'],
                },
            }
            for r in rows
        ]
        written = 0
        for i in range(0, len(payload), 200):
            chunk = payload[i:i + 200]
            db.table('questions').insert(chunk).execute()
            written += len(chunk)
        return written

    return write


if __name__ == '__main__':
    main()
