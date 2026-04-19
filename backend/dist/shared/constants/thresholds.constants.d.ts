export declare const ROI_THRESHOLDS: {
    readonly EXCELLENT: 15;
    readonly GOOD: 8;
};
export declare const CAP_RATE_THRESHOLDS: {
    readonly EXCELLENT: 8;
    readonly GOOD: 5;
};
export declare const ZONE_THRESHOLDS: {
    readonly EXCELLENT: 2.5;
    readonly GOOD: 1.5;
};
export declare const REMODELING_SCENARIOS: {
    readonly 1: {
        readonly label: "Empresa todo costo";
        readonly costPerM2: 1150000;
    };
    readonly 2: {
        readonly label: "Solo mano de obra";
        readonly costPerM2: 500000;
    };
    readonly 3: {
        readonly label: "Administrador de obra";
        readonly baseCostPerM2: 500000;
        readonly defaultAdminPercent: 15;
    };
};
export declare const DEFAULT_PERCENTAGES: {
    readonly NOTARY_FEES_PERCENT: 1.07;
    readonly BROKER_COMMISSION_PERCENT: 3;
};
