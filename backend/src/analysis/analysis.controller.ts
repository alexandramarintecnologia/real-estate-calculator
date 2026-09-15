import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { AnalyzePropertyUseCase } from './application/analyze-property.use-case.js';
import { AnalysisRequestDto } from './dto/analysis-request.dto.js';
import type { AnalysisResult } from './domain/types/analysis-result.type.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  type JwtUser,
} from '../auth/decorators/current-user.decorator.js';
import { AnalysisHistoryService } from '../analysis-history/analysis-history.service.js';

@UseGuards(JwtAuthGuard)
@Controller('analysis')
export class AnalysisController {
  private readonly logger = new Logger(AnalysisController.name);

  constructor(
    private readonly analyzeProperty: AnalyzePropertyUseCase,
    private readonly historyService: AnalysisHistoryService,
  ) {}

  @Post('calculate')
  calculate(
    @Body() dto: AnalysisRequestDto,
    @CurrentUser() user: JwtUser,
  ): AnalysisResult {
    const result = this.analyzeProperty.execute(dto);

    // Guardamos en el historial sin bloquear la respuesta: un problema de base de
    // datos no debe impedirle al usuario ver su analisis. Pero si falla lo dejamos
    // en el log, porque antes se perdia en silencio y parecia guardado.
    void this.historyService
      .create(
        user.id,
        dto as unknown as Record<string, unknown>,
        result as unknown as Record<string, unknown>,
      )
      .catch((error: unknown) => {
        this.logger.error(
          `No se pudo guardar en el historial el analisis de ${user.email}`,
          error instanceof Error ? error.stack : String(error),
        );
      });

    return result;
  }
}
