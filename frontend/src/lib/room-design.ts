import * as THREE from "three";
import {
  createBlackMarbleTexture,
  createBlackSpeckledTexture,
  createDarkMarbleFloor,
  createGraniteTexture,
  createNormalFrom,
  createPlankFloorTexture,
  createQuartzTexture,
  createStoneSlabTexture,
  createTerrazzoTexture,
  createWhiteMarbleFloor,
  createWhiteTileTexture,
  createFloorTexture,
  createMarbleTexture,
  createPaintTexture,
  createWoodTexture,
} from "./apartment-textures";
import { roomTierStyle, type RoomTierStyle } from "./room-styles";
import type { BudgetTierId } from "@/types/remodeling.types";

/**
 * Acabados de cada nivel de presupuesto.
 *
 * La diferencia entre Bajo, Medio y Alto no es solo el color: cambia el
 * material de la encimera (laminado, cuarzo, marmol), si hay salpicadero,
 * el tipo de iluminacion y cuanto mobiliario extra aparece. Esa progresion es
 * la que hace que el resultado se lea como mas caro.
 */

export interface TierPalette {
  label: string;
  /** Materiales del recinto. */
  floor: THREE.MeshStandardMaterial;
  wall: THREE.MeshStandardMaterial;
  ceiling: THREE.MeshStandardMaterial;
  /** Materiales del mobiliario. */
  counter: THREE.MeshStandardMaterial;
  cabinet: THREE.MeshStandardMaterial;
  cabinetUpper: THREE.MeshStandardMaterial;
  backsplash: THREE.MeshStandardMaterial | null;
  metal: THREE.MeshStandardMaterial;
  fabric: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  white: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  /** Espejo: refleja el entorno. No puede ser el mismo material que el vidrio,
   *  que ahora transmite y convertiria el espejo en una ventana. */
  mirror: THREE.MeshStandardMaterial;
  /** Zocalo y perfiles oscuros: el retranqueo en sombra bajo los muebles. */
  toeKick: THREE.MeshStandardMaterial;
  /** Electrodomesticos: negro mate o satinado segun el nivel. */
  appliance: THREE.MeshStandardMaterial;
  /** Barra de luz bajo alacena. Emite, no recibe. */
  ledStrip: THREE.MeshBasicMaterial;
  plant: THREE.MeshStandardMaterial;
  lamp: THREE.MeshBasicMaterial;
  /** Cuanto se permite adornar: 0 nada, 2 todo. */
  decorLevel: 0 | 1 | 2;
  /** Lamparas colgantes sobre la isla o el meson. */
  hasPendants: boolean;
  /** Luz de cornisa, el detalle que mas encarece la sensacion. */
  hasCoveLight: boolean;
}

/** Todo lo que hay que liberar al desmontar la escena. */
export type Disposables = { dispose: () => void }[];

function std(
  sink: Disposables,
  params: THREE.MeshStandardMaterialParameters,
): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial(params);
  sink.push(m);
  return m;
}

function track<T extends { dispose: () => void }>(sink: Disposables, x: T): T {
  sink.push(x);
  return x;
}

/** Mapa de normales derivado de la propia textura, ya registrado para liberar. */
function bump(
  sink: Disposables,
  texture: THREE.CanvasTexture,
  strength: number,
): THREE.CanvasTexture {
  return track(sink, createNormalFrom(texture, strength));
}

/** Espejo: metal pulido que toma su imagen del entorno. */
function mirrorMaterial(sink: Disposables): THREE.MeshStandardMaterial {
  return track(
    sink,
    new THREE.MeshStandardMaterial({
      color: 0xf4f7f8,
      roughness: 0.02,
      metalness: 1,
      envMapIntensity: 1.8,
    }),
  );
}

/** Vidrio real: transmite en vez de solo ser semitransparente. */
function glassMaterial(
  sink: Disposables,
  roughness: number,
): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness,
    metalness: 0,
    // transmission refracta lo que hay detras, que es lo que hace que un vidrio
    // parezca vidrio y no un plastico con opacidad.
    transmission: 0.92,
    thickness: 0.02,
    ior: 1.52,
    transparent: true,
    opacity: 1,
  });
  sink.push(m);
  return m;
}

