import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Disposables, TierPalette } from "./room-design";

/**
 * Interiores de cada ambiente, segun el nivel de presupuesto.
 *
 * Todo se arma con cajas de aristas redondeadas: ningun objeto real tiene canto
 * vivo, y ese detalle es la diferencia entre un mueble y una caja de carton.
 *
 * La densidad importa tanto como el material. Un cuarto con cuatro volumenes se
 * lee vacio por bien iluminado que este, asi que cada ambiente incluye tambien
 * los objetos chicos que lo hacen creible.
 */

export interface BuildCtx {
  palette: TierPalette;
  sink: Disposables;
  width: number;
  depth: number;
  height: number;
}

/** Caja de aristas redondeadas, apoyada por su base en `y`. */
export function rbox(
  ctx: BuildCtx,
  material: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  radius?: number,
): THREE.Mesh {
  // El radio nunca puede pasar la mitad del lado mas corto o la geometria
  // degenera y aparecen caras invertidas.
  const r = Math.min(radius ?? 0.018, Math.min(w, h, d) / 2.05);
  const geo = new RoundedBoxGeometry(w, h, d, 2, r);
  ctx.sink.push(geo);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cyl(
  ctx: BuildCtx,
  material: THREE.Material,
  rTop: number,
  rBottom: number,
  h: number,
  x: number,
  y: number,
  z: number,
  segments = 24,
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, segments);
  ctx.sink.push(geo);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(
  ctx: BuildCtx,
  material: THREE.Material,
  r: number,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(r, 18, 14);
  ctx.sink.push(geo);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y + r, z);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Frente de carpinteria: en vez de un bloque unico, dibuja puertas separadas
 * por una junta. Es lo que distingue un mueble de una caja pintada.
 */
function cabinetFront(
  ctx: BuildCtx,
  g: THREE.Group,
  doors: number,
  spanW: number,
  h: number,
  x: number,
  y: number,
  z: number,
  handleAtTop: boolean,
) {
  const p = ctx.palette;
  const gap = 0.012;
  const doorW = (spanW - gap * (doors - 1)) / doors;
  const startX = x - spanW / 2 + doorW / 2;

  for (let i = 0; i < doors; i++) {
    const dx = startX + i * (doorW + gap);
    g.add(rbox(ctx, p.cabinet, doorW, h - gap, 0.02, dx, y, z, 0.006));
    // Tirador vertical, barra fina de metal
    const hy = handleAtTop ? y + h - 0.16 : y + 0.08;
    g.add(rbox(ctx, p.metal, 0.016, 0.11, 0.016, dx + doorW / 2 - 0.05, hy, z + 0.018, 0.007));
  }
}

/** Plantas: tronco, maceta y follaje en varias esferas, no una sola. */
function plant(ctx: BuildCtx, g: THREE.Group, x: number, z: number, scale = 1) {
  const p = ctx.palette;
  const potH = 0.26 * scale;
  g.add(cyl(ctx, p.counter, 0.15 * scale, 0.12 * scale, potH, x, 0, z, 20));
  g.add(cyl(ctx, p.wood, 0.02 * scale, 0.025 * scale, 0.3 * scale, x, potH, z, 8));
  const base = potH + 0.28 * scale;
  g.add(sphere(ctx, p.plant, 0.17 * scale, x, base, z));
  g.add(sphere(ctx, p.plant, 0.13 * scale, x + 0.13 * scale, base + 0.05 * scale, z + 0.05 * scale));
  g.add(sphere(ctx, p.plant, 0.12 * scale, x - 0.11 * scale, base + 0.09 * scale, z - 0.04 * scale));
}

/** Pila de libros, para estanterias y mesas. */
function books(ctx: BuildCtx, g: THREE.Group, x: number, y: number, z: number, n = 3) {
  const p = ctx.palette;
  const tones = [p.fabric, p.wood, p.counter, p.metal];
  let oy = y;
  for (let i = 0; i < n; i++) {
    const h = 0.03 + Math.random() * 0.02;
    g.add(rbox(ctx, tones[i % tones.length], 0.2, h, 0.14, x, oy, z, 0.004));
    oy += h;
  }
}

// ─── Cocina ──────────────────────────────────────────────────────────────────

function cocina(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;
  const H = ctx.height;
  // En el nivel alto la cocina no es la misma con mejores acabados: cambia la
  // distribucion. Pasa de una linea contra el muro a una cocina en L con
  // torre de columnas, isla grande y falso techo sobre la isla.
  const lux = p.decorLevel === 2;

  const counterH = 0.9;
  const counterD = 0.62;
  const upperBottom = 1.45;
  const runZ = -hd + counterD / 2;
  // En alto la torre de columnas se come parte del frente.
  const towerW = lux ? 1.15 : 0;
  const runW = ctx.width - 0.1 - towerW;
  const runCx = towerW / 2;

  const gap = 0.014;

  // ── Bajomesada del frente ──
  g.add(rbox(ctx, p.toeKick, runW, 0.11, counterD - 0.07, runCx, 0, runZ + 0.035, 0.004));
  const baseBodyH = counterH - 0.11 - 0.04;
  g.add(rbox(ctx, p.cabinet, runW, baseBodyH, counterD - 0.03, runCx, 0.11, runZ, 0.006));

  const frontZ = runZ + counterD / 2 - 0.012;
  const drawerCount = lux ? 5 : 4;
  const dw = (runW - 0.04 - gap * (drawerCount - 1)) / drawerCount;
  for (let i = 0; i < drawerCount; i++) {
    const x = runCx - runW / 2 + 0.02 + dw / 2 + i * (dw + gap);
    const rows = i % 2 === 0 ? 2 : 1;
    const rowH = (baseBodyH - gap * (rows - 1)) / rows;
    for (let r = 0; r < rows; r++) {
      const y = 0.115 + r * (rowH + gap);
      g.add(rbox(ctx, p.cabinet, dw - gap, rowH, 0.018, x, y, frontZ, 0.004));
      g.add(rbox(ctx, p.toeKick, dw - gap, 0.012, 0.022, x, y + rowH - 0.012, frontZ + 0.002, 0.003));
    }
  }
  g.add(rbox(ctx, p.counter, runW + 0.03, 0.04, counterD + 0.02, runCx, counterH - 0.04, runZ, 0.004));

  const splashH = upperBottom - counterH;
  g.add(rbox(ctx, p.backsplash ?? p.wall, runW, splashH, 0.012, runCx, counterH, -hd + 0.008, 0.002));

  // ── Alacenas ──
  const upperH = H - upperBottom - 0.02;
  const upperD = 0.36;
  const upperZ = -hd + upperD / 2;

  if (lux) {
    // Alto: alacena corrida hasta el techo y estanteria abierta de madera
    // sobre el sector del fregadero, en vez del nicho central.
    g.add(rbox(ctx, p.cabinetUpper, runW * 0.55, upperH, upperD, runCx + runW * 0.22, upperBottom, upperZ, 0.006));
    const doors = 3;
    const ddw = (runW * 0.55 - gap * (doors - 1)) / doors;
    for (let i = 0; i < doors; i++) {
      const dx = runCx + runW * 0.22 - runW * 0.275 + ddw / 2 + i * (ddw + gap);
      g.add(rbox(ctx, p.cabinetUpper, ddw, upperH - gap, 0.016, dx, upperBottom, upperZ + upperD / 2, 0.004));
    }
    [0, 1, 2].forEach((i) => {
      const sy = upperBottom + 0.12 + i * 0.36;
      g.add(rbox(ctx, p.wood, runW * 0.4, 0.035, 0.26, runCx - runW * 0.3, sy, -hd + 0.13, 0.004));
      [-0.28, -0.05, 0.2].forEach((ox, k) => {
        const jarH = 0.1 + ((i + k) % 3) * 0.04;
        g.add(cyl(ctx, k === 1 ? p.glass : p.white, 0.04, 0.04, jarH, runCx - runW * 0.3 + ox, sy + 0.035, -hd + 0.13, 16));
      });
    });
  } else {
    // Medio y bajo: dos tramos con nicho de madera al centro.
    const nicheW = Math.min(0.75, ctx.width * 0.22);
    const leftW = (runW - nicheW) / 2;
    [-1, 1].forEach((sgn) => {
      const x = runCx + sgn * (nicheW / 2 + leftW / 2);
      g.add(rbox(ctx, p.cabinetUpper, leftW, upperH, upperD, x, upperBottom, upperZ, 0.006));
      const doors = Math.max(2, Math.round(leftW / 0.55));
      const ddw = (leftW - gap * (doors - 1)) / doors;
      for (let i = 0; i < doors; i++) {
        const dx = x - leftW / 2 + ddw / 2 + i * (ddw + gap);
        g.add(rbox(ctx, p.cabinetUpper, ddw, upperH - gap, 0.016, dx, upperBottom, upperZ + upperD / 2, 0.004));
      }
      g.add(rbox(ctx, p.ledStrip, leftW - 0.1, 0.012, 0.03, x, upperBottom - 0.014, -hd + 0.07, 0.003));
    });
    g.add(rbox(ctx, p.wood, nicheW, upperH, upperD, runCx, upperBottom, upperZ, 0.004));
    for (let i = 1; i < 3; i++) {
      g.add(rbox(ctx, p.wood, nicheW - 0.05, 0.018, upperD - 0.04, runCx, upperBottom + (upperH / 3) * i, upperZ, 0.003));
    }
    for (let i = 0; i < 3; i++) {
      const sy = upperBottom + (upperH / 3) * i + 0.02;
      [-0.16, 0.02, 0.18].forEach((ox, k) => {
        const jarH = 0.11 + ((i + k) % 3) * 0.045;
        g.add(cyl(ctx, k === 1 ? p.glass : p.white, 0.045, 0.045, jarH, runCx + ox, sy, upperZ, 16));
      });
    }
  }

  if (lux) {
    g.add(rbox(ctx, p.ledStrip, runW * 0.55 - 0.1, 0.012, 0.03, runCx + runW * 0.22, upperBottom - 0.014, -hd + 0.07, 0.003));
  }

  // ── Torre de columnas: horno, microondas y despensa. Solo en alto. ──
  if (lux) {
    const tx = -hw + towerW / 2 + 0.05;
    g.add(rbox(ctx, p.cabinet, towerW, H - 0.04, 0.68, tx, 0, -hd + 0.35, 0.006));
    // Horno y microondas empotrados, uno sobre otro
    g.add(rbox(ctx, p.appliance, towerW - 0.14, 0.58, 0.04, tx, 0.85, -hd + 0.69, 0.008));
    g.add(rbox(ctx, p.metal, towerW - 0.2, 0.03, 0.03, tx, 1.36, -hd + 0.72, 0.01));
    g.add(rbox(ctx, p.appliance, towerW - 0.14, 0.38, 0.04, tx, 1.48, -hd + 0.69, 0.008));
    g.add(rbox(ctx, p.metal, towerW - 0.2, 0.03, 0.03, tx, 1.81, -hd + 0.72, 0.01));
    // Frentes de despensa arriba y abajo
    g.add(rbox(ctx, p.cabinet, towerW - 0.04, 0.78, 0.018, tx, 0.03, -hd + 0.69, 0.004));
    g.add(rbox(ctx, p.cabinet, towerW - 0.04, H - 1.92, 0.018, tx, 1.88, -hd + 0.69, 0.004));
  }

  // ── Fregadero ──
  const sinkX = lux ? runCx - runW * 0.3 : -runW * 0.33;
  g.add(rbox(ctx, p.metal, 0.56, 0.025, 0.42, sinkX, counterH - 0.045, runZ, 0.008));
  g.add(rbox(ctx, p.metal, 0.48, 0.16, 0.34, sinkX, counterH - 0.2, runZ, 0.02));
  g.add(cyl(ctx, p.metal, 0.018, 0.022, 0.34, sinkX, counterH - 0.04, -hd + 0.13, 16));
  g.add(cyl(ctx, p.metal, 0.016, 0.016, 0.22, sinkX, counterH + 0.3, -hd + 0.24, 14));

  // ── Coccion: en alto pasa a la isla, en el resto va contra el muro ──
  const hobX = lux ? -0.2 : runW * 0.2;
  const hobZ = lux ? hd - 1.2 : runZ;
  const hobY = counterH - 0.042;
  g.add(rbox(ctx, p.appliance, 0.72, 0.018, 0.5, hobX, hobY, hobZ, 0.004));
  [-0.17, 0.17].forEach((ox) =>
    [-0.12, 0.12].forEach((oz) => {
      g.add(cyl(ctx, p.appliance, 0.062, 0.062, 0.014, hobX + ox, hobY + 0.018, hobZ + oz, 18));
      g.add(cyl(ctx, p.ledStrip, 0.03, 0.03, 0.004, hobX + ox, hobY + 0.022, hobZ + oz, 14));
    }),
  );
  g.add(cyl(ctx, p.metal, 0.115, 0.105, 0.17, hobX - 0.17, hobY + 0.02, hobZ - 0.12, 24));
  g.add(cyl(ctx, p.metal, 0.118, 0.118, 0.02, hobX - 0.17, hobY + 0.19, hobZ - 0.12, 24));
  g.add(cyl(ctx, p.metal, 0.125, 0.115, 0.09, hobX + 0.17, hobY + 0.02, hobZ - 0.12, 24));

  // ── Campana ──
  if (lux) {
    // Extractor de isla, suspendido del falso techo.
    g.add(rbox(ctx, p.appliance, 0.95, 0.16, 0.52, hobX, 1.72, hobZ, 0.012));
    g.add(rbox(ctx, p.metal, 0.28, H - 1.88, 0.28, hobX, 1.88, hobZ, 0.01));
  } else {
    const hoodW = Math.min(0.92, ctx.width * 0.3);
    g.add(rbox(ctx, p.appliance, hoodW, 0.34, 0.46, runW * 0.2, upperBottom - 0.34, -hd + 0.25, 0.012));
    g.add(rbox(ctx, p.appliance, hoodW, 0.3, 0.3, runW * 0.2, upperBottom, -hd + 0.17, 0.01));
  }

  // ── Nevera ──
  if (!lux) {
    const fx = hw - 0.36;
    g.add(rbox(ctx, p.cabinet, 0.66, H - 0.04, 0.7, fx, 0, -hd + 0.36, 0.006));
    g.add(rbox(ctx, p.appliance, 0.03, 1.9, 0.66, fx - 0.34, 0.2, -hd + 0.36, 0.004));
  } else {
    // Integrada en la torre, con frente de carpinteria: no se ve el acero.
    const fx = hw - 0.42;
    g.add(rbox(ctx, p.cabinet, 0.78, H - 0.04, 0.72, fx, 0, -hd + 0.37, 0.006));
    g.add(rbox(ctx, p.cabinet, 0.74, 1.0, 0.018, fx, 0.03, -hd + 0.74, 0.004));
    g.add(rbox(ctx, p.cabinet, 0.74, 1.0, 0.018, fx, 1.06, -hd + 0.74, 0.004));
    g.add(rbox(ctx, p.toeKick, 0.74, 0.012, 0.022, fx, 1.03, -hd + 0.742, 0.003));
  }

  // ── Objetos de encimera ──
  g.add(rbox(ctx, p.wood, 0.3, 0.02, 0.22, runCx - runW * 0.08, counterH - 0.02, runZ - 0.08, 0.006));
  [-0.05, 0.02, 0.09].forEach((ox, i) =>
    g.add(cyl(ctx, p.glass, 0.032, 0.032, 0.19 + i * 0.02, runCx + runW * 0.12 + ox, counterH - 0.02, runZ - 0.1, 14)),
  );
  g.add(cyl(ctx, p.white, 0.06, 0.055, 0.15, runCx + runW * 0.34, counterH - 0.02, runZ - 0.06, 18));
  [-0.02, 0.01, 0.03].forEach((ox) =>
    g.add(cyl(ctx, p.wood, 0.008, 0.008, 0.26, runCx + runW * 0.34 + ox, counterH + 0.1, runZ - 0.06, 8)),
  );

  // ── Isla ──
  if (p.decorLevel > 0) {
    // En alto la isla es mucho mayor, con faldon de piedra a ambos lados y
    // frente de alacenas del lado de la sala.
    const islandW = lux ? Math.min(2.6, ctx.width - 0.9) : Math.min(1.9, ctx.width - 1.5);
    const islandD = lux ? 1.05 : 0.86;
    const ix = lux ? -0.2 : -0.25;
    const iz = lux ? hd - 1.2 : hd - 1.35;

    g.add(rbox(ctx, p.toeKick, islandW - 0.12, 0.1, islandD - 0.08, ix, 0, iz, 0.004));
    g.add(rbox(ctx, p.cabinet, islandW, counterH - 0.15, islandD, ix, 0.1, iz, 0.006));

    const n = lux ? 4 : 3;
    const idw = (islandW - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const dx = ix - islandW / 2 + idw / 2 + i * (idw + gap);
      g.add(rbox(ctx, p.cabinet, idw - gap, counterH - 0.17, 0.018, dx, 0.11, iz + islandD / 2, 0.004));
      g.add(rbox(ctx, p.toeKick, idw - gap, 0.012, 0.022, dx, counterH - 0.07, iz + islandD / 2 + 0.002, 0.003));
    }
    g.add(rbox(ctx, p.counter, islandW + 0.12, 0.04, islandD + 0.12, ix, counterH - 0.04, iz, 0.004));

    if (lux) {
      [-1, 1].forEach((sgn) =>
        g.add(rbox(ctx, p.counter, 0.05, counterH - 0.04, islandD + 0.12, ix + sgn * (islandW / 2 + 0.06), 0, iz, 0.004)),
      );
    }

    const stools = lux ? [-0.85, -0.2, 0.45] : [-0.55, 0.2];
    stools.forEach((dx) => {
      const bx = ix + dx;
      const bz = iz + islandD / 2 + 0.3;
      [-0.13, 0.13].forEach((ox) =>
        [-0.11, 0.11].forEach((oz) =>
          g.add(cyl(ctx, p.appliance, 0.013, 0.013, 0.64, bx + ox, 0, bz + oz, 8)),
        ),
      );
      g.add(rbox(ctx, p.fabric, 0.36, 0.06, 0.34, bx, 0.64, bz, 0.02));
      if (lux) g.add(rbox(ctx, p.fabric, 0.34, 0.4, 0.06, bx, 0.7, bz + 0.15, 0.02));
    });

    g.add(cyl(ctx, p.white, 0.14, 0.1, 0.07, ix + (lux ? 0.8 : 0), counterH - 0.02, iz, 22));
    [-0.05, 0.04, 0.0].forEach((ox, i) =>
      g.add(sphere(ctx, p.plant, 0.038, ix + (lux ? 0.8 : 0) + ox, counterH + 0.04, iz + (i - 1) * 0.04)),
    );
  }

  if (lux) plant(ctx, g, hw - 0.5, hd - 0.5, 0.9);
}

// ─── Baño ────────────────────────────────────────────────────────────────────

function bano(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;
  // En alto el bano se reorganiza: entra tina exenta, la ducha pierde la
  // mampara y el lavamanos pasa a doble seno sobre mueble suspendido.
  const lux = p.decorLevel === 2;

  if (lux) {
    // ── Ducha a ras, sin plato ni puerta ──
    const showerW = Math.min(1.1, ctx.width * 0.46);
    const sx = -hw + showerW / 2 + 0.04;
    const sz = -hd + 0.62;
    g.add(rbox(ctx, p.counter, showerW, 0.015, 1.15, sx, 0, sz, 0.004));
    g.add(rbox(ctx, p.backsplash ?? p.wall, showerW, 2.25, 0.015, sx, 0.015, sz - 0.58, 0.004));
    // Panel fijo corto: el resto queda abierto.
    g.add(rbox(ctx, p.glass, 0.02, 2.05, 0.72, sx + showerW / 2, 0.015, sz - 0.2, 0.004));
    g.add(rbox(ctx, p.metal, 0.03, 2.05, 0.03, sx + showerW / 2, 0.015, sz + 0.16, 0.012));
    // Rociador de lluvia empotrado
    g.add(rbox(ctx, p.metal, 0.32, 0.02, 0.32, sx, 2.22, sz, 0.006));
    g.add(cyl(ctx, p.metal, 0.02, 0.02, 0.22, sx + showerW / 2 - 0.12, 1.2, sz - 0.56, 12));

    // ── Tina exenta ──
    const tx = 0.15;
    const tz = hd - 1.15;
    g.add(cyl(ctx, p.white, 0.42, 0.34, 0.52, tx, 0, tz, 28));
    g.add(cyl(ctx, p.counter, 0.44, 0.44, 0.03, tx, 0.52, tz, 28));
    g.add(cyl(ctx, p.metal, 0.02, 0.02, 0.75, tx - 0.5, 0, tz, 12));
    g.add(rbox(ctx, p.metal, 0.03, 0.03, 0.24, tx - 0.4, 0.74, tz, 0.012));
    g.add(rbox(ctx, p.fabric, 0.34, 0.04, 0.5, tx + 0.58, 0.02, tz, 0.015));

    // ── Doble lavamanos suspendido ──
    const vw = Math.min(1.5, ctx.width * 0.7);
    const vz = -hd + 0.28;
    g.add(rbox(ctx, p.cabinet, vw, 0.42, 0.48, hw - vw / 2 - 0.3, 0.42, vz, 0.01));
    g.add(rbox(ctx, p.counter, vw + 0.06, 0.05, 0.52, hw - vw / 2 - 0.3, 0.84, vz, 0.006));
    [-0.34, 0.34].forEach((ox) => {
      const bx = hw - vw / 2 - 0.3 + ox;
      g.add(cyl(ctx, p.white, 0.16, 0.13, 0.1, bx, 0.87, vz, 22));
      g.add(cyl(ctx, p.metal, 0.02, 0.024, 0.26, bx, 0.89, vz - 0.18, 14));
      g.add(rbox(ctx, p.metal, 0.028, 0.028, 0.14, bx, 1.14, vz - 0.12, 0.012));
      g.add(rbox(ctx, p.mirror, 0.56, 1.0, 0.015, bx, 1.15, -hd + 0.03, 0.004));
      g.add(rbox(ctx, p.metal, 0.6, 1.04, 0.02, bx, 1.13, -hd + 0.02, 0.006));
    });
    g.add(rbox(ctx, p.ledStrip, vw - 0.1, 0.02, 0.03, hw - vw / 2 - 0.3, 0.4, vz + 0.2, 0.004));

    // ── Sanitario suspendido ──
    g.add(rbox(ctx, p.white, 0.36, 0.34, 0.56, hw - 0.36, 0.28, hd - 0.55, 0.08));
    g.add(rbox(ctx, p.white, 0.38, 0.04, 0.48, hw - 0.36, 0.62, hd - 0.57, 0.02));
    g.add(rbox(ctx, p.metal, 0.14, 0.02, 0.05, hw - 0.36, 1.0, hd - 0.28, 0.006));

    plant(ctx, g, -hw + 0.42, hd - 0.45, 0.7);
    g.add(rbox(ctx, p.fabric, 0.8, 0.025, 0.5, tx - 0.15, 0, tz + 0.75, 0.008));
    return;
  }

  // ── Bajo y medio: ducha con mampara, sanitario y lavamanos simple ──
  const showerW = Math.min(1.0, ctx.width * 0.48);
  const sx = -hw + showerW / 2 + 0.04;
  const sz = -hd + 0.56;
  g.add(rbox(ctx, p.white, showerW, 0.07, 1.0, sx, 0, sz, 0.012));
  g.add(rbox(ctx, p.backsplash ?? p.wall, showerW, 2.05, 0.015, sx, 0.07, sz - 0.5, 0.004));
  g.add(rbox(ctx, p.glass, 0.02, 1.95, 1.0, sx + showerW / 2, 0.07, sz, 0.004));
  g.add(rbox(ctx, p.metal, 0.03, 1.95, 0.03, sx + showerW / 2, 0.07, sz + 0.5, 0.012));
  g.add(cyl(ctx, p.metal, 0.02, 0.02, 0.28, sx, 1.95, sz - 0.34, 12));
  g.add(cyl(ctx, p.metal, 0.1, 0.1, 0.025, sx, 1.93, sz - 0.2, 20));
  g.add(rbox(ctx, p.metal, 0.05, 0.05, 0.22, sx + showerW / 2 - 0.1, 1.1, sz - 0.42, 0.02));

  const tx = hw - 0.36;
  g.add(rbox(ctx, p.white, 0.36, 0.36, 0.56, tx, 0, -hd + 0.5, 0.08));
  g.add(rbox(ctx, p.white, 0.38, 0.05, 0.48, tx, 0.36, -hd + 0.52, 0.03));
  g.add(rbox(ctx, p.white, 0.36, 0.56, 0.18, tx, 0.41, -hd + 0.2, 0.03));
  g.add(rbox(ctx, p.metal, 0.06, 0.015, 0.05, tx, 0.96, -hd + 0.2, 0.006));

  const vanityW = Math.min(1.05, ctx.width * 0.55);
  const vz = hd - 0.3;
  g.add(rbox(ctx, p.cabinet, vanityW, 0.66, 0.46, 0, 0.06, vz, 0.01));
  [0.12, 0.42].forEach((dy) => {
    g.add(rbox(ctx, p.cabinet, vanityW - 0.04, 0.26, 0.02, 0, dy, vz + 0.24, 0.006));
    g.add(rbox(ctx, p.metal, vanityW * 0.4, 0.014, 0.016, 0, dy + 0.12, vz + 0.26, 0.006));
  });
  g.add(rbox(ctx, p.counter, vanityW + 0.06, 0.05, 0.5, 0, 0.72, vz, 0.006));
  g.add(cyl(ctx, p.white, 0.18, 0.15, 0.11, 0, 0.75, vz, 22));
  g.add(cyl(ctx, p.metal, 0.02, 0.025, 0.24, 0, 0.77, vz - 0.17, 14));
  g.add(rbox(ctx, p.metal, 0.028, 0.028, 0.14, 0, 1.0, vz - 0.11, 0.012));
  g.add(rbox(ctx, p.mirror, vanityW - 0.06, 0.9, 0.015, 0, 1.12, hd - 0.04, 0.004));
  g.add(rbox(ctx, p.white, vanityW, 0.95, 0.02, 0, 1.1, hd - 0.03, 0.006));

  g.add(rbox(ctx, p.metal, 0.5, 0.02, 0.02, -0.1, 1.25, -hd + 0.04, 0.008));
  g.add(rbox(ctx, p.white, 0.2, 0.4, 0.05, -0.2, 0.85, -hd + 0.06, 0.015));
  if (p.decorLevel > 0) {
    g.add(rbox(ctx, p.fabric, 0.2, 0.4, 0.05, 0.02, 0.85, -hd + 0.06, 0.015));
    g.add(rbox(ctx, p.fabric, 0.7, 0.022, 0.45, 0, 0, hd - 0.85, 0.008));
    g.add(cyl(ctx, p.white, 0.05, 0.045, 0.13, vanityW / 2 - 0.14, 0.77, vz + 0.08, 16));
  }
}

// ─── Dormitorio ──────────────────────────────────────────────────────────────

function dormitorio(ctx: BuildCtx, g: THREE.Group, doble: boolean) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;
  // En alto la habitacion cambia de planta: la cama gira contra el muro
  // lateral, aparece un rincon de lectura y el armario pasa a muro completo
  // con puertas corredizas.
  const lux = p.decorLevel === 2;
  const camaW = doble ? 1.62 : 1.02;

  if (lux) {
    // Cama centrada contra el muro del fondo, con panel de madera de pared a
    // pared y mesas flotantes en vez de nocheros apoyados.
    const bz = -hd + 1.35;
    g.add(rbox(ctx, p.wood, ctx.width - 0.3, 1.25, 0.05, 0, 0.25, -hd + 0.06, 0.006));
    g.add(rbox(ctx, p.fabric, camaW + 0.5, 0.95, 0.12, 0, 0.3, -hd + 0.12, 0.05));

    g.add(rbox(ctx, p.wood, camaW + 0.14, 0.2, 2.1, 0, 0, bz, 0.012));
    g.add(rbox(ctx, p.white, camaW, 0.28, 2.0, 0, 0.2, bz, 0.05));
    g.add(rbox(ctx, p.fabric, camaW + 0.06, 0.1, 1.3, 0, 0.46, bz + 0.35, 0.04));
    [-0.4, 0.4].forEach((dx) => {
      g.add(rbox(ctx, p.white, 0.66, 0.15, 0.36, dx, 0.46, bz - 0.78, 0.06));
      g.add(rbox(ctx, p.fabric, 0.34, 0.12, 0.28, dx, 0.61, bz - 0.66, 0.05));
    });
    // Banqueta a los pies
    g.add(rbox(ctx, p.fabric, camaW - 0.1, 0.42, 0.42, 0, 0, bz + 1.2, 0.03));

    // Mesas de noche flotantes con lampara colgante
    const side = camaW / 2 + 0.4;
    [-side, side].forEach((dx) => {
      g.add(rbox(ctx, p.wood, 0.48, 0.1, 0.36, dx, 0.42, bz - 0.85, 0.01));
      g.add(cyl(ctx, p.metal, 0.006, 0.006, 0.75, dx, 1.35, bz - 0.85, 6));
      g.add(cyl(ctx, p.lamp, 0.1, 0.13, 0.16, dx, 1.19, bz - 0.85, 18));
    });

    // Armario de muro completo con puertas corredizas
    g.add(rbox(ctx, p.cabinet, 0.6, ctx.height - 0.04, ctx.depth - 0.6, -hw + 0.32, 0, 0.1, 0.008));
    [-1, 1].forEach((sgn) => {
      g.add(rbox(ctx, p.cabinet, 0.02, ctx.height - 0.12, (ctx.depth - 0.7) / 2, -hw + 0.62, 0.04, 0.1 + sgn * (ctx.depth - 0.66) / 4, 0.004));
    });
    g.add(rbox(ctx, p.metal, 0.03, 0.03, ctx.depth - 0.6, -hw + 0.63, 1.1, 0.1, 0.012));

    // Rincon de lectura
    g.add(rbox(ctx, p.fabric, 0.68, 0.38, 0.7, hw - 0.6, 0, hd - 0.85, 0.05));
    g.add(rbox(ctx, p.fabric, 0.68, 0.55, 0.18, hw - 0.6, 0.38, hd - 0.52, 0.05));
    [-0.3, 0.3].forEach((ox) =>
      g.add(rbox(ctx, p.fabric, 0.14, 0.5, 0.7, hw - 0.6 + ox, 0.38, hd - 0.85, 0.05)),
    );
    g.add(cyl(ctx, p.metal, 0.16, 0.16, 0.03, hw - 1.25, 0.45, hd - 0.85, 20));
    g.add(cyl(ctx, p.metal, 0.02, 0.02, 0.45, hw - 1.25, 0, hd - 0.85, 10));
    books(ctx, g, hw - 1.25, 0.48, hd - 0.85, 2);
    plant(ctx, g, hw - 0.5, hd - 1.9, 0.95);

    g.add(rbox(ctx, p.fabric, camaW + 1.5, 0.022, 2.7, 0, 0, bz + 0.45, 0.008));
    return;
  }

  // ── Bajo y medio: cama contra el fondo, nocheros y armario de una hoja ──
  const bz = -hd + 1.3;
  g.add(rbox(ctx, p.wood, camaW + 0.12, 0.26, 2.08, 0, 0, bz, 0.012));
  g.add(rbox(ctx, p.white, camaW, 0.26, 1.98, 0, 0.26, bz, 0.05));
  g.add(rbox(ctx, p.fabric, camaW + 0.06, 0.1, 1.35, 0, 0.5, bz + 0.3, 0.04));

  const pillows = doble ? [-0.38, 0.38] : [0];
  pillows.forEach((dx) =>
    g.add(rbox(ctx, p.white, doble ? 0.66 : 0.6, 0.15, 0.36, dx, 0.5, bz - 0.76, 0.06)),
  );
  if (p.decorLevel > 0) {
    pillows.forEach((dx) =>
      g.add(rbox(ctx, p.fabric, 0.34, 0.12, 0.28, dx, 0.62, bz - 0.66, 0.05)),
    );
  }

  if (p.decorLevel === 0) {
    g.add(rbox(ctx, p.wood, camaW + 0.14, 0.55, 0.06, 0, 0.26, bz - 1.06, 0.01));
  } else {
    g.add(rbox(ctx, p.fabric, camaW + 0.34, 1.05, 0.14, 0, 0.22, bz - 1.1, 0.05));
  }

  const side = camaW / 2 + 0.36;
  const nights = doble ? [-side, side] : [side];
  nights.forEach((dx) => {
    g.add(rbox(ctx, p.wood, 0.46, 0.42, 0.4, dx, 0.06, bz - 0.82, 0.012));
    g.add(rbox(ctx, p.wood, 0.42, 0.16, 0.02, dx, 0.26, bz - 0.63, 0.006));
    g.add(rbox(ctx, p.metal, 0.12, 0.014, 0.014, dx, 0.33, bz - 0.62, 0.006));
    [-0.19, 0.19].forEach((ox) =>
      [-0.16, 0.16].forEach((oz) =>
        g.add(cyl(ctx, p.wood, 0.016, 0.016, 0.06, dx + ox, 0, bz - 0.82 + oz, 8)),
      ),
    );
    if (p.decorLevel > 0) {
      g.add(cyl(ctx, p.metal, 0.03, 0.06, 0.16, dx, 0.48, bz - 0.82, 14));
      g.add(cyl(ctx, p.lamp, 0.11, 0.13, 0.18, dx, 0.64, bz - 0.82, 18));
    } else {
      books(ctx, g, dx, 0.48, bz - 0.82, 2);
    }
  });

  g.add(rbox(ctx, p.cabinet, 0.58, 2.15, Math.min(1.6, ctx.depth * 0.45), -hw + 0.34, 0, hd - 1.1, 0.01));
  cabinetFront(ctx, g, 2, Math.min(1.55, ctx.depth * 0.44), 2.1, -hw + 0.34, 0.02, hd - 1.1, false);

  if (p.decorLevel > 0) {
    g.add(rbox(ctx, p.fabric, camaW + 1.3, 0.022, 2.5, 0, 0, bz + 0.55, 0.008));
    plant(ctx, g, hw - 0.55, hd - 0.6, 0.85);
  }
}

