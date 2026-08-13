// ═══════════════════════════════════════════════════════
// HH GOA 2026 — HIGH-RES DOM & CANVAS EXPORTER
// Pure clean template rendering without any fillRect cover patches!
// ═══════════════════════════════════════════════════════

import { FrameConfig } from './frames';
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

let cleanCardImg: HTMLImageElement | null = null;

function loadCleanCardImage(): Promise<HTMLImageElement> {
  if (cleanCardImg && cleanCardImg.complete) {
    return Promise.resolve(cleanCardImg);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cleanCardImg = img;
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = '/clean_card.png';
  });
}

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

  // 1. Pristine Clean Background Template Image (clean_card.png)
  ctx.fillStyle = data.frame.bgColor;
  ctx.fillRect(0, 0, width, height);

  if (!isPfp) {
    try {
      const artImg = await loadCleanCardImage();
      ctx.drawImage(artImg, 0, 0, width, height);
    } catch {
      // Fallback dark green background fill
    }
  }

  // 2. User Photo — clipped to photo window
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

  if (data.filter && data.filter !== 'natural') {
    applyFilterToCanvas(ctx, width, height, data.filter);
  }
  ctx.restore();

  // 3. Clean DOM-matched Text & Scannables Overlay (No cover-up patches needed!)
  if (!isPfp) {
    const tz = data.frame.textZones;

    // Draw Name (Creamy Gold, large display font)
    const displayName = data.name && data.name.trim() ? data.name.trim() : 'Your Name';
    drawTextZone(ctx, displayName, tz.name, { clearBg: false });

    // Draw Stack / Role (White monospace font)
    const displayStack = data.stack && data.stack.trim()
      ? `STACK / ROLE: ${data.stack.toUpperCase().trim()}`
      : 'STACK / ROLE: RUST >& BACKEND';
    drawTextZone(ctx, displayStack, tz.stack, { clearBg: false });

    // Draw Yellow Box Background
    const yb = data.frame.idBoxZone;
    ctx.save();
    ctx.fillStyle = '#FFD200';
    ctx.beginPath();
    ctx.roundRect(yb.x, yb.y, yb.width, yb.height, 20);
    ctx.fill();
    ctx.restore();

    // Draw Builder ID in Yellow Box
    drawTextZone(ctx, formatBuilderId(data.builderId), tz.builderId);

    // Draw Timestamp & Socials if present
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

    // Draw QR code inside Yellow Box
    await drawQrCode(ctx, profileUrl, data.frame.qrZone, {
      dark: '#012119',
      light: '#ffffff',
    });

    // Draw Barcode inside Yellow Box
    drawBarcode(ctx, formatBuilderId(data.builderId), data.frame.barcodeZone, {
      bar: '#012119',
      bg: '#FFD200',
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
