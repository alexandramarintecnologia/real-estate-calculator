import { Injectable } from '@nestjs/common';
import {
  Rating,
  Decision,
  type InvestmentEvaluation,
  type ProfitabilityMetrics,
  type QualitativeResult,
} from '../types/analysis-result.type.js';
import {
  ROI_THRESHOLDS,
  CAP_RATE_THRESHOLDS,
} from '../../../shared/constants/thresholds.constants.js';

@Injectable()
export class InvestmentEvaluator {
  evaluate(
    profitability: ProfitabilityMetrics,
    qualitative: QualitativeResult,
  ): InvestmentEvaluation {
    const roiRating = this.rateRoi(profitability.roi);
    const capRateRating = this.rateCapRate(profitability.capRate);
    const zoneRating = qualitative.rating;

    const overallRating = this.computeOverallRating(
      roiRating,
      capRateRating,
      zoneRating,
    );
    const decision = this.computeDecision(roiRating, zoneRating);
    const recommendations = this.buildRecommendations(
      profitability,
      roiRating,
      capRateRating,
      zoneRating,
    );

    return {
      roiRating,
      capRateRating,
      zoneRating,
      overallRating,
      decision,
      recommendations,
    };
  }

  private rateRoi(roi: number): Rating {
    if (roi >= ROI_THRESHOLDS.EXCELLENT) return Rating.EXCELENTE;
    if (roi >= ROI_THRESHOLDS.GOOD) return Rating.BUENA;
    return Rating.RIESGOSA;
  }

  private rateCapRate(capRate: number): Rating {
    if (capRate >= CAP_RATE_THRESHOLDS.EXCELLENT) return Rating.EXCELENTE;
    if (capRate >= CAP_RATE_THRESHOLDS.GOOD) return Rating.BUENA;
    return Rating.RIESGOSA;
  }

  private computeOverallRating(
    roi: Rating,
    capRate: Rating,
    zone: Rating,
  ): Rating {
    const ratings = [roi, capRate, zone];
    const scores = ratings.map((r) => this.ratingToScore(r));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avg >= 2.5) return Rating.EXCELENTE;
    if (avg >= 1.5) return Rating.BUENA;
    return Rating.RIESGOSA;
  }

  private computeDecision(roiRating: Rating, zoneRating: Rating): Decision {
    if (roiRating === Rating.EXCELENTE && zoneRating !== Rating.RIESGOSA) {
      return Decision.COMPRAR;
    }
    if (roiRating === Rating.RIESGOSA || zoneRating === Rating.RIESGOSA) {
      return Decision.NO_RECOMENDABLE;
    }
    return Decision.EVALUAR;
  }

  private buildRecommendations(
    profitability: ProfitabilityMetrics,
    roiRating: Rating,
    capRateRating: Rating,
    zoneRating: Rating,
  ): string[] {
    const recs: string[] = [];

    if (roiRating === Rating.EXCELENTE) {
      recs.push(
        `ROI de ${profitability.roi}% — Excelente retorno de inversión.`,
      );
    } else if (roiRating === Rating.BUENA) {
      recs.push(
        `ROI de ${profitability.roi}% — Retorno aceptable. Evalúa si puedes negociar un mejor precio de compra.`,
      );
    } else {
      recs.push(
        `ROI de ${profitability.roi}% — Retorno bajo. Considera renegociar el precio o buscar otra propiedad.`,
      );
    }

    if (capRateRating === Rating.EXCELENTE) {
      recs.push(
        `Cap Rate de ${profitability.capRate}% — Excelente rentabilidad por arriendo.`,
      );
    } else if (capRateRating === Rating.BUENA) {
      recs.push(
        `Cap Rate de ${profitability.capRate}% — Rentabilidad por arriendo aceptable.`,
      );
    } else {
      recs.push(
        `Cap Rate de ${profitability.capRate}% — Baja rentabilidad por arriendo. El plan B de arrendar podría no ser viable.`,
      );
    }

    if (zoneRating === Rating.RIESGOSA) {
      recs.push(
        'La zona no cumple con los estándares mínimos. Revisa entorno, seguridad y accesibilidad.',
      );
    } else if (zoneRating === Rating.EXCELENTE) {
      recs.push(
        'La zona tiene excelentes condiciones de entorno, accesibilidad y servicios.',
      );
    }

    if (profitability.grossProfit < 0) {
      recs.push(
        'ALERTA: La ganancia bruta proyectada es negativa. Este proyecto generaría pérdidas.',
      );
    }

    return recs;
  }

  private ratingToScore(rating: Rating): number {
    switch (rating) {
      case Rating.EXCELENTE:
        return 3;
      case Rating.BUENA:
        return 2;
      case Rating.RIESGOSA:
        return 1;
    }
  }
}
