import { Injectable } from '@nestjs/common';
import { BudgetTierCalculator } from '../domain/calculators/budget-tier.calculator.js';
import { AreaCostCalculator } from '../domain/calculators/area-cost.calculator.js';
import type { RemodelingEstimate } from '../domain/types/remodeling-estimate.type.js';
import type { RemodelingRequestDto } from '../dto/remodeling-request.dto.js';

@Injectable()
export class EstimateRemodelingUseCase {
  constructor(
    private readonly budgetTiers: BudgetTierCalculator,
    private readonly areaCosts: AreaCostCalculator,
  ) {}

  /**
   * Va de las areas al monto, no al reves: el usuario marca que quiere remodelar
   * y el resultado le dice cuanto necesita y que nivel de presupuesto lo cubre.
   */
  execute(dto: RemodelingRequestDto): RemodelingEstimate {
    const selectedAreas = dto.selectedAreas ?? [];

    const areaCosts = this.areaCosts.calculate(
      dto.basePrice,
      selectedAreas,
      dto.areaAmounts ?? {},
    );

    const requiredAmount = areaCosts.reduce((sum, a) => sum + a.amount, 0);
    const requiredPercent =
      dto.basePrice > 0
        ? Math.round((requiredAmount / dto.basePrice) * 1000) / 10
        : 0;

    // Los tres niveles se siguen calculando como referencia: sirven para mostrar
    // contra que se compara el monto necesario.
    const tiers = this.budgetTiers.calculateAll(
      dto.basePrice,
      dto.percentOverrides ?? {},
    );
    const match = this.budgetTiers.classify(requiredPercent, tiers);

    return {
      basePrice: dto.basePrice,
      basePriceSource: dto.basePriceSource,
      analysisId: dto.analysisId,
      selectedAreas: areaCosts.map((a) => a.area),
      areaCosts,
      requiredAmount,
      requiredPercent,
      coverage: this.areaCosts.coverage(selectedAreas),
      recommendedTier: match.tier,
      exceedsTopTier: match.exceedsTopTier,
      tiers,
      generatedAt: new Date().toISOString(),
    };
  }
}
