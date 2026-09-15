import type { BudgetTierId } from "@/types/remodeling.types";

/**
 * Imagenes de referencia por ambiente y nivel de presupuesto.
 *
 * Se sirven desde /public por convencion de ruta, sin manifiesto que mantener:
 * basta con dejar el archivo en su carpeta y aparece solo. Si falta, la vista
 * lo dice y el modelo 3D sigue estando.
 *
 *   public/remodelaciones/<ambiente>/bajo.jpg
 *   public/remodelaciones/<ambiente>/medio.jpg
 *   public/remodelaciones/<ambiente>/alto.jpg
 *
 * Formatos admitidos: .jpg, .jpeg, .png, .webp y .avif
 *
 * A mayor nivel, mas lujosa la referencia: es la escalera visual que acompana
 * al presupuesto.
 */

const BASE = "/remodelaciones";
// Se prueban en este orden. Los formatos modernos van al final a proposito:
// las fotos actuales son .jpg, y anteponer avif haria una peticion fallida por
// imagen en cada carga. Si solo existe el avif, igual se encuentra.
const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

/** Rutas candidatas, en orden de preferencia. */
export function galleryCandidates(roomId: string, tier: BudgetTierId): string[] {
  return EXTENSIONS.map((ext) => `${BASE}/${roomId}/${tier}.${ext}`);
}

/** Ruta esperada, para poder decir exactamente que archivo falta. */
export function expectedPath(roomId: string, tier: BudgetTierId): string {
  return `public${BASE}/${roomId}/${tier}.jpg`;
}
