import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PropertyDataDto {
  @IsOptional() @IsString()
  linkPortal?: string;

  @IsString()
  direccion!: string;

  @IsOptional() @IsString()
  torre?: string;

  @IsOptional() @IsNumber()
  piso?: number;

  @IsOptional() @IsString()
  numeroApto?: string;

  @IsNumber() @Min(0)
  alcobas!: number;

  @IsNumber() @Min(0)
  banos!: number;

  @IsNumber() @Min(1)
  metrosCuadrados!: number;

  @IsNumber() @Min(0)
  m2Remodelacion!: number;

  @IsBoolean()
  parqueadero!: boolean;

  @IsOptional() @IsString()
  nombrePropietario?: string;

  @IsOptional() @IsString()
  celular?: string;

  @IsNumber() @Min(0)
  gastosPosesionMensual!: number;

  @IsNumber() @Min(0)
  precioCompra!: number;

  @IsNumber() @Min(0)
  arriendoProyectado!: number;

  @IsNumber() @Min(0)
  precioVentaProyectado!: number;

  @IsNumber() @Min(1)
  mesesProyectadosVenta!: number;

  @IsOptional() @IsString()
  observaciones?: string;

  @IsOptional() @IsNumber() @Min(0) @Max(10)
  puntuacionPersonal?: number;

  @IsOptional()
  @IsEnum(['pendiente', 'en_negociacion', 'en_documentos', 'descartado'])
  estadoNegociacion?: string;
}

export class RemodelingScenarioDto {
  @IsNumber() @Min(1) @Max(3)
  selectedScenario!: 1 | 2 | 3;

  @IsOptional() @IsNumber() @Min(10) @Max(25)
  adminPercentage?: number;

  @IsOptional() @IsNumber() @Min(0)
  customCostPerM2?: number;
}

export class ProjectExpensesDto {
  @IsOptional() @IsNumber() @Min(0)
  notaryFeesValue?: number;

  @IsOptional() @IsEnum(['percent', 'fixed'])
  notaryFeesType?: 'percent' | 'fixed';

  @IsOptional() @IsNumber() @Min(0)
  brokerCommissionValue?: number;

  @IsOptional() @IsEnum(['percent', 'fixed'])
  brokerCommissionType?: 'percent' | 'fixed';

  @IsOptional() @IsNumber() @Min(0)
  otherExpenses?: number;
}

export class QualitativeEvaluationDto {
  @IsNumber() @Min(0) @Max(3)
  entorno!: number;

  @IsNumber() @Min(0) @Max(3)
  accesibilidad!: number;

  @IsNumber() @Min(0) @Max(3)
  transporte!: number;

  @IsNumber() @Min(0) @Max(3)
  seguridad!: number;

  @IsNumber() @Min(0) @Max(3)
  comercioOcio!: number;

  @IsNumber() @Min(0) @Max(3)
  documentacion!: number;
}

export class AnalysisRequestDto {
  @ValidateNested()
  @Type(() => PropertyDataDto)
  property!: PropertyDataDto;

  @ValidateNested()
  @Type(() => RemodelingScenarioDto)
  remodeling!: RemodelingScenarioDto;

  @ValidateNested()
  @Type(() => ProjectExpensesDto)
  expenses!: ProjectExpensesDto;

  @ValidateNested()
  @Type(() => QualitativeEvaluationDto)
  qualitative!: QualitativeEvaluationDto;
}
