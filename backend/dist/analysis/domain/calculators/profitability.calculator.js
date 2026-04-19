"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitabilityCalculator = void 0;
const common_1 = require("@nestjs/common");
let ProfitabilityCalculator = class ProfitabilityCalculator {
    calculate(input) {
        const { projectedSalePrice, totalProjectCost, monthlyRent } = input;
        const grossProfit = projectedSalePrice - totalProjectCost;
        const roi = totalProjectCost > 0
            ? (grossProfit / totalProjectCost) * 100
            : 0;
        const annualRentalIncome = monthlyRent * 12;
        const capRate = totalProjectCost > 0
            ? (annualRentalIncome / totalProjectCost) * 100
            : 0;
        return {
            grossProfit: Math.round(grossProfit),
            roi: Math.round(roi * 100) / 100,
            annualRentalIncome: Math.round(annualRentalIncome),
            capRate: Math.round(capRate * 100) / 100,
        };
    }
};
exports.ProfitabilityCalculator = ProfitabilityCalculator;
exports.ProfitabilityCalculator = ProfitabilityCalculator = __decorate([
    (0, common_1.Injectable)()
], ProfitabilityCalculator);
//# sourceMappingURL=profitability.calculator.js.map