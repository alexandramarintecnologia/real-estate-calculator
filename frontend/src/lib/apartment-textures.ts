import * as THREE from "three";

/**
 * Texturas generadas en canvas para la vista 3D.
 *
 * Se dibujan en codigo en vez de cargar imagenes: no suman peso al bundle ni
 * peticiones, y el patron de baldosa con boquilla es justo lo que distingue un
 * piso terminado de una placa de concreto a la vista.
 *
 * Toda textura creada aca hay que liberarla con dispose() al desmontar la
 * escena: Three.js no suelta memoria de GPU por su cuenta.
 */

const SIZE = 256;

function createCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto 2D para las texturas");
  return [canvas, ctx];
}

function finish(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Ruido sutil, para que las superficies no se vean planas como plastico. */
function speckle(
  ctx: CanvasRenderingContext2D,
  count: number,
  alpha: number,
  dark = true,
) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = Math.random() * 2.2;
    ctx.fillStyle = dark
      ? `rgba(0,0,0,${Math.random() * alpha})`
      : `rgba(255,255,255,${Math.random() * alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Baldosa grande con boquilla clara, como la del piso terminado de referencia. */
export function createTileTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();

  ctx.fillStyle = "#8a817a";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const gap = 6;
  const half = SIZE / 2;
  const tones = ["#6f665f", "#746b63", "#6a615a", "#776e66"];
  let i = 0;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = tones[i++ % tones.length];
      ctx.fillRect(col * half + gap / 2, row * half + gap / 2, half - gap, half - gap);
    }
  }

  const shine = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  shine.addColorStop(0, "rgba(255,255,255,0.10)");
  shine.addColorStop(0.5, "rgba(255,255,255,0)");
  shine.addColorStop(1, "rgba(255,255,255,0.06)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, SIZE, SIZE);

  speckle(ctx, 120, 0.05);
  return finish(canvas);
}

/** Placa de concreto a la vista: manchada, despareja, sin acabado. */
export function createConcreteTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();

  ctx.fillStyle = "#9a938b";
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 18; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 18 + Math.random() * 46;
    const stain = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = Math.random() > 0.5;
    stain.addColorStop(0, dark ? "rgba(90,84,78,0.34)" : "rgba(190,184,176,0.30)");
    stain.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = stain;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  speckle(ctx, 900, 0.16);
  speckle(ctx, 400, 0.10, false);
  return finish(canvas);
}

/** Muro de ladrillo a la vista, el rojo caracteristico de la obra negra. */
export function createBrickTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();

  ctx.fillStyle = "#9c9188";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const rows = 8;
  const brickH = SIZE / rows;
  const brickW = SIZE / 3;
  const mortar = 4;

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : -brickW / 2;
    for (let col = -1; col < 4; col++) {
      const x = col * brickW + offset;
      const y = row * brickH;
      const tone = 150 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgb(${tone}, ${Math.floor(tone * 0.52)}, ${Math.floor(tone * 0.38)})`;
      ctx.fillRect(x + mortar / 2, y + mortar / 2, brickW - mortar, brickH - mortar);
    }
  }

  speckle(ctx, 500, 0.14);
  return finish(canvas);
}

/** Pintura lisa con textura minima, para el muro terminado. */
export function createPaintTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#e9dcc6";
  ctx.fillRect(0, 0, SIZE, SIZE);
  speckle(ctx, 200, 0.03);
  return finish(canvas);
}

/**
 * Escala las UV de una geometria para que la textura se repita segun el tamano
 * real del cuarto. Evita clonar una textura por ambiente: con una sola textura
 * compartida y las UV ajustadas, la baldosa mide lo mismo en toda la planta.
 */
export function scaleUv(
  geometry: THREE.BufferGeometry,
  repeatX: number,
  repeatY: number,
): void {
  const uv = geometry.attributes.uv;
  if (!uv) return;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * repeatX, uv.getY(i) * repeatY);
  }
  uv.needsUpdate = true;
}

// ─── Texturas por nivel de presupuesto ───────────────────────────────────────

