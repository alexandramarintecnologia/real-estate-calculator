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

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Limpia prefijos comunes que Google Sheets puede insertar en links de email. */
function cleanEmail(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^mailto:/i, "")
    .trim();
}

const HEADER_ALIASES: Record<keyof BulkUserItem, string[]> = {
  email: ["email", "correo", "correo electronico", "e-mail", "e mail", "mail"],
  fullName: [
    "nombre",
    "name",
    "fullname",
    "full name",
    "nombre completo",
    "cliente",
    "clientes",
    "nombre del cliente",
  ],
  phone: [
    "telefono",
    "teléfono",
    "phone",
    "celular",
    "movil",
    "móvil",
    "cel",
    "whatsapp",
  ],
};

/** Cuántas filas iniciales se inspeccionan buscando el encabezado (el resto son títulos). */
const HEADER_SEARCH_LIMIT = 10;

/** Un registro CSV lógico, que puede abarcar varias líneas físicas del archivo. */
interface CsvRecord {
  /** Línea física (1-based) donde empieza el registro. */
  line: number;
  cells: string[];
  raw: string;
}

/**
 * Parser CSV completo: recorre el contenido carácter a carácter respetando
 * comillas dobles, por lo que soporta delimitadores y saltos de línea dentro
 * de un campo (p. ej. la celda `"FECHA\nRENOVACIÓN"` que exporta Google Sheets).
 */
function parseCsv(content: string, delimiter: string): CsvRecord[] {
  const records: CsvRecord[] = [];
  let cells: string[] = [];
  let field = "";
  let inQuotes = false;
  let line = 1;
  let recordStartLine = 1;
  let recordStart = 0;
  let i = 0;

  const endRecord = (endIndex: number) => {
    cells.push(field);
    records.push({
      line: recordStartLine,
      cells: cells.map((c) => c.trim()),
      raw: content.slice(recordStart, endIndex),
    });
    cells = [];
    field = "";
  };

  for (; i < content.length; i++) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        if (ch === "\n") line++;
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      cells.push(field);
      field = "";
    } else if (ch === "\r" || ch === "\n") {
      endRecord(i);
      if (ch === "\r" && content[i + 1] === "\n") i++;
      line++;
      recordStartLine = line;
      recordStart = i + 1;
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || cells.length > 0) endRecord(content.length);

  return records.filter((r) => r.cells.some((c) => c.length > 0));
}

/**
 * Detecta el delimitador contando ocurrencias fuera de comillas en todo el
 * archivo, para no confundirse con comas dentro de campos como `"1 julio, 2026"`.
 */
function detectDelimiter(content: string): string {
  const candidates = [",", ";", "\t"];
  const counts = new Map(candidates.map((c) => [c, 0]));
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') i++;
      else inQuotes = !inQuotes;
    } else if (!inQuotes && counts.has(ch)) {
      counts.set(ch, counts.get(ch)! + 1);
    }
  }

  let best = ",";
  let bestCount = -1;
  for (const c of candidates) {
    const count = counts.get(c)!;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
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
 * Parsea el contenido de un CSV a usuarios.
 * - Detecta delimitador (`,`, `;`, tab).
 * - Soporta comas y saltos de línea dentro de campos entre comillas.
 * - Busca los encabezados por nombre en las primeras filas (no solo la primera),
 *   ignorando las filas de título que Google Sheets suele poner antes.
 * - Si no hay encabezado reconocible, asume el orden: email, nombre, teléfono.
 * - Valida formato de email y presencia del nombre.
 */
export function parseUsersCsv(content: string): CsvParseResult {
  const clean = content.replace(/^﻿/, ""); // quita BOM

  const valid: ParsedRow[] = [];
  const invalid: InvalidRow[] = [];

  const delimiter = detectDelimiter(clean);
  const records = parseCsv(clean, delimiter);

  if (records.length === 0) {
    return { valid, invalid, totalRows: 0 };
  }

  // Busca el encabezado en las primeras filas; lo anterior son títulos y se ignora.
  let headerIndex = -1;
  let headerMap: Record<keyof BulkUserItem, number> | null = null;
  for (let i = 0; i < Math.min(records.length, HEADER_SEARCH_LIMIT); i++) {
    const map = detectHeaderMap(records[i].cells);
    if (map) {
      headerIndex = i;
      headerMap = map;
      break;
    }
  }

  // Si hay encabezado, los datos empiezan justo después; si no, en la primera fila.
  const dataRows = headerMap ? records.slice(headerIndex + 1) : records;
  const cols = headerMap ?? { email: 0, fullName: 1, phone: 2 };

  for (const { line, cells, raw: text } of dataRows) {
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

  return { valid, invalid, totalRows: dataRows.length };
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
