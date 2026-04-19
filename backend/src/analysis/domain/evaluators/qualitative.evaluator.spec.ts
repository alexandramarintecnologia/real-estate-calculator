import { QualitativeEvaluator } from './qualitative.evaluator.js';
import { QualitativeScore, Rating } from '../types/analysis-result.type.js';

describe('QualitativeEvaluator', () => {
  let evaluator: QualitativeEvaluator;

  beforeEach(() => {
    evaluator = new QualitativeEvaluator();
  });

  it('should rate all excelente as excelente', () => {
    const result = evaluator.evaluate({
      entorno: QualitativeScore.EXCELENTE,
      accesibilidad: QualitativeScore.EXCELENTE,
      transporte: QualitativeScore.EXCELENTE,
      seguridad: QualitativeScore.EXCELENTE,
      comercioOcio: QualitativeScore.EXCELENTE,
      documentacion: QualitativeScore.EXCELENTE,
    });

    expect(result.average).toBe(3);
    expect(result.rating).toBe(Rating.EXCELENTE);
  });

  it('should rate mixed scores as buena', () => {
    const result = evaluator.evaluate({
      entorno: QualitativeScore.BUENO,
      accesibilidad: QualitativeScore.EXCELENTE,
      transporte: QualitativeScore.REGULAR,
      seguridad: QualitativeScore.BUENO,
      comercioOcio: QualitativeScore.BUENO,
      documentacion: QualitativeScore.EXCELENTE,
    });

    expect(result.average).toBeGreaterThanOrEqual(1.5);
    expect(result.average).toBeLessThan(2.5);
    expect(result.rating).toBe(Rating.BUENA);
  });

  it('should rate low scores as riesgosa', () => {
    const result = evaluator.evaluate({
      entorno: QualitativeScore.DESCARTADO,
      accesibilidad: QualitativeScore.REGULAR,
      transporte: QualitativeScore.DESCARTADO,
      seguridad: QualitativeScore.REGULAR,
      comercioOcio: QualitativeScore.DESCARTADO,
      documentacion: QualitativeScore.REGULAR,
    });

    expect(result.average).toBeLessThan(1.5);
    expect(result.rating).toBe(Rating.RIESGOSA);
  });
});
