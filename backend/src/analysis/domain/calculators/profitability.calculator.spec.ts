import { ProfitabilityCalculator } from './profitability.calculator.js';

describe('ProfitabilityCalculator', () => {
  let calculator: ProfitabilityCalculator;

  beforeEach(() => {
    calculator = new ProfitabilityCalculator();
  });

  it('should calculate positive profitability', () => {
    const result = calculator.calculate({
      projectedSalePrice: 300_000_000,
      totalProjectCost: 250_000_000,
      monthlyRent: 1_500_000,
    });

    expect(result.projectedSalePrice).toBe(300_000_000);
    expect(result.grossProfit).toBe(50_000_000);
    expect(result.roi).toBe(20);
    expect(result.annualRentalIncome).toBe(18_000_000);
    expect(result.capRate).toBe(7.2);
  });

  it('should calculate negative profitability', () => {
    const result = calculator.calculate({
      projectedSalePrice: 200_000_000,
      totalProjectCost: 250_000_000,
      monthlyRent: 1_000_000,
    });

    expect(result.grossProfit).toBe(-50_000_000);
    expect(result.roi).toBe(-20);
  });

  it('should handle zero project cost gracefully', () => {
    const result = calculator.calculate({
      projectedSalePrice: 100_000_000,
      totalProjectCost: 0,
      monthlyRent: 500_000,
    });

    expect(result.roi).toBe(0);
    expect(result.capRate).toBe(0);
  });

  it('should round roi to 2 decimals', () => {
    const result = calculator.calculate({
      projectedSalePrice: 333_333_333,
      totalProjectCost: 250_000_000,
      monthlyRent: 1_200_000,
    });

    expect(result.roi).toBe(33.33);
    expect(result.capRate).toBe(5.76);
  });
});
