"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCostCalculator = void 0;
const common_1 = require("@nestjs/common");
const thresholds_constants_js_1 = require("../../../shared/constants/thresholds.constants.js");
let ProjectCostCalculator = class ProjectCostCalculator {
    calculate(input) {
        let notaryFees = 0;
        if (input.notaryFeesType === 'fixed' && input.notaryFeesValue !== undefined) {
            notaryFees = input.notaryFeesValue;
        }
        else {
            const notaryPercent = input.notaryFeesValue ?? thresholds_constants_js_1.DEFAULT_PERCENTAGES.NOTARY_FEES_PERCENT;
            notaryFees = input.purchasePrice * (notaryPercent / 100) * 2;
        }
        let brokerCommission = 0;
        if (input.brokerCommissionType === 'fixed' && input.brokerCommissionValue !== undefined) {
            brokerCommission = input.brokerCommissionValue;
        }
        else {
            const brokerPercent = input.brokerCommissionValue ?? thresholds_constants_js_1.DEFAULT_PERCENTAGES.BROKER_COMMISSION_PERCENT;
            brokerCommission = input.purchasePrice * (brokerPercent / 100);
        }
        const otherExpenses = input.otherExpenses ?? 0;
        const totalOwnershipExpenses = input.monthlyOwnershipExpenses * input.projectedMonthsToSell;
        const totalProjectCost = input.purchasePrice +
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
};
exports.ProjectCostCalculator = ProjectCostCalculator;
exports.ProjectCostCalculator = ProjectCostCalculator = __decorate([
    (0, common_1.Injectable)()
], ProjectCostCalculator);
//# sourceMappingURL=project-cost.calculator.js.map