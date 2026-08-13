// ═══════════════════════════════════════════════════════
// HH GOA 2026 — CANVAS EXPORTER
// Correct Layer Ordering:
// 1. Background Fill & Template Image (card.png)
// 2. User Photo (Clipped to photo zone + zoom/pan + filter)
// 3. Text, QR Code, and Barcode Overlay
// ═══════════════════════════════════════════════════════

import { FrameConfig, loadCardImage } from './frames';
import { formatBuilderId } from './idGenerator';
import { PhotoFilterMode, applyFilterToCanvas } from './imageProcessor';
import { drawTextZone, drawSocialsZone, drawQrCode, drawBarcode } from './cardRenderer';

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

const BUILDER_ID_WIDTH = 1748;
const BUILDER_ID_HEIGHT = 1240;
const PFP_SIZE = 1080;

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

  // 1. Background Fill & Base Template Image
  ctx.fillStyle = data.frame.bgColor;
  ctx.fillRect(0, 0, width, height);

  if (!isPfp) {
    const artImg = await loadCardImage();
    if (artImg && artImg.complete && artImg.naturalWidth > 0) {
      ctx.drawImage(artImg, 0, 0, width, height);
    }
  }

  // 2. User Photo — clipped to inner pink window
  const photoZone = isPfp ? data.frame.pfpPhotoZone : data.frame.photoZone;

  ctx.save();
  ctx.beginPath();
  ctx.rect(photoZone.x, photoZone.y, photoZone.width, photoZone.height);
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

  // 3. Text & Scannables Overlay
  if (!isPfp) {
    const tz = data.frame.textZones;
    drawTextZone(ctx, data.name, tz.name, { clearBg: true });
    drawTextZone(ctx, data.stack ? `STACK / ROLE: ${data.stack.toUpperCase()}` : '', tz.stack, {
      clearBg: true,
    });
    drawTextZone(ctx, data.title, tz.title);
    drawTextZone(ctx, formatBuilderId(data.builderId), tz.builderId);

    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const timestamp = `${months[now.getMonth()]} ${now.getFullYear()}`;
    drawTextZone(ctx, timestamp, tz.timestamp);

    if (data.socials) {
      drawSocialsZone(ctx, data.socials, tz.socials, tz.socials.color);
    }

    const profileUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/builder/${data.builderId}`
        : `https://hhgoa.com/builder/${data.builderId}`;

    await drawQrCode(ctx, profileUrl, data.frame.qrZone, {
      dark: '#021a14',
      light: '#ffffff',
    });

    drawBarcode(ctx, formatBuilderId(data.builderId), data.frame.barcodeZone, {
      bar: '#021a14',
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
