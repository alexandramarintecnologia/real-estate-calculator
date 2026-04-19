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
export declare class ProjectCostCalculator {
    calculate(input: ProjectCostInput): ProjectCosts;
}
