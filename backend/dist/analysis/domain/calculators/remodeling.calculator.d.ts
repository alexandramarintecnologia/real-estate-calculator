import type { RemodelingCost } from '../types/analysis-result.type.js';
export interface RemodelingInput {
    m2ToRemodel: number;
    scenario: 1 | 2 | 3;
    adminPercentage?: number;
    customCostPerM2?: number;
}
export declare class RemodelingCalculator {
    calculate(input: RemodelingInput): RemodelingCost;
    calculateAllScenarios(m2ToRemodel: number, adminPercentage?: number): RemodelingCost[];
}
