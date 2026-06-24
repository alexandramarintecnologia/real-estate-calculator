import type { AnalysisRequest, AnalysisResult } from "./analysis.types";

export interface AnalysisHistoryItem {
  id: string;
  label: string;
  direccion: string;
  precioCompra: number;
  precioVenta: number;
  roi: number;
  decision: string;
  createdAt: string;
}

export interface AnalysisHistoryDetail extends AnalysisHistoryItem {
  request: AnalysisRequest;
  result: AnalysisResult;
}

export interface PaginatedHistory {
  data: AnalysisHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
