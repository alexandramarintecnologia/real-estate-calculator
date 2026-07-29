import { Injectable } from '@nestjs/common';
import { RemodelingCalculator } from '../domain/calculators/remodeling.calculator.js';
import { ProjectCostCalculator } from '../domain/calculators/project-cost.calculator.js';
import { ProfitabilityCalculator } from '../domain/calculators/profitability.calculator.js';
import { QualitativeEvaluator } from '../domain/evaluators/qualitative.evaluator.js';
import { InvestmentEvaluator } from '../domain/evaluators/investment.evaluator.js';
import type { AnalysisRequestDto } from '../dto/analysis-request.dto.js';
import type { QualitativeInput } from '../domain/evaluators/qualitative.evaluator.js';
import type { AnalysisResult } from '../domain/types/analysis-result.type.js';

@Injectable()
export class AnalyzePropertyUseCase {
  constructor(
    private readonly remodelingCalc: RemodelingCalculator,
    private readonly projectCostCalc: ProjectCostCalculator,
    private readonly profitabilityCalc: ProfitabilityCalculator,
    private readonly qualitativeEval: QualitativeEvaluator,
    private readonly investmentEval: InvestmentEvaluator,
  ) {}

  execute(dto: AnalysisRequestDto): AnalysisResult {
    const { property, remodeling, expenses, qualitative } = dto;

    const remodelingCosts = this.remodelingCalc.calculateAllScenarios(
      property.precioCompra,
      remodeling.remodelingPercent,
      remodeling.adminPercentage,
    );

    const selectedRemodelingCost = this.remodelingCalc.calculate({
      purchasePrice: property.precioCompra,
      scenario: remodeling.selectedScenario,
      remodelingPercent: remodeling.remodelingPercent,
      adminPercentage: remodeling.adminPercentage,
      customCost: remodeling.customCost,
    });

    const projectCosts = this.projectCostCalc.calculate({
      purchasePrice: property.precioCompra,
      remodelingCost: selectedRemodelingCost.totalCost,
      monthlyOwnershipExpenses: property.gastosPosesionMensual,
      projectedMonthsToSell: property.mesesProyectadosVenta,
      notaryFeesValue: expenses.notaryFeesValue,
      notaryFeesType: expenses.notaryFeesType,
      brokerCommissionValue: expenses.brokerCommissionValue,
      brokerCommissionType: expenses.brokerCommissionType,
      otherExpenses: expenses.otherExpenses,
    });

    // Cuando el precio de venta es porcentual, la base es precioCompra + remodelación
    const projectedSalePrice =
      property.precioVentaType === 'percent' && property.precioVentaPercent != null
        ? Math.round(
            (property.precioCompra + selectedRemodelingCost.totalCost) *
              (1 + property.precioVentaPercent / 100),
          )
        : property.precioVentaProyectado;

    const profitability = this.profitabilityCalc.calculate({
      projectedSalePrice,
      totalProjectCost: projectCosts.totalProjectCost,
      monthlyRent: property.arriendoProyectado,
    });

    const qualitativeResult = this.qualitativeEval.evaluate(
      qualitative as unknown as QualitativeInput,
    );

    const evaluation = this.investmentEval.evaluate(
      profitability,
      qualitativeResult,
    );

    return {
      remodelingCosts,
      selectedRemodelingCost,
      projectCosts,
      profitability,
      qualitative: qualitativeResult,
      evaluation,
    };
  }
}
