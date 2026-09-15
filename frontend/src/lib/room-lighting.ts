import * as THREE from "three";
import { rbox, type BuildCtx } from "./room-interiors";

/**
 * Luminaria de diseno del nivel alto, distinta en cada ambiente.
 *
 * Antes todos los ambientes colgaban los mismos tres conos, incluidos los
 * banos, donde una lampara suspendida sobre la nada no tiene sentido. Ahora
 * cada espacio lleva la luminaria que le corresponde y ninguna se repite entre
 * ambientes contiguos.
 */

function cyl(
  ctx: BuildCtx,
  material: THREE.Material,
  rTop: number,
  rBottom: number,
  h: number,
  x: number,
  y: number,
  z: number,
  segments = 20,
  open = false,
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, segments, 1, open);
  ctx.sink.push(geo);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  return mesh;
}

function ball(
  ctx: BuildCtx,
  material: THREE.Material,
  r: number,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(r, 20, 16);
  ctx.sink.push(geo);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  return mesh;
}

/** Cable de suspension, del techo a la luminaria. */
function cord(ctx: BuildCtx, x: number, zTop: number, from: number, to: number, g: THREE.Group) {
  const geo = new THREE.CylinderGeometry(0.007, 0.007, from - to, 6);
  ctx.sink.push(geo);
  const mesh = new THREE.Mesh(geo, ctx.palette.metal);
  mesh.position.set(x, (from + to) / 2, zTop);
  g.add(mesh);
}

function bulb(color: number, intensity: number, x: number, y: number, z: number, g: THREE.Group) {
  const light = new THREE.PointLight(color, intensity, 4.5, 2);
  light.position.set(x, y, z);
  g.add(light);
}

// ─── Luminarias ──────────────────────────────────────────────────────────────

/** Tres conos en linea, sobre la isla de la cocina. */
function conosSobreIsla(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const H = ctx.height;
  const z = ctx.depth / 2 - 1.2;
  [-0.75, 0, 0.75].forEach((x) => {
    cord(ctx, x, z, H, H - 0.62, g);
    const geo = new THREE.ConeGeometry(0.15, 0.22, 24, 1, true);
    ctx.sink.push(geo);
    const shade = new THREE.Mesh(geo, p.metal);
    shade.position.set(x, H - 0.73, z);
    shade.castShadow = true;
    g.add(shade);
    g.add(ball(ctx, p.lamp, 0.05, x, H - 0.85, z));
    bulb(0xffd9a0, 2.4, x, H - 0.88, z, g);
  });
}

/** Arana de globos a distinta altura, sobre el comedor de la sala. */
function racimoDeGlobos(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const H = ctx.height;
  const x = ctx.width / 2 - 1.25;
  const z = 0.15;
  const globos: [number, number, number][] = [
    [0, 0.55, 0.11],
    [-0.28, 0.82, 0.09],
    [0.26, 0.75, 0.095],
    [0.05, 1.02, 0.075],
    [-0.2, 1.12, 0.07],
  ];
  g.add(rbox(ctx, p.metal, 0.5, 0.03, 0.5, x, H - 0.03, z, 0.008));
  globos.forEach(([dx, drop, r]) => {
    cord(ctx, x + dx, z, H, H - drop, g);
    g.add(ball(ctx, p.lamp, r, x + dx, H - drop, z));
  });
  bulb(0xffdcae, 3.4, x, H - 0.8, z, g);
}

/** Barra lineal suspendida, sobre el escritorio del estudio. */
function barraLineal(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const H = ctx.height;
  const z = -ctx.depth / 2 + 0.5;
  const len = Math.min(1.5, ctx.width * 0.6);
  [-len / 2 + 0.12, len / 2 - 0.12].forEach((x) => cord(ctx, x, z, H, H - 0.55, g));
  g.add(rbox(ctx, p.metal, len, 0.07, 0.1, 0, H - 0.62, z, 0.02));
  g.add(rbox(ctx, p.lamp, len - 0.08, 0.015, 0.07, 0, H - 0.63, z, 0.006));
  bulb(0xfff0cc, 3.0, 0, H - 0.7, z, g);
}

/** Pantalla de tambor amplia, centrada. Para dormitorios. */
function tambor(ctx: BuildCtx, g: THREE.Group, radius: number) {
  const p = ctx.palette;
  const H = ctx.height;
  cord(ctx, 0, 0, H, H - 0.4, g);
  g.add(cyl(ctx, p.fabric, radius, radius, 0.26, 0, H - 0.66, 0, 26, true));
  g.add(cyl(ctx, p.lamp, radius - 0.02, radius - 0.02, 0.015, 0, H - 0.68, 0, 26));
  bulb(0xffe6bb, 3.2, 0, H - 0.72, 0, g);
}