// ─── Zona social ─────────────────────────────────────────────────────────────

function zonaSocial(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;
  // En alto la sala cambia de planta: el sofa pasa a ser seccional en L
  // flotando en el centro, entra un mueble bajo corrido con panel de TV y el
  // comedor crece a seis puestos con aparador.
  const lux = p.decorLevel === 2;

  if (lux) {
    // ── Seccional en L, despegado de la pared ──
    const sx = -hw + 1.7;
    const sz = hd - 1.5;
    g.add(rbox(ctx, p.fabric, 2.6, 0.3, 0.95, sx, 0.08, sz, 0.03));
    [-0.85, 0, 0.85].forEach((ox) =>
      g.add(rbox(ctx, p.fabric, 0.8, 0.16, 0.85, sx + ox, 0.38, sz + 0.02, 0.05)),
    );
    [-0.85, 0, 0.85].forEach((ox) =>
      g.add(rbox(ctx, p.fabric, 0.8, 0.46, 0.2, sx + ox, 0.54, sz - 0.38, 0.05)),
    );
    // Brazo largo de la L
    g.add(rbox(ctx, p.fabric, 0.95, 0.3, 1.5, sx + 1.75, 0.08, sz - 1.2, 0.03));
    g.add(rbox(ctx, p.fabric, 0.85, 0.16, 1.4, sx + 1.75, 0.38, sz - 1.2, 0.05));
    g.add(rbox(ctx, p.fabric, 0.2, 0.46, 1.4, sx + 2.12, 0.54, sz - 1.2, 0.05));
    [-0.28, 0.12, 0.5].forEach((ox) =>
      g.add(rbox(ctx, p.counter, 0.36, 0.13, 0.32, sx + ox, 0.54, sz - 0.22, 0.05)),
    );

    // ── Mesa de centro doble, de piedra ──
    [-0.45, 0.4].forEach((ox, i) => {
      const r = i === 0 ? 0.42 : 0.32;
      g.add(cyl(ctx, p.counter, r, r, 0.05, sx + 0.4 + ox, i === 0 ? 0.36 : 0.28, sz - 1.5, 26));
      g.add(cyl(ctx, p.metal, 0.07, 0.1, i === 0 ? 0.36 : 0.28, sx + 0.4 + ox, 0, sz - 1.5, 16));
    });
    g.add(rbox(ctx, p.fabric, 3.4, 0.022, 2.6, sx + 0.5, 0, sz - 0.8, 0.008));

    // ── Mueble bajo corrido con panel ──
    const tz = -hd + 0.26;
    g.add(rbox(ctx, p.wood, ctx.width - 1.2, 2.3, 0.06, -0.3, 0, -hd + 0.06, 0.006));
    g.add(rbox(ctx, p.cabinet, 2.8, 0.36, 0.42, -0.3, 0.18, tz, 0.01));
    [-0.95, 0, 0.95].forEach((ox) =>
      g.add(rbox(ctx, p.cabinet, 0.88, 0.32, 0.02, -0.3 + ox, 0.2, tz + 0.22, 0.005)),
    );
    g.add(rbox(ctx, p.metal, 1.85, 1.05, 0.04, -0.3, 0.9, tz - 0.1, 0.008));
    g.add(rbox(ctx, p.ledStrip, 2.6, 0.015, 0.03, -0.3, 0.17, tz + 0.18, 0.004));
    [-1.0, 0.9].forEach((ox) => books(ctx, g, -0.3 + ox, 0.55, tz, 3));

    // ── Comedor de seis con aparador ──
    const dx = hw - 1.25;
    const dz = 0.15;
    g.add(rbox(ctx, p.counter, 1.05, 0.06, 2.1, dx, 0.72, dz, 0.008));
    [-0.36, 0.36].forEach((ox) =>
      g.add(rbox(ctx, p.metal, 0.09, 0.72, 0.7, dx + ox, 0, dz, 0.012)),
    );
    [-0.72, 0, 0.72].forEach((oz) =>
      [-0.72, 0.72].forEach((ox) => {
        g.add(rbox(ctx, p.fabric, 0.44, 0.07, 0.44, dx + ox, 0.44, dz + oz, 0.03));
        g.add(rbox(ctx, p.fabric, 0.42, 0.52, 0.07, dx + ox + (ox > 0 ? 0.18 : -0.18), 0.51, dz + oz, 0.03));
        [-0.17, 0.17].forEach((px) =>
          [-0.17, 0.17].forEach((pz) =>
            g.add(cyl(ctx, p.metal, 0.016, 0.016, 0.44, dx + ox + px, 0, dz + oz + pz, 8)),
          ),
        );
      }),
    );
    g.add(cyl(ctx, p.glass, 0.09, 0.07, 0.26, dx, 0.78, dz, 20));
    plant(ctx, g, hw - 0.5, -hd + 0.75, 1.15);
    plant(ctx, g, -hw + 0.45, hd - 0.5, 0.9);
    return;
  }

  // ── Bajo y medio: sofa contra la pared, mesa de centro y comedor de cuatro ──
  const sx = -hw + 1.55;
  const sz = hd - 0.85;
  g.add(rbox(ctx, p.fabric, 2.35, 0.3, 0.92, sx, 0.08, sz, 0.03));
  [-0.75, 0, 0.75].forEach((ox) =>
    g.add(rbox(ctx, p.fabric, 0.72, 0.16, 0.82, sx + ox, 0.38, sz + 0.02, 0.05)),
  );
  [-0.75, 0, 0.75].forEach((ox) =>
    g.add(rbox(ctx, p.fabric, 0.72, 0.46, 0.2, sx + ox, 0.54, sz - 0.36, 0.05)),
  );
  [-1.16, 1.16].forEach((ox) =>
    g.add(rbox(ctx, p.fabric, 0.2, 0.5, 0.92, sx + ox, 0.3, sz, 0.05)),
  );
  if (p.decorLevel > 0) {
    [-0.2, 0.3].forEach((ox) =>
      g.add(rbox(ctx, p.counter, 0.34, 0.12, 0.3, sx + ox, 0.54, sz - 0.2, 0.05)),
    );
  }
  [-1.0, 1.0].forEach((ox) =>
    [-0.35, 0.35].forEach((oz) =>
      g.add(cyl(ctx, p.wood, 0.02, 0.016, 0.08, sx + ox, 0, sz + oz, 8)),
    ),
  );

  const cz = hd - 2.15;
  g.add(rbox(ctx, p.decorLevel > 0 ? p.counter : p.wood, 1.15, 0.05, 0.62, sx + 0.1, 0.36, cz, 0.008));
  [-0.48, 0.48].forEach((ox) =>
    g.add(rbox(ctx, p.wood, 0.06, 0.36, 0.52, sx + 0.1 + ox, 0, cz, 0.01)),
  );
  books(ctx, g, sx + 0.1, 0.41, cz, 3);
  g.add(cyl(ctx, p.glass, 0.07, 0.05, 0.16, sx + 0.36, 0.41, cz + 0.1, 18));
  g.add(rbox(ctx, p.fabric, 2.9, 0.02, 2.0, sx + 0.1, 0, hd - 1.65, 0.006));

  const tz = -hd + 0.3;
  g.add(rbox(ctx, p.cabinet, 2.0, 0.4, 0.4, sx + 0.1, 0.08, tz, 0.01));
  cabinetFront(ctx, g, 3, 1.95, 0.38, sx + 0.1, 0.09, tz + 0.21, false);
  g.add(rbox(ctx, p.metal, 1.55, 0.9, 0.04, sx + 0.1, 0.85, tz - 0.08, 0.008));
  g.add(rbox(ctx, p.metal, 0.3, 0.03, 0.18, sx + 0.1, 0.55, tz - 0.06, 0.01));

  const dx = hw - 1.25;
  const dz = 0.15;
  g.add(rbox(ctx, p.wood, 1.5, 0.06, 0.9, dx, 0.71, dz, 0.008));
  [-0.62, 0.62].forEach((ox) =>
    [-0.34, 0.34].forEach((oz) =>
      g.add(cyl(ctx, p.wood, 0.028, 0.028, 0.71, dx + ox, 0, dz + oz, 10)),
    ),
  );
  [-0.5, 0.5].forEach((ox) =>
    [-0.62, 0.62].forEach((oz) => {
      g.add(rbox(ctx, p.fabric, 0.42, 0.06, 0.42, dx + ox, 0.44, dz + oz, 0.02));
      g.add(rbox(ctx, p.wood, 0.4, 0.46, 0.05, dx + ox, 0.5, dz + oz + (oz > 0 ? 0.18 : -0.18), 0.02));
      [-0.17, 0.17].forEach((px) =>
        [-0.17, 0.17].forEach((pz) =>
          g.add(cyl(ctx, p.wood, 0.018, 0.018, 0.44, dx + ox + px, 0, dz + oz + pz, 8)),
        ),
      );
    }),
  );
  if (p.decorLevel > 0) {
    g.add(cyl(ctx, p.glass, 0.08, 0.06, 0.22, dx, 0.77, dz, 18));
    plant(ctx, g, hw - 0.55, hd - 0.75, 1.0);
  }
}

