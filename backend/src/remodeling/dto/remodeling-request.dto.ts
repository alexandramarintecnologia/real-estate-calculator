import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsObject,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PERCENT_BOUNDS } from '../domain/constants/budget-tiers.constants.js';

/**
 * Se declara antes de RemodelingRequestDto a proposito: `emitDecoratorMetadata`
 * emite la referencia del tipo de forma anticipada, y si la clase queda debajo
 * el modulo revienta en runtime con "Cannot access before initialization".
 */
export class PercentOverridesDto {
  @IsOptional()
  @IsNumber()
  @Min(PERCENT_BOUNDS.min)
  @Max(PERCENT_BOUNDS.max)
  bajo?: number;

  @IsOptional()
  @IsNumber()
  @Min(PERCENT_BOUNDS.min)
  @Max(PERCENT_BOUNDS.max)
  medio?: number;

  @IsOptional()
  @IsNumber()
  @Min(PERCENT_BOUNDS.min)
  @Max(PERCENT_BOUNDS.max)
  alto?: number;
}

export class RemodelingRequestDto {
  /** Costo del apartamento sobre el que se proyecta la remodelacion. */
  @IsNumber()
  @Min(1)
  basePrice!: number;

  @IsEnum(['manual', 'analysis'])
  basePriceSource!: 'manual' | 'analysis';

  /** Analisis del que se tomo el precio. Solo aplica si la fuente es 'analysis'. */
  @IsOptional()
  @IsString()
  analysisId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PercentOverridesDto)
  percentOverrides?: PercentOverridesDto;

  /** Ids de las areas a las que se reparte el presupuesto del nivel elegido. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedAreas?: string[];

  /**
   * Montos fijados a mano por area, en pesos. Las areas que no aparezcan aqui
   * reciben su parte del reparto proporcional.
   */
  @IsOptional()
  @IsObject()
  areaAmounts?: Record<string, number>;
}
