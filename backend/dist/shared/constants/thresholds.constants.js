"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PERCENTAGES = exports.REMODELING_SCENARIOS = exports.ZONE_THRESHOLDS = exports.CAP_RATE_THRESHOLDS = exports.ROI_THRESHOLDS = void 0;
exports.ROI_THRESHOLDS = {
    EXCELLENT: 15,
    GOOD: 8,
};
exports.CAP_RATE_THRESHOLDS = {
    EXCELLENT: 8,
    GOOD: 5,
};
exports.ZONE_THRESHOLDS = {
    EXCELLENT: 2.5,
    GOOD: 1.5,
};
exports.REMODELING_SCENARIOS = {
    1: { label: 'Empresa todo costo', costPerM2: 1_150_000 },
    2: { label: 'Solo mano de obra', costPerM2: 500_000 },
    3: { label: 'Administrador de obra', baseCostPerM2: 500_000, defaultAdminPercent: 15 },
};
exports.DEFAULT_PERCENTAGES = {
    NOTARY_FEES_PERCENT: 1.07,
    BROKER_COMMISSION_PERCENT: 3,
};
//# sourceMappingURL=thresholds.constants.js.map