// ─── Estudio ─────────────────────────────────────────────────────────────────

function estudio(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;
  // En alto el escritorio deja el muro y se pone de cara a la ventana, con
  // biblioteca de pared a pared detras y un sillon de lectura.
  const lux = p.decorLevel === 2;

  if (lux) {
    const dz = 0.15;
    // Escritorio exento, de piedra, con estructura metalica
    g.add(rbox(ctx, p.counter, 1.9, 0.06, 0.85, 0, 0.74, dz, 0.008));
    [-0.85, 0.85].forEach((ox) =>
      g.add(rbox(ctx, p.metal, 0.07, 0.74, 0.75, ox, 0, dz, 0.012)),
    );
    g.add(rbox(ctx, p.metal, 1.6, 0.05, 0.06, 0, 0.3, dz, 0.012));
    // Doble monitor
    [-0.45, 0.45].forEach((ox) => {
      g.add(rbox(ctx, p.metal, 0.62, 0.36, 0.02, ox, 0.99, dz - 0.22, 0.008));
      g.add(cyl(ctx, p.metal, 0.02, 0.02, 0.18, ox, 0.8, dz - 0.22, 10));
      g.add(rbox(ctx, p.metal, 0.22, 0.02, 0.14, ox, 0.8, dz - 0.22, 0.008));
    });
    g.add(rbox(ctx, p.white, 0.44, 0.014, 0.14, 0, 0.8, dz + 0.1, 0.006));
    g.add(cyl(ctx, p.white, 0.04, 0.04, 0.11, 0.36, 0.8, dz + 0.06, 14));
    books(ctx, g, -0.7, 0.8, dz + 0.04, 3);

    // Silla de dirección
    const cz = dz + 0.95;
    g.add(cyl(ctx, p.metal, 0.04, 0.04, 0.44, 0, 0, cz, 12));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      g.add(rbox(ctx, p.metal, 0.07, 0.03, 0.32, Math.sin(a) * 0.14, 0.01, cz + Math.cos(a) * 0.14, 0.012));
    }
    g.add(rbox(ctx, p.fabric, 0.52, 0.09, 0.5, 0, 0.44, cz, 0.03));
    g.add(rbox(ctx, p.fabric, 0.48, 0.66, 0.08, 0, 0.53, cz + 0.22, 0.03));
    [-0.3, 0.3].forEach((ox) =>
      g.add(rbox(ctx, p.metal, 0.05, 0.03, 0.3, ox, 0.62, cz + 0.02, 0.012)),
    );

    // Biblioteca de pared a pared
    const bw = ctx.width - 0.3;
    g.add(rbox(ctx, p.cabinet, bw, ctx.height - 0.04, 0.36, 0, 0, -hd + 0.2, 0.008));
    [0.5, 1.0, 1.5, 2.0].forEach((sy) => {
      g.add(rbox(ctx, p.wood, bw - 0.08, 0.035, 0.32, 0, sy, -hd + 0.2, 0.004));
      [-1.0, -0.35, 0.35, 1.0].forEach((ox) => books(ctx, g, ox, sy + 0.035, -hd + 0.2, 3));
      g.add(rbox(ctx, p.ledStrip, bw - 0.16, 0.012, 0.02, 0, sy - 0.012, -hd + 0.36, 0.004));
    });

    // Rincón de lectura
    g.add(rbox(ctx, p.fabric, 0.72, 0.38, 0.72, hw - 0.62, 0, hd - 0.85, 0.05));
    g.add(rbox(ctx, p.fabric, 0.72, 0.56, 0.18, hw - 0.62, 0.38, hd - 0.53, 0.05));
    g.add(cyl(ctx, p.metal, 0.02, 0.02, 1.45, hw - 1.2, 0, hd - 0.95, 10));
    g.add(cyl(ctx, p.lamp, 0.13, 0.16, 0.2, hw - 1.2, 1.45, hd - 0.95, 18));
    plant(ctx, g, -hw + 0.45, hd - 0.6, 1.0);
    return;
  }

  // ── Bajo y medio: escritorio contra el muro ──
  const dz = -hd + 0.5;
  g.add(rbox(ctx, p.wood, 1.7, 0.05, 0.7, 0, 0.73, dz, 0.008));
  [-0.78, 0.78].forEach((ox) =>
    [-0.28, 0.28].forEach((oz) =>
      g.add(cyl(ctx, p.metal, 0.022, 0.022, 0.73, ox, 0, dz + oz, 10)),
    ),
  );
  g.add(rbox(ctx, p.cabinet, 0.42, 0.58, 0.5, 0.58, 0.06, dz, 0.01));
  [0.12, 0.32].forEach((dy) => {
    g.add(rbox(ctx, p.cabinet, 0.38, 0.17, 0.02, 0.58, dy, dz + 0.26, 0.006));
    g.add(rbox(ctx, p.metal, 0.16, 0.012, 0.014, 0.58, dy + 0.08, dz + 0.28, 0.006));
  });
  g.add(rbox(ctx, p.metal, 0.2, 0.03, 0.16, -0.25, 0.78, dz - 0.08, 0.01));
  g.add(cyl(ctx, p.metal, 0.02, 0.02, 0.16, -0.25, 0.81, dz - 0.08, 10));
  g.add(rbox(ctx, p.metal, 0.62, 0.37, 0.02, -0.25, 0.97, dz - 0.08, 0.008));
  g.add(rbox(ctx, p.white, 0.4, 0.014, 0.14, -0.25, 0.78, dz + 0.14, 0.006));
  g.add(cyl(ctx, p.white, 0.04, 0.04, 0.11, 0.42, 0.78, dz - 0.12, 14));
  books(ctx, g, -0.72, 0.78, dz - 0.05, 3);

  const cz = dz + 1.05;
  g.add(cyl(ctx, p.metal, 0.035, 0.035, 0.42, 0, 0, cz, 10));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    g.add(rbox(ctx, p.metal, 0.06, 0.03, 0.3, Math.sin(a) * 0.13, 0.01, cz + Math.cos(a) * 0.13, 0.012));
  }
  g.add(rbox(ctx, p.fabric, 0.48, 0.08, 0.46, 0, 0.42, cz, 0.03));
  g.add(rbox(ctx, p.fabric, 0.44, 0.52, 0.07, 0, 0.5, cz + 0.2, 0.03));

  const bx = hw - 0.22;
  g.add(rbox(ctx, p.cabinet, 0.36, 2.0, Math.min(1.5, ctx.depth * 0.4), bx, 0, hd - 1.0, 0.01));
  [0.45, 0.92, 1.39].forEach((sy) => {
    g.add(rbox(ctx, p.wood, 0.33, 0.03, Math.min(1.45, ctx.depth * 0.39), bx, sy, hd - 1.0, 0.004));
    [-0.4, 0, 0.4].forEach((oz) => books(ctx, g, bx, sy + 0.03, hd - 1.0 + oz, 3));
  });
  if (p.decorLevel > 0) plant(ctx, g, -hw + 0.42, hd - 0.55, 0.9);
}

