"""Deterministic PYQ paper parser — no LLM, no external API.

Indian competitive-exam PYQ PDFs are highly regular: a numbered question, four
or five bracketed options, and either an inline `Ans. (b)`, a dense answer-key
grid, or a numbered solutions section carrying the answer letter plus an
explanation. This module extracts all of that with regex and keyword rules, so
paper ingestion needs no Gemini/Groq call and produces identical output on every
run.

Public entry point: parse_paper(raw_text) -> list[ParsedQuestion]
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

OPTION_LETTERS = 'abcde'

SUBJECTS = ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Finance & Economics']

TOPICS: dict[str, tuple[str, str]] = {
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
    'qa_si_ci': ('Simple & Compound Interest', 'Quantitative Aptitude'),
    'qa_ratio': ('Ratio & Proportion', 'Quantitative Aptitude'),
    'qa_time_work': ('Time & Work', 'Quantitative Aptitude'),
    'qa_tw': ('Time & Work', 'Quantitative Aptitude'),
    'qa_mixture': ('Mixture & Alligation', 'Quantitative Aptitude'),
    'qa_probability': ('Probability', 'Quantitative Aptitude'),
    'lr_analogy': ('Analogy', 'Reasoning'),
    'lr_classification': ('Classification', 'Reasoning'),
    'lr_ranking': ('Ranking & Order', 'Reasoning'),
    'lr_math_operators': ('Mathematical Operators', 'Reasoning'),
    'lr_syllogism': ('Syllogism', 'Reasoning'),
    'lr_blood_relation': ('Blood Relations', 'Reasoning'),
    'lr_blood': ('Blood Relations', 'Reasoning'),
    'lr_coding': ('Coding-Decoding', 'Reasoning'),
    'lr_series': ('Letter/Alpha-Numeric Series', 'Reasoning'),
    'lr_venn_diagram': ('Venn Diagram', 'Reasoning'),
    'lr_venn': ('Venn Diagram', 'Reasoning'),
    'lr_direction': ('Direction & Distance', 'Reasoning'),
    'lr_seating': ('Seating Arrangement', 'Reasoning'),
    'lr_puzzle': ('Puzzles', 'Reasoning'),
    'lr_word_sequence': ('Logical Word Sequence', 'Reasoning'),
    'lr_number_series': ('Number Series', 'Reasoning'),
    'en_error': ('Error Spotting', 'English'),
    'en_idiom': ('Idioms & Phrases', 'English'),
    'en_vocab': ('Vocabulary', 'English'),
    'en_synonym': ('Synonyms & Antonyms', 'English'),
    'en_oneword': ('One Word Substitution', 'English'),
    'en_fillblank': ('Fill in the Blanks', 'English'),
    'en_sentence': ('Sentence Improvement', 'English'),
    'en_para': ('Para Jumbles', 'English'),
    'en_rc': ('Reading Comprehension', 'English'),
    'ga_polity': ('Indian Polity', 'General Awareness'),
    'ga_history': ('History', 'General Awareness'),
    'ga_geography': ('Geography', 'General Awareness'),
    'ga_static': ('Static GK', 'General Awareness'),
    'ga_economy': ('Economy', 'General Awareness'),
    'ga_science': ('General Science', 'General Awareness'),
    'ga_current': ('Current Affairs', 'General Awareness'),
    'ga_computer': ('Computer Knowledge', 'General Awareness'),
    'fe_banking': ('Banking Awareness', 'Finance & Economics'),
    'fe_securities': ('Securities & Regulations', 'Finance & Economics'),
    'fe_accounts': ('Accounting & Auditing', 'Finance & Economics'),
    'fe_insurance': ('Insurance Principles', 'Finance & Economics'),
}

# Keyword -> topic weights. Longer/more specific phrases score higher so that a
# question mentioning both "profit" and "percent" lands on Profit & Loss.
TOPIC_KEYWORDS: dict[str, list[tuple[str, int]]] = {
    'qa_profit_loss': [('profit', 3), ('loss', 2), ('cost price', 4), ('selling price', 4), ('marked price', 4), ('discount', 3), ('shopkeeper', 3)],
    'qa_interest': [('compound interest', 5), ('simple interest', 5), ('per annum', 2), ('instalment', 3), ('principal', 2), ('compounded', 3)],
    'qa_si_ci': [('compound interest', 5), ('simple interest', 5), ('per annum', 2), ('instalment', 3), ('principal', 2), ('compounded', 3)],
    'qa_ratio': [('ratio of', 4), ('in the ratio', 4), ('proportion', 4), ('ratio', 2)],
    'qa_mixture': [('mixture', 4), ('alligation', 5), ('milk and water', 4), ('liquid', 2), ('pure vessel', 3)],
    'qa_probability': [('probability', 5), ('dice', 4), ('deck of cards', 4), ('coin is tossed', 4)],
    'qa_tsd': [('speed', 3), ('km/h', 4), ('kmph', 4), ('upstream', 4), ('downstream', 4), ('train', 2), ('boat', 3), ('distance', 2), ('overtake', 3)],
    'qa_time_work': [('days can', 3), ('time and work', 5), ('pipe', 3), ('cistern', 4), ('work together', 4), ('complete the work', 5), ('finish the work', 5), ('piece of work', 5), ('same work in', 4), ('men or', 3), ('women can', 3), ('efficiency', 3)],
    'qa_tw': [('days can', 3), ('time and work', 5), ('pipe', 3), ('cistern', 4), ('work together', 4), ('complete the work', 5), ('finish the work', 5), ('piece of work', 5)],
    'qa_average': [('average', 4), ('mean of', 3)],
    'qa_percentage': [('percent', 3), ('%', 1), ('increase by', 2), ('decrease by', 2)],
    'qa_trigonometry': [('sin', 3), ('cos', 3), ('tan', 3), ('cot', 3), ('sec', 2), ('cosec', 3), ('theta', 3), ('trigonometric', 5)],
    'qa_mensuration': [('volume', 3), ('surface area', 4), ('cylinder', 4), ('cone', 3), ('sphere', 4), ('cuboid', 4), ('perimeter', 3), ('curved surface', 5)],
    'qa_geometry': [('triangle', 3), ('circle', 3), ('tangent', 4), ('chord', 4), ('angle', 2), ('parallel', 2), ('bisector', 4), ('quadrilateral', 4), ('centroid', 4), ('incentre', 4)],
    'qa_algebra': [('equation', 3), ('polynomial', 4), ('roots', 3), ('simplify', 2), ('x2', 1), ('x³', 2), ('value of x', 3)],
    'qa_di': [('table shows', 4), ('pie chart', 5), ('bar graph', 5), ('bar chart', 5), ('the graph', 3), ('following table', 4), ('data given', 3)],
    'qa_number': [('divisible', 4), ('remainder', 4), ('lcm', 4), ('hcf', 4), ('prime', 3), ('digit', 3), ('factors', 2)],
    'lr_syllogism': [('conclusion', 3), ('statements:', 3), ('follows', 2), ('all a are', 3), ('some are', 2)],
    'lr_blood_relation': [('related to', 3), ('brother', 3), ('sister', 3), ('father', 2), ('mother', 2), ('nephew', 4), ('niece', 4), ('daughter-in-law', 4), ('paternal', 4), ('maternal', 4)],
    'lr_blood': [('related to', 3), ('brother', 3), ('sister', 3), ('father', 2), ('mother', 2), ('nephew', 4), ('niece', 4), ('paternal', 4)],
    'lr_coding': [('code language', 5), ('coded as', 5), ('written as', 3), ('code for', 4)],
    'lr_analogy': [('is related to', 4), ('::', 5), ('analogy', 5)],
    'lr_classification': [('odd one out', 5), ('does not belong', 5), ('is different', 3), ('odd letter', 4), ('select the odd', 5)],
    'lr_ranking': [('from the left', 4), ('from the right', 4), ('rank', 3), ('in a row', 4), ('in a queue', 4), ('position', 2)],
    'lr_direction': [('facing north', 4), ('turns left', 4), ('turns right', 4), ('towards south', 4), ('direction', 3), ('starting point', 3)],
    'lr_seating': [('sitting around a circular table', 5), ('facing centre', 4), ('row facing north', 4), ('seating arrangement', 5)],
    'lr_puzzle': [('floor puzzle', 5), ('box puzzle', 5), ('schedule puzzle', 5)],
    'lr_math_operators': [('interchanged', 4), ('signs', 3), ('denotes', 4), ('means ×', 4), ('means ÷', 4)],
    'lr_series': [('letter cluster', 5), ('alphabetical', 3), ('letter series', 5)],
    'lr_number_series': [('number series', 5), ('missing number', 4), ('next number', 4), ('replace the question mark', 4)],
    'lr_venn_diagram': [('venn', 5), ('diagram that best', 4)],
    'lr_venn': [('venn', 5), ('diagram that best', 4)],
    'lr_word_sequence': [('logical and meaningful order', 5), ('meaningful sequence', 5), ('arrange the following words', 5)],
    'en_idiom': [('idiom', 5), ('phrase', 3), ('proverb', 4), ('meaning of the idiom', 5)],
    'en_vocab': [('vocabulary', 3), ('meaning of', 2)],
    'en_synonym': [('synonym', 5), ('antonym', 5), ('opposite in meaning', 5), ('closest in meaning', 5)],
    'en_oneword': [('one-word substitut', 5), ('one word substitut', 5)],
    'en_fillblank': [('fill in the blank', 4), ('select the most appropriate option to fill', 5)],
    'en_sentence': [('sentence improvement', 5), ('substitute the underlined', 4), ('improves', 3)],
    'en_para': [('parajumble', 5), ('jumbled sentences', 5), ('rearrange the parts', 5)],
    'en_rc': [('read the passage', 5), ('according to the passage', 5), ('passage given below', 5)],
    'en_error': [('error', 4), ('grammatical', 4), ('spelt', 4), ('spelling', 3), ('active voice', 5), ('passive voice', 5), ('indirect speech', 5), ('direct speech', 5), ('segment', 3)],
    'ga_history': [('dynasty', 4), ('mughal', 4), ('harappa', 4), ('indus valley', 5), ('battle of', 5), ('maurya', 4), ('ashoka', 4), ('buddhism', 4), ('jainism', 4), ('viceroy', 4), ('revolt of 1857', 5), ('freedom movement', 4), ('gandhi', 3)],
    'ga_geography': [('tributary', 4), ('plateau', 4), ('himalaya', 4), ('soil', 3), ('monsoon', 4), ('biosphere reserve', 4), ('strait', 4), ('equator', 4), ('latitude', 3), ('longitude', 3), ('peninsula', 4)],
    'ga_polity': [('constitution', 4), ('article', 3), ('parliament', 4), ('fundamental right', 5), ('amendment', 4), ('lok sabha', 5), ('rajya sabha', 5), ('supreme court', 4), ('president of india', 4), ('schedule', 3), ('act,', 3)],
    'ga_economy': [('gdp', 4), ('inflation', 4), ('fiscal', 4), ('budget', 3), ('economic survey', 5), ('niti aayog', 5), ('export', 3), ('import', 3), ('subsidy', 3)],
    'ga_science': [('vitamin', 4), ('element', 3), ('atom', 3), ('chemical', 3), ('planet', 4), ('cell', 3), ('acid', 3), ('si unit', 5), ('disease', 3), ('enzyme', 4), ('gas', 2), ('newton', 3), ('photosynthesis', 4), ('wavelength', 4)],
    'ga_computer': [('cpu', 4), ('ram', 4), ('rom', 4), ('operating system', 4), ('binary', 4), ('ip address', 4), ('browser', 3), ('hardware', 3), ('software', 3), ('protocol', 3)],
    'ga_current': [('summit 202', 4), ('oscar 202', 4), ('g20', 4), ('cup 202', 4), ('scheme launched', 4), ('appointed as', 3), ('nobel prize 202', 5)],
    'fe_banking': [('rbi', 5), ('repo rate', 5), ('crr', 5), ('slr', 5), ('npa', 5), ('bank', 3), ('monetary policy', 5), ('basel', 5), ('nabard', 5)],
    'fe_accounts': [('balance sheet', 5), ('trial balance', 5), ('ledger', 5), ('journal entry', 5), ('depreciation', 4), ('cash flow', 4), ('accounting standard', 5)],
    'fe_insurance': [('insurance', 4), ('premium', 4), ('policyholder', 5), ('underwriting', 5), ('irdai', 5), ('actuary', 5), ('annuity', 4), ('reinsurance', 5), ('indemnity', 4)],
    'fe_securities': [('sebi', 5), ('mutual fund', 5), ('stock exchange', 5), ('ipo', 4), ('debenture', 4), ('securities', 4), ('depositor', 3), ('nse', 4), ('bse', 4)],
    'ga_static': [('capital of', 4), ('dance', 3), ('festival', 3), ('river', 3), ('national park', 4), ('temple', 3), ('unesco', 4), ('award', 3), ('written by', 4), ('author', 3), ('located in', 3), ('world cup', 4)],
}

# Section headings that appear in most papers; used to classify questions whose
# own wording is too generic to place (e.g. figure-only or bare-expression items).
# Anchored to standalone lines so the word "reasoning" inside a question stem
# cannot be mistaken for a section break.
SECTION_HEADINGS: list[tuple[re.Pattern, str]] = [
    (re.compile(r'(?m)^[ \t\W]*(?:quantitative\s+(?:aptitude|abilit\w*)|numerical\s+abilit\w*|mathematics|arithmetic)[ \t\W]*$', re.I), 'Quantitative Aptitude'),
    (re.compile(r'(?m)^[ \t\W]*(?:(?:general|logical|verbal)?\s*reasoning(?:\s+abilit\w*)?|mental\s+abilit\w*)[ \t\W]*$', re.I), 'Reasoning'),
    (re.compile(r'(?m)^[ \t\W]*english(?:\s+(?:language|comprehension))?[ \t\W]*$', re.I), 'English'),
    (re.compile(r'(?m)^[ \t\W]*general\s+(?:awareness|knowledge|studies)[ \t\W]*$', re.I), 'General Awareness'),
    (re.compile(r'(?m)^[ \t\W]*(?:finance\s*(?:&|and)?\s*management|economics?|banking\s+awareness|insurance\s+awareness)[ \t\W]*$', re.I), 'Finance & Economics'),
]


# Running headers such as "SEBI Grade A 2020 Phase 1 - Quant Recollected
# Questions" or "ACIO Solved Paper-2021". Aggregator PYQ books bundle several
# exam years into one PDF, so the year has to be read per question from the
# nearest preceding header rather than assumed from the filename.
PAPER_YEAR_HEADER = re.compile(
    r'(?im)^[^\n]{0,70}\b(20[0-2]\d)\b[^\n]{0,70}$'
)
YEAR_HEADER_CONTEXT = re.compile(
    r'(?i)phase|tier|shift|recollected|solved\s+paper|question\s+paper|prelims|mains|paper\s*-?\s*[12i]'
)

# Wording that marks a paper as reconstructed from candidate recall rather than
# transcribed from an official released paper.
RECOLLECTED_MARKERS = re.compile(r'(?i)recollected|memory[\s-]based|memory\s+based|recalled\s+questions')


def find_paper_years(text: str) -> list[tuple[int, int]]:
    """Offsets at which the paper switches exam year, in document order."""
    positions = []
    for match in PAPER_YEAR_HEADER.finditer(text):
        line = match.group(0)
        if not YEAR_HEADER_CONTEXT.search(line):
            continue
        # A line listing a span ("2020-2025") is a contents blurb, not a section.
        if re.search(r'20[0-2]\d\s*[-–—]\s*20[0-2]\d', line):
            continue
        positions.append((match.start(), int(match.group(1))))
    positions.sort()
    return positions


def year_at(positions: list[tuple[int, int]], offset: int) -> int | None:
    current = None
    for start, year in positions:
        if start > offset:
            break
        current = year
    return current


def is_recollected(text: str) -> bool:
    """True when the document describes itself as candidate-recalled."""
    return len(RECOLLECTED_MARKERS.findall(text)) >= 3


def _find_sections(text: str) -> list[tuple[int, str]]:
    """Offsets at which the paper switches subject section, in document order."""
    positions = [
        (m.end(), subject)
        for pattern, subject in SECTION_HEADINGS
        for m in pattern.finditer(text)
    ]
    positions.sort()
    return positions


def _section_at(positions: list[tuple[int, str]], offset: int) -> str | None:
    current = None
    for start, subject in positions:
        if start > offset:
            break
        current = subject
    return current

QUESTION_START = re.compile(r'(?m)^[ \t]*(?:Q[\.\s]?\s*)?(\d{1,3})\s*[\.\)]\s*')
OPTION_TOKEN = re.compile(r'[\(\[]\s*([a-eA-E])\s*[\)\]]|(?m)^[ \t]*([a-eA-E])[\.\)]\s+')
INLINE_ANSWER = re.compile(r'\bAns(?:wer)?\b[\s\.:\-]*[\(\[]?\s*([a-eA-E])\s*[\)\]]?', re.I)
SOLUTION_LINE = re.compile(r'(?m)^[ \t]*(\d{1,3})[\.\)]\s*[\(\[]\s*([a-eA-E])\s*[\)\]]\s*(.*)$')
ANSWER_KEY_PAIR = re.compile(r'\b(\d{1,3})[\.\)]?\s*[\(\[]\s*([a-eA-E])\s*[\)\]]')
# Adda247 house style: "S12. Ans. (c)" followed by "Sol. <explanation>".
ADDA_SOLUTION = re.compile(
    r'(?m)^[ \t]*S\.?\s*(\d{1,3})[\.\)]\s*(?:Ans(?:wer)?[\s\.:\-]*)?[\(\[]\s*([a-eA-E])\s*[\)\]]'
)
# Two-column answer tables that flatten to "<number>\n<letter>" pairs.
ANSWER_TABLE_PAIR = re.compile(r'(?m)^[ \t]*(\d{1,3})[ \t]*\n[ \t]*([A-Ea-e])[ \t]*$')

# Companion answer-key documents (Prepp publishes the paper and its key as two
# separate PDFs) use a couple of further shapes:
#   "1. Ans. A" / "12. Answer: C"  — no brackets around the letter.
NUMBERED_ANSWER_LINE = re.compile(
    r'(?m)^[ \t]*(\d{1,3})[\.\)]\s*Ans(?:wer)?[\s\.:\-]*[\(\[]?\s*([a-eA-E])\s*[\)\]]?'
)
#   A "Question No / Option" grid whose options are digits: 1-4 rather than a-d.
ANSWER_TABLE_NUMERIC = re.compile(r'(?m)^[ \t]*(\d{1,3})[ \t]*\n[ \t]*([1-5])[ \t]*$')
NUMERIC_GRID_HEADER = re.compile(r'(?i)question\s*no.{0,40}option')

# Lines that are page furniture rather than content.
NOISE_LINE = re.compile(
    r'^\s*(?:page\s*\d+|\d+\s*\|\s*page|www\.[^\s]+|https?://\S+|[-—_=\s]{3,})\s*$'
    r'|adda247|bankersadda|sscadda|careerpower|byju|oswaal|edutap|disha\s*publication|testbook|prepp\b',
    re.I,
)


@dataclass
class ParsedQuestion:
    number: int
    question_text: str
    options: list[str]
    correct_option: int  # -1 when unknown
    subject: str
    topic_id: str
    difficulty: str
    year: int | None = None
    explanation: str = ''
    warnings: list[str] = field(default_factory=list)


def clean_text(raw: str) -> str:
    """Collapse PDF whitespace artifacts and drop page furniture."""
    text = raw.replace('­', '').replace('﻿', '')
    text = re.sub(r'[ \t ]+', ' ', text)
    lines = [ln.rstrip() for ln in text.split('\n')]
    kept = [ln for ln in lines if not NOISE_LINE.search(ln)]
    text = '\n'.join(kept)
    # A hyphen at end-of-line is a PDF line-break hyphenation, not a real hyphen.
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)
    return text


SECTION_MARKER = re.compile(
    r'(?m)^[ \t]*(?:ANSWER\s*KEYS?|ANSWERS?\s*(?:&|AND)?\s*(?:EXPLANATIONS?|SOLUTIONS?)?'
    r'|SOLUTIONS?|HINTS?\s*(?:&|AND)\s*(?:SOLUTIONS?|EXPLANATIONS?)|EXPLANATIONS?)\s*:?\s*$',
    re.I,
)


def split_questions_and_solutions(text: str) -> tuple[str, str]:
    """Most papers append an answer-key/solutions section. Split it off so the
    numbered solution entries are not mistaken for numbered questions, and so
    answer-key grids are never scraped out of the question body itself."""
    candidates = [m.start() for m in SECTION_MARKER.finditer(text) if m.start() > len(text) * 0.15]

    # Some papers print the heading only as a repeated running header partway
    # into the solutions. Anchor instead on the earliest sustained run of
    # "N. (letter)" solution entries, which is where the section really begins.
    entries = list(SOLUTION_LINE.finditer(text))
    if len(entries) >= 10:
        run_start, run_len = None, 0
        previous = None
        for m in entries:
            num = int(m.group(1))
            if previous is not None and 0 < num - previous <= 3:
                run_len += 1
            else:
                run_start, run_len = m.start(), 1
            previous = num
            if run_len >= 10 and run_start is not None and run_start > len(text) * 0.15:
                candidates.append(run_start)
                break

    if not candidates:
        return text, ''
    split_at = min(candidates)
    return text[:split_at], text[split_at:]


def build_answer_map(solutions_text: str, whole_text: str) -> tuple[dict[int, str], dict[int, str]]:
    """Return (question number -> answer letter, question number -> explanation)."""
    answers: dict[int, str] = {}
    explanations: dict[int, str] = {}

    def absorb_numbered(source: str, pattern: re.Pattern, body_group: int | None) -> None:
        """Record answers (and explanations, when the pattern captures a body)
        from a numbered solutions listing."""
        entries = list(pattern.finditer(source))
        for i, m in enumerate(entries):
            num = int(m.group(1))
            answers.setdefault(num, m.group(2).lower())
            end = entries[i + 1].start() if i + 1 < len(entries) else len(source)
            head = m.group(body_group) if body_group else ''
            body = (head + '\n' + source[m.end():end]).strip()
            body = re.sub(r'(?im)^\s*Sol(?:ution)?[\s\.:\-]*', '', body)
            body = re.sub(r'\s+', ' ', body).strip()
            if body and num not in explanations:
                explanations[num] = body[:2000]

    # Order matters: `setdefault` means the first pattern to claim a question
    # number wins, so these run strictly most-explicit first. Getting this
    # backwards silently records wrong answers — an ambiguous bare
    # "<number>\n<letter>" pair used to outrank an explicit "1. Ans. A".

    # 1. "1. Ans. A" — an unambiguous statement of the answer. Used by
    #    standalone answer-key documents.
    if solutions_text:
        absorb_numbered(solutions_text, NUMBERED_ANSWER_LINE, None)

        # 2. "1. (b) <explanation>" numbered solutions.
        absorb_numbered(solutions_text, SOLUTION_LINE, 3)

    # 3. Adda247-style "S12. Ans. (c) / Sol. …" blocks are usually interleaved
    #    with the questions rather than sitting behind a SOLUTIONS heading. The
    #    "S" prefix makes them unambiguous, so scanning the whole document is safe.
    absorb_numbered(whole_text, ADDA_SOLUTION, None)

    if solutions_text:
        # 4. Dense answer-key grids ("1. (b) 2. (c) 3. (a) …"), no explanations.
        for m in ANSWER_KEY_PAIR.finditer(solutions_text):
            answers.setdefault(int(m.group(1)), m.group(2).lower())

        # 5. "Question No | Option" grids number their options 1-4 instead of
        #    a-d. Gated on the grid header so a bare "<number>\n<digit>" in a
        #    question body (a number series, say) is never read as an answer.
        if NUMERIC_GRID_HEADER.search(solutions_text):
            for num, digit in ANSWER_TABLE_NUMERIC.findall(solutions_text):
                index = int(digit) - 1
                if 0 <= index < len(OPTION_LETTERS):
                    answers.setdefault(int(num), OPTION_LETTERS[index])

        # 6. Weakest signal, so it goes last: column answer tables that flatten
        #    to alternating number/letter lines. A bare "<number>\n<letter>" is
        #    only meaningful inside a dedicated answer section — in a question
        #    body it matches a question number sitting above its option (a).
        table_pairs = ANSWER_TABLE_PAIR.findall(solutions_text)
        if len(table_pairs) >= 10:
            for num, letter in table_pairs:
                answers.setdefault(int(num), letter.lower())

    return answers, explanations


def _compile_keyword(keyword: str) -> re.Pattern:
    """Match a keyword on word boundaries. Plain substring matching silently
    misfires on short maths tokens — 'sin' inside "using", 'sec' inside
    "second", 'tan' inside "distance" — which mislabels whole papers."""
    escaped = re.escape(keyword)
    left = r'\b' if keyword[0].isalnum() else ''
    right = r'\b' if keyword[-1].isalnum() else ''
    return re.compile(left + escaped + right, re.I)


_KEYWORD_PATTERNS: dict[str, list[tuple[re.Pattern, int]]] = {
    topic_id: [(_compile_keyword(kw), weight) for kw, weight in keywords]
    for topic_id, keywords in TOPIC_KEYWORDS.items()
}


def _score_topic(text: str) -> tuple[str, int]:
    best_topic, best_score = '', 0
    for topic_id, patterns in _KEYWORD_PATTERNS.items():
        score = sum(weight for pattern, weight in patterns if pattern.search(text))
        if score > best_score:
            best_topic, best_score = topic_id, score
    return best_topic, best_score


def classify(question_text: str, options: list[str], section_subject: str | None) -> tuple[str, str]:
    """Return (subject, topic_id) using keyword scoring, with the paper's current
    section heading as a tie-breaker."""
    blob = question_text + ' ' + ' '.join(options)
    topic_id, score = _score_topic(blob)

    if topic_id and score >= 3:
        subject = TOPICS[topic_id][1]
        # A confident keyword hit that contradicts the section heading usually
        # means the heading was stale; trust the keywords unless the score is weak.
        if section_subject and subject != section_subject and score < 5:
            fallback = _default_topic_for(section_subject)
            return section_subject, fallback
        return subject, topic_id

    if section_subject:
        return section_subject, _default_topic_for(section_subject)

    return 'General Awareness', 'ga_static'


def _default_topic_for(subject: str) -> str:
    defaults = {
        'Quantitative Aptitude': 'qa_number',
        'Reasoning': 'lr_classification',
        'English': 'en_vocab',
        'General Awareness': 'ga_static',
        'Finance & Economics': 'fe_banking',
    }
    return defaults.get(subject, 'ga_static')


def estimate_difficulty(question_text: str, topic_id: str) -> str:
    """Length and topic are the only signals available without an answer model.
    Long multi-step quantitative items skew hard; short recall items skew easy."""
    length = len(question_text)
    hard_topics = {'qa_trigonometry', 'qa_algebra', 'qa_geometry', 'qa_di', 'lr_syllogism'}
    easy_topics = {'en_vocab', 'en_idiom', 'ga_static', 'lr_analogy'}

    if length > 320 or topic_id in hard_topics and length > 180:
        return 'hard'
    if length < 90 and topic_id in easy_topics:
        return 'easy'
    return 'medium'


def _extract_options(block: str) -> tuple[str, list[str]]:
    """Split a question block into its stem and its option texts."""
    tokens = []
    for m in OPTION_TOKEN.finditer(block):
        letter = (m.group(1) or m.group(2)).lower()
        tokens.append((m.start(), m.end(), letter))
    if not tokens:
        return block.strip(), []

    # Keep only the first ascending run a, b, c, … — bracketed letters inside the
    # stem (e.g. "statement (a) above") otherwise corrupt the split.
    run: list[tuple[int, int, str]] = []
    expected = 0
    for start, end, letter in tokens:
        if letter == OPTION_LETTERS[expected]:
            run.append((start, end, letter))
            expected += 1
            if expected >= len(OPTION_LETTERS):
                break
        elif expected > 0 and letter == OPTION_LETTERS[0] and len(run) < 2:
            run = [(start, end, letter)]
            expected = 1
    if len(run) < 2:
        return block.strip(), []

    stem = block[:run[0][0]].strip()
    options = []
    for i, (_, end, _) in enumerate(run):
        stop = run[i + 1][0] if i + 1 < len(run) else len(block)
        options.append(re.sub(r'\s+', ' ', block[end:stop]).strip(' .;'))
    return stem, options


def parse_paper(raw_text: str, answer_text: str | None = None) -> list[ParsedQuestion]:
    """Parse a paper. `answer_text` is the raw text of a companion answer-key
    PDF, for sources that publish the paper and its key as two documents."""
    text = clean_text(raw_text)
    _, solutions = split_questions_and_solutions(text)

    if answer_text:
        # Prefer the dedicated key document, then still fall back to anything
        # the paper itself carries.
        key_text = clean_text(answer_text)
        answers, explanations = build_answer_map(key_text, key_text)
        own_answers, own_explanations = build_answer_map(solutions, text)
        for num, letter in own_answers.items():
            answers.setdefault(num, letter)
        for num, body in own_explanations.items():
            explanations.setdefault(num, body)
    else:
        answers, explanations = build_answer_map(solutions, text)

    # Scan the whole document for questions, not just the part before the first
    # solutions block. Aggregator PYQ books interleave questions and solutions
    # once per exam year, so splitting on the first solutions run discarded
    # every year after the first — two thirds of a typical book. Solution
    # entries are filtered out below instead: "11. (c) Because…" has no stem
    # before its first option, so the stem-length guard rejects it.
    body = text
    section_positions = _find_sections(body)
    year_positions = find_paper_years(body)
    starts = list(QUESTION_START.finditer(body))
    parsed: list[ParsedQuestion] = []
    # Question numbers restart in each year's section, so a number alone can no
    # longer identify a duplicate — key on the stem as well.
    seen: set[tuple[int, str]] = set()

    for i, m in enumerate(starts):
        number = int(m.group(1))
        end = starts[i + 1].start() if i + 1 < len(starts) else len(body)
        block = body[m.end():end]

        section_subject = _section_at(section_positions, m.start())

        stem, options = _extract_options(block)
        stem = re.sub(r'\s+', ' ', stem).strip()

        if len(stem) < 12 or len(options) < 2:
            continue
        key = (number, stem[:60].lower())
        if key in seen:
            continue
        seen.add(key)

        letter = None
        inline = INLINE_ANSWER.search(block)
        if inline:
            letter = inline.group(1).lower()
            stem = INLINE_ANSWER.sub('', stem).strip()
        elif number in answers:
            letter = answers[number]

        correct = OPTION_LETTERS.index(letter) if letter and letter in OPTION_LETTERS else -1
        if correct >= len(options):
            correct = -1

        subject, topic_id = classify(stem, options, section_subject)
        question = ParsedQuestion(
            number=number,
            question_text=stem,
            options=options,
            correct_option=correct,
            subject=subject,
            topic_id=topic_id,
            difficulty=estimate_difficulty(stem, topic_id),
            year=year_at(year_positions, m.start()),
            explanation=explanations.get(number, ''),
        )
        if correct == -1:
            question.warnings.append('no answer key found')
        parsed.append(question)

    return parsed
