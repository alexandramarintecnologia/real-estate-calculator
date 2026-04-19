import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalysisModule } from './analysis/analysis.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AnalysisModule,
  ],
})
export class AppModule {}
