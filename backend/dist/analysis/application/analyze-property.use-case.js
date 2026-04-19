"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzePropertyUseCase = void 0;
const common_1 = require("@nestjs/common");
const remodeling_calculator_js_1 = require("../domain/calculators/remodeling.calculator.js");
const project_cost_calculator_js_1 = require("../domain/calculators/project-cost.calculator.js");
const profitability_calculator_js_1 = require("../domain/calculators/profitability.calculator.js");
const qualitative_evaluator_js_1 = require("../domain/evaluators/qualitative.evaluator.js");
const investment_evaluator_js_1 = require("../domain/evaluators/investment.evaluator.js");
let AnalyzePropertyUseCase = class AnalyzePropertyUseCase {
    remodelingCalc;
    projectCostCalc;
    profitabilityCalc;
    qualitativeEval;
    investmentEval;
    constructor(remodelingCalc, projectCostCalc, profitabilityCalc, qualitativeEval, investmentEval) {
        this.remodelingCalc = remodelingCalc;
        this.projectCostCalc = projectCostCalc;
        this.profitabilityCalc = profitabilityCalc;
        this.qualitativeEval = qualitativeEval;
        this.investmentEval = investmentEval;
    }
    execute(dto) {
        const { property, remodeling, expenses, qualitative } = dto;
        const remodelingCosts = this.remodelingCalc.calculateAllScenarios(property.m2Remodelacion, remodeling.adminPercentage);
        const selectedRemodelingCost = this.remodelingCalc.calculate({
            m2ToRemodel: property.m2Remodelacion,
            scenario: remodeling.selectedScenario,
            adminPercentage: remodeling.adminPercentage,
            customCostPerM2: remodeling.customCostPerM2,
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
        const profitability = this.profitabilityCalc.calculate({
            projectedSalePrice: property.precioVentaProyectado,
            totalProjectCost: projectCosts.totalProjectCost,
            monthlyRent: property.arriendoProyectado,
        });
        const qualitativeResult = this.qualitativeEval.evaluate(qualitative);
        const evaluation = this.investmentEval.evaluate(profitability, qualitativeResult);
        return {
            remodelingCosts,
            selectedRemodelingCost,
            projectCosts,
            profitability,
            qualitative: qualitativeResult,
            evaluation,
        };
    }
};
exports.AnalyzePropertyUseCase = AnalyzePropertyUseCase;
exports.AnalyzePropertyUseCase = AnalyzePropertyUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [remodeling_calculator_js_1.RemodelingCalculator,
        project_cost_calculator_js_1.ProjectCostCalculator,
        profitability_calculator_js_1.ProfitabilityCalculator,
        qualitative_evaluator_js_1.QualitativeEvaluator,
        investment_evaluator_js_1.InvestmentEvaluator])
], AnalyzePropertyUseCase);
//# sourceMappingURL=analyze-property.use-case.js.map