/** Marmol veteado, para encimeras y revestimientos del nivel alto. */
export function createMarbleTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#f2efe9";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Vetas: lineas quebradas con ramificaciones, como el marmol real.
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    let x = Math.random() * SIZE;
    let y = -10;
    ctx.moveTo(x, y);
    while (y < SIZE + 10) {
      x += (Math.random() - 0.5) * 40;
      y += 10 + Math.random() * 14;
      ctx.lineTo(x, y);
    }
    const grey = 150 + Math.floor(Math.random() * 60);
    ctx.strokeStyle = `rgba(${grey},${grey - 8},${grey - 16},${0.18 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.6 + Math.random() * 2.4;
    ctx.stroke();
  }
  speckle(ctx, 150, 0.04);
  return finish(canvas);
}

/** Cuarzo: fondo claro con grano fino, para encimeras del nivel medio. */
export function createQuartzTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#e4e1da";
  ctx.fillRect(0, 0, SIZE, SIZE);
  speckle(ctx, 2200, 0.14);
  speckle(ctx, 1400, 0.12, false);
  return finish(canvas);
}

/** Madera con veta, para carpinteria. */
export function createWoodTexture(base: string, veta: string): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 42; i++) {
    const y = Math.random() * SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= SIZE; x += 16) {
      ctx.lineTo(x, y + Math.sin(x / 26 + i) * 2.4);
    }
    ctx.strokeStyle = veta;
    ctx.globalAlpha = 0.06 + Math.random() * 0.14;
    ctx.lineWidth = 0.6 + Math.random() * 2;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return finish(canvas);
}

/** Salpicadero: baldosin pequeno tipo metro, para cocinas y banos. */
export function createBacksplashTexture(color: string, grout: string): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const rows = 8;
  const h = SIZE / rows;
  const w = SIZE / 4;
  const gap = 3;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : -w / 2;
    for (let col = -1; col < 5; col++) {
      ctx.fillStyle = color;
      ctx.fillRect(col * w + offset + gap / 2, row * h + gap / 2, w - gap, h - gap);
    }
  }
  // Brillo: el baldosin esmaltado refleja.
  const shine = ctx.createLinearGradient(0, 0, 0, SIZE);
  shine.addColorStop(0, "rgba(255,255,255,0.16)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return finish(canvas);
}

/** Baldosa de piso parametrizable, para diferenciar los tres niveles. */
export function createFloorTexture(
  tones: string[],
  grout: string,
  gloss: number,
): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const gap = 5;
  const half = SIZE / 2;
  let i = 0;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = tones[i++ % tones.length];
      ctx.fillRect(col * half + gap / 2, row * half + gap / 2, half - gap, half - gap);
    }
  }

  const shine = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  shine.addColorStop(0, `rgba(255,255,255,${gloss})`);
  shine.addColorStop(0.5, "rgba(255,255,255,0)");
  shine.addColorStop(1, `rgba(255,255,255,${gloss * 0.6})`);
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, SIZE, SIZE);

  speckle(ctx, 90, 0.04);
  return finish(canvas);
}

/**
 * Deriva un mapa de normales a partir de una textura de canvas.
 *
 * Lee la luminancia como si fuera altura y calcula la pendiente con un Sobel.
 * Con eso la boquilla de la baldosa se hunde, la veta de la madera tiene
 * relieve y la tela deja de ser una superficie perfectamente plana. Es lo que
 * separa una foto pegada de un material con volumen.
 */
export function createNormalFrom(
  source: THREE.CanvasTexture,
  strength = 2.2,
): THREE.CanvasTexture {
  const src = source.image as HTMLCanvasElement;
  const srcCtx = src.getContext("2d");
  const [canvas, ctx] = createCanvas();
  if (!srcCtx) return finish(canvas);

  const { data } = srcCtx.getImageData(0, 0, SIZE, SIZE);
  const out = ctx.createImageData(SIZE, SIZE);

  const lum = (x: number, y: number) => {
    // Envuelve en los bordes: la textura se repite, y sin esto aparece una
    // costura visible en cada union.
    const xi = (x + SIZE) % SIZE;
    const yi = (y + SIZE) % SIZE;
    const i = (yi * SIZE + xi) * 4;
    return (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
  };

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const tl = lum(x - 1, y - 1), t = lum(x, y - 1), tr = lum(x + 1, y - 1);
      const l = lum(x - 1, y), r = lum(x + 1, y);
      const bl = lum(x - 1, y + 1), b = lum(x, y + 1), br = lum(x + 1, y + 1);

      const dx = tl + 2 * l + bl - (tr + 2 * r + br);
      const dy = tl + 2 * t + tr - (bl + 2 * b + br);
      const dz = 1 / strength;

      const len = Math.hypot(dx, dy, dz) || 1;
      const i = (y * SIZE + x) * 4;
      out.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((dz / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);
  const texture = finish(canvas);
  // Los mapas de normales son datos, no color: no se convierten a sRGB.
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/** Terrazo: fondo claro con aridos de varios tamanos, como la encimera de referencia. */
export function createTerrazzoTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#e8e6e1";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const chips = ["#9a958c", "#c4bfb6", "#7e7970", "#b3aca1", "#6f6a62"];
  for (let i = 0; i < 340; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 1.2 + Math.random() * 3.4;
    ctx.fillStyle = chips[Math.floor(Math.random() * chips.length)];
    ctx.globalAlpha = 0.5 + Math.random() * 0.45;
    // Aridos irregulares: un poligono, no un circulo perfecto.
    ctx.beginPath();
    const sides = 5 + Math.floor(Math.random() * 3);
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2;
      const rr = r * (0.7 + Math.random() * 0.6);
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (s === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, 300, 0.05);
  return finish(canvas);
}

/** Marmol oscuro de formato grande, para el piso de la referencia. */
export function createDarkMarbleFloor(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#6e6a66";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Nubes de tono: el marmol nunca es de un solo gris.
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 30 + Math.random() * 70;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() > 0.45;
    cloud.addColorStop(0, light ? "rgba(160,156,150,0.38)" : "rgba(58,55,52,0.34)");
    cloud.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vetas claras
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    let x = Math.random() * SIZE;
    let y = -10;
    ctx.moveTo(x, y);
    while (y < SIZE + 10) {
      x += (Math.random() - 0.5) * 46;
      y += 12 + Math.random() * 16;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(198,194,188,${0.2 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.8;
    ctx.stroke();
  }

  // Junta de baldosa de formato grande, apenas marcada.
  ctx.strokeStyle = "rgba(40,38,36,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);

  speckle(ctx, 200, 0.06);
  return finish(canvas);
}

/** Piedra clara de formato grande para el salpicadero continuo. */
export function createStoneSlabTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#eceae5";
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 40 + Math.random() * 60;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r);
    cloud.addColorStop(0, "rgba(200,196,189,0.35)");
    cloud.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  speckle(ctx, 160, 0.03);
  return finish(canvas);
}

/** Piso de tablones de madera clara, para el nivel medio. */
export function createPlankFloorTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#c9a87c";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const planks = 4;
  const h = SIZE / planks;
  for (let i = 0; i < planks; i++) {
    const tone = 190 + Math.floor(Math.random() * 30);
    ctx.fillStyle = `rgb(${tone}, ${Math.floor(tone * 0.82)}, ${Math.floor(tone * 0.62)})`;
    ctx.fillRect(0, i * h + 1.5, SIZE, h - 3);

    // Veta longitudinal del tablon
    for (let v = 0; v < 9; v++) {
      const y = i * h + 4 + Math.random() * (h - 8);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= SIZE; x += 14) {
        ctx.lineTo(x, y + Math.sin(x / 22 + v) * 1.6);
      }
      ctx.strokeStyle = `rgba(120, 88, 56, ${0.05 + Math.random() * 0.14})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.6;
      ctx.stroke();
    }
    // Testa: junta vertical, desplazada en cada hilada
    const seam = (i % 2 === 0 ? 0.35 : 0.7) * SIZE;
    ctx.fillStyle = "rgba(120, 92, 60, 0.45)";
    ctx.fillRect(seam, i * h + 1.5, 2, h - 3);
  }
  speckle(ctx, 200, 0.05);
  return finish(canvas);
}

