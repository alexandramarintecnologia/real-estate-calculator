#!/usr/bin/env node
/**
 * Genera las imágenes de referencia del módulo de Remodelaciones con Gemini.
 *
 * Habla directo con la API REST: Node 22 ya trae fetch, así que no hace falta
 * instalar nada. Escribe en public/remodelaciones/<ambiente>/<nivel>.jpg, que
 * es justo donde la app las busca.
 *
 * Dos fuentes posibles:
 *
 *   IA (Gemini) — genera la imagen desde cero:
 *     export GEMINI_API_KEY="tu-clave"       # aistudio.google.com/apikey
 *     npm run generate:renders
 *
 *   Fotos reales (Pexels) — banco gratuito con licencia de uso comercial:
 *     export PEXELS_API_KEY="tu-clave"       # pexels.com/api
 *     npm run generate:renders -- --source pexels
 *
 *   npm run generate:renders -- --room cocina
 *   npm run generate:renders -- --tier alto --force
 */

import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "remodelaciones");

/**
 * Carga .env.local si existe, para no tener que exportar la clave en cada
 * terminal. Ese archivo esta en .gitignore, asi que la clave nunca llega a git.
 */
async function loadEnvLocal() {
  try {
    const raw = await readFile(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      // Se respeta lo que ya venga del entorno: exportar gana sobre el archivo.
      if (process.env[key]) continue;
      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // Sin .env.local no pasa nada: se usan las variables del entorno.
  }
}

let API_KEY = process.env.GEMINI_API_KEY;
let PEXELS_KEY = process.env.PEXELS_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
const ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// ─── Qué se ve en cada ambiente ──────────────────────────────────────────────

const ROOMS = {
  cocina: "a kitchen",
  bano_principal: "a main bathroom",
  bano_social: "a small guest bathroom",
  zona_social: "an open living and dining room",
  habitacion_principal: "a main bedroom",
  habitaciones_secundarias: "a secondary bedroom",
  estudio_oficina: "a home office study",
  vestier: "a walk-in closet",
  zona_ropas: "a laundry room",
  balcon_terraza: "an apartment balcony terrace",
  entrada_hall: "an entrance hall foyer",
};

// ─── Qué distingue cada nivel de presupuesto ─────────────────────────────────
// El salto entre niveles tiene que ser evidente: no es el mismo cuarto con otro
// color, cambian los materiales, la iluminación y la cantidad de diseño.

const TIERS = {
  bajo: {
    label: "budget renovation",
    detail:
      "simple functional finishes, matte ceramic floor tiles, plain white painted walls, " +
      "basic white melamine cabinetry with simple handles, laminate countertops, " +
      "a single flush ceiling light, minimal decoration, clean and tidy but modest",
  },
  medio: {
    label: "mid-range renovation",
    detail:
      "quality finishes, large-format porcelain floor tiles, quartz or terrazzo countertops, " +
      "wood-tone and white cabinetry, a tiled backsplash, under-cabinet LED lighting, " +
      "a cove ceiling light, curtains, a rug and a few plants, warm and inviting",
  },
  alto: {
    label: "luxury high-end renovation",
    detail:
      "premium materials, book-matched marble surfaces with waterfall edges, " +
      "dark walnut and lacquered cabinetry, brass fixtures and hardware, " +
      "designer pendant lighting, integrated appliances, a statement feature wall, " +
      "layered lighting, curated art and decor, magazine-quality interior design",
  },
};

// Terminos de busqueda para el banco de fotos. El nivel cambia el adjetivo,
// que es lo que hace que la foto sea mas o menos lujosa.
const SEARCH_TERMS = {
  cocina: "kitchen interior",
  bano_principal: "bathroom interior",
  bano_social: "small bathroom interior",
  zona_social: "living room interior",
  habitacion_principal: "bedroom interior",
  habitaciones_secundarias: "small bedroom interior",
  estudio_oficina: "home office interior",
  vestier: "walk in closet interior",
  zona_ropas: "laundry room interior",
  balcon_terraza: "apartment balcony",
  entrada_hall: "entryway hallway interior",
};

const TIER_QUALIFIER = {
  bajo: "simple minimal",
  medio: "modern",
  alto: "luxury elegant",
};

/** Descarga una foto del banco de Pexels y devuelve sus bytes. */
async function fetchFromPexels(roomId, tierId) {
  const query = `${TIER_QUALIFIER[tierId]} ${SEARCH_TERMS[roomId]}`;
  const url =
    "https://api.pexels.com/v1/search?per_page=15&orientation=landscape&query=" +
    encodeURIComponent(query);

  const search = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  if (!search.ok) {
    throw new Error(`Pexels HTTP ${search.status}: ${(await search.text()).slice(0, 200)}`);
  }

  const { photos = [] } = await search.json();
  if (photos.length === 0) throw new Error(`sin resultados para "${query}"`);

  // Se varia la eleccion por nivel para no repetir la misma foto entre niveles
  // cuando la busqueda devuelve resultados parecidos.
  const offset = { bajo: 0, medio: 1, alto: 2 }[tierId] ?? 0;
  const photo = photos[offset % photos.length];
  const image = await fetch(photo.src.large2x ?? photo.src.large);
  if (!image.ok) throw new Error(`descarga HTTP ${image.status}`);

  return {
    bytes: Buffer.from(await image.arrayBuffer()),
    credit: `${photo.photographer} — Pexels`,
  };
}

function buildPrompt(roomId, tierId) {
  const room = ROOMS[roomId];
  const tier = TIERS[tierId];
  return [
    `Photorealistic interior architecture photograph of ${room} in a modern Colombian apartment,`,
    `after a ${tier.label}.`,
    `Features ${tier.detail}.`,
    "Shot with a wide-angle lens at eye level, one-point perspective, natural daylight",
    "coming through a window, soft realistic shadows, accurate materials and reflections.",
    "Professional real-estate photography, high dynamic range, sharp focus, no people,",
    "no text, no watermarks, no logos.",
  ].join(" ");
}

// ─── Generación ──────────────────────────────────────────────────────────────

async function generate(roomId, tierId) {
  const response = await fetch(`${ENDPOINT(MODEL)}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(roomId, tierId) }] }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: { aspectRatio: "4:3" },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((part) => part.inlineData?.data);

  if (!image) {
    // Si el modelo respondió solo texto, suele ser un rechazo: mostrarlo ayuda.
    const text = parts.find((p) => p.text)?.text ?? "sin contenido";
    throw new Error(`la respuesta no trajo imagen — ${text.slice(0, 200)}`);
  }

  return Buffer.from(image.inlineData.data, "base64");
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const args = { force: false, room: null, tier: null, source: "gemini" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--force") args.force = true;
    if (argv[i] === "--room") args.room = argv[++i];
    if (argv[i] === "--tier") args.tier = argv[++i];
    if (argv[i] === "--source") args.source = argv[++i];
  }
  return args;
}

async function main() {
  await loadEnvLocal();
  API_KEY = process.env.GEMINI_API_KEY;
  PEXELS_KEY = process.env.PEXELS_API_KEY;

  const args = parseArgs(process.argv.slice(2));

  if (args.source === "pexels" && !PEXELS_KEY) {
    console.error(
      "\nFalta PEXELS_API_KEY.\n\n" +
        "  1. Conseguí una clave gratis en https://www.pexels.com/api/\n" +
        '  2. Guardala en frontend/.env.local:  PEXELS_API_KEY=tu-clave\n' +
        "     (o export PEXELS_API_KEY=\"tu-clave\")\n" +
        "  3. npm run generate:renders -- --source pexels\n",
    );
    process.exit(1);
  }

  if (args.source === "gemini" && !API_KEY) {
    console.error(
      "\nFalta GEMINI_API_KEY.\n\n" +
        "  1. Conseguí una clave gratis en https://aistudio.google.com/apikey\n" +
        '  2. export GEMINI_API_KEY="tu-clave"\n' +
        "  3. npm run generate:renders\n\n" +
        "  O usá fotos reales sin IA:\n" +
        "     npm run generate:renders -- --source pexels\n",
    );
    process.exit(1);
  }
  const rooms = args.room ? [args.room] : Object.keys(ROOMS);
  const tiers = args.tier ? [args.tier] : Object.keys(TIERS);

  const unknownRoom = rooms.find((r) => !ROOMS[r]);
  if (unknownRoom) {
    console.error(`Ambiente desconocido: ${unknownRoom}`);
    console.error(`Disponibles: ${Object.keys(ROOMS).join(", ")}`);
    process.exit(1);
  }

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const roomId of rooms) {
    await mkdir(join(OUT_DIR, roomId), { recursive: true });

    for (const tierId of tiers) {
      const outPath = join(OUT_DIR, roomId, `${tierId}.jpg`);
      const label = `${roomId}/${tierId}`;

      if (!args.force && (await exists(outPath))) {
        console.log(`  ·  ${label} — ya existe, se omite`);
        skipped++;
        continue;
      }

      try {
        process.stdout.write(`  …  ${label} — ${args.source === "pexels" ? "buscando" : "generando"}`);
        let bytes;
        let credit = "";
        if (args.source === "pexels") {
          const result = await fetchFromPexels(roomId, tierId);
          bytes = result.bytes;
          credit = ` · ${result.credit}`;
        } else {
          bytes = await generate(roomId, tierId);
        }
        await writeFile(outPath, bytes);
        console.log(`\r  ✔  ${label} — ${(bytes.length / 1024).toFixed(0)} KB${credit}   `);
        done++;
      } catch (error) {
        console.log(`\r  ✗  ${label} — ${error.message}`);
        failed++;
      }

      // Respiro entre llamadas: el nivel gratuito tiene límite por minuto.
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log(`\nGeneradas ${done} · omitidas ${skipped} · fallidas ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
