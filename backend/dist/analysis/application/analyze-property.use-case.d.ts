import { RemodelingCalculator } from '../domain/calculators/remodeling.calculator.js';
import { ProjectCostCalculator } from '../domain/calculators/project-cost.calculator.js';
import { ProfitabilityCalculator } from '../domain/calculators/profitability.calculator.js';
import { QualitativeEvaluator } from '../domain/evaluators/qualitative.evaluator.js';
import { InvestmentEvaluator } from '../domain/evaluators/investment.evaluator.js';
import type { AnalysisRequestDto } from '../dto/analysis-request.dto.js';
import type { AnalysisResult } from '../domain/types/analysis-result.type.js';
export declare class AnalyzePropertyUseCase {
    private readonly remodelingCalc;
    private readonly projectCostCalc;
    private readonly profitabilityCalc;
    private readonly qualitativeEval;
    private readonly investmentEval;
    constructor(remodelingCalc: RemodelingCalculator, projectCostCalc: ProjectCostCalculator, profitabilityCalc: ProfitabilityCalculator, qualitativeEval: QualitativeEvaluator, investmentEval: InvestmentEvaluator);
    execute(dto: AnalysisRequestDto): AnalysisResult;
}
