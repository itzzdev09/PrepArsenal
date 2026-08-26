"""
PrepArsenal — ML Trend Prediction Engine & Topic Analysis Pipeline

Features:
1. Time-Series Topic Frequency Analysis across 10 years of exams
2. Exponential Recency Weighting (higher weight to shifts in last 3-5 years)
3. Cross-Exam Overlap & Shared Topic Graph (SSC CGL <-> RRB <-> RBI <-> UPSC APFO)
4. Difficulty Drift Calculation (Categorical transition probabilities)
5. Exam Paper Predictor Score (Statistical probability of topic occurrence)
"""

from dataclasses import dataclass
from typing import Dict, List, Tuple
from collections import Counter, defaultdict
from datetime import datetime
import numpy as np
from db_client import get_db_client

# A priority needs evidence from at least three separate exam years.  This is
# deliberately measured at paper level, rather than requiring the *same* topic
# to occur in every year: a topic absent from a paper is meaningful zero data.
MIN_PYQ_YEARS = 3
MIN_TOPIC_OCCURRENCE_YEARS = 2
# A handful of hand-curated questions can validate provenance, but cannot
# estimate paper frequency. Wait for a meaningful extraction before labelling
# anything "high priority" to students.
MIN_VERIFIED_PYQS_PER_EXAM = 50
MIN_VERIFIED_PYQS_PER_YEAR = 15

@dataclass
class TopicTrendResult:
    topic_id: str
    topic_name: str
    subject: str
    exam_code: str
    yearly_counts: Dict[int, int]
    avg_questions_per_year: float
    recency_weighted_avg: float
    prediction_score: float # 0.0 to 100.0%
    difficulty_trend: str # 'easier', 'stable', 'harder'
    momentum_direction: str # 'rising', 'stable', 'falling'

class PrepArsenalMLEngine:
    def __init__(self, decay_rate: float = 0.25):
        """
        decay_rate: Exponential decay rate lambda for recency weighting.
        weight(t) = exp(-lambda * (current_year - t))
        """
        self.decay_rate = decay_rate
        self.current_year = datetime.now().year

    def compute_prediction_score(
        self,
        yearly_counts: Dict[int, int],
        yearly_totals: Dict[int, int] | None = None,
    ) -> Tuple[float, float, str, float]:
        """
        Computes predictive confidence score using exponential weighted moving average (EWMA)
        and momentum slope.

        `yearly_totals` is the number of questions extracted for that exam in
        each year. Scoring uses the topic's *share* of the paper rather than its
        raw count, so the score means the same thing whether 40 or 400 questions
        were extracted from a given year. Scoring on raw counts made the result
        a function of extraction volume: once the pool grew, most topics pinned
        at the 99 ceiling and the ranking carried no information.
        """
        years = sorted(yearly_counts.keys())
        if not years:
            return 0.0, 0.0, "stable", 0.0

        counts = np.array([yearly_counts[y] for y in years], dtype=float)
        years_arr = np.array(years, dtype=float)

        # 1. Standard Average
        avg_freq = float(np.mean(counts))

        # 2. Exponential Recency Weights
        time_deltas = self.current_year - years_arr
        weights = np.exp(-self.decay_rate * time_deltas)
        weights /= np.sum(weights)

        weighted_avg = float(np.sum(counts * weights))

        # 3. Momentum & Trend (Linear regression slope on recent 5 years)
        if len(years) >= 3:
            recent_years = years_arr[-5:]
            recent_counts = counts[-5:]
            slope, _ = np.polyfit(recent_years, recent_counts, 1)
        else:
            slope = 0.0

        if slope > 0.3:
            momentum = "rising"
        elif slope < -0.3:
            momentum = "falling"
        else:
            momentum = "stable"

        # 4. Normalized Prediction Score (0 - 100%)
        # Score the topic's recency-weighted share of the paper, so the value is
        # independent of how many questions were extracted per year.
        totals = yearly_totals or {}
        shares = np.array(
            [yearly_counts[y] / totals[y] if totals.get(y) else 0.0 for y in years],
            dtype=float,
        )
        weighted_share = float(np.sum(shares * weights))

        consistency = np.count_nonzero(counts) / len(counts)  # Fraction of years it appeared

        # Saturating curve: a topic holding ~6% of a paper scores ~63 before the
        # consistency factor, ~15% scores ~92. It approaches but never reaches
        # 100, so strong topics stay separable instead of all clipping together.
        SHARE_SCALE = 0.06
        base_score = 99.0 * (1.0 - float(np.exp(-weighted_share / SHARE_SCALE))) * consistency

        # Momentum adjustment (+- ~12%)
        if momentum == "rising":
            base_score *= 1.12
        elif momentum == "falling":
            base_score *= 0.88

        prediction_score = round(float(np.clip(base_score, 1.0, 99.0)), 1)

        return avg_freq, weighted_avg, momentum, prediction_score

    def analyze_difficulty_trend(self, historical_difficulties: List[Dict[str, any]]) -> str:
        """
        Computes if question difficulty is drifting easier/harder over time.
        historical_difficulties: [{'year': 2019, 'difficulty': 'easy'}, ...]

        NOT WRITTEN TO trend_analytics, and not surfaced in the UI. The
        per-question `difficulty` this reads is assigned by
        pyq_parser.estimate_difficulty, which only looks at question text length
        plus a hardcoded topic list — it measures verbosity, not difficulty. A
        drift-over-time claim built on that is not defensible to a student, so
        the "Getting Harder" card was replaced by a Rising Topics card computed
        from real question counts.

        Kept for reference: it becomes meaningful once difficulty comes from
        observed student accuracy (the IRT/adaptive path) rather than a text
        heuristic. Wire it back in then.
        """
        diff_map = {'easy': 1, 'medium': 2, 'hard': 3}
        if not historical_difficulties:
            return 'stable'

        sorted_items = sorted(historical_difficulties, key=lambda x: x['year'])
        scores = [diff_map.get(x['difficulty'], 2) for x in sorted_items]

        if len(scores) < 3:
            return 'stable'

        # Compare early half vs recent half
        mid = len(scores) // 2
        early_avg = np.mean(scores[:mid])
        recent_avg = np.mean(scores[mid:])

        if recent_avg - early_avg >= 0.4:
            return 'harder'
        elif early_avg - recent_avg >= 0.4:
            return 'easier'
        return 'stable'

