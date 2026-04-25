import { ProjectCostCalculator } from './project-cost.calculator.js';

describe('ProjectCostCalculator', () => {
  let calculator: ProjectCostCalculator;

  beforeEach(() => {
    calculator = new ProjectCostCalculator();
  });

  it('should calculate total project cost with defaults', () => {
    const result = calculator.calculate({
      purchasePrice: 200_000_000,
      remodelingCost: 50_000_000,
      monthlyOwnershipExpenses: 500_000,
      projectedMonthsToSell: 6,
    });

    expect(result.purchasePrice).toBe(200_000_000);
    expect(result.remodelingCost).toBe(50_000_000);
    expect(result.notaryFees).toBe(Math.round(200_000_000 * 0.03 * 2));
    expect(result.brokerCommission).toBe(Math.round(200_000_000 * 0.01));
    expect(result.totalOwnershipExpenses).toBe(3_000_000);
    expect(result.otherExpenses).toBe(0);
    expect(result.totalProjectCost).toBe(
      200_000_000 +
        50_000_000 +
        result.notaryFees +
        result.brokerCommission +
        3_000_000,
    );
  });

  it('should allow custom percentages', () => {
    const result = calculator.calculate({
      purchasePrice: 100_000_000,
      remodelingCost: 0,
      monthlyOwnershipExpenses: 0,
      projectedMonthsToSell: 1,
      notaryFeesValue: 2,
      notaryFeesType: 'percent',
      brokerCommissionValue: 5,
      brokerCommissionType: 'percent',
      otherExpenses: 1_000_000,
    });

    expect(result.notaryFees).toBe(Math.round(100_000_000 * 0.02 * 2));
    expect(result.brokerCommission).toBe(Math.round(100_000_000 * 0.05));
    expect(result.otherExpenses).toBe(1_000_000);
  });

  it('should allow fixed amounts', () => {
    const result = calculator.calculate({
      purchasePrice: 100_000_000,
      remodelingCost: 0,
      monthlyOwnershipExpenses: 0,
      projectedMonthsToSell: 1,
      notaryFeesValue: 5000000,
      notaryFeesType: 'fixed',
      brokerCommissionValue: 6000000,
      brokerCommissionType: 'fixed',
      otherExpenses: 1_000_000,
    });

    expect(result.notaryFees).toBe(5000000);
    expect(result.brokerCommission).toBe(6000000);
    expect(result.otherExpenses).toBe(1_000_000);
  });

  it('should handle zero ownership expenses', () => {
    const result = calculator.calculate({
      purchasePrice: 100_000_000,
      remodelingCost: 0,
      monthlyOwnershipExpenses: 0,
      projectedMonthsToSell: 12,
    });

    expect(result.totalOwnershipExpenses).toBe(0);
  });
});
