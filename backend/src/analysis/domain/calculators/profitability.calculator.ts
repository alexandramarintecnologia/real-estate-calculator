import { Injectable } from '@nestjs/common';
import type { ProfitabilityMetrics } from '../types/analysis-result.type.js';

export interface ProfitabilityInput {
  projectedSalePrice: number;
  totalProjectCost: number;
  monthlyRent: number;
}

@Injectable()
export class ProfitabilityCalculator {
  calculate(input: ProfitabilityInput): ProfitabilityMetrics {
    const { projectedSalePrice, totalProjectCost, monthlyRent } = input;

    const grossProfit = projectedSalePrice - totalProjectCost;
    const roi = totalProjectCost > 0
      ? (grossProfit / totalProjectCost) * 100
      : 0;
    const annualRentalIncome = monthlyRent * 12;
    const capRate = totalProjectCost > 0
      ? (annualRentalIncome / totalProjectCost) * 100
      : 0;

    return {
      grossProfit: Math.round(grossProfit),
      roi: Math.round(roi * 100) / 100,
      annualRentalIncome: Math.round(annualRentalIncome),
      capRate: Math.round(capRate * 100) / 100,
    };
  }
}
