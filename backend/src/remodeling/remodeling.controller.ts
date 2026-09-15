import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EstimateRemodelingUseCase } from './application/estimate-remodeling.use-case.js';
import { RemodelingRequestDto } from './dto/remodeling-request.dto.js';
import {
  BUDGET_TIERS,
  BUDGET_TIER_IDS,
  type BudgetTierConfig,
} from './domain/constants/budget-tiers.constants.js';
import {
  ACTIVE_AREAS,
  AREA_GROUPS,
  type AreaGroupConfig,
  type RemodelingAreaConfig,
} from './domain/constants/remodeling-areas.constants.js';
import type { RemodelingEstimate } from './domain/types/remodeling-estimate.type.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('remodeling')
export class RemodelingController {
  constructor(private readonly estimateRemodeling: EstimateRemodelingUseCase) {}

  /** Catalogo de niveles, para que el front no repita los porcentajes. */
  @Get('tiers')
  tiers(): BudgetTierConfig[] {
    return BUDGET_TIER_IDS.map((id) => BUDGET_TIERS[id]);
  }

  /** Catalogo de areas agrupadas, para armar el selector del front. */
  @Get('areas')
  areas(): { groups: AreaGroupConfig[]; areas: RemodelingAreaConfig[] } {
    const groups = Object.values(AREA_GROUPS).filter((group) =>
      ACTIVE_AREAS.some((area) => area.group === group.id),
    );
    return { groups, areas: ACTIVE_AREAS };
  }

  @Post('estimate')
  estimate(@Body() dto: RemodelingRequestDto): RemodelingEstimate {
    return this.estimateRemodeling.execute(dto);
  }
}
