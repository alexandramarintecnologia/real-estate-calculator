import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../schemas/user.schema.js';

export class BulkUserItemDto {
  @IsString()
  email!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class BulkCreateUsersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => BulkUserItemDto)
  users!: BulkUserItemDto[];

  /**
   * Meses de vigencia aplicados a todos los usuarios del lote.
   * Por defecto 3 meses. Usa 0 para acceso sin fecha de expiración.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  expiresInMonths?: number;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
