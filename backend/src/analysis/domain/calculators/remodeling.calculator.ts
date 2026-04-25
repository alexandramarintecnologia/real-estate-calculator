import { Injectable } from '@nestjs/common';
import { REMODELING_SCENARIOS } from '../../../shared/constants/thresholds.constants.js';
import type { RemodelingCost } from '../types/analysis-result.type.js';

export interface RemodelingInput {
  m2ToRemodel: number;
  scenario: 1 | 2 | 3;
  adminPercentage?: number;
  customCostPerM2?: number;
}

@Injectable()
export class RemodelingCalculator {
  calculate(input: RemodelingInput): RemodelingCost {
    const { m2ToRemodel, scenario, adminPercentage } = input;

    let costPerM2: number;
    let effectiveAdminPercent: number | undefined;

    switch (scenario) {
      case 1:
        costPerM2 = input.customCostPerM2 ?? REMODELING_SCENARIOS[1].costPerM2;
        break;
      case 2:
        costPerM2 = input.customCostPerM2 ?? REMODELING_SCENARIOS[2].costPerM2;
        break;
      case 3: {
        const baseCost =
          input.customCostPerM2 ?? REMODELING_SCENARIOS[3].baseCostPerM2;
        effectiveAdminPercent =
          adminPercentage ?? REMODELING_SCENARIOS[3].defaultAdminPercent;
        costPerM2 = baseCost * (1 + effectiveAdminPercent / 100);
        break;
      }
    }

    return {
      scenario,
      costPerM2,
      totalCost: m2ToRemodel * costPerM2,
      adminPercentage: effectiveAdminPercent,
    };
  }

  calculateAllScenarios(
    m2ToRemodel: number,
    adminPercentage?: number,
  ): RemodelingCost[] {
    return [1, 2, 3].map((scenario) =>
      this.calculate({
        m2ToRemodel,
        scenario: scenario as 1 | 2 | 3,
        adminPercentage,
      }),
    );
  }
}
