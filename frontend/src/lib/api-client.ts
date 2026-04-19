import type { AnalysisRequest, AnalysisResult } from '@/types/analysis.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function calculateAnalysis(data: AnalysisRequest): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analysis/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error de servidor' }));
    throw new Error(error.message ?? `Error ${res.status}`);
  }

  return res.json();
}
