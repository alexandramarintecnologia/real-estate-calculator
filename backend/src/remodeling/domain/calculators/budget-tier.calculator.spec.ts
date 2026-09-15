import { BudgetTierCalculator } from './budget-tier.calculator.js';

describe('BudgetTierCalculator', () => {
  let calculator: BudgetTierCalculator;
  const basePrice = 200_000_000;

  beforeEach(() => {
    calculator = new BudgetTierCalculator();
  });

  describe('porcentajes por defecto', () => {
    it('nivel bajo es el 10% del costo del apartamento', () => {
      const result = calculator.calculate(basePrice, 'bajo');
      expect(result.percent).toBe(10);
      expect(result.totalBudget).toBe(20_000_000);
      expect(result.isAdjusted).toBe(false);
    });

    it('nivel medio es el 15%', () => {
      const result = calculator.calculate(basePrice, 'medio');
      expect(result.percent).toBe(15);
      expect(result.totalBudget).toBe(30_000_000);
    });

    it('nivel alto es el 20%', () => {
      const result = calculator.calculate(basePrice, 'alto');
      expect(result.percent).toBe(20);
      expect(result.totalBudget).toBe(40_000_000);
    });
  });

  describe('ajuste manual del porcentaje', () => {
    it('usa el porcentaje ajustado y lo marca como tal', () => {
      const result = calculator.calculate(basePrice, 'bajo', 18);
      expect(result.percent).toBe(18);
      expect(result.totalBudget).toBe(36_000_000);
      expect(result.isAdjusted).toBe(true);
    });

    it('no marca ajuste cuando el valor coincide con el default', () => {
      expect(calculator.calculate(basePrice, 'medio', 15).isAdjusted).toBe(false);
    });

    it('acota por debajo del minimo', () => {
      expect(calculator.calculate(basePrice, 'bajo', 0).percent).toBe(1);
    });

    it('acota por encima del maximo', () => {
      expect(calculator.calculate(basePrice, 'alto', 500).percent).toBe(100);
    });

    it('ignora valores no numericos y cae al default', () => {
      expect(calculator.calculate(basePrice, 'alto', Number.NaN).percent).toBe(20);
    });
  });

  describe('calculateAll', () => {
    it('devuelve los tres niveles en orden bajo, medio, alto', () => {
      const tiers = calculator.calculateAll(basePrice);
      expect(tiers.map((t) => t.tier)).toEqual(['bajo', 'medio', 'alto']);
      expect(tiers.map((t) => t.totalBudget)).toEqual([
        20_000_000, 30_000_000, 40_000_000,
      ]);
    });

    it('aplica overrides solo a los niveles indicados', () => {
      const tiers = calculator.calculateAll(basePrice, { medio: 22 });
      expect(tiers[0].percent).toBe(10);
      expect(tiers[1].percent).toBe(22);
      expect(tiers[1].isAdjusted).toBe(true);
      expect(tiers[2].percent).toBe(20);
      expect(tiers[2].isAdjusted).toBe(false);
    });

    it('redondea a pesos enteros', () => {
      const tiers = calculator.calculateAll(123_456_789);
      tiers.forEach((t) => expect(Number.isInteger(t.totalBudget)).toBe(true));
    });
  });
});
