import type { BudgetTierId } from "@/types/remodeling.types";

/**
 * Materiales por ambiente y nivel, tomados de las fotos de referencia.
 *
 * La paleta de nivel da el punto de partida; esto la corrige para que cada
 * ambiente se parezca a SU foto. Sin esto todos los ambientes de un mismo nivel
 * comparten materiales, y las fotos no funcionan asi: la cocina media tiene
 * piso de marmol claro y la habitacion media lo tiene de madera.
 *
 * Los colores salen de muestrear las propias imagenes por zonas (piso, muro,
 * centro), asi que son los tonos reales de cada foto, no una interpretacion.
 */

export type FloorKind =
  | "plank"        // tablon de madera
  | "whiteMarble"  // marmol claro de formato grande
  | "blackMarble"  // marmol negro pulido
  | "darkMarble"   // marmol gris oscuro
  | "ceramic";     // baldosa ceramica mate

export type CounterKind =
  | "granite"      // granito gris
  | "quartzWhite"  // cuarzo blanco
  | "blackSpeckle" // cuarzo negro con destellos
  | "marble"       // marmol veteado
  | "terrazzo";

export type BacksplashKind = "whiteTile" | "reliefTile" | "marble" | "stone" | null;

export interface RoomTierStyle {
  floor?: FloorKind;
  counter?: CounterKind;
  backsplash?: BacksplashKind;
  /** Colores en hexadecimal. Sobrescriben los de la paleta del nivel. */
  cabinet?: number;
  cabinetUpper?: number;
  wall?: number;
  metal?: number;
  fabric?: number;
  wood?: number;
}

const key = (room: string, tier: BudgetTierId) => `${room}:${tier}`;

/**
 * Solo se declara lo que cambia respecto de la paleta del nivel. Lo que no
 * aparece aqui, se hereda.
 */
