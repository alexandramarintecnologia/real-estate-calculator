import { AnalyzePropertyUseCase } from './application/analyze-property.use-case.js';
import { AnalysisRequestDto } from './dto/analysis-request.dto.js';
import type { AnalysisResult } from './domain/types/analysis-result.type.js';
export declare class AnalysisController {
    private readonly analyzeProperty;
    constructor(analyzeProperty: AnalyzePropertyUseCase);
    calculate(dto: AnalysisRequestDto): AnalysisResult;
}
