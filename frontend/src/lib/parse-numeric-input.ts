interface SanitizeNumericOptions {
  decimals?: boolean;
}

export function sanitizeNumericInput(
  raw: string,
  { decimals = false }: SanitizeNumericOptions = {},
): string {
  if (decimals) {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 1) return cleaned;
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return raw.replace(/\D/g, "");
}

export function parseNumericInput(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === ".") return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function formatNumericDisplay(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "";
  return String(value);
}

export function clampNumber(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}
