// ═══════════════════════════════════════════════════════
// HH GOA 2026 — IMAGE PROCESSOR & PHOTO FILTER ENGINE
// High-clarity filters: Natural, Goa Sunset, Vintage Risograph
// ═══════════════════════════════════════════════════════

const MAX_DIMENSION = 2048;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface ProcessedImage {
  bitmap: ImageBitmap;
  blob: Blob;
  width: number;
  height: number;
  originalName: string;
}

export type PhotoFilterMode = 'natural' | 'goa-sunset' | 'riso-dither';

export type ImageError =
  | 'unsupported-type'
  | 'file-too-large'
  | 'corrupt-image'
  | 'heic-failure'
  | 'unknown';

export const ERROR_MESSAGES: Record<ImageError, string> = {
  'unsupported-type': "We can't read that file type. Try a JPG, PNG, or HEIC.",
  'file-too-large': "That file's too heavy (>20MB). Try a smaller photo.",
  'corrupt-image': "Couldn't decode that image. Try a different photo.",
  'heic-failure': "HEIC conversion hiccup. Try re-saving as JPG from your Photos app.",
  'unknown': "Something went wrong processing your photo. Try again.",
};

function isHEIC(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  );
}

function isSupportedType(file: File): boolean {
  const supported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (supported.includes(file.type)) return true;
  if (isHEIC(file)) return true;
  const ext = file.name.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'].includes(ext || '');
}

async function convertHEIC(file: File): Promise<Blob> {
  try {
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    });
    if (Array.isArray(result)) return result[0];
    return result;
  } catch {
    throw new Error('heic-failure');
  }
}

async function resizeImage(blob: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  let { width, height } = bitmap;

  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { blob, width, height };
  }

  const scale = MAX_DIMENSION / Math.max(width, height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const resizedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
  return { blob: resizedBlob, width, height };
}

export async function processImage(file: File): Promise<ProcessedImage> {
  if (!isSupportedType(file)) {
    throw new Error('unsupported-type');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('file-too-large');
  }

  let blob: Blob = file;

  if (isHEIC(file)) {
    blob = await convertHEIC(file);
  }

  try {
    const resized = await resizeImage(blob);
    blob = resized.blob;

    const bitmap = await createImageBitmap(blob);
    return {
      bitmap,
      blob,
      width: bitmap.width,
      height: bitmap.height,
      originalName: file.name,
    };
  } catch (e) {
    if (e instanceof Error && Object.keys(ERROR_MESSAGES).includes(e.message)) {
      throw e;
    }
    throw new Error('corrupt-image');
  }
}

// ── Photo Filter Compositing ──
export function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  filter: PhotoFilterMode
) {
  if (filter === 'natural') return;

  if (filter === 'goa-sunset') {
    // Warm Tropical Golden Hour Glow
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255, 0, 122, 0.35)');
    grad.addColorStop(1, 'rgba(255, 247, 140, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (filter === 'riso-dither') {
    // Crisp Vintage Risograph Print
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(255, 0, 122, 0.35)';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 247, 140, 0.15)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
