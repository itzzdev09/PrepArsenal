"""Shift-wise PYQ scraper for prepp.in paper pages.

Prepp publishes each exam sitting as its own page — one date, one shift — and
embeds the whole paper in the page's Next.js `__NEXT_DATA__` payload: question
text, every option with an `isCorrect` flag, and a worked solution. That is a
far better source than the PDFs, which are frequently Hindi-only, scanned, or
split across separate question and answer-key files.

No LLM is involved: structure comes from the page's own JSON, and only topic
classification uses the existing keyword rules in pyq_parser.

Public entry points:
    list_paper_urls(listing_url) -> list[str]
    scrape_paper(url)            -> ScrapedPaper | None
"""

from __future__ import annotations

import html
import json
import re
import time
from dataclasses import dataclass, field

import requests

BASE = 'https://prepp.in'
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml',
}

NEXT_DATA = re.compile(
    r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', re.S
)
PAPER_HREF = re.compile(r'/paper/[a-z0-9\-]+')

# "…-question-paper-01-dec-2022-shift-1-<objectid>" — the sitting's date and
# shift live in the slug and nowhere else in the payload.
SLUG_DATE = re.compile(r'-(\d{1,2})-([a-z]{3})-(\d{4})-', re.I)
SLUG_SHIFT = re.compile(r'-shift-(\d+)', re.I)
SLUG_YEAR_ONLY = re.compile(r'-(19|20)(\d{2})-')

MONTHS = {m: i for i, m in enumerate(
    ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'], 1
)}

# Prepp's section/subject labels -> the five subjects this project uses.
SECTION_SUBJECT = [
    (re.compile(r'(?i)quant|numerical|mathemat|aptitude'), 'Quantitative Aptitude'),
    (re.compile(r'(?i)reason|intelligence|logical|mental'), 'Reasoning'),
    (re.compile(r'(?i)english|verbal|comprehension'), 'English'),
    (re.compile(r'(?i)finance|economic|commerce|account|banking|management|costing'),
     'Finance & Economics'),
    (re.compile(r'(?i)awareness|general\s*knowledge|current|static|science|polity'),
     'General Awareness'),
]


@dataclass
class ScrapedQuestion:
    index: int
    text: str
    options: list[str]
    correct_option: int
    explanation: str
    section: str
    subject: str


@dataclass
class ScrapedPaper:
    url: str
    slug: str
    name: str
    year: int | None
    shift: str | None
    questions: list[ScrapedQuestion] = field(default_factory=list)


def _text(node, default: str = '') -> str:
    """Pull English text out of prepp's LanguageField shape."""
    if node is None:
        return default
    if isinstance(node, str):
        return node
    if isinstance(node, dict):
        for key in ('en', 'default'):
            value = node.get(key)
            if isinstance(value, str) and value.strip():
                return value
    return default


def strip_html(raw: str) -> str:
    if not raw:
        return ''
    text = re.sub(r'(?is)<(script|style).*?</\1>', ' ', raw)
    text = re.sub(r'(?i)<br\s*/?>|</p>|</div>|</li>', '\n', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    text = text.replace(' ', ' ')
    return re.sub(r'[ \t]+', ' ', text).strip()


def _subject_for(section: str, prepp_subject: str) -> str:
    for pattern, subject in SECTION_SUBJECT:
        if pattern.search(section) or pattern.search(prepp_subject):
            return subject
    return 'General Awareness'


def _year_and_shift(slug: str) -> tuple[int | None, str | None]:
    year = None
    date_match = SLUG_DATE.search(slug)
    if date_match:
        year = int(date_match.group(3))
    else:
        year_match = SLUG_YEAR_ONLY.search(slug)
        if year_match:
            year = int(year_match.group(1) + year_match.group(2))

    shift = None
    shift_match = SLUG_SHIFT.search(slug)
    if shift_match:
        shift = f'Shift {shift_match.group(1)}'
        if date_match:
            day = int(date_match.group(1))
            month = date_match.group(2).capitalize()
            shift = f'{day} {month} {date_match.group(3)} Shift {shift_match.group(1)}'
    return year, shift


def _get(url: str, session: requests.Session, retries: int = 3) -> str | None:
    for attempt in range(retries):
        try:
            response = session.get(url, headers=HEADERS, timeout=45)
            if response.status_code == 200:
                return response.text
            if response.status_code in (429, 502, 503):
                time.sleep(5 * (attempt + 1))
                continue
            return None
        except requests.RequestException:
            time.sleep(3 * (attempt + 1))
    return None


def list_paper_urls(listing_url: str, session: requests.Session | None = None) -> list[str]:
    """Paper-page URLs linked from an exam's practice-papers listing."""
    session = session or requests.Session()
    page = _get(listing_url, session)
    if not page:
        return []
    seen: dict[str, None] = {}
    for href in PAPER_HREF.findall(page):
        seen.setdefault(BASE + href, None)
    return list(seen)


def scrape_paper(url: str, session: requests.Session | None = None) -> ScrapedPaper | None:
    session = session or requests.Session()
    page = _get(url, session)
    if not page:
        return None

    match = NEXT_DATA.search(page)
    if not match:
        return None
    try:
        payload = json.loads(match.group(1))
    except json.JSONDecodeError:
        return None

    try:
        test = payload['props']['initialProps']['pageProps']['testData']['testBySlug']
    except (KeyError, TypeError):
        return None
    if not test:
        return None

    slug = test.get('slug') or url.rsplit('/', 1)[-1]
    year, shift = _year_and_shift(slug)
    paper = ScrapedPaper(
        url=url, slug=slug, name=_text(test.get('name'), slug), year=year, shift=shift
    )

    for section in test.get('sections') or []:
        section_name = strip_html(_text(section.get('name')))
        for question in section.get('questions') or []:
            stem = strip_html(_text(question.get('text')))
            options, correct = [], -1
            for i, option in enumerate(question.get('options') or []):
                options.append(strip_html(_text(option.get('content'))))
                if option.get('isCorrect'):
                    correct = i

            # `answer` is prepp's own 0-indexed key. Trust the per-option flag,
            # but drop the question when the two disagree rather than guess.
            declared = question.get('answer')
            if isinstance(declared, int) and correct >= 0 and declared != correct:
                continue

            if not stem or len(options) < 2 or correct < 0:
                continue

            prepp_subject = strip_html(_text((question.get('subject') or {}).get('name')))
            paper.questions.append(ScrapedQuestion(
                index=int(question.get('qIndex') or len(paper.questions) + 1),
                text=stem,
                options=options,
                correct_option=correct,
                explanation=strip_html(_text((question.get('solution') or {}).get('text')))[:2000],
                section=section_name,
                subject=_subject_for(section_name, prepp_subject),
            ))

    return paper
