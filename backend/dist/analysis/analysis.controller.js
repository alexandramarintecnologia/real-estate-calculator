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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisController = void 0;
const common_1 = require("@nestjs/common");
const analyze_property_use_case_js_1 = require("./application/analyze-property.use-case.js");
const analysis_request_dto_js_1 = require("./dto/analysis-request.dto.js");
let AnalysisController = class AnalysisController {
    analyzeProperty;
    constructor(analyzeProperty) {
        this.analyzeProperty = analyzeProperty;
    }
    calculate(dto) {
        return this.analyzeProperty.execute(dto);
    }
};
exports.AnalysisController = AnalysisController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analysis_request_dto_js_1.AnalysisRequestDto]),
    __metadata("design:returntype", Object)
], AnalysisController.prototype, "calculate", null);
exports.AnalysisController = AnalysisController = __decorate([
    (0, common_1.Controller)('analysis'),
    __metadata("design:paramtypes", [analyze_property_use_case_js_1.AnalyzePropertyUseCase])
], AnalysisController);
//# sourceMappingURL=analysis.controller.js.map