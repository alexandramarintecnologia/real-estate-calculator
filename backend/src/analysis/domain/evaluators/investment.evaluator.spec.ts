import { InvestmentEvaluator } from './investment.evaluator.js';
import { Rating, Decision } from '../types/analysis-result.type.js';
import type { ProfitabilityMetrics, QualitativeResult } from '../types/analysis-result.type.js';

describe('InvestmentEvaluator', () => {
  let evaluator: InvestmentEvaluator;

  beforeEach(() => {
    evaluator = new InvestmentEvaluator();
  });

  const makeProfitability = (roi: number, capRate: number): ProfitabilityMetrics => ({
    grossProfit: 50_000_000,
    roi,
    annualRentalIncome: 18_000_000,
    capRate,
  });

  const makeQualitative = (rating: Rating): QualitativeResult => ({
    scores: {} as any,
    average: rating === Rating.EXCELENTE ? 3 : rating === Rating.BUENA ? 2 : 0.5,
    rating,
  });

  it('should recommend comprar for excellent ROI and good zone', () => {
    const result = evaluator.evaluate(
      makeProfitability(20, 9),
      makeQualitative(Rating.BUENA),
    );

    expect(result.decision).toBe(Decision.COMPRAR);
    expect(result.roiRating).toBe(Rating.EXCELENTE);
  });

  it('should recommend no_recomendable for risky ROI', () => {
    const result = evaluator.evaluate(
      makeProfitability(3, 2),
      makeQualitative(Rating.BUENA),
    );

    expect(result.decision).toBe(Decision.NO_RECOMENDABLE);
    expect(result.roiRating).toBe(Rating.RIESGOSA);
  });

  it('should recommend evaluar for mixed results', () => {
    const result = evaluator.evaluate(
      makeProfitability(10, 6),
      makeQualitative(Rating.BUENA),
    );

    expect(result.decision).toBe(Decision.EVALUAR);
    expect(result.roiRating).toBe(Rating.BUENA);
  });

  it('should recommend no_recomendable for risky zone', () => {
    const result = evaluator.evaluate(
      makeProfitability(10, 6),
      makeQualitative(Rating.RIESGOSA),
    );

    expect(result.decision).toBe(Decision.NO_RECOMENDABLE);
  });

  it('should generate recommendations', () => {
    const result = evaluator.evaluate(
      { grossProfit: -10_000_000, roi: -5, annualRentalIncome: 6_000_000, capRate: 3 },
      makeQualitative(Rating.RIESGOSA),
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.some((r) => r.includes('ALERTA'))).toBe(true);
  });
});
