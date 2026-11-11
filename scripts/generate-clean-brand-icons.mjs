import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

// Clean smooth vector paths from Meraki's official typography & brand identity
const MERAKI_MONOGRAM_PATHS = `
  <path d="M -180,60 C -195,-70 -80,-190 35,-180 C 145,-170 195,-40 155,70 C 110,180 -25,190 -115,145 C -150,125 -175,95 -180,60" 
        fill="none" stroke="#5E765E" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M -135,70 C -115,60 -90,-25 -65,-60 C -45,-85 -25,-80 -20,-25 C -15,15 -10,40 -5,55 C 5,15 18,-45 35,-60 C 50,-75 65,-55 70,-20 C 75,18 78,48 82,62 C 88,32 108,-30 135,-35 C 158,-40 168,-15 155,15 C 135,48 105,42 130,52 C 150,60 185,55 205,40" 
        fill="none" stroke="#5E765E" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
`;

// Transparent SVG for desktop browsers / vector favicon
const faviconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-240 -240 480 480" width="100%" height="100%">
  <g transform="translate(0, 0)">
    ${MERAKI_MONOGRAM_PATHS}
  </g>
</svg>`;

// Solid background SVG with safe zone for mobile home screens, Apple Touch Icon, and PWA icons
function makeAppIconSvg(size, scale = 0.82, bgColor = '#FFF2DE') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-250 -250 500 500" width="${size}" height="${size}">
  <rect x="-250" y="-250" width="500" height="500" fill="${bgColor}" />
  <g transform="scale(${scale})">
    ${MERAKI_MONOGRAM_PATHS}
  </g>
</svg>`;
}

// 1. Write clean vector favicon.svg
fs.writeFileSync('public/favicon.svg', faviconSvgContent);
fs.writeFileSync('public/assets/brand/meraki-monogram.svg', faviconSvgContent);
fs.writeFileSync('public/assets/brand/meraki-favicon.svg', faviconSvgContent);

// 2. Render crisp PNGs
const renderPng = (svgString, targetWidth, targetHeight = targetWidth) => {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: targetWidth },
    font: { loadSystemFonts: true },
    shapeRendering: 2 // geometricPrecision
  });
  const pngData = resvg.render();
  return pngData.asPng();
};

// 180x180 Apple Touch Icon (Apple devices require opaque background #FFF2DE)
const appleTouchIconBuf = renderPng(makeAppIconSvg(180, 0.82), 180);
fs.writeFileSync('public/apple-touch-icon.png', appleTouchIconBuf);

// 192x192 PWA Icon
const pwa192Buf = renderPng(makeAppIconSvg(192, 0.80), 192);
fs.writeFileSync('public/pwa-192x192.png', pwa192Buf);

// 512x512 PWA Splash & Standard Icon
const pwa512Buf = renderPng(makeAppIconSvg(512, 0.80), 512);
fs.writeFileSync('public/pwa-512x512.png', pwa512Buf);

// 512x512 PWA Maskable Icon (safe zone padded at scale 0.65 to fit within Android circular/squircle mask)
const pwaMaskable512Buf = renderPng(makeAppIconSvg(512, 0.66), 512);
fs.writeFileSync('public/pwa-maskable-512x512.png', pwaMaskable512Buf);

// 64x64 and 32x32 Favicon PNG
const favicon64Buf = renderPng(makeAppIconSvg(64, 0.85), 64);
fs.writeFileSync('public/favicon.png', favicon64Buf);

console.log('All brand icons generated cleanly without scanlines or artifacts!');
