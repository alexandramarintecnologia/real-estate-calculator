import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AnalysisHistoryService } from './analysis-history.service.js';
import {
  AnalysisHistoryQueryDto,
  CompareAnalysisDto,
  UpdateAnalysisLabelDto,
} from './dto/analysis-history.dto.js';

interface JwtUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

@UseGuards(JwtAuthGuard)
@Controller('analysis-history')
export class AnalysisHistoryController {
  constructor(private readonly historyService: AnalysisHistoryService) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtUser,
    @Query() query: AnalysisHistoryQueryDto,
  ) {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const result = await this.historyService.findByUser(
      user.id,
      page,
      limit,
      query.search,
    );

    return {
      data: result.data.map((doc) => this.serialize(doc)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    const doc = await this.historyService.findOne(id, user.id);
    if (!doc) throw new NotFoundException('Análisis no encontrado');
    return this.serializeFull(doc);
  }

  @Patch(':id/label')
  async updateLabel(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateAnalysisLabelDto,
  ) {
    const doc = await this.historyService.updateLabel(id, user.id, dto.label);
    if (!doc) throw new NotFoundException('Análisis no encontrado');
    return this.serialize(doc);
  }

  @Post('compare')
  async compare(
    @CurrentUser() user: JwtUser,
    @Body() dto: CompareAnalysisDto,
  ) {
    const docs = await this.historyService.findManyByUser(dto.ids, user.id);
    return docs.map((doc) => this.serializeFull(doc));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    const deleted = await this.historyService.remove(id, user.id);
    if (!deleted) throw new NotFoundException('Análisis no encontrado');
  }

  private serialize(doc: any) {
    return {
      id: doc._id.toString(),
      label: doc.label,
      direccion: doc.direccion,
      precioCompra: doc.precioCompra,
      precioVenta: doc.precioVenta,
      roi: doc.roi,
      decision: doc.decision,
      createdAt: doc.createdAt,
    };
  }

  private serializeFull(doc: any) {
    return {
      ...this.serialize(doc),
      request: doc.request,
      result: doc.result,
    };
  }
}
