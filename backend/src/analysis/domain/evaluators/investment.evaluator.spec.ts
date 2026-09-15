import { InvestmentEvaluator } from './investment.evaluator.js';
import { Rating, Decision } from '../types/analysis-result.type.js';
import {
  ROI_THRESHOLDS,
  CAP_RATE_THRESHOLDS,
} from '../../../shared/constants/thresholds.constants.js';
import type {
  ProfitabilityMetrics,
  QualitativeResult,
} from '../types/analysis-result.type.js';

describe('InvestmentEvaluator', () => {
  let evaluator: InvestmentEvaluator;

  beforeEach(() => {
    evaluator = new InvestmentEvaluator();
  });

  const makeProfitability = (
    roi: number,
    capRate: number,
  ): ProfitabilityMetrics => ({
    projectedSalePrice: 300_000_000,
    grossProfit: 50_000_000,
    roi,
    annualRentalIncome: 18_000_000,
    capRate,
  });

  const makeQualitative = (rating: Rating): QualitativeResult => ({
    scores: {},
    average:
      rating === Rating.EXCELENTE ? 3 : rating === Rating.BUENA ? 2 : 0.5,
    rating,
  });

  it('should recommend comprar for excellent ROI and good zone', () => {
    const result = evaluator.evaluate(
      makeProfitability(28, 9),
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
      makeProfitability(18, 6),
      makeQualitative(Rating.BUENA),
    );

    expect(result.decision).toBe(Decision.EVALUAR);
    expect(result.roiRating).toBe(Rating.BUENA);
  });

  it('should recommend no_recomendable for risky zone', () => {
    const result = evaluator.evaluate(
      makeProfitability(18, 6),
      makeQualitative(Rating.RIESGOSA),
    );

    expect(result.decision).toBe(Decision.NO_RECOMENDABLE);
  });

  it('should generate recommendations', () => {
    const result = evaluator.evaluate(
      {
        projectedSalePrice: 100_000_000,
        grossProfit: -10_000_000,
        roi: -5,
        annualRentalIncome: 6_000_000,
        capRate: 3,
      },
      makeQualitative(Rating.RIESGOSA),
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.some((r) => r.includes('ALERTA'))).toBe(true);
  });
  // Estos casos leen los umbrales de la constante, de modo que si alguien los
  // vuelve a mover el test sigue siendo valido y no queda desincronizado.
  describe('umbrales de ROI', () => {
    it('rates exactly the excellent threshold as excelente', () => {
      const result = evaluator.evaluate(
        makeProfitability(ROI_THRESHOLDS.EXCELLENT, 9),
        makeQualitative(Rating.BUENA),
      );

      expect(result.roiRating).toBe(Rating.EXCELENTE);
      expect(result.decision).toBe(Decision.COMPRAR);
    });

    it('rates just below the excellent threshold as buena', () => {
      const result = evaluator.evaluate(
        makeProfitability(ROI_THRESHOLDS.EXCELLENT - 0.01, 6),
        makeQualitative(Rating.BUENA),
      );

      expect(result.roiRating).toBe(Rating.BUENA);
      expect(result.decision).toBe(Decision.EVALUAR);
    });

    it('rates exactly the good threshold as buena', () => {
      const result = evaluator.evaluate(
        makeProfitability(ROI_THRESHOLDS.GOOD, 6),
        makeQualitative(Rating.BUENA),
      );

      expect(result.roiRating).toBe(Rating.BUENA);
    });

    it('rates just below the good threshold as riesgosa', () => {
      const result = evaluator.evaluate(
        makeProfitability(ROI_THRESHOLDS.GOOD - 0.01, 6),
        makeQualitative(Rating.BUENA),
      );

      expect(result.roiRating).toBe(Rating.RIESGOSA);
      expect(result.decision).toBe(Decision.NO_RECOMENDABLE);
    });
  });

  describe('umbrales de Cap Rate', () => {
    it('rates exactly the excellent threshold as excelente', () => {
      const result = evaluator.evaluate(
        makeProfitability(28, CAP_RATE_THRESHOLDS.EXCELLENT),
        makeQualitative(Rating.BUENA),
      );

      expect(result.capRateRating).toBe(Rating.EXCELENTE);
    });

    it('rates exactly the good threshold as buena', () => {
      const result = evaluator.evaluate(
        makeProfitability(28, CAP_RATE_THRESHOLDS.GOOD),
        makeQualitative(Rating.BUENA),
      );

      expect(result.capRateRating).toBe(Rating.BUENA);
    });

    it('rates just below the good threshold as riesgosa', () => {
      const result = evaluator.evaluate(
        makeProfitability(28, CAP_RATE_THRESHOLDS.GOOD - 0.01),
        makeQualitative(Rating.BUENA),
      );

      expect(result.capRateRating).toBe(Rating.RIESGOSA);
    });
  });

  it('does not let a risky cap rate block the buy decision', () => {
    // La decision solo depende de ROI y zona: el arriendo es el plan B.
    const result = evaluator.evaluate(
      makeProfitability(30, 1),
      makeQualitative(Rating.EXCELENTE),
    );

    expect(result.capRateRating).toBe(Rating.RIESGOSA);
    expect(result.decision).toBe(Decision.COMPRAR);
  });
});
