import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnalysisHistoryDocument = AnalysisHistory & Document;

@Schema({ timestamps: true })
export class AnalysisHistory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Object, required: true })
  request!: Record<string, unknown>;

  @Prop({ type: Object, required: true })
  result!: Record<string, unknown>;

  @Prop({ default: '' })
  label!: string;

  @Prop({ default: '' })
  direccion!: string;

  @Prop({ default: 0 })
  precioCompra!: number;

  @Prop({ default: 0 })
  precioVenta!: number;

  @Prop({ default: 0 })
  roi!: number;

  @Prop({ default: '' })
  decision!: string;
}

export const AnalysisHistorySchema =
  SchemaFactory.createForClass(AnalysisHistory);
