"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const analysis_controller_js_1 = require("./analysis.controller.js");
const analyze_property_use_case_js_1 = require("./application/analyze-property.use-case.js");
const remodeling_calculator_js_1 = require("./domain/calculators/remodeling.calculator.js");
const project_cost_calculator_js_1 = require("./domain/calculators/project-cost.calculator.js");
const profitability_calculator_js_1 = require("./domain/calculators/profitability.calculator.js");
const investment_evaluator_js_1 = require("./domain/evaluators/investment.evaluator.js");
const qualitative_evaluator_js_1 = require("./domain/evaluators/qualitative.evaluator.js");
let AnalysisModule = class AnalysisModule {
};
exports.AnalysisModule = AnalysisModule;
exports.AnalysisModule = AnalysisModule = __decorate([
    (0, common_1.Module)({
        controllers: [analysis_controller_js_1.AnalysisController],
        providers: [
            analyze_property_use_case_js_1.AnalyzePropertyUseCase,
            remodeling_calculator_js_1.RemodelingCalculator,
            project_cost_calculator_js_1.ProjectCostCalculator,
            profitability_calculator_js_1.ProfitabilityCalculator,
            investment_evaluator_js_1.InvestmentEvaluator,
            qualitative_evaluator_js_1.QualitativeEvaluator,
        ],
    })
], AnalysisModule);
//# sourceMappingURL=analysis.module.js.map