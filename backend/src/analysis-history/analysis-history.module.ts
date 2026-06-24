import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import { AnalysisHistoryController } from './analysis-history.controller.js';
import { AnalysisHistoryService } from './analysis-history.service.js';
import {
  AnalysisHistory,
  AnalysisHistorySchema,
} from './schemas/analysis-history.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalysisHistory.name, schema: AnalysisHistorySchema },
    ]),
    AuthModule,
  ],
  controllers: [AnalysisHistoryController],
  providers: [AnalysisHistoryService],
  exports: [AnalysisHistoryService],
})
export class AnalysisHistoryModule {}
