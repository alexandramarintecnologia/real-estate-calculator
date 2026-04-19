import { RemodelingCalculator } from './remodeling.calculator.js';

describe('RemodelingCalculator', () => {
  let calculator: RemodelingCalculator;

  beforeEach(() => {
    calculator = new RemodelingCalculator();
  });

  it('should calculate scenario 1 (empresa todo costo)', () => {
    const result = calculator.calculate({ m2ToRemodel: 50, scenario: 1 });
    expect(result.scenario).toBe(1);
    expect(result.costPerM2).toBe(1_150_000);
    expect(result.totalCost).toBe(50 * 1_150_000);
    expect(result.adminPercentage).toBeUndefined();
  });

  it('should calculate scenario 2 (solo mano de obra)', () => {
    const result = calculator.calculate({ m2ToRemodel: 30, scenario: 2 });
    expect(result.costPerM2).toBe(500_000);
    expect(result.totalCost).toBe(30 * 500_000);
  });

  it('should calculate scenario 3 with default admin percentage', () => {
    const result = calculator.calculate({ m2ToRemodel: 40, scenario: 3 });
    expect(result.adminPercentage).toBe(15);
    expect(result.costPerM2).toBe(500_000 * 1.15);
    expect(result.totalCost).toBe(40 * 500_000 * 1.15);
  });

  it('should calculate scenario 3 with custom admin percentage', () => {
    const result = calculator.calculate({
      m2ToRemodel: 40,
      scenario: 3,
      adminPercentage: 20,
    });
    expect(result.adminPercentage).toBe(20);
    expect(result.costPerM2).toBe(500_000 * 1.2);
  });

  it('should allow custom cost per m2', () => {
    const result = calculator.calculate({
      m2ToRemodel: 20,
      scenario: 1,
      customCostPerM2: 1_000_000,
    });
    expect(result.costPerM2).toBe(1_000_000);
    expect(result.totalCost).toBe(20_000_000);
  });

  it('should calculate all 3 scenarios at once', () => {
    const results = calculator.calculateAllScenarios(50);
    expect(results).toHaveLength(3);
    expect(results[0].scenario).toBe(1);
    expect(results[1].scenario).toBe(2);
    expect(results[2].scenario).toBe(3);
  });

  it('should return 0 total cost when 0 m2 to remodel', () => {
    const result = calculator.calculate({ m2ToRemodel: 0, scenario: 1 });
    expect(result.totalCost).toBe(0);
  });
});