/** Textura de piso segun el tipo pedido por el estilo del ambiente. */
function floorTexture(kind: RoomTierStyle["floor"], sink: Disposables) {
  switch (kind) {
    case "whiteMarble":
      return track(sink, createWhiteMarbleFloor());
    case "blackMarble":
      return track(sink, createBlackMarbleTexture());
    case "darkMarble":
      return track(sink, createDarkMarbleFloor());
    case "ceramic":
      return track(sink, createFloorTexture(["#cfcbc4", "#d4d0c9"], "#b8b3ab", 0.08));
    case "plank":
    default:
      return track(sink, createPlankFloorTexture());
  }
}

function counterTexture(kind: RoomTierStyle["counter"], sink: Disposables) {
  switch (kind) {
    case "granite":
      return track(sink, createGraniteTexture());
    case "blackSpeckle":
      return track(sink, createBlackSpeckledTexture());
    case "marble":
      return track(sink, createMarbleTexture());
    case "terrazzo":
      return track(sink, createTerrazzoTexture());
    case "quartzWhite":
    default:
      return track(sink, createQuartzTexture());
  }
}

function backsplashTexture(kind: RoomTierStyle["backsplash"], sink: Disposables) {
  switch (kind) {
    case "whiteTile":
      return track(sink, createWhiteTileTexture(false));
    case "reliefTile":
      return track(sink, createWhiteTileTexture(true));
    case "marble":
      return track(sink, createMarbleTexture());
    case "stone":
      return track(sink, createStoneSlabTexture());
    default:
      return null;
  }
}

/**
 * Aplica el estilo del ambiente sobre la paleta del nivel: cambia texturas de
 * piso, encimera y salpicadero, y los colores que la foto imponga.
 */
function applyRoomStyle(
  palette: TierPalette,
  style: RoomTierStyle,
  sink: Disposables,
): TierPalette {
  if (style.floor) {
    const tex = floorTexture(style.floor, sink);
    palette.floor.map = tex;
    palette.floor.normalMap = bump(sink, tex, 2.4);
    // El marmol negro refleja; la madera y la ceramica no.
    const polished = style.floor === "blackMarble" || style.floor === "darkMarble";
    palette.floor.roughness = polished ? 0.1 : style.floor === "whiteMarble" ? 0.22 : 0.55;
    palette.floor.metalness = polished ? 0.16 : 0;
    palette.floor.envMapIntensity = polished ? 1.7 : 0.7;
    palette.floor.needsUpdate = true;
  }

  if (style.counter) {
    const tex = counterTexture(style.counter, sink);
    palette.counter.map = tex;
    palette.counter.normalMap = bump(sink, tex, style.counter === "granite" ? 2.0 : 1.2);
    palette.counter.needsUpdate = true;
  }

  if (style.backsplash !== undefined) {
    const tex = backsplashTexture(style.backsplash, sink);
    if (tex && palette.backsplash) {
      palette.backsplash.map = tex;
      palette.backsplash.normalMap = bump(sink, tex, style.backsplash === "reliefTile" ? 3.2 : 2.2);
      palette.backsplash.needsUpdate = true;
    } else if (tex) {
      palette.backsplash = std(sink, {
        map: tex,
        normalMap: bump(sink, tex, 2.2),
        roughness: 0.24,
        envMapIntensity: 1.1,
      });
    } else {
      palette.backsplash = null;
    }
  }

  const colors: [keyof TierPalette, number | undefined][] = [
    ["cabinet", style.cabinet],
    ["cabinetUpper", style.cabinetUpper],
    ["wall", style.wall],
    ["metal", style.metal],
    ["fabric", style.fabric],
    ["wood", style.wood],
  ];
  colors.forEach(([slot, hex]) => {
    if (hex == null) return;
    const material = palette[slot] as THREE.MeshStandardMaterial;
    material.color.setHex(hex);
    material.needsUpdate = true;
  });

  return palette;
}

