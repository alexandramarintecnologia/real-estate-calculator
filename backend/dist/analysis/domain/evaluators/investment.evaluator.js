"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentEvaluator = void 0;
const common_1 = require("@nestjs/common");
const analysis_result_type_js_1 = require("../types/analysis-result.type.js");
const thresholds_constants_js_1 = require("../../../shared/constants/thresholds.constants.js");
let InvestmentEvaluator = class InvestmentEvaluator {
    evaluate(profitability, qualitative) {
        const roiRating = this.rateRoi(profitability.roi);
        const capRateRating = this.rateCapRate(profitability.capRate);
        const zoneRating = qualitative.rating;
        const overallRating = this.computeOverallRating(roiRating, capRateRating, zoneRating);
        const decision = this.computeDecision(roiRating, zoneRating);
        const recommendations = this.buildRecommendations(profitability, roiRating, capRateRating, zoneRating);
        return {
            roiRating,
            capRateRating,
            zoneRating,
            overallRating,
            decision,
            recommendations,
        };
    }
    rateRoi(roi) {
        if (roi >= thresholds_constants_js_1.ROI_THRESHOLDS.EXCELLENT)
            return analysis_result_type_js_1.Rating.EXCELENTE;
        if (roi >= thresholds_constants_js_1.ROI_THRESHOLDS.GOOD)
            return analysis_result_type_js_1.Rating.BUENA;
        return analysis_result_type_js_1.Rating.RIESGOSA;
    }
    rateCapRate(capRate) {
        if (capRate >= thresholds_constants_js_1.CAP_RATE_THRESHOLDS.EXCELLENT)
            return analysis_result_type_js_1.Rating.EXCELENTE;
        if (capRate >= thresholds_constants_js_1.CAP_RATE_THRESHOLDS.GOOD)
            return analysis_result_type_js_1.Rating.BUENA;
        return analysis_result_type_js_1.Rating.RIESGOSA;
    }
    computeOverallRating(roi, capRate, zone) {
        const ratings = [roi, capRate, zone];
        const scores = ratings.map((r) => this.ratingToScore(r));
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg >= 2.5)
            return analysis_result_type_js_1.Rating.EXCELENTE;
        if (avg >= 1.5)
            return analysis_result_type_js_1.Rating.BUENA;
        return analysis_result_type_js_1.Rating.RIESGOSA;
    }
    computeDecision(roiRating, zoneRating) {
        if (roiRating === analysis_result_type_js_1.Rating.EXCELENTE && zoneRating !== analysis_result_type_js_1.Rating.RIESGOSA) {
            return analysis_result_type_js_1.Decision.COMPRAR;
        }
        if (roiRating === analysis_result_type_js_1.Rating.RIESGOSA || zoneRating === analysis_result_type_js_1.Rating.RIESGOSA) {
            return analysis_result_type_js_1.Decision.NO_RECOMENDABLE;
        }
        return analysis_result_type_js_1.Decision.EVALUAR;
    }
    buildRecommendations(profitability, roiRating, capRateRating, zoneRating) {
        const recs = [];
        if (roiRating === analysis_result_type_js_1.Rating.EXCELENTE) {
            recs.push(`ROI de ${profitability.roi}% — Excelente retorno de inversión.`);
        }
        else if (roiRating === analysis_result_type_js_1.Rating.BUENA) {
            recs.push(`ROI de ${profitability.roi}% — Retorno aceptable. Evalúa si puedes negociar un mejor precio de compra.`);
        }
        else {
            recs.push(`ROI de ${profitability.roi}% — Retorno bajo. Considera renegociar el precio o buscar otra propiedad.`);
        }
        if (capRateRating === analysis_result_type_js_1.Rating.EXCELENTE) {
            recs.push(`Cap Rate de ${profitability.capRate}% — Excelente rentabilidad por arriendo.`);
        }
        else if (capRateRating === analysis_result_type_js_1.Rating.BUENA) {
            recs.push(`Cap Rate de ${profitability.capRate}% — Rentabilidad por arriendo aceptable.`);
        }
        else {
            recs.push(`Cap Rate de ${profitability.capRate}% — Baja rentabilidad por arriendo. El plan B de arrendar podría no ser viable.`);
        }
        if (zoneRating === analysis_result_type_js_1.Rating.RIESGOSA) {
            recs.push('La zona no cumple con los estándares mínimos. Revisa entorno, seguridad y accesibilidad.');
        }
        else if (zoneRating === analysis_result_type_js_1.Rating.EXCELENTE) {
            recs.push('La zona tiene excelentes condiciones de entorno, accesibilidad y servicios.');
        }
        if (profitability.grossProfit < 0) {
            recs.push('ALERTA: La ganancia bruta proyectada es negativa. Este proyecto generaría pérdidas.');
        }
        return recs;
    }
    ratingToScore(rating) {
        switch (rating) {
            case analysis_result_type_js_1.Rating.EXCELENTE: return 3;
            case analysis_result_type_js_1.Rating.BUENA: return 2;
            case analysis_result_type_js_1.Rating.RIESGOSA: return 1;
        }
    }
};
exports.InvestmentEvaluator = InvestmentEvaluator;
exports.InvestmentEvaluator = InvestmentEvaluator = __decorate([
    (0, common_1.Injectable)()
], InvestmentEvaluator);
//# sourceMappingURL=investment.evaluator.js.map