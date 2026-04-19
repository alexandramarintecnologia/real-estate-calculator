import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller.js';
import { AnalyzePropertyUseCase } from './application/analyze-property.use-case.js';
import { RemodelingCalculator } from './domain/calculators/remodeling.calculator.js';
import { ProjectCostCalculator } from './domain/calculators/project-cost.calculator.js';
import { ProfitabilityCalculator } from './domain/calculators/profitability.calculator.js';
import { InvestmentEvaluator } from './domain/evaluators/investment.evaluator.js';
import { QualitativeEvaluator } from './domain/evaluators/qualitative.evaluator.js';

@Module({
  controllers: [AnalysisController],
  providers: [
    AnalyzePropertyUseCase,
    RemodelingCalculator,
    ProjectCostCalculator,
    ProfitabilityCalculator,
    InvestmentEvaluator,
    QualitativeEvaluator,
  ],
})
export class AnalysisModule {}
