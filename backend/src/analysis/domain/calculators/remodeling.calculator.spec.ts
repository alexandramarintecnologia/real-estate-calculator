import { RemodelingCalculator } from './remodeling.calculator.js';

describe('RemodelingCalculator', () => {
  let calculator: RemodelingCalculator;

  beforeEach(() => {
    calculator = new RemodelingCalculator();
  });

  describe('Scenario 1 - Empresa todo costo (25-35%)', () => {
    it('should calculate at default 32%', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 1,
      });
      expect(result.scenario).toBe(1);
      expect(result.remodelingPercent).toBe(32);
      expect(result.totalCost).toBe(32_000_000);
      expect(result.baseCost).toBe(32_000_000);
      expect(result.adminPercentage).toBeUndefined();
    });

    it('should clamp to min 25%', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 1,
        remodelingPercent: 10,
      });
      expect(result.remodelingPercent).toBe(25);
      expect(result.totalCost).toBe(25_000_000);
    });

    it('should clamp to max 35%', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 1,
        remodelingPercent: 50,
      });
      expect(result.remodelingPercent).toBe(35);
      expect(result.totalCost).toBe(35_000_000);
    });

    it('should allow custom cost', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 1,
        customCost: 40_000_000,
      });
      expect(result.totalCost).toBe(40_000_000);
    });
  });

  describe('Scenario 2 - Solo mano de obra (15-20%)', () => {
    it('should calculate at default 15%', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 2,
      });
      expect(result.totalCost).toBe(15_000_000);
      expect(result.remodelingPercent).toBe(15);
    });

    it('should calculate at 20%', () => {
      const result = calculator.calculate({
        purchasePrice: 200_000_000,
        scenario: 2,
        remodelingPercent: 20,
      });
      expect(result.totalCost).toBe(40_000_000);
    });

    it('should clamp to min 15%', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 2,
        remodelingPercent: 5,
      });
      expect(result.remodelingPercent).toBe(15);
    });

    it('should clamp to max 20%', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 2,
        remodelingPercent: 30,
      });
      expect(result.remodelingPercent).toBe(20);
    });
  });

  describe('Scenario 3 - Administrador de obra (15-20% + admin)', () => {
    it('should calculate at 15% + 18% admin', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 3,
      });
      expect(result.baseCost).toBe(15_000_000);
      expect(result.adminPercentage).toBe(18);
      expect(result.totalCost).toBe(Math.round(15_000_000 * 1.18));
    });

    it('should use custom admin percentage', () => {
      const result = calculator.calculate({
        purchasePrice: 100_000_000,
        scenario: 3,
        remodelingPercent: 20,
        adminPercentage: 25,
      });
      const baseCost = 20_000_000;
      expect(result.baseCost).toBe(baseCost);
      expect(result.adminPercentage).toBe(25);
      expect(result.totalCost).toBe(Math.round(baseCost * 1.25));
    });
  });

  describe('calculateAllScenarios', () => {
    it('should return all 3 scenarios with correct defaults', () => {
      const results = calculator.calculateAllScenarios(100_000_000);
      expect(results).toHaveLength(3);
      expect(results[0].remodelingPercent).toBe(32);
      expect(results[0].totalCost).toBe(32_000_000);
      expect(results[1].remodelingPercent).toBe(15);
      expect(results[1].totalCost).toBe(15_000_000);
      expect(results[2].remodelingPercent).toBe(15);
      expect(results[2].adminPercentage).toBe(18);
      expect(results[2].totalCost).toBe(Math.round(15_000_000 * 1.18));
    });
  });
});
