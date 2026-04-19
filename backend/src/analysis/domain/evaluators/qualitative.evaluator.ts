import { Injectable } from '@nestjs/common';
import { QualitativeScore, Rating } from '../types/analysis-result.type.js';
import { ZONE_THRESHOLDS } from '../../../shared/constants/thresholds.constants.js';
import type { QualitativeResult } from '../types/analysis-result.type.js';

export const QUALITATIVE_FACTORS = [
  'entorno',
  'accesibilidad',
  'transporte',
  'seguridad',
  'comercioOcio',
  'documentacion',
] as const;

export type QualitativeFactor = (typeof QUALITATIVE_FACTORS)[number];

export type QualitativeInput = Record<QualitativeFactor, QualitativeScore>;

@Injectable()
export class QualitativeEvaluator {
  evaluate(scores: QualitativeInput): QualitativeResult {
    const values = Object.values(scores);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const average = values.length > 0
      ? Math.round((sum / values.length) * 100) / 100
      : 0;

    return {
      scores,
      average,
      rating: this.rateAverage(average),
    };
  }

  private rateAverage(average: number): Rating {
    if (average >= ZONE_THRESHOLDS.EXCELLENT) return Rating.EXCELENTE;
    if (average >= ZONE_THRESHOLDS.GOOD) return Rating.BUENA;
    return Rating.RIESGOSA;
  }
}