/** Farol de vidrio y laton, para la entrada. */
function farol(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const H = ctx.height;
  cord(ctx, 0, 0, H, H - 0.35, g);
  g.add(rbox(ctx, p.metal, 0.22, 0.03, 0.22, 0, H - 0.38, 0, 0.006));
  g.add(rbox(ctx, p.glass, 0.2, 0.3, 0.2, 0, H - 0.68, 0, 0.006));
  // Montantes del farol
  [-0.09, 0.09].forEach((dx) =>
    [-0.09, 0.09].forEach((dz) =>
      g.add(rbox(ctx, p.metal, 0.018, 0.3, 0.018, dx, H - 0.68, dz, 0.006)),
    ),
  );
  g.add(ball(ctx, p.lamp, 0.06, 0, H - 0.53, 0));
  bulb(0xffdca8, 2.6, 0, H - 0.55, 0, g);
}

/** Apliques a los lados del espejo. Para banos: nada colgando del techo. */
function apliquesDeEspejo(ctx: BuildCtx, g: THREE.Group, frente: 1 | -1) {
  const p = ctx.palette;
  const z = (frente * ctx.depth) / 2 - frente * 0.07;
  const sep = Math.min(0.62, ctx.width * 0.34);
  [-sep, sep].forEach((x) => {
    g.add(rbox(ctx, p.metal, 0.07, 0.07, 0.07, x, 1.62, z, 0.012));
    g.add(cyl(ctx, p.lamp, 0.045, 0.045, 0.3, x, 1.64, z - frente * 0.02, 18));
    bulb(0xfff0d2, 1.5, x, 1.78, z - frente * 0.09, g);
  });
}

/** Tubo suspendido a lo largo, para el vestier. */
function tuboVestier(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const H = ctx.height;
  const len = ctx.depth - 0.7;
  [-len / 2 + 0.1, len / 2 - 0.1].forEach((z) => cord(ctx, 0, z, H, H - 0.3, g));
  g.add(rbox(ctx, p.metal, 0.09, 0.06, len, 0, H - 0.36, 0, 0.02));
  g.add(rbox(ctx, p.lamp, 0.06, 0.012, len - 0.06, 0, H - 0.37, 0, 0.005));
  bulb(0xfff2d8, 2.8, 0, H - 0.45, 0, g);
}

/** Guirnalda de bombillas, para el balcon. */
function guirnalda(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const H = ctx.height;
  const n = 7;
  const span = ctx.width - 0.5;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = -span / 2 + t * span;
    // Catenaria: el cable cuelga, no va recto.
    const sag = Math.sin(t * Math.PI) * 0.22;
    const y = H - 0.12 - sag;
    g.add(ball(ctx, p.lamp, 0.045, x, y - 0.08, 0.1));
    const geo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 5);
    ctx.sink.push(geo);
    const cable = new THREE.Mesh(geo, p.metal);
    cable.position.set(x, y - 0.04, 0.1);
    g.add(cable);
  }
  bulb(0xffd9a0, 2.4, 0, H - 0.4, 0.1, g);
}

// ─── Asignacion por ambiente ─────────────────────────────────────────────────

type LampBuilder = (ctx: BuildCtx, g: THREE.Group) => void;

const LAMPS: Record<string, LampBuilder> = {
  cocina: conosSobreIsla,
  zona_social: racimoDeGlobos,
  estudio_oficina: barraLineal,
  // Dormitorios: mismo tipo de luminaria pero distinto tamano, para que la
  // principal se lea mas generosa que la secundaria.
  habitacion_principal: (ctx, g) => tambor(ctx, g, 0.34),
  habitaciones_secundarias: (ctx, g) => tambor(ctx, g, 0.26),
  entrada_hall: farol,
  vestier: tuboVestier,
  balcon_terraza: guirnalda,
  // Los banos llevan apliques junto al espejo, no lampara colgante.
  bano_principal: (ctx, g) => apliquesDeEspejo(ctx, g, -1),
  bano_social: (ctx, g) => apliquesDeEspejo(ctx, g, 1),
  // La zona de ropas se queda con el plafon: no es un ambiente de estar.
};

/** true si el ambiente tiene luminaria propia en el nivel alto. */
export function hasDesignLamp(roomId: string): boolean {
  return roomId in LAMPS;
}

/** Construye la luminaria del ambiente. Devuelve un grupo vacio si no tiene. */
export function buildDesignLamp(roomId: string, ctx: BuildCtx): THREE.Group {
  const group = new THREE.Group();
  LAMPS[roomId]?.(ctx, group);
  return group;
}
