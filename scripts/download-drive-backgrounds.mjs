#!/usr/bin/env node
/**
 * Utility script to download backgrounds from Google Drive or direct URLs
 * into public/assets/backgrounds/
 * 
 * Usage:
 *   node scripts/download-drive-backgrounds.mjs
 *   node scripts/download-drive-backgrounds.mjs <desktop_file_id_or_url> <mobile_file_id_or_url>
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const BG_DIR = path.resolve('public/assets/backgrounds');

if (!fs.existsSync(BG_DIR)) {
  fs.mkdirSync(BG_DIR, { recursive: true });
}

function extractFileId(input) {
  if (!input) return null;
  const match = input.match(/[-\w]{25,}/);
  return match ? match[0] : input;
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: HTTP ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Saved: ${destPath} (${fs.statSync(destPath).size} bytes)`);
        resolve(destPath);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const [,, desktopArg, mobileArg] = process.argv;

  if (desktopArg) {
    const desktopId = extractFileId(desktopArg);
    const desktopUrl = desktopArg.startsWith('http') && !desktopArg.includes('drive.google.com') 
      ? desktopArg 
      : `https://drive.google.com/uc?export=download&id=${desktopId}`;
    console.log(`Downloading desktop background from: ${desktopUrl}`);
    try {
      await downloadFile(desktopUrl, path.join(BG_DIR, 'fondo-desktop.webp'));
    } catch (e) {
      console.warn('Could not download desktop background:', e.message);
    }
  }

  if (mobileArg) {
    const mobileId = extractFileId(mobileArg);
    const mobileUrl = mobileArg.startsWith('http') && !mobileArg.includes('drive.google.com') 
      ? mobileArg 
      : `https://drive.google.com/uc?export=download&id=${mobileId}`;
    console.log(`Downloading mobile background from: ${mobileUrl}`);
    try {
      await downloadFile(mobileUrl, path.join(BG_DIR, 'fondo-mobile.webp'));
    } catch (e) {
      console.warn('Could not download mobile background:', e.message);
    }
  }
}

main().catch(console.error);
