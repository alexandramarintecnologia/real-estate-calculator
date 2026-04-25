/**
 * Genera public/og.png (1200×630) para Open Graph / WhatsApp.
 * Ejecutar desde la raíz del frontend: node scripts/generate-og.mjs
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const outPath = join(publicDir, "og.png");
const logoPath = join(publicDir, "logo.png");

const W = 1200;
const H = 630;

const gradientSvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4C1D95"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>
`;

const bg = sharp(Buffer.from(gradientSvg));

const logoBuf = readFileSync(logoPath);
const logoResized = await sharp(logoBuf)
  .resize({
    height: 340,
    fit: "inside",
    withoutEnlargement: true,
  })
  .ensureAlpha()
  .toBuffer();

const meta = await sharp(logoResized).metadata();
const lw = meta.width ?? 0;
const lh = meta.height ?? 0;
const left = Math.round((W - lw) / 2);
const top = Math.round((H - lh) / 2);

await bg
  .composite([{ input: logoResized, left, top, blend: "over" }])
  .png({ compressionLevel: 9 })
  .toFile(outPath);

console.log("Written:", outPath, `${W}×${H}`);