// ─── Vestier ─────────────────────────────────────────────────────────────────

function vestier(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;
  const modD = ctx.depth - 0.4;

  [-1, 1].forEach((s) => {
    const x = s * (hw - 0.3);
    // Estructura, baldas y barra de colgar
    g.add(rbox(ctx, p.cabinet, 0.52, 2.2, modD, x, 0, 0, 0.01));
    [0.5, 1.05, 1.6].forEach((sy) =>
      g.add(rbox(ctx, p.wood, 0.48, 0.03, modD - 0.06, x, sy, 0, 0.004)),
    );
    g.add(cyl(ctx, p.metal, 0.016, 0.016, modD - 0.2, x - s * 0.1, 1.45, 0, 10));

    // Ropa colgada: tablillas de distinto largo y color
    for (let i = 0; i < 7; i++) {
      const oz = -modD / 2 + 0.18 + i * ((modD - 0.36) / 6);
      const h = 0.55 + (i % 3) * 0.14;
      g.add(rbox(ctx, i % 2 ? p.fabric : p.white, 0.26, h, 0.05, x - s * 0.1, 1.42 - h, oz, 0.02));
    }
    // Cajas y zapatos en las baldas
    [0.53, 1.08].forEach((sy) =>
      [-0.3, 0.3].forEach((oz) =>
        g.add(rbox(ctx, sy > 1 ? p.white : p.fabric, 0.34, 0.18, 0.3, x, sy, oz, 0.012)),
      ),
    );
  });

  // La isla central marca la diferencia: en alto es un joyero con tapa de
  // vidrio y banco tapizado a un lado; en medio, un simple cajon.
  if (p.decorLevel === 2) {
    g.add(rbox(ctx, p.cabinet, 0.62, 0.78, 1.1, 0, 0, -0.25, 0.012));
    g.add(rbox(ctx, p.glass, 0.58, 0.03, 1.06, 0, 0.78, -0.25, 0.006));
    [0.18, 0.42].forEach((dy) =>
      g.add(rbox(ctx, p.cabinet, 0.58, 0.2, 0.02, 0, dy, -0.25 + 0.55, 0.005)),
    );
    g.add(rbox(ctx, p.ledStrip, 0.5, 0.012, 0.9, 0, 0.76, -0.25, 0.004));
    g.add(rbox(ctx, p.fabric, 0.5, 0.42, 0.8, 0, 0, 0.75, 0.03));
    [-0.18, 0.18].forEach((ox) =>
      [-0.32, 0.32].forEach((oz) =>
        g.add(cyl(ctx, p.metal, 0.018, 0.018, 0.42, ox, 0, 0.75 + oz, 8)),
      ),
    );
  } else if (p.decorLevel > 0) {
    g.add(rbox(ctx, p.cabinet, 0.5, 0.42, 0.8, 0, 0, 0, 0.014));
    g.add(rbox(ctx, p.fabric, 0.54, 0.08, 0.84, 0, 0.42, 0, 0.03));
  } else {
    g.add(rbox(ctx, p.fabric, 0.44, 0.42, 0.44, 0, 0, 0, 0.03));
  }
  if (p.decorLevel === 2) {
    g.add(rbox(ctx, p.mirror, 0.52, 1.5, 0.02, 0, 0.35, -hd + 0.06, 0.006));
    g.add(rbox(ctx, p.metal, 0.56, 1.54, 0.02, 0, 0.33, -hd + 0.04, 0.006));
  }
}

