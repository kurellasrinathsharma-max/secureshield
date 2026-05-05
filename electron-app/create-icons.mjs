/**
 * Pure Node.js icon generator — zero npm dependencies.
 * Uses only built-in zlib + fs to produce PNG and ICO files.
 */
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = join(__dirname, "build");
mkdirSync(buildDir, { recursive: true });

// ── CRC32 for PNG chunks ────────────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const l = Buffer.alloc(4);
  l.writeUInt32BE(data.length);
  const cr = Buffer.alloc(4);
  cr.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([l, t, data, cr]);
}

// ── Draw shield + checkmark into an RGBA pixel buffer ──────────────────────
function drawIcon(pixels, size) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size;

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const i = (y * s + x) * 4;

      // Normalised coords [-1, 1]
      const nx = (x - cx) / (s * 0.5);
      const ny = (y - cy) / (s * 0.5);

      // Rounded background square
      const rx = Math.max(0, Math.abs(nx) - 0.78);
      const ry = Math.max(0, Math.abs(ny) - 0.78);
      const inBg = rx * rx + ry * ry < 0.055;

      if (!inBg) continue;

      // Dark background
      pixels[i] = 15; pixels[i + 1] = 23; pixels[i + 2] = 42; pixels[i + 3] = 255;

      // Shield shape: trapezoid top half, rounded-taper bottom half
      const shieldX = nx;
      const shieldY = ny;
      const halfW = shieldY < 0 ? 0.62 : 0.62 - shieldY * 0.7;
      const inShield =
        Math.abs(shieldX) < halfW &&
        shieldY > -0.72 &&
        shieldY < 0.78;

      if (inShield) {
        // Blue fill with low opacity over dark bg
        const a = 0.18;
        pixels[i]     = Math.round(pixels[i]     * (1 - a) + 59  * a);
        pixels[i + 1] = Math.round(pixels[i + 1] * (1 - a) + 130 * a);
        pixels[i + 2] = Math.round(pixels[i + 2] * (1 - a) + 246 * a);
      }

      // White checkmark — two line segments
      const cs = s * 0.21;
      const p1 = [cx - cs * 0.65, cy + cs * 0.05];
      const p2 = [cx - cs * 0.05, cy + cs * 0.62];
      const p3 = [cx + cs * 0.72, cy - cs * 0.52];

      function distSeg(ax, ay, bx, by) {
        const dx = bx - ax, dy = by - ay;
        const t2 = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(x - ax - t2 * dx, y - ay - t2 * dy);
      }

      const thick = Math.max(1, s * 0.055);
      const d = Math.min(
        distSeg(p1[0], p1[1], p2[0], p2[1]),
        distSeg(p2[0], p2[1], p3[0], p3[1])
      );

      if (d < thick && inShield) {
        const alpha = Math.max(0, 1 - d / thick);
        pixels[i]     = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = Math.round(255 * alpha);
      }
    }
  }
}

// ── Build a PNG buffer for a given size ────────────────────────────────────
function makePNG(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA colour type

  const pixels = Buffer.alloc(size * size * 4, 0);
  drawIcon(pixels, size);

  // Prepend filter byte (None = 0) to each row
  const scanlines = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    scanlines[y * (1 + size * 4)] = 0;
    pixels.copy(scanlines, y * (1 + size * 4) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Build an ICO (PNG-in-ICO, supported Windows Vista+) ───────────────────
function makeICO(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const dirs = entries.map(({ size, png }) => {
    const dir = Buffer.alloc(16);
    dir[0] = size >= 256 ? 0 : size;
    dir[1] = size >= 256 ? 0 : size;
    dir[2] = 0; dir[3] = 0;
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += png.length;
    return dir;
  });

  return Buffer.concat([header, ...dirs, ...entries.map(e => e.png)]);
}

// ── Generate everything ────────────────────────────────────────────────────
console.log("Generating icons (pure Node.js — no native dependencies)...");

const icoSizes = [16, 32, 48, 64, 128, 256];
const icoEntries = icoSizes.map(size => {
  const png = makePNG(size);
  writeFileSync(join(buildDir, `icon-${size}.png`), png);
  process.stdout.write(`  ${size}×${size} ✓\n`);
  return { size, png };
});

writeFileSync(join(buildDir, "icon.png"),  makePNG(512));
console.log("  512×512 ✓ (icon.png)");

writeFileSync(join(buildDir, "tray.png"), makePNG(24));
console.log("  24×24 ✓ (tray.png)");

writeFileSync(join(buildDir, "icon.ico"), makeICO(icoEntries));
console.log("  icon.ico ✓");

const trayEntries = [16, 24, 32].map(size => ({ size, png: makePNG(size) }));
writeFileSync(join(buildDir, "tray.ico"), makeICO(trayEntries));
console.log("  tray.ico ✓");

console.log("\nAll icons generated successfully!");
