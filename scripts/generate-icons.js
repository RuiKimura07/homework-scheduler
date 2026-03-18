// Simple script to generate PWA icons as SVG-based PNGs
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

function createSVG(size) {
  const pad = size * 0.15;
  const inner = size - pad * 2;
  const fontSize = size * 0.35;
  const subFontSize = size * 0.1;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#2563EB"/>
  <text x="${size/2}" y="${size * 0.48}" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="${fontSize}" fill="white">宿題</text>
  <text x="${size/2}" y="${size * 0.72}" text-anchor="middle" font-family="sans-serif" font-weight="400" font-size="${subFontSize}" fill="rgba(255,255,255,0.8)">スケジュール</text>
</svg>`;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Write SVG files (browsers can use these as icons too)
[192, 512].forEach(size => {
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}.svg`),
    createSVG(size)
  );
  console.log(`Created icon-${size}.svg`);
});
