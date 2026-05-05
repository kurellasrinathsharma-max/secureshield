/**
 * Generates all required app icons from an inline SVG.
 * Run: node create-icons.mjs
 */
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = join(__dirname, "build");
mkdirSync(buildDir, { recursive: true });

const SVG = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <path d="M256 56L400 108V256C400 348 336 424 256 456C176 424 112 348 112 256V108L256 56Z"
        fill="rgba(59,130,246,0.12)" stroke="#3b82f6" stroke-width="10"/>
  <path d="M176 264L220 308L336 204"
        stroke="white" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const TRAY_SVG = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 4L56 14V32C56 46 46 57 32 62C18 57 8 46 8 32V14L32 4Z"
        fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="2"/>
  <path d="M19 33L26 40L45 24"
        stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const svgBuf = Buffer.from(SVG);
const trayBuf = Buffer.from(TRAY_SVG);

// Sizes needed for a proper Windows ICO
const icoSizes = [16, 32, 48, 64, 128, 256];
const pngPaths = [];

console.log("Generating PNG icons...");
for (const size of icoSizes) {
  const outPath = join(buildDir, `icon-${size}.png`);
  await sharp(svgBuf).resize(size, size).png().toFile(outPath);
  pngPaths.push(outPath);
  process.stdout.write(`  ${size}×${size} ✓\n`);
}

// 512×512 for macOS / general
await sharp(svgBuf).resize(512, 512).png().toFile(join(buildDir, "icon.png"));
console.log("  512×512 ✓ (icon.png)");

// Tray icon (24×24)
await sharp(trayBuf).resize(24, 24).png().toFile(join(buildDir, "tray.png"));
console.log("  24×24 ✓ (tray.png)");

// Convert PNGs to .ico for Windows
console.log("\nGenerating icon.ico...");
const pngBuffers = pngPaths.map(p => readFileSync(p));
const icoBuffer = await pngToIco(pngBuffers);
writeFileSync(join(buildDir, "icon.ico"), icoBuffer);
console.log("  icon.ico ✓");

// Tray ICO (16, 24, 32)
const trayIcoBuffers = await Promise.all(
  [16, 24, 32].map(async s => {
    const tmp = join(buildDir, `tray-${s}.png`);
    await sharp(trayBuf).resize(s, s).png().toFile(tmp);
    return readFileSync(tmp);
  })
);
const trayIco = await pngToIco(trayIcoBuffers);
writeFileSync(join(buildDir, "tray.ico"), trayIco);
console.log("  tray.ico ✓");

console.log("\nAll icons generated successfully!");