const STYLES: Record<string, RoomTierStyle> = {
  // ── Cocina ──
  // Bajo: muebles blancos, meson de granito gris, azulejo blanco, piso de madera.
  [key("cocina", "bajo")]: {
    floor: "plank",
    counter: "granite",
    backsplash: "whiteTile",
    cabinet: 0xf2f1ee,
    cabinetUpper: 0xf6f5f3,
    wall: 0xeeebe6,
    metal: 0xc6c8ca,
  },
  // Medio: bajos de madera, altos blancos, meson blanco, piso de marmol claro.
  [key("cocina", "medio")]: {
    floor: "whiteMarble",
    counter: "quartzWhite",
    backsplash: "reliefTile",
    cabinet: 0xc99b6b,
    cabinetUpper: 0xf7f6f4,
    wall: 0xf1efeb,
    metal: 0xbfc2c5,
  },
  // Alto: nogal, meson negro con destellos, marmol al fondo, luz calida.
  [key("cocina", "alto")]: {
    floor: "darkMarble",
    counter: "blackSpeckle",
    backsplash: "marble",
    cabinet: 0x7a5638,
    cabinetUpper: 0xf2f1ef,
    wall: 0x6f6259,
    metal: 0xc9a24a,
    wood: 0x7a5638,
  },

  // ── Bano principal ──
  [key("bano_principal", "bajo")]: {
    floor: "ceramic",
    counter: "granite",
    backsplash: "whiteTile",
    wall: 0xf1e7ef,
    cabinet: 0xeceaea,
  },
  [key("bano_principal", "medio")]: {
    floor: "ceramic",
    counter: "quartzWhite",
    backsplash: "reliefTile",
    wall: 0xa29386,
    cabinet: 0xa79589,
    wood: 0x9c8a7c,
  },
  [key("bano_principal", "alto")]: {
    floor: "darkMarble",
    counter: "marble",
    backsplash: "marble",
    wall: 0x867366,
    cabinet: 0x564f4b,
    metal: 0xc9a24a,
  },

  // ── Bano social ──
  [key("bano_social", "bajo")]: {
    floor: "ceramic",
    counter: "granite",
    backsplash: "whiteTile",
    wall: 0x8e8d80,
    cabinet: 0x9b8b6f,
  },
  [key("bano_social", "medio")]: {
    floor: "ceramic",
    counter: "quartzWhite",
    backsplash: "reliefTile",
    wall: 0xc6c6b3,
    cabinet: 0x93866a,
  },
  [key("bano_social", "alto")]: {
    floor: "darkMarble",
    counter: "marble",
    backsplash: "marble",
    wall: 0x898b8d,
    cabinet: 0x82857e,
    metal: 0xc9a24a,
  },

  // ── Zona social ──
  [key("zona_social", "bajo")]: {
    floor: "plank",
    wall: 0xdcd5cc,
    fabric: 0xa79c92,
    wood: 0xb2a193,
  },
  [key("zona_social", "medio")]: {
    floor: "whiteMarble",
    wall: 0xc6c2b8,
    fabric: 0xb4b0a4,
    wood: 0xc2c1bc,
  },
  [key("zona_social", "alto")]: {
    floor: "darkMarble",
    counter: "marble",
    wall: 0xa89887,
    fabric: 0x8e7869,
    wood: 0x7d6553,
    metal: 0xc9a24a,
  },

  // ── Habitacion principal ──
  [key("habitacion_principal", "bajo")]: {
    floor: "plank",
    wall: 0xd5d3d2,
    fabric: 0xbfb8b1,
    wood: 0x766a5e,
  },
  [key("habitacion_principal", "medio")]: {
    floor: "plank",
    wall: 0xddd6cd,
    fabric: 0xc6bbaf,
    wood: 0xb59b80,
  },
  [key("habitacion_principal", "alto")]: {
    floor: "darkMarble",
    wall: 0x7a7174,
    fabric: 0xa6978c,
    wood: 0x7f695c,
    metal: 0xc9a24a,
  },

  // ── Habitaciones secundarias ──
  [key("habitaciones_secundarias", "bajo")]: {
    floor: "plank",
    wall: 0xe4e0dc,
    fabric: 0xc8b3a1,
    wood: 0xbca18c,
  },
  [key("habitaciones_secundarias", "medio")]: {
    floor: "plank",
    wall: 0xcfcfc7,
    fabric: 0xb9ab91,
    wood: 0xcfc5b5,
  },
  [key("habitaciones_secundarias", "alto")]: {
    floor: "plank",
    wall: 0xb59a7f,
    fabric: 0x8b6b4f,
    wood: 0xc8b39f,
    metal: 0xc9a24a,
  },

  // ── Estudio / Oficina ──
  [key("estudio_oficina", "bajo")]: {
    floor: "plank",
    wall: 0xe3e3e2,
    fabric: 0xb09886,
    wood: 0x9e8b7e,
  },
  [key("estudio_oficina", "medio")]: {
    floor: "plank",
    wall: 0xbeac9b,
    fabric: 0xa99683,
    wood: 0xab7a58,
  },
  [key("estudio_oficina", "alto")]: {
    floor: "whiteMarble",
    counter: "marble",
    wall: 0xb49670,
    fabric: 0x9d978c,
    wood: 0x8a6a44,
    metal: 0xc9a24a,
  },

  // ── Balcon / Terraza ──
  [key("balcon_terraza", "bajo")]: {
    floor: "plank",
    wall: 0x9eaab6,
    wood: 0x926e5b,
    fabric: 0x868982,
  },
  [key("balcon_terraza", "medio")]: {
    floor: "ceramic",
    wall: 0x8d857c,
    wood: 0xaa9c8d,
    fabric: 0xbebdb9,
  },
  [key("balcon_terraza", "alto")]: {
    floor: "darkMarble",
    counter: "marble",
    wall: 0x7d6453,
    wood: 0x5f5957,
    fabric: 0xa0a4a5,
    metal: 0xc9a24a,
  },
};

/** Estilo del ambiente para ese nivel, o vacio si hereda todo de la paleta. */
export function roomTierStyle(roomId: string, tier: BudgetTierId): RoomTierStyle {
  return STYLES[key(roomId, tier)] ?? {};
}