// ─── Zona de ropas ───────────────────────────────────────────────────────────

function zonaRopas(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;
  const z = -hd + 0.42;

  // Lavadora y secadora, con puerta circular y panel
  const units = p.decorLevel > 0 ? [-0.34, 0.34] : [0];
  units.forEach((dx) => {
    g.add(rbox(ctx, p.white, 0.6, 0.85, 0.6, dx, 0, z, 0.02));
    g.add(cyl(ctx, p.metal, 0.2, 0.2, 0.04, dx, 0.44, z + 0.29, 24));
    g.add(cyl(ctx, p.glass, 0.15, 0.15, 0.05, dx, 0.44, z + 0.3, 24));
    g.add(rbox(ctx, p.metal, 0.5, 0.08, 0.02, dx, 0.73, z + 0.3, 0.008));
    [-0.15, 0, 0.15].forEach((ox) =>
      g.add(cyl(ctx, p.metal, 0.018, 0.018, 0.012, dx + ox, 0.77, z + 0.31, 12)),
    );
  });

  // Encimera, poceta y grifo
  g.add(rbox(ctx, p.counter, ctx.width - 0.25, 0.05, 0.66, 0, 0.86, z, 0.006));
  g.add(rbox(ctx, p.white, 0.44, 0.2, 0.42, hw - 0.42, 0.68, z, 0.02));
  g.add(cyl(ctx, p.metal, 0.02, 0.024, 0.26, hw - 0.42, 0.91, z - 0.2, 12));

  // Alacena, tendedero y canastos
  g.add(rbox(ctx, p.cabinetUpper, ctx.width - 0.35, 0.62, 0.32, 0, 1.6, z - 0.13, 0.01));
  cabinetFront(ctx, g, 2, ctx.width - 0.4, 0.6, 0, 1.61, z + 0.03, false);
  [-0.14, 0.14].forEach((oz) =>
    g.add(cyl(ctx, p.metal, 0.012, 0.012, ctx.width - 0.4, 0, 1.4, z + oz + 0.28, 8)),
  );
  g.add(rbox(ctx, p.fabric, 0.36, 0.34, 0.34, -hw + 0.3, 0, hd - 0.35, 0.03));
  if (p.decorLevel > 0) {
    g.add(rbox(ctx, p.fabric, 0.36, 0.34, 0.34, -hw + 0.3, 0.34, hd - 0.35, 0.03));
  }
}