if __name__ == "__main__":
    print("Initializing PrepArsenal ML Trend Engine...")
    db = get_db_client()
    engine = PrepArsenalMLEngine()
    
    try:
        print("Fetching questions from database...")
        questions = []
        page_size = 1000
        offset = 0
        while True:
            page = db.table('questions').select('exam_code, topic_id, year, difficulty, metadata') \
                .range(offset, offset + page_size - 1).execute().data or []
            questions.extend(page)
            if len(page) < page_size:
                break
            offset += page_size
        
        if not questions:
            print("No questions found in database. Run dataset_harvester.py first.")
            exit(0)
            
        # A question counts towards trends when it was transcribed from a real
        # paper with a confirmed answer key. `is_verified_pyq` already encodes
        # that at import time, so it is the primary gate; the source_type
        # exclusion list keeps recalled and editorially written items out even
        # if a future importer sets the flag too generously.
        #
        # This deliberately does NOT test `source_type == 'pyq'`. Only the
        # curated importer used that literal value — the PDF pipeline records
        # the actual provenance ('third_party', 'official', 'memory_based'), so
        # an equality check silently excluded every pipeline-imported question.
        NON_PAPER_SOURCES = {'memory_based', 'expert_authored', 'benchmark', 'synthetic'}
        verified_pyqs = [
            question for question in questions
            if (question.get('metadata') or {}).get('is_verified_pyq') is True
            and (question.get('metadata') or {}).get('source_type') not in NON_PAPER_SOURCES
        ]

        print(f"Found {len(questions)} total questions and {len(verified_pyqs)} verified PYQs.")

        # 'recollected' means an aggregator compiled a full paper from candidate
        # recall and published it with an answer key. It is weaker evidence than
        # an officially released paper, but it is whole-paper evidence, and topic
        # frequency is robust to individual recall errors — so it counts here,
        # unlike single-shift 'memory_based' dumps. Surface the mix so the split
        # is visible rather than buried.
        source_mix = Counter(
            (question.get('metadata') or {}).get('source_type') for question in verified_pyqs
        )
        print(f"  provenance of counted questions: {dict(source_mix)}")

        if not verified_pyqs:
            # Clear obsolete predictions so benchmark/demo data can never appear
            # as a PYQ trend.
            db.table('trend_analytics').delete().not_.is_('id', 'null').execute()
            print("No verified PYQs found. Trends were cleared; import verified PYQs before running predictions.")
            exit(0)

        print(f"Analyzing {len(verified_pyqs)} verified PYQs...")
        topic_rows = db.table('topics').select('id, name, subject').execute().data or []
        topic_catalog = {topic['id']: topic for topic in topic_rows}
        
        # Determine the eligible paper history for every exam first.  A topic
        # can then be scored over the full history, including years in which it
        # did not occur, instead of inflating a one-off question into a trend.
        exam_years = defaultdict(set)
        for q in verified_pyqs:
            exam_years[q['exam_code']].add(q['year'])

        verified_counts_by_exam = defaultdict(int)
        for q in verified_pyqs:
            verified_counts_by_exam[q['exam_code']] += 1

        verified_counts_by_exam_year = defaultdict(lambda: defaultdict(int))
        for q in verified_pyqs:
            verified_counts_by_exam_year[q['exam_code']][q['year']] += 1

        eligible_exam_years = {}
        for exam_code, years in exam_years.items():
            years_with_usable_coverage = sorted(
                year for year in years
                if verified_counts_by_exam_year[exam_code][year] >= MIN_VERIFIED_PYQS_PER_YEAR
            )
            if (
                len(years_with_usable_coverage) >= MIN_PYQ_YEARS
                and verified_counts_by_exam[exam_code] >= MIN_VERIFIED_PYQS_PER_EXAM
            ):
                eligible_exam_years[exam_code] = years_with_usable_coverage
        skipped_exams = sorted(set(exam_years) - set(eligible_exam_years))
        if skipped_exams:
            print(
                f'Waiting for {MIN_PYQ_YEARS} source-attributed PYQ years with at least '
                f'{MIN_VERIFIED_PYQS_PER_YEAR} questions each, and '
                f'{MIN_VERIFIED_PYQS_PER_EXAM} total extracted questions for: '
                + ', '.join(skipped_exams)
            )

        # Group by (exam_code, topic_id)
        topic_data = defaultdict(lambda: {
            'yearly_counts': defaultdict(int),
            'difficulties': []
        })
        
        for q in verified_pyqs:
            topic_id = q.get('topic_id')
            if not topic_id or topic_id not in topic_catalog:
                print(f"Skipping verified PYQ with an unknown topic: {topic_id}")
                continue
            if q['exam_code'] not in eligible_exam_years:
                continue
            key = (q['exam_code'], topic_id)
            topic_data[key]['yearly_counts'][q['year']] += 1
            if q.get('difficulty'):
                topic_data[key]['difficulties'].append({'year': q['year'], 'difficulty': q['difficulty']})
                
        results = []
        for (exam_code, topic_id), data in topic_data.items():
            yearly_counts = {
                year: data['yearly_counts'].get(year, 0)
                for year in eligible_exam_years[exam_code]
            }
            occurrence_years = sum(count > 0 for count in yearly_counts.values())
            if occurrence_years < MIN_TOPIC_OCCURRENCE_YEARS:
                print(
                    f"Skipping {exam_code}/{topic_id}: only appears in "
                    f"{occurrence_years} of {len(yearly_counts)} eligible PYQ years."
                )
                continue

            yearly_totals = {
                year: verified_counts_by_exam_year[exam_code][year]
                for year in eligible_exam_years[exam_code]
            }
            avg, w_avg, momentum, score = engine.compute_prediction_score(yearly_counts, yearly_totals)

            # difficulty_trend is deliberately not written — see
            # analyze_difficulty_trend's docstring. The column keeps its
            # 'stable' default until difficulty comes from real student data.
            trend_record = {
                'exam_code': exam_code,
                'topic_id': topic_id,
                'yearly_frequencies': yearly_counts,
                'prediction_score': score,
                'avg_questions_per_year': round(avg, 2),
                'recency_weight_score': round(w_avg, 2)
            }
            results.append(trend_record)
            
        print(f"Computed trends for {len(results)} verified PYQ topics. Updating database...")

        # Write the new predictions first, then prune whatever the previous run
        # left behind. Deleting up front meant a failed upsert (e.g. a numeric
        # overflow) wiped the table and left the app with no trends at all.
        if results:
            try:
                db.table('trend_analytics').upsert(results, on_conflict='exam_code, topic_id').execute()
            except Exception as upsert_error:
                # avg_questions_per_year / recency_weight_score are NUMERIC(4,2)
                # in older deployments and overflow once an exam averages 100+
                # questions per year for a topic. Neither column is read by the
                # app, so fall back to writing the scores the UI actually uses
                # rather than losing the whole run.
                # Permanent fix: supabase/widen_trend_analytics_numerics.sql
                if '22003' not in str(upsert_error) and 'overflow' not in str(upsert_error).lower():
                    raise
                print(
                    'WARNING: trend_analytics numeric columns are too narrow for the current '
                    'question volume. Writing prediction scores only.\n'
                    '         Run supabase/widen_trend_analytics_numerics.sql to restore '
                    'avg_questions_per_year / recency_weight_score.'
                )
                trimmed = [
                    {k: v for k, v in r.items()
                     if k not in ('avg_questions_per_year', 'recency_weight_score')}
                    for r in results
                ]
                db.table('trend_analytics').upsert(trimmed, on_conflict='exam_code, topic_id').execute()

            fresh_keys = {(r['exam_code'], r['topic_id']) for r in results}
            existing = db.table('trend_analytics').select('id, exam_code, topic_id').execute().data or []
            stale = [
                row['id'] for row in existing
                if (row['exam_code'], row['topic_id']) not in fresh_keys
            ]
            for i in range(0, len(stale), 100):
                db.table('trend_analytics').delete().in_('id', stale[i:i + 100]).execute()
            if stale:
                print(f"Pruned {len(stale)} stale trend rows.")

        print("\n[SUCCESS] ML Trend Engine run completed successfully!")

    except Exception as e:
        # Exit non-zero: this runs unattended, and a swallowed failure previously
        # looked identical to a clean run.
        print(f"ML Engine Error: {e}")
        raise SystemExit(1)
