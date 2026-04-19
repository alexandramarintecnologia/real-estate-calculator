import type { ProfitabilityMetrics } from '../types/analysis-result.type.js';
export interface ProfitabilityInput {
    projectedSalePrice: number;
    totalProjectCost: number;
    monthlyRent: number;
}
export declare class ProfitabilityCalculator {
    calculate(input: ProfitabilityInput): ProfitabilityMetrics;
}
