import { type InvestmentEvaluation, type ProfitabilityMetrics, type QualitativeResult } from '../types/analysis-result.type.js';
export declare class InvestmentEvaluator {
    evaluate(profitability: ProfitabilityMetrics, qualitative: QualitativeResult): InvestmentEvaluation;
    private rateRoi;
    private rateCapRate;
    private computeOverallRating;
    private computeDecision;
    private buildRecommendations;
    private ratingToScore;
}
