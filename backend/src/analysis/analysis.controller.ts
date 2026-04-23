import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyzePropertyUseCase } from './application/analyze-property.use-case.js';
import { AnalysisRequestDto } from './dto/analysis-request.dto.js';
import type { AnalysisResult } from './domain/types/analysis-result.type.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analyzeProperty: AnalyzePropertyUseCase) {}

  @Post('calculate')
  calculate(@Body() dto: AnalysisRequestDto): AnalysisResult {
    return this.analyzeProperty.execute(dto);
  }
}
