import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { RemodelingController } from './remodeling.controller.js';
import { EstimateRemodelingUseCase } from './application/estimate-remodeling.use-case.js';
import { BudgetTierCalculator } from './domain/calculators/budget-tier.calculator.js';
import { AreaCostCalculator } from './domain/calculators/area-cost.calculator.js';

@Module({
  imports: [AuthModule],
  controllers: [RemodelingController],
  providers: [
    EstimateRemodelingUseCase,
    BudgetTierCalculator,
    AreaCostCalculator,
  ],
})
export class RemodelingModule {}
