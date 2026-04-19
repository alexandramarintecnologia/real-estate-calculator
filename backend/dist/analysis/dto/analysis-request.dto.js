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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisRequestDto = exports.QualitativeEvaluationDto = exports.ProjectExpensesDto = exports.RemodelingScenarioDto = exports.PropertyDataDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PropertyDataDto {
    linkPortal;
    direccion;
    torre;
    piso;
    numeroApto;
    alcobas;
    banos;
    metrosCuadrados;
    m2Remodelacion;
    parqueadero;
    nombrePropietario;
    celular;
    gastosPosesionMensual;
    precioCompra;
    arriendoProyectado;
    precioVentaProyectado;
    mesesProyectadosVenta;
    observaciones;
    puntuacionPersonal;
    estadoNegociacion;
}
exports.PropertyDataDto = PropertyDataDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyDataDto.prototype, "linkPortal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyDataDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyDataDto.prototype, "torre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "piso", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyDataDto.prototype, "numeroApto", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "alcobas", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "banos", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "metrosCuadrados", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "m2Remodelacion", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PropertyDataDto.prototype, "parqueadero", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyDataDto.prototype, "nombrePropietario", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyDataDto.prototype, "celular", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "gastosPosesionMensual", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "precioCompra", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "arriendoProyectado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "precioVentaProyectado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "mesesProyectadosVenta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyDataDto.prototype, "observaciones", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], PropertyDataDto.prototype, "puntuacionPersonal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pendiente', 'en_negociacion', 'en_documentos', 'descartado']),
    __metadata("design:type", String)
], PropertyDataDto.prototype, "estadoNegociacion", void 0);
class RemodelingScenarioDto {
    selectedScenario;
    adminPercentage;
    customCostPerM2;
}
exports.RemodelingScenarioDto = RemodelingScenarioDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], RemodelingScenarioDto.prototype, "selectedScenario", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(25),
    __metadata("design:type", Number)
], RemodelingScenarioDto.prototype, "adminPercentage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RemodelingScenarioDto.prototype, "customCostPerM2", void 0);
class ProjectExpensesDto {
    notaryFeesValue;
    notaryFeesType;
    brokerCommissionValue;
    brokerCommissionType;
    otherExpenses;
}
exports.ProjectExpensesDto = ProjectExpensesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProjectExpensesDto.prototype, "notaryFeesValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['percent', 'fixed']),
    __metadata("design:type", String)
], ProjectExpensesDto.prototype, "notaryFeesType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProjectExpensesDto.prototype, "brokerCommissionValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['percent', 'fixed']),
    __metadata("design:type", String)
], ProjectExpensesDto.prototype, "brokerCommissionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProjectExpensesDto.prototype, "otherExpenses", void 0);
class QualitativeEvaluationDto {
    entorno;
    accesibilidad;
    transporte;
    seguridad;
    comercioOcio;
    documentacion;
}
exports.QualitativeEvaluationDto = QualitativeEvaluationDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], QualitativeEvaluationDto.prototype, "entorno", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], QualitativeEvaluationDto.prototype, "accesibilidad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], QualitativeEvaluationDto.prototype, "transporte", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], QualitativeEvaluationDto.prototype, "seguridad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], QualitativeEvaluationDto.prototype, "comercioOcio", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], QualitativeEvaluationDto.prototype, "documentacion", void 0);
class AnalysisRequestDto {
    property;
    remodeling;
    expenses;
    qualitative;
}
exports.AnalysisRequestDto = AnalysisRequestDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PropertyDataDto),
    __metadata("design:type", PropertyDataDto)
], AnalysisRequestDto.prototype, "property", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RemodelingScenarioDto),
    __metadata("design:type", RemodelingScenarioDto)
], AnalysisRequestDto.prototype, "remodeling", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ProjectExpensesDto),
    __metadata("design:type", ProjectExpensesDto)
], AnalysisRequestDto.prototype, "expenses", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => QualitativeEvaluationDto),
    __metadata("design:type", QualitativeEvaluationDto)
], AnalysisRequestDto.prototype, "qualitative", void 0);
//# sourceMappingURL=analysis-request.dto.js.map