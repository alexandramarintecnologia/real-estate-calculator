import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyzePropertyUseCase } from './application/analyze-property.use-case.js';
import { AnalysisRequestDto } from './dto/analysis-request.dto.js';
import type { AnalysisResult } from './domain/types/analysis-result.type.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AnalysisHistoryService } from '../analysis-history/analysis-history.service.js';

interface JwtUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

@UseGuards(JwtAuthGuard)
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analyzeProperty: AnalyzePropertyUseCase,
    private readonly historyService: AnalysisHistoryService,
  ) {}

  @Post('calculate')
  async calculate(
    @Body() dto: AnalysisRequestDto,
    @CurrentUser() user: JwtUser,
  ): Promise<AnalysisResult> {
    const result = this.analyzeProperty.execute(dto);

    this.historyService
      .create(
        user.id,
        dto as unknown as Record<string, unknown>,
        result as unknown as Record<string, unknown>,
      )
      .catch(() => {});

    return result;
  }
}
