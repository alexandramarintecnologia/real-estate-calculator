"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualitativeScore = exports.Decision = exports.Rating = void 0;
var Rating;
(function (Rating) {
    Rating["EXCELENTE"] = "excelente";
    Rating["BUENA"] = "buena";
    Rating["RIESGOSA"] = "riesgosa";
})(Rating || (exports.Rating = Rating = {}));
var Decision;
(function (Decision) {
    Decision["COMPRAR"] = "comprar";
    Decision["EVALUAR"] = "evaluar";
    Decision["NO_RECOMENDABLE"] = "no_recomendable";
})(Decision || (exports.Decision = Decision = {}));
var QualitativeScore;
(function (QualitativeScore) {
    QualitativeScore[QualitativeScore["DESCARTADO"] = 0] = "DESCARTADO";
    QualitativeScore[QualitativeScore["REGULAR"] = 1] = "REGULAR";
    QualitativeScore[QualitativeScore["BUENO"] = 2] = "BUENO";
    QualitativeScore[QualitativeScore["EXCELENTE"] = 3] = "EXCELENTE";
})(QualitativeScore || (exports.QualitativeScore = QualitativeScore = {}));
//# sourceMappingURL=analysis-result.type.js.map