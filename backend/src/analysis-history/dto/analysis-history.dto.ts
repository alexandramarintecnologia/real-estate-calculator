import { IsArray, IsOptional, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class UpdateAnalysisLabelDto {
  @IsString()
  label!: string;
}

export class AnalysisHistoryQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  ids?: string;
}

export class CompareAnalysisDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  ids!: string[];
}