// ─── Balcón ──────────────────────────────────────────────────────────────────

function balcon(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;

  // Baranda de vidrio con montantes y pasamanos
  g.add(rbox(ctx, p.glass, ctx.width - 0.3, 1.02, 0.02, 0, 0.05, hd - 0.1, 0.004));
  g.add(rbox(ctx, p.metal, ctx.width - 0.2, 0.05, 0.06, 0, 1.07, hd - 0.1, 0.02));
  for (let i = 0; i <= 4; i++) {
    const x = -hw + 0.15 + (i * (ctx.width - 0.3)) / 4;
    g.add(rbox(ctx, p.metal, 0.04, 1.07, 0.05, x, 0, hd - 0.1, 0.015));
  }

  // Mesa y sillas
  const tx = -ctx.width / 4;
  if (p.decorLevel === 2) {
    // Lounge de exterior: sofa bajo, mesa de centro y tumbona.
    g.add(rbox(ctx, p.wood, 1.7, 0.26, 0.8, tx, 0, -0.15, 0.02));
    g.add(rbox(ctx, p.fabric, 1.6, 0.16, 0.72, tx, 0.26, -0.15, 0.05));
    [-0.5, 0.5].forEach((ox) =>
      g.add(rbox(ctx, p.fabric, 0.55, 0.4, 0.18, tx + ox, 0.42, -0.42, 0.05)),
    );
    [-0.55, 0.55].forEach((ox) =>
      g.add(rbox(ctx, p.counter, 0.34, 0.12, 0.3, tx + ox, 0.42, -0.2, 0.05)),
    );
    g.add(rbox(ctx, p.counter, 0.8, 0.05, 0.45, tx, 0.32, 0.55, 0.008));
    [-0.3, 0.3].forEach((ox) =>
      g.add(rbox(ctx, p.wood, 0.06, 0.32, 0.38, tx + ox, 0, 0.55, 0.01)),
    );
    g.add(cyl(ctx, p.glass, 0.07, 0.05, 0.16, tx, 0.37, 0.55, 18));
  } else {
    g.add(cyl(ctx, p.wood, 0.4, 0.4, 0.05, tx, 0.7, 0, 26));
    g.add(cyl(ctx, p.metal, 0.05, 0.09, 0.7, tx, 0, 0, 14));
    [-0.62, 0.62].forEach((dx) => {
      g.add(rbox(ctx, p.fabric, 0.42, 0.07, 0.42, tx + dx, 0.42, 0, 0.03));
      g.add(rbox(ctx, p.metal, 0.4, 0.45, 0.05, tx + dx + (dx > 0 ? 0.18 : -0.18), 0.49, 0, 0.02));
      [-0.16, 0.16].forEach((px) =>
        [-0.16, 0.16].forEach((pz) =>
          g.add(cyl(ctx, p.metal, 0.015, 0.015, 0.42, tx + dx + px, 0, pz, 8)),
        ),
      );
    });
  }

  // Jardinera corrida y plantas
  g.add(rbox(ctx, p.counter, 0.34, 0.3, ctx.depth - 0.6, hw - 0.28, 0, 0, 0.02));
  plant(ctx, g, hw - 0.28, -0.35, 0.7);
  plant(ctx, g, hw - 0.28, 0.35, 0.6);
  if (p.decorLevel > 0) {
    plant(ctx, g, -hw + 0.35, hd - 0.5, 1.0);
    g.add(rbox(ctx, p.fabric, 1.2, 0.02, 0.8, tx, 0, 0, 0.006));
  }
}

