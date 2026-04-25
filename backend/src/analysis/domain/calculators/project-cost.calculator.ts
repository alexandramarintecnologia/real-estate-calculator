import { Injectable } from '@nestjs/common';
import { DEFAULT_PERCENTAGES } from '../../../shared/constants/thresholds.constants.js';
import type { ProjectCosts } from '../types/analysis-result.type.js';

export interface ProjectCostInput {
  purchasePrice: number;
  remodelingCost: number;
  monthlyOwnershipExpenses: number;
  projectedMonthsToSell: number;
  notaryFeesValue?: number;
  notaryFeesType?: 'percent' | 'fixed';
  brokerCommissionValue?: number;
  brokerCommissionType?: 'percent' | 'fixed';
  otherExpenses?: number;
}

@Injectable()
export class ProjectCostCalculator {
  calculate(input: ProjectCostInput): ProjectCosts {
    // Calculo Escrituras
    let notaryFees = 0;
    if (
      input.notaryFeesType === 'fixed' &&
      input.notaryFeesValue !== undefined
    ) {
      notaryFees = input.notaryFeesValue;
    } else {
      const notaryPercent =
        input.notaryFeesValue ?? DEFAULT_PERCENTAGES.NOTARY_FEES_PERCENT;
      notaryFees = input.purchasePrice * (notaryPercent / 100) * 2;
    }

    // Calculo Comision
    let brokerCommission = 0;
    if (
      input.brokerCommissionType === 'fixed' &&
      input.brokerCommissionValue !== undefined
    ) {
      brokerCommission = input.brokerCommissionValue;
    } else {
      const brokerPercent =
        input.brokerCommissionValue ??
        DEFAULT_PERCENTAGES.BROKER_COMMISSION_PERCENT;
      brokerCommission = input.purchasePrice * (brokerPercent / 100);
    }
    const otherExpenses = input.otherExpenses ?? 0;
    const totalOwnershipExpenses =
      input.monthlyOwnershipExpenses * input.projectedMonthsToSell;

    const totalProjectCost =
      input.purchasePrice +
      input.remodelingCost +
      notaryFees +
      brokerCommission +
      otherExpenses +
      totalOwnershipExpenses;

    return {
      purchasePrice: input.purchasePrice,
      remodelingCost: input.remodelingCost,
      notaryFees: Math.round(notaryFees),
      brokerCommission: Math.round(brokerCommission),
      otherExpenses,
      totalOwnershipExpenses,
      totalProjectCost: Math.round(totalProjectCost),
    };
  }
}
