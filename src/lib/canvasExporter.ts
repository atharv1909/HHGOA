// ═══════════════════════════════════════════════════════
// HH GOA 2026 — CANVAS EXPORTER
// Correct Layer Ordering:
// 1. Background fill
// 2. Frame Background Art (Sea, Palms, Sunset)
// 3. User Photo (Clipped to photo zone + zoom/pan + filter)
// 4. Frame Decorations & Text (Borders, stamps, title, ID)
// ═══════════════════════════════════════════════════════

import { FrameConfig } from './frames';
import { formatBuilderId } from './idGenerator';
import { PhotoFilterMode, applyFilterToCanvas } from './imageProcessor';
import { drawTextZone, drawSocialsZone, drawQrCode } from './cardRenderer';

export interface ExportData {
  image: ImageBitmap;
  imageTransform: { scale: number; offsetX: number; offsetY: number };
  filter?: PhotoFilterMode;
  frame: FrameConfig;
  format: 'builder-id' | 'pfp';
  name: string;
  stack: string;
  title: string;
  builderId: string;
  socials?: Record<string, string>;
}

const BUILDER_ID_WIDTH = 1080;
const BUILDER_ID_HEIGHT = 1350; // 4:5
const PFP_SIZE = 1080; // 1:1

async function ensureFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    await document.fonts.ready;
  } catch {
    // Font loading fallback
  }
}

export async function exportCard(data: ExportData): Promise<Blob> {
  await ensureFontsLoaded();

  const isPfp = data.format === 'pfp';
  const width = isPfp ? PFP_SIZE : BUILDER_ID_WIDTH;
  const height = isPfp ? PFP_SIZE : BUILDER_ID_HEIGHT;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Background Fill
  ctx.fillStyle = data.frame.bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Background Artwork (Sea, Sunset, Palm Tree Silhouettes) - drawn BEFORE photo!
  if (!isPfp && data.frame.renderBackground) {
    data.frame.renderBackground(ctx, width, height);
  }

  // 3. User Photo — clipped to photo zone, with transform & filter
  const photoZone = isPfp ? data.frame.pfpPhotoZone : data.frame.photoZone;

  ctx.save();
  ctx.beginPath();

  if (data.frame.id === 'goa-genesis' && !isPfp) {
    const cx = photoZone.x + photoZone.width / 2;
    const cy = photoZone.y + photoZone.height / 2;
    const radius = photoZone.width / 2;
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  } else {
    ctx.rect(photoZone.x, photoZone.y, photoZone.width, photoZone.height);
  }
  ctx.clip();

  const img = data.image;
  const imgAspect = img.width / img.height;
  const zoneAspect = photoZone.width / photoZone.height;

  let baseScale: number;
  if (imgAspect > zoneAspect) {
    baseScale = photoZone.height / img.height;
  } else {
    baseScale = photoZone.width / img.width;
  }

  const finalScale = baseScale * data.imageTransform.scale;
  const drawWidth = img.width * finalScale;
  const drawHeight = img.height * finalScale;

  const drawX = photoZone.x + (photoZone.width - drawWidth) / 2 + data.imageTransform.offsetX;
  const drawY = photoZone.y + (photoZone.height - drawHeight) / 2 + data.imageTransform.offsetY;

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  if (data.filter) {
    applyFilterToCanvas(ctx, width, height, data.filter);
  }
  ctx.restore();

  // 4. Frame Decorations & Text — drawn AFTER photo
  if (isPfp) {
    data.frame.renderPfpDecorations(ctx, width, height);
  } else {
    data.frame.renderDecorations(ctx, width, height);
  }

  // 5. Text (Builder ID format)
  if (!isPfp) {
    const tz = data.frame.textZones;
    drawTextZone(ctx, data.name, tz.name);
    drawTextZone(ctx, data.stack, tz.stack);
    drawTextZone(ctx, data.title, tz.title);
    drawTextZone(ctx, formatBuilderId(data.builderId), tz.builderId);

    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const timestamp = `${months[now.getMonth()]} ${now.getFullYear()}`;
    drawTextZone(ctx, timestamp, tz.timestamp);

    // Socials get their OWN zone — never inherits builderId/timestamp's spot.
    if (data.socials) {
      const socialsColor = tz.socials.color;
      drawSocialsZone(ctx, data.socials, tz.socials, socialsColor);
    }

    // 6. Scannable QR — unique per builder, encodes their public profile URL.
    const profileUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/builder/${data.builderId}`
        : `https://hhgoa.com/builder/${data.builderId}`;
    await drawQrCode(ctx, profileUrl, data.frame.qrZone, {
      dark: data.frame.paletteMode === 'dark' ? '#021a14' : '#021a14',
      light: '#ffffff',
    });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      },
      'image/png',
      1.0
    );
  });
}
