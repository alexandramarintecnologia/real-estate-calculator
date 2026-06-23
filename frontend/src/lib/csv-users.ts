import type { BulkUserItem } from "@/types/auth.types";

export interface ParsedRow extends BulkUserItem {
  /** Número de fila en el archivo (1-based, contando el archivo original). */
  line: number;
}

export interface InvalidRow {
  line: number;
  raw: string;
  reason: string;
}

export interface CsvParseResult {
  valid: ParsedRow[];
  invalid: InvalidRow[];
  /** Total de filas de datos consideradas (válidas + inválidas). */
  totalRows: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Limpia prefijos comunes que Google Sheets puede insertar en links de email. */
function cleanEmail(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^mailto:/i, "")
    .trim();
}

const HEADER_ALIASES: Record<keyof BulkUserItem, string[]> = {
  email: ["email", "correo", "correo electronico", "e-mail", "mail"],
  fullName: ["nombre", "name", "fullname", "full name", "nombre completo", "cliente"],
  phone: ["telefono", "teléfono", "phone", "celular", "movil", "móvil", "cel"],
};

/** Detecta el delimitador más frecuente en la primera línea con contenido. */
function detectDelimiter(firstLine: string): string {
  const candidates = [",", ";", "\t"];
  let best = ",";
  let bestCount = -1;
  for (const c of candidates) {
    const count = firstLine.split(c).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

/** Parser CSV por línea que respeta campos entre comillas dobles. */
function parseLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out.map((f) => f.trim());
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Devuelve el índice de columna para cada campo, o null si no hay encabezado reconocible. */
function detectHeaderMap(
  cells: string[],
): Record<keyof BulkUserItem, number> | null {
  const normalized = cells.map(normalizeHeader);
  const map: Partial<Record<keyof BulkUserItem, number>> = {};

  (Object.keys(HEADER_ALIASES) as Array<keyof BulkUserItem>).forEach((field) => {
    const aliases = HEADER_ALIASES[field].map(normalizeHeader);
    const idx = normalized.findIndex((h) => aliases.includes(h));
    if (idx !== -1) map[field] = idx;
  });

  // Consideramos que hay encabezado solo si al menos detectamos la columna email.
  if (map.email === undefined) return null;
  return {
    email: map.email,
    fullName: map.fullName ?? -1,
    phone: map.phone ?? -1,
  };
}

/**
 * Busca el encabezado en las primeras MAX_HEADER_SCAN líneas del archivo.
 * Google Sheets suele colocar una fila de título antes de los encabezados reales.
 */
const MAX_HEADER_SCAN = 10;

/**
 * Parsea el contenido de un CSV a usuarios.
 * - Detecta delimitador (`,`, `;`, tab).
 * - Busca los encabezados por nombre en las primeras filas (no solo la primera).
 * - Si no hay encabezado reconocible, asume el orden: email, nombre, teléfono.
 * - Valida formato de email y presencia del nombre.
 */
export function parseUsersCsv(content: string): CsvParseResult {
  const rawLines = content
    .replace(/^﻿/, "") // quita BOM
    .split(/\r\n|\n|\r/);

  const lines = rawLines
    .map((line, idx) => ({ line: idx + 1, text: line }))
    .filter((l) => l.text.trim().length > 0);

  const valid: ParsedRow[] = [];
  const invalid: InvalidRow[] = [];

  if (lines.length === 0) {
    return { valid, invalid, totalRows: 0 };
  }

  const delimiter = detectDelimiter(lines[0].text);

  // Buscar la fila de encabezado en las primeras N líneas
  let headerMap: Record<keyof BulkUserItem, number> | null = null;
  let headerLineIdx = -1;

  const scanLimit = Math.min(MAX_HEADER_SCAN, lines.length);
  for (let i = 0; i < scanLimit; i++) {
    const cells = parseLine(lines[i].text, delimiter);
    const detected = detectHeaderMap(cells);
    if (detected) {
      headerMap = detected;
      headerLineIdx = i;
      break;
    }
  }

  // Los datos empiezan justo después de la fila de encabezado.
  // Si no se encontró, se asume que todo es data con orden: email, nombre, teléfono.
  const dataLines = headerMap ? lines.slice(headerLineIdx + 1) : lines;
  const cols = headerMap ?? { email: 0, fullName: 1, phone: 2 };

  for (const { line, text } of dataLines) {
    const cells = parseLine(text, delimiter);
    const email = cleanEmail(cells[cols.email] ?? "");
    const fullName = cols.fullName >= 0 ? (cells[cols.fullName] ?? "") : "";
    const phone = cols.phone >= 0 ? (cells[cols.phone] ?? "") : "";

    if (!email) {
      invalid.push({ line, raw: text, reason: "Falta el email" });
      continue;
    }
    if (!EMAIL_RE.test(email)) {
      invalid.push({ line, raw: text, reason: `Email inválido: "${email}"` });
      continue;
    }
    if (fullName.trim().length < 2) {
      invalid.push({ line, raw: text, reason: "Falta el nombre (mínimo 2 caracteres)" });
      continue;
    }

    valid.push({
      line,
      email,
      fullName: fullName.trim(),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
    });
  }

  return { valid, invalid, totalRows: dataLines.length };
}

/** Elimina duplicados por email dentro del lote parseado (deja la primera aparición). */
export function dedupeByEmail(rows: ParsedRow[]): {
  unique: ParsedRow[];
  duplicates: number;
} {
  const seen = new Set<string>();
  const unique: ParsedRow[] = [];
  let duplicates = 0;
  for (const row of rows) {
    if (seen.has(row.email)) {
      duplicates += 1;
      continue;
    }
    seen.add(row.email);
    unique.push(row);
  }
  return { unique, duplicates };
}
