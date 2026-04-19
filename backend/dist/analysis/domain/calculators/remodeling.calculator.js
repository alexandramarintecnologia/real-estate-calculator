"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemodelingCalculator = void 0;
const common_1 = require("@nestjs/common");
const thresholds_constants_js_1 = require("../../../shared/constants/thresholds.constants.js");
let RemodelingCalculator = class RemodelingCalculator {
    calculate(input) {
        const { m2ToRemodel, scenario, adminPercentage } = input;
        let costPerM2;
        let effectiveAdminPercent;
        switch (scenario) {
            case 1:
                costPerM2 = input.customCostPerM2 ?? thresholds_constants_js_1.REMODELING_SCENARIOS[1].costPerM2;
                break;
            case 2:
                costPerM2 = input.customCostPerM2 ?? thresholds_constants_js_1.REMODELING_SCENARIOS[2].costPerM2;
                break;
            case 3: {
                const baseCost = input.customCostPerM2 ?? thresholds_constants_js_1.REMODELING_SCENARIOS[3].baseCostPerM2;
                effectiveAdminPercent = adminPercentage ?? thresholds_constants_js_1.REMODELING_SCENARIOS[3].defaultAdminPercent;
                costPerM2 = baseCost * (1 + effectiveAdminPercent / 100);
                break;
            }
        }
        return {
            scenario,
            costPerM2,
            totalCost: m2ToRemodel * costPerM2,
            adminPercentage: effectiveAdminPercent,
        };
    }
    calculateAllScenarios(m2ToRemodel, adminPercentage) {
        return [1, 2, 3].map((scenario) => this.calculate({
            m2ToRemodel,
            scenario: scenario,
            adminPercentage,
        }));
    }
};
exports.RemodelingCalculator = RemodelingCalculator;
exports.RemodelingCalculator = RemodelingCalculator = __decorate([
    (0, common_1.Injectable)()
], RemodelingCalculator);
//# sourceMappingURL=remodeling.calculator.js.map