export function createTierPalette(
  tier: BudgetTierId,
  sink: Disposables,
  roomId?: string,
): TierPalette {
  const paint = track(sink, createPaintTexture());

  if (tier === "bajo") {
    const floorTex = track(sink, createFloorTexture(["#b9b3ab", "#bdb7af"], "#a8a29a", 0.05));
    const woodTex = track(sink, createWoodTexture("#d8d4cd", "#a9a49c"));
    return applyRoomStyle({
      label: "Bajo",
      floor: std(sink, {
        map: floorTex,
        normalMap: bump(sink, floorTex, 2.6),
        normalScale: new THREE.Vector2(0.7, 0.7),
        roughness: 0.8,
        envMapIntensity: 0.5,
      }),
      wall: std(sink, {
        map: paint,
        normalMap: bump(sink, paint, 1.2),
        normalScale: new THREE.Vector2(0.25, 0.25),
        color: 0xf2efe8,
        roughness: 0.95,
        envMapIntensity: 0.4,
      }),
      ceiling: std(sink, { color: 0xfafafa, roughness: 1 }),
      counter: std(sink, { color: 0xc9c4bc, roughness: 0.6 }),
      cabinet: std(sink, { map: woodTex, color: 0xf0ece5, roughness: 0.75 }),
      cabinetUpper: std(sink, { map: woodTex, color: 0xf0ece5, roughness: 0.75 }),
      backsplash: null, // sin salpicadero: solo pintura
      metal: std(sink, { color: 0xb9bcbf, roughness: 0.45, metalness: 0.6 }),
      fabric: std(sink, { color: 0x9aa0a6, roughness: 1 }),
      wood: std(sink, { map: woodTex, normalMap: bump(sink, woodTex, 1.6), roughness: 0.8 }),
      white: std(sink, { color: 0xf5f4f2, roughness: 0.6 }),
      glass: glassMaterial(sink, 0.12),
      mirror: mirrorMaterial(sink),
      toeKick: std(sink, { color: 0x3a3a3c, roughness: 0.7 }),
      appliance: std(sink, { color: 0x2b2b2d, roughness: 0.42, metalness: 0.3 }),
      ledStrip: track(sink, new THREE.MeshBasicMaterial({ color: 0xfff6e2 })),
      plant: std(sink, { color: 0x5c8452, roughness: 0.9 }),
      lamp: track(sink, new THREE.MeshBasicMaterial({ color: 0xfff2d8 })),
      decorLevel: 0,
      hasPendants: false,
      hasCoveLight: false,
    }, roomTierStyle(roomId ?? "", tier), sink);
  }

  if (tier === "medio") {
    const floorTex = track(sink, createPlankFloorTexture());
    const woodTex = track(sink, createWoodTexture("#d9b988", "#a8814f"));
    const quartz = track(sink, createTerrazzoTexture());
    const splash = track(sink, createStoneSlabTexture());
    return applyRoomStyle({
      label: "Medio",
      // Madera clara: piso cálido y luminoso, lo opuesto al nivel alto.
      floor: std(sink, {
        map: floorTex,
        normalMap: bump(sink, floorTex, 2.4),
        normalScale: new THREE.Vector2(0.6, 0.6),
        roughness: 0.55,
        metalness: 0,
        envMapIntensity: 0.6,
      }),
      wall: std(sink, {
        map: paint,
        normalMap: bump(sink, paint, 1.2),
        normalScale: new THREE.Vector2(0.25, 0.25),
        color: 0xf7f4ee,
        roughness: 0.9,
        envMapIntensity: 0.5,
      }),
      ceiling: std(sink, { color: 0xfdfdfc, roughness: 1 }),
      counter: std(sink, { map: quartz, normalMap: bump(sink, quartz, 2.0), normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.28, metalness: 0.04, envMapIntensity: 1.1 }),
      cabinet: std(sink, { color: 0xf4f3f0, roughness: 0.35, envMapIntensity: 0.9 }),
      cabinetUpper: std(sink, { color: 0xf6f5f2, roughness: 0.32, envMapIntensity: 0.9 }),
      backsplash: std(sink, { map: splash, normalMap: bump(sink, splash, 0.8), normalScale: new THREE.Vector2(0.2, 0.2), roughness: 0.22, envMapIntensity: 1.2 }),
      metal: std(sink, { color: 0xd0d4d8, roughness: 0.22, metalness: 0.85 }),
      fabric: std(sink, { color: 0x9aa79a, roughness: 0.92 }),
      wood: std(sink, { map: woodTex, normalMap: bump(sink, woodTex, 1.6), roughness: 0.6 }),
      white: std(sink, { color: 0xf9f8f6, roughness: 0.4 }),
      glass: glassMaterial(sink, 0.06),
      mirror: mirrorMaterial(sink),
      toeKick: std(sink, { color: 0x8f8a82, roughness: 0.7 }),
      appliance: std(sink, { color: 0xd9dadc, roughness: 0.35, metalness: 0.5 }),
      ledStrip: track(sink, new THREE.MeshBasicMaterial({ color: 0xfff6e2 })),
      plant: std(sink, { color: 0x4f7d4a, roughness: 0.9 }),
      lamp: track(sink, new THREE.MeshBasicMaterial({ color: 0xfff4de })),
      decorLevel: 1,
      hasPendants: false,
      hasCoveLight: true,
    }, roomTierStyle(roomId ?? "", tier), sink);
  }

  // Alto: marmol, carpinteria oscura, laton y colgantes.
  const floorTex = track(sink, createBlackMarbleTexture());
  const woodTex = track(sink, createWoodTexture("#2f3a33", "#19211c"));
  const marble = track(sink, createMarbleTexture());
  const splash = track(sink, createMarbleTexture());
  return applyRoomStyle({
    label: "Alto",
    // Marmol negro pulido: refleja el ambiente y cambia por completo la
    // lectura del espacio respecto de la madera clara del nivel medio.
    floor: std(sink, {
      map: floorTex,
      normalMap: bump(sink, floorTex, 2.4),
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.09,
      metalness: 0.18,
      envMapIntensity: 1.8,
    }),
    wall: std(sink, {
      map: paint,
      normalMap: bump(sink, paint, 1.0),
      normalScale: new THREE.Vector2(0.2, 0.2),
      color: 0x39403c,
      roughness: 0.6,
      envMapIntensity: 0.8,
    }),
    ceiling: std(sink, { color: 0xe8e6e1, roughness: 0.85 }),
    counter: std(sink, { map: marble, normalMap: bump(sink, marble, 0.9), normalScale: new THREE.Vector2(0.3, 0.3), roughness: 0.12, metalness: 0.06, envMapIntensity: 1.5 }),
    cabinet: std(sink, { map: woodTex, normalMap: bump(sink, woodTex, 1.8), color: 0x36423b, roughness: 0.28, envMapIntensity: 1.3 }),
    cabinetUpper: std(sink, { map: woodTex, color: 0x2f3a33, roughness: 0.28, envMapIntensity: 1.3 }),
    backsplash: std(sink, { map: splash, normalMap: bump(sink, splash, 0.9), roughness: 0.1, metalness: 0.05, envMapIntensity: 1.5 }),
    // Laton: el metal que mas lee como premium.
    metal: std(sink, { color: 0xc9a24a, roughness: 0.18, metalness: 0.95, envMapIntensity: 1.6 }),
    fabric: std(sink, { color: 0x8a6a3f, roughness: 0.8 }),
    wood: std(sink, { map: woodTex, normalMap: bump(sink, woodTex, 1.8), roughness: 0.4 }),
    white: std(sink, { color: 0xfdfcfa, roughness: 0.25 }),
    glass: glassMaterial(sink, 0.02),
    mirror: mirrorMaterial(sink),
    toeKick: std(sink, { color: 0xc9a24a, roughness: 0.25, metalness: 0.9 }),
    appliance: std(sink, { color: 0x1f1f21, roughness: 0.28, metalness: 0.45, envMapIntensity: 1.3 }),
    ledStrip: track(sink, new THREE.MeshBasicMaterial({ color: 0xfff2d8 })),
    plant: std(sink, { color: 0x5b8a4e, roughness: 0.85 }),
    lamp: track(sink, new THREE.MeshBasicMaterial({ color: 0xffe9bd })),
    decorLevel: 2,
    hasPendants: true,
    hasCoveLight: true,
  }, roomTierStyle(roomId ?? "", tier), sink);
}
