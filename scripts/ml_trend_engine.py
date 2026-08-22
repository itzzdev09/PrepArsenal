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
from collections import defaultdict
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

    def compute_prediction_score(self, yearly_counts: Dict[int, int]) -> Tuple[float, float, str, float]:
        """
        Computes predictive confidence score using exponential weighted moving average (EWMA)
        and momentum slope.
        """
        years = sorted(yearly_counts.keys())
        if not years:
            return 0.0, 0.0, "stable"

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
        # Base probability from occurrence consistency + weighted frequency + momentum boost
        consistency = np.count_nonzero(counts) / len(counts) # Percentage of years it appeared
        base_score = min(100.0, (weighted_avg * 18.0) * consistency)
        
        # Momentum adjustment (+- 10%)
        if momentum == "rising":
            base_score = min(99.0, base_score * 1.12)
        elif momentum == "falling":
            base_score = max(20.0, base_score * 0.88)

        prediction_score = round(float(np.clip(base_score, 10.0, 99.0)), 1)

        return avg_freq, weighted_avg, momentum, prediction_score

    def analyze_difficulty_trend(self, historical_difficulties: List[Dict[str, any]]) -> str:
        """
        Computes if question difficulty is drifting easier/harder over time.
        historical_difficulties: [{'year': 2019, 'difficulty': 'easy'}, ...]
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
            
        verified_pyqs = [
            question for question in questions
            if (question.get('metadata') or {}).get('source_type') == 'pyq'
            and (question.get('metadata') or {}).get('is_verified_pyq') is True
        ]

        print(f"Found {len(questions)} total questions and {len(verified_pyqs)} verified PYQs.")

        # Clear obsolete predictions so benchmark/demo data can never appear as a PYQ trend.
        db.table('trend_analytics').delete().not_.is_('id', 'null').execute()

        if not verified_pyqs:
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

            avg, w_avg, momentum, score = engine.compute_prediction_score(yearly_counts)
            diff_trend = engine.analyze_difficulty_trend(data['difficulties'])
            
            trend_record = {
                'exam_code': exam_code,
                'topic_id': topic_id,
                'yearly_frequencies': yearly_counts,
                'prediction_score': score,
                'difficulty_trend': diff_trend,
                'avg_questions_per_year': round(avg, 2),
                'recency_weight_score': round(w_avg, 2)
            }
            results.append(trend_record)
            
        print(f"Computed trends for {len(results)} verified PYQ topics. Updating database...")
        
        # Upsert trends
        if results:
            db.table('trend_analytics').upsert(results, on_conflict='exam_code, topic_id').execute()
        
        print("\n[SUCCESS] ML Trend Engine run completed successfully!")
        
    except Exception as e:
        print(f"ML Engine Error: {e}")
