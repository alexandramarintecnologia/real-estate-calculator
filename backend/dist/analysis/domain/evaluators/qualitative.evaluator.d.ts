import { QualitativeScore } from '../types/analysis-result.type.js';
import type { QualitativeResult } from '../types/analysis-result.type.js';
export declare const QUALITATIVE_FACTORS: readonly ["entorno", "accesibilidad", "transporte", "seguridad", "comercioOcio", "documentacion"];
export type QualitativeFactor = (typeof QUALITATIVE_FACTORS)[number];
export type QualitativeInput = Record<QualitativeFactor, QualitativeScore>;
export declare class QualitativeEvaluator {
    evaluate(scores: QualitativeInput): QualitativeResult;
    private rateAverage;
}