/** Marmol negro con vetas blancas: el piso dramatico del nivel alto. */
export function createBlackMarbleTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#1c1c1f";
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 16; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 30 + Math.random() * 70;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r);
    cloud.addColorStop(0, "rgba(70,70,78,0.42)");
    cloud.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vetas blancas gruesas con ramificaciones finas
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    let x = Math.random() * SIZE;
    let y = -10;
    ctx.moveTo(x, y);
    while (y < SIZE + 10) {
      x += (Math.random() - 0.5) * 52;
      y += 10 + Math.random() * 15;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(238,236,232,${0.35 + Math.random() * 0.45})`;
    ctx.lineWidth = 0.8 + Math.random() * 3;
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(90,90,96,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);
  speckle(ctx, 160, 0.08, false);
  return finish(canvas);
}

/** Granito gris: la encimera economica clasica del nivel bajo. */
export function createGraniteTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#8f9092";
  ctx.fillRect(0, 0, SIZE, SIZE);
  const chips = ["#5f6062", "#b9bbbd", "#74767a", "#d2d4d6", "#43454a"];
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    ctx.fillStyle = chips[Math.floor(Math.random() * chips.length)];
    ctx.globalAlpha = 0.35 + Math.random() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + Math.random() * 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return finish(canvas);
}

/** Cuarzo negro con destellos, como la encimera de la cocina de referencia. */
export function createBlackSpeckledTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#14141a";
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Destellos claros dispersos: es lo que da el brillo del cuarzo negro.
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 0.4 + Math.random() * 1.5;
    const t = Math.random();
    ctx.fillStyle = t > 0.8 ? "rgba(255,255,255,0.9)" : t > 0.5 ? "rgba(190,195,205,0.55)" : "rgba(90,95,105,0.5)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return finish(canvas);
}

/** Marmol blanco de formato grande: el piso claro del nivel medio. */
export function createWhiteMarbleFloor(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#eceae6";
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 40 + Math.random() * 60;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r);
    cloud.addColorStop(0, "rgba(206,203,198,0.4)");
    cloud.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    let x = Math.random() * SIZE;
    let y = -10;
    ctx.moveTo(x, y);
    while (y < SIZE + 10) {
      x += (Math.random() - 0.5) * 46;
      y += 12 + Math.random() * 16;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(150,150,152,${0.16 + Math.random() * 0.24})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.6;
    ctx.stroke();
  }
  // Junta clara del formato grande
  ctx.strokeStyle = "rgba(190,188,183,0.8)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);
  return finish(canvas);
}

/** Azulejo blanco cuadrado, el salpicadero del nivel bajo. */
export function createWhiteTileTexture(relief: boolean): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas();
  ctx.fillStyle = "#dcdad5";
  ctx.fillRect(0, 0, SIZE, SIZE);
  const n = 4;
  const s = SIZE / n;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      ctx.fillStyle = "#f6f5f2";
      ctx.fillRect(c * s + 1.5, r * s + 1.5, s - 3, s - 3);
      if (relief) {
        // Relieve en espiga: el baldosin texturado del nivel medio.
        ctx.strokeStyle = "rgba(180,178,173,0.55)";
        ctx.lineWidth = 1.2;
        for (let k = 0; k < 5; k++) {
          const o = (k * s) / 5;
          ctx.beginPath();
          ctx.moveTo(c * s + 2, r * s + o + 2);
          ctx.lineTo(c * s + s / 2, r * s + o + s / 5);
          ctx.lineTo(c * s + s - 2, r * s + o + 2);
          ctx.stroke();
        }
      }
    }
  }
  const shine = ctx.createLinearGradient(0, 0, 0, SIZE);
  shine.addColorStop(0, "rgba(255,255,255,0.2)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return finish(canvas);
}
