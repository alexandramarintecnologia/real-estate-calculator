"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualitativeEvaluator = exports.QUALITATIVE_FACTORS = void 0;
const common_1 = require("@nestjs/common");
const analysis_result_type_js_1 = require("../types/analysis-result.type.js");
const thresholds_constants_js_1 = require("../../../shared/constants/thresholds.constants.js");
exports.QUALITATIVE_FACTORS = [
    'entorno',
    'accesibilidad',
    'transporte',
    'seguridad',
    'comercioOcio',
    'documentacion',
];
let QualitativeEvaluator = class QualitativeEvaluator {
    evaluate(scores) {
        const values = Object.values(scores);
        const sum = values.reduce((acc, v) => acc + v, 0);
        const average = values.length > 0
            ? Math.round((sum / values.length) * 100) / 100
            : 0;
        return {
            scores,
            average,
            rating: this.rateAverage(average),
        };
    }
    rateAverage(average) {
        if (average >= thresholds_constants_js_1.ZONE_THRESHOLDS.EXCELLENT)
            return analysis_result_type_js_1.Rating.EXCELENTE;
        if (average >= thresholds_constants_js_1.ZONE_THRESHOLDS.GOOD)
            return analysis_result_type_js_1.Rating.BUENA;
        return analysis_result_type_js_1.Rating.RIESGOSA;
    }
};
exports.QualitativeEvaluator = QualitativeEvaluator;
exports.QualitativeEvaluator = QualitativeEvaluator = __decorate([
    (0, common_1.Injectable)()
], QualitativeEvaluator);
//# sourceMappingURL=qualitative.evaluator.js.map