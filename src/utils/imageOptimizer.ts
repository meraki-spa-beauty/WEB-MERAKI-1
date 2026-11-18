export interface OptimizedImageResult {
  dataUrl: string;
  mimeType: 'image/webp' | 'image/jpeg';
  width: number;
  height: number;
  byteLength: number;
}

const MAX_DIMENSION_PX = 1000;

const MAX_DATA_URL_LENGTH = 340000;

const MAX_INPUT_BYTES = 18 * 1024 * 1024;

const MEDIA_PREFIX = 'media://';

export function extractCatalogMediaId(imageRef?: string | null): string | null {
  if (!imageRef || !imageRef.startsWith(MEDIA_PREFIX)) return null;

  const candidate = imageRef.slice(MEDIA_PREFIX.length).trim();

  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(candidate)) return null;

  return candidate;
}

export function buildCatalogMediaRef(mediaId: string): string {
  return `${MEDIA_PREFIX}${mediaId}`;
}

export function isValidCatalogImageRef(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();

  if (!trimmed || trimmed.length > 500) return false;

  if (extractCatalogMediaId(trimmed) !== null) return true;

  if (trimmed.startsWith('/assets/') && !trimmed.includes('..')) return true;

  try {
    const parsed = new URL(trimmed);

    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer el archivo de imagen seleccionado.'));
    };

    img.src = objectUrl;
  });
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  mimeType: 'image/webp' | 'image/jpeg',
  quality: number,
): string {
  return canvas.toDataURL(mimeType, quality);
}

export async function optimizeCatalogImageFile(file: File): Promise<OptimizedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecciona un archivo de imagen válido (JPG, PNG o WebP).');
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('La imagen supera el máximo permitido de 18 MB antes de optimizar.');
  }

  const img = await loadImageElement(file);
  const naturalW = Math.max(16, img.naturalWidth || 800);
  const naturalH = Math.max(16, img.naturalHeight || 600);

  let targetW = naturalW;
  let targetH = naturalH;

  if (naturalW > MAX_DIMENSION_PX || naturalH > MAX_DIMENSION_PX) {
    const ratio = Math.min(MAX_DIMENSION_PX / naturalW, MAX_DIMENSION_PX / naturalH);

    targetW = Math.max(16, Math.round(naturalW * ratio));
    targetH = Math.max(16, Math.round(naturalH * ratio));
  }

  const canvas = document.createElement('canvas');

  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Tu navegador no pudo procesar el lienzo de imagen.');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  let chosenMime: 'image/webp' | 'image/jpeg' = 'image/webp';
  let dataUrl = encodeCanvas(canvas, chosenMime, 0.82);

  if (!dataUrl.startsWith('data:image/webp')) {
    chosenMime = 'image/jpeg';
    dataUrl = encodeCanvas(canvas, chosenMime, 0.82);
  }

  const qualities = [0.74, 0.64, 0.54, 0.45];

  for (const q of qualities) {
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) break;

    dataUrl = encodeCanvas(canvas, chosenMime, q);
  }

  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    const fallbackScale = 0.72;

    canvas.width = Math.max(16, Math.round(targetW * fallbackScale));
    canvas.height = Math.max(16, Math.round(targetH * fallbackScale));
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    targetW = canvas.width;
    targetH = canvas.height;
    dataUrl = encodeCanvas(canvas, chosenMime, 0.56);
  }

  if (dataUrl.length > 430000) {
    throw new Error('No se pudo comprimir la foto lo suficiente. Intenta con una imagen de menor peso.');
  }

  return {
    dataUrl,
    mimeType: chosenMime,
    width: targetW,
    height: targetH,
    byteLength: dataUrl.length,
  };
}
