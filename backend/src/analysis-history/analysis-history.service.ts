import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AnalysisHistory,
  AnalysisHistoryDocument,
} from './schemas/analysis-history.schema.js';

export interface PaginatedHistory {
  data: AnalysisHistoryDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AnalysisHistoryService {
  constructor(
    @InjectModel(AnalysisHistory.name)
    private readonly historyModel: Model<AnalysisHistoryDocument>,
  ) {}

  async create(
    userId: string,
    request: Record<string, unknown>,
    result: Record<string, unknown>,
  ): Promise<AnalysisHistoryDocument> {
    const property = request['property'] as Record<string, unknown> | undefined;
    const profitability = result['profitability'] as
      | Record<string, unknown>
      | undefined;
    const evaluation = result['evaluation'] as
      | Record<string, unknown>
      | undefined;

    const doc = new this.historyModel({
      userId: new Types.ObjectId(userId),
      request,
      result,
      label: (property?.['direccion'] as string) || 'Sin dirección',
      direccion: (property?.['direccion'] as string) || '',
      precioCompra: (property?.['precioCompra'] as number) || 0,
      precioVenta: (property?.['precioVentaProyectado'] as number) || 0,
      roi: (profitability?.['roi'] as number) || 0,
      decision: (evaluation?.['decision'] as string) || '',
    });

    return doc.save();
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<PaginatedHistory> {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (search) {
      filter['$or'] = [
        { label: { $regex: search, $options: 'i' } },
        { direccion: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.historyModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.historyModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<AnalysisHistoryDocument | null> {
    return this.historyModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }

  async updateLabel(
    id: string,
    userId: string,
    label: string,
  ): Promise<AnalysisHistoryDocument | null> {
    return this.historyModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          userId: new Types.ObjectId(userId),
        },
        { label },
        { new: true },
      )
      .exec();
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const result = await this.historyModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();
    return result.deletedCount > 0;
  }

  async countByUser(userId: string): Promise<number> {
    return this.historyModel
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async findManyByUser(
    ids: string[],
    userId: string,
  ): Promise<AnalysisHistoryDocument[]> {
    const objectIds = ids
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    return this.historyModel
      .find({
        _id: { $in: objectIds },
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }
}
