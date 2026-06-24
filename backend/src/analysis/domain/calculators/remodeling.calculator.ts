import { Injectable } from '@nestjs/common';
import { REMODELING_SCENARIOS } from '../../../shared/constants/thresholds.constants.js';
import type { RemodelingCost } from '../types/analysis-result.type.js';

export interface RemodelingInput {
  purchasePrice: number;
  scenario: 1 | 2 | 3;
  remodelingPercent?: number;
  adminPercentage?: number;
  customCost?: number;
}

@Injectable()
export class RemodelingCalculator {
  calculate(input: RemodelingInput): RemodelingCost {
    const { purchasePrice, scenario, customCost } = input;
    const config = REMODELING_SCENARIOS[scenario];

    const remodelingPercent = Math.min(
      config.maxPercent,
      Math.max(config.minPercent, input.remodelingPercent ?? config.defaultPercent),
    );

    const baseCost =
      customCost ?? Math.round((purchasePrice * remodelingPercent) / 100);

    let totalCost = baseCost;
    let effectiveAdminPercent: number | undefined;

    if (scenario === 3) {
      effectiveAdminPercent =
        input.adminPercentage ??
        REMODELING_SCENARIOS[3].defaultAdminPercent;
      totalCost = Math.round(baseCost * (1 + effectiveAdminPercent / 100));
    }

    return {
      scenario,
      costPerM2: 0,
      totalCost,
      adminPercentage: effectiveAdminPercent,
      remodelingPercent,
      baseCost,
    };
  }

  calculateAllScenarios(
    purchasePrice: number,
    remodelingPercent?: number,
    adminPercentage?: number,
  ): RemodelingCost[] {
    return [1, 2, 3].map((scenario) =>
      this.calculate({
        purchasePrice,
        scenario: scenario as 1 | 2 | 3,
        remodelingPercent,
        adminPercentage,
      }),
    );
  }
}
