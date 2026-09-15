/**
 * Planta esquematica del apartamento para la vista 3D.
 *
 * Cada cuarto corresponde a un area del grupo "espacios" del catalogo de
 * remodelaciones (mismo id), para que marcar un area prenda su cuarto.
 *
 * Medidas en metros, con el origen en la esquina de la planta. El visor la
 * centra al armar la escena. Es una distribucion de referencia, no la del
 * inmueble real: sirve para ver que zonas se intervienen, no para medir.
 */

export interface Room {
  /** Mismo id que el area en el catalogo del backend. */
  id: string;
  label: string;
  /** Esquina menor en el plano. */
  x: number;
  z: number;
  /** Ancho (eje x) y fondo (eje z). */
  width: number;
  depth: number;
}

export const APARTMENT_ROOMS: Room[] = [
  { id: "entrada_hall", label: "Entrada / Hall", x: 0, z: 0, width: 2, depth: 2.5 },
  { id: "zona_social", label: "Zona social", x: 2, z: 0, width: 5, depth: 4.5 },
  { id: "balcon_terraza", label: "Balcón / Terraza", x: 7, z: 0, width: 5, depth: 2 },
  { id: "cocina", label: "Cocina", x: 7, z: 2, width: 3.5, depth: 3 },
  { id: "zona_ropas", label: "Zona de ropas", x: 10.5, z: 2, width: 1.5, depth: 3 },
  { id: "bano_social", label: "Baño social", x: 0, z: 2.5, width: 2, depth: 2 },
  { id: "habitacion_principal", label: "Habitación principal", x: 0, z: 4.5, width: 4, depth: 4.5 },
  { id: "vestier", label: "Vestier", x: 4, z: 4.5, width: 1.5, depth: 2 },
  { id: "bano_principal", label: "Baño principal", x: 4, z: 6.5, width: 1.5, depth: 2.5 },
  { id: "habitaciones_secundarias", label: "Habitaciones secundarias", x: 5.5, z: 5, width: 3.5, depth: 4 },
  { id: "estudio_oficina", label: "Estudio / Oficina", x: 9, z: 5, width: 3, depth: 4 },
];

/** Huella total de la planta, para centrar la escena y encuadrar la camara. */
export const PLAN_SIZE = {
  width: Math.max(...APARTMENT_ROOMS.map((r) => r.x + r.width)),
  depth: Math.max(...APARTMENT_ROOMS.map((r) => r.z + r.depth)),
};

/**
 * Areas transversales: no son un cuarto, se aplican sobre todos.
 * Marcar "Pisos" deja el piso terminado en todo el apartamento, y lo mismo
 * "Paredes" con los muros.
 */
export const CROSS_CUTTING = {
  floors: "pisos",
  walls: "paredes",
} as const;

/** Altura de los muros en la vista. Recortados para poder ver dentro. */
export const WALL_HEIGHT = 1.35;
export const WALL_THICKNESS = 0.12;
