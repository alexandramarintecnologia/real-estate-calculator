import { EstimateRemodelingUseCase } from './estimate-remodeling.use-case.js';
import { BudgetTierCalculator } from '../domain/calculators/budget-tier.calculator.js';
import { AreaCostCalculator } from '../domain/calculators/area-cost.calculator.js';
import type { RemodelingRequestDto } from '../dto/remodeling-request.dto.js';

const ALL_AREAS = [
  'zona_social', 'cocina', 'bano_principal', 'bano_social',
  'habitacion_principal', 'habitaciones_secundarias', 'estudio_oficina',
  'balcon_terraza', 'instalacion_electrica', 'instalacion_hidraulica',
  'instalacion_gas', 'paredes', 'pisos', 'techos', 'puertas', 'carpinteria',
  'ventanas_cortinas', 'climatizacion', 'domotica', 'entretenimiento',
  'decoracion',
];

describe('EstimateRemodelingUseCase', () => {
  let useCase: EstimateRemodelingUseCase;
  const basePrice = 400_000_000;

  beforeEach(() => {
    useCase = new EstimateRemodelingUseCase(
      new BudgetTierCalculator(),
      new AreaCostCalculator(),
    );
  });

  function run(overrides: Partial<RemodelingRequestDto> = {}) {
    return useCase.execute({
      basePrice,
      basePriceSource: 'manual',
      ...overrides,
    } as RemodelingRequestDto);
  }

  describe('monto necesario a partir de las areas', () => {
    it('sin areas marcadas no se necesita nada y no hay nivel', () => {
      const result = run();
      expect(result.requiredAmount).toBe(0);
      expect(result.requiredPercent).toBe(0);
      expect(result.recommendedTier).toBeNull();
      expect(result.exceedsTopTier).toBe(false);
    });

    it('marcar todo el catalogo da el 20% del apartamento', () => {
      const result = run({ selectedAreas: ALL_AREAS });
      expect(result.requiredAmount).toBe(80_000_000);
      expect(result.requiredPercent).toBe(20);
      expect(result.coverage).toBe(100);
    });

    it('el monto sube al marcar mas areas', () => {
      const pocas = run({ selectedAreas: ['cocina'] });
      const muchas = run({ selectedAreas: ['cocina', 'pisos', 'carpinteria'] });
      expect(muchas.requiredAmount).toBeGreaterThan(pocas.requiredAmount);
    });
  });

  describe('nivel recomendado', () => {
    it('una seleccion chica cae en el nivel bajo', () => {
      // cocina + bano_principal = 30/176 -> ~4.3% del apartamento
      const result = run({ selectedAreas: ['cocina', 'bano_principal'] });
      expect(result.requiredPercent).toBeLessThanOrEqual(10);
      expect(result.recommendedTier).toBe('bajo');
    });

    it('marcar todo cae en el nivel alto', () => {
      expect(run({ selectedAreas: ALL_AREAS }).recommendedTier).toBe('alto');
    });

    it('elige el nivel medio cuando el bajo no alcanza', () => {
      // Un monto manual que deja el requerido entre 10% y 15%.
      const result = run({
        selectedAreas: ['cocina'],
        areaAmounts: { cocina: 52_000_000 }, // 13% de 400M
      });
      expect(result.requiredPercent).toBe(13);
      expect(result.recommendedTier).toBe('medio');
    });

    it('marca exceso cuando ni el nivel alto alcanza', () => {
      const result = run({
        selectedAreas: ['cocina'],
        areaAmounts: { cocina: 200_000_000 }, // 50% del apartamento
      });
      expect(result.recommendedTier).toBeNull();
      expect(result.exceedsTopTier).toBe(true);
    });

    it('elige el nivel mas barato que alcanza, no el primero del catalogo', () => {
      // Con el nivel bajo subido a 30%, el alto (20%) sigue siendo el mas
      // barato que cubre un requerimiento del 20%.
      const result = run({
        selectedAreas: ALL_AREAS,
        percentOverrides: { bajo: 30 },
      });
      expect(result.requiredPercent).toBe(20);
      expect(result.recommendedTier).toBe('alto');
    });

    it('clasifica contra los porcentajes ajustados, no contra los de referencia', () => {
      // Bajando los tres niveles, lo que antes cabia en el alto pasa a excederlo.
      const result = run({
        selectedAreas: ALL_AREAS,
        percentOverrides: { bajo: 5, medio: 8, alto: 10 },
      });
      expect(result.requiredPercent).toBe(20);
      expect(result.exceedsTopTier).toBe(true);
      expect(result.recommendedTier).toBeNull();
    });
  });

  describe('referencia y trazabilidad', () => {
    it('devuelve los tres niveles como referencia', () => {
      const result = run({ selectedAreas: ['cocina'] });
      expect(result.tiers.map((t) => t.tier)).toEqual(['bajo', 'medio', 'alto']);
      expect(result.tiers.map((t) => t.totalBudget)).toEqual([
        40_000_000, 60_000_000, 80_000_000,
      ]);
    });

    it('conserva el analisis de origen', () => {
      const result = run({ basePriceSource: 'analysis', analysisId: 'abc123' });
      expect(result.basePriceSource).toBe('analysis');
      expect(result.analysisId).toBe('abc123');
    });

    it('selectedAreas refleja solo las areas validas', () => {
      expect(run({ selectedAreas: ['cocina', 'inventada'] }).selectedAreas).toEqual([
        'cocina',
      ]);
    });
  });
});
