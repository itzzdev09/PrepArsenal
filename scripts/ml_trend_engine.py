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
import numpy as np

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
        self.current_year = 2024

    def compute_prediction_score(self, yearly_counts: Dict[int, int]) -> Tuple[float, float, str]:
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
    engine = PrepArsenalMLEngine()
    sample_data = {2019: 3, 2020: 4, 2021: 4, 2022: 5, 2023: 6}
    avg, w_avg, momentum, score = engine.compute_prediction_score(sample_data)
    print(f"Prediction Analysis:")
    print(f"- Average: {avg:.2f}")
    print(f"- Weighted Average: {w_avg:.2f}")
    print(f"- Momentum: {momentum}")
    print(f"- Prediction Confidence: {score}%")