// ─── Entrada / Hall ──────────────────────────────────────────────────────────

function hall(ctx: BuildCtx, g: THREE.Group) {
  const p = ctx.palette;
  const hw = ctx.width / 2;
  const hd = ctx.depth / 2;
  const z = -hd + 0.24;

  // Consola con cajones y patas
  g.add(rbox(ctx, p.cabinet, ctx.width - 0.5, 0.62, 0.34, 0, 0.14, z, 0.01));
  g.add(rbox(ctx, p.counter, ctx.width - 0.44, 0.045, 0.38, 0, 0.76, z, 0.006));
  [-0.3, 0.3].forEach((ox) =>
    g.add(rbox(ctx, p.metal, 0.16, 0.014, 0.016, ox, 0.44, z + 0.18, 0.006)),
  );
  [-1, 1].forEach((s) =>
    [-0.12, 0.12].forEach((oz) =>
      g.add(cyl(ctx, p.metal, 0.016, 0.016, 0.14, s * (ctx.width / 2 - 0.34), 0, z + oz, 8)),
    ),
  );

  // Espejo y objetos
  g.add(rbox(ctx, p.mirror, 0.56, 0.82, 0.015, 0, 1.0, -hd + 0.05, 0.006));
  g.add(rbox(ctx, p.decorLevel === 2 ? p.metal : p.white, 0.6, 0.86, 0.02, 0, 0.98, -hd + 0.04, 0.006));
  g.add(cyl(ctx, p.white, 0.07, 0.05, 0.16, -0.3, 0.78, z, 18));
  g.add(rbox(ctx, p.fabric, 0.16, 0.06, 0.12, 0.28, 0.78, z, 0.02));

  // Perchero y alfombra de entrada
  g.add(cyl(ctx, p.metal, 0.02, 0.02, 1.7, hw - 0.28, 0, hd - 0.45, 10));
  [0, 2.1, 4.2].forEach((a) =>
    g.add(rbox(ctx, p.metal, 0.05, 0.03, 0.12, hw - 0.28 + Math.sin(a) * 0.08, 1.6, hd - 0.45 + Math.cos(a) * 0.08, 0.012)),
  );
  if (p.decorLevel === 2) {
    // Panel ranurado de madera detras de la consola y banco con zapatero.
    g.add(rbox(ctx, p.wood, ctx.width - 0.3, 2.3, 0.05, 0, 0, -hd + 0.03, 0.006));
    for (let i = 0; i < 9; i++) {
      const x = -ctx.width / 2 + 0.25 + (i * (ctx.width - 0.5)) / 8;
      g.add(rbox(ctx, p.toeKick, 0.018, 2.2, 0.02, x, 0.05, -hd + 0.06, 0.004));
    }
    g.add(rbox(ctx, p.cabinet, ctx.width - 0.9, 0.42, 0.38, 0, 0.12, hd - 0.32, 0.012));
    g.add(rbox(ctx, p.fabric, ctx.width - 0.95, 0.08, 0.36, 0, 0.54, hd - 0.32, 0.03));
    g.add(rbox(ctx, p.ledStrip, ctx.width - 1.0, 0.012, 0.03, 0, 0.1, hd - 0.5, 0.004));
    plant(ctx, g, -hw + 0.34, hd - 0.9, 0.8);
  } else if (p.decorLevel > 0) {
    g.add(rbox(ctx, p.fabric, 0.24, 0.5, 0.1, hw - 0.28, 1.05, hd - 0.4, 0.03));
    g.add(rbox(ctx, p.fabric, ctx.width - 0.7, 0.02, 0.7, 0, 0, hd - 0.7, 0.006));
    plant(ctx, g, -hw + 0.32, hd - 0.45, 0.75);
  }
}

const BUILDERS: Record<string, (ctx: BuildCtx, g: THREE.Group) => void> = {
  cocina,
  bano_principal: bano,
  bano_social: bano,
  habitacion_principal: (c, g) => dormitorio(c, g, true),
  habitaciones_secundarias: (c, g) => dormitorio(c, g, false),
  zona_social: zonaSocial,
  estudio_oficina: estudio,
  vestier,
  zona_ropas: zonaRopas,
  balcon_terraza: balcon,
  entrada_hall: hall,
};

export function hasInterior(roomId: string): boolean {
  return roomId in BUILDERS;
}

export function buildInterior(roomId: string, ctx: BuildCtx): THREE.Group {
  const group = new THREE.Group();
  BUILDERS[roomId]?.(ctx, group);
  return group;
}
