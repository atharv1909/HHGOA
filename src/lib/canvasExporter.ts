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

function drawTextWithFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  zone: { fontSize: number; fontFamily: 'display' | 'mono'; color: string; maxWidth: number; align?: CanvasTextAlign; weight?: string }
) {
  const family = zone.fontFamily === 'mono'
    ? '"JetBrains Mono", monospace'
    : '"Space Grotesk", sans-serif';
  const weight = zone.weight || '700';
  ctx.font = `${weight} ${zone.fontSize}px ${family}`;
  ctx.fillStyle = zone.color;
  ctx.textAlign = zone.align || 'left';
  ctx.textBaseline = 'top';

  let displayText = text;
  while (ctx.measureText(displayText).width > zone.maxWidth && displayText.length > 1) {
    displayText = displayText.slice(0, -1);
  }
  if (displayText !== text) displayText += '…';

  ctx.fillText(displayText, x, y);
}

function drawSocialsRow(
  ctx: CanvasRenderingContext2D,
  socials: Record<string, string>,
  startX: number,
  startY: number,
  color: string
) {
  const entries = Object.entries(socials).filter(([, v]) => v.trim());
  if (entries.length === 0) return;

  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let x = startX;
  const y = startY;

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const prefix = key === 'x' ? '@' : key === 'github' ? 'gh/' : key === 'website' ? '🔗 ' : key === 'email' ? '✉ ' : '';
    const text = `${prefix}${value}`;
    if (x + ctx.measureText(text).width > startX + 900) break;
    ctx.fillText(text, x, y);
    x += ctx.measureText(text).width + 24;
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
    drawTextWithFont(ctx, data.name, tz.name.x, tz.name.y, tz.name);
    drawTextWithFont(ctx, data.stack, tz.stack.x, tz.stack.y, tz.stack);
    drawTextWithFont(ctx, data.title, tz.title.x, tz.title.y, tz.title);
    drawTextWithFont(ctx, formatBuilderId(data.builderId), tz.builderId.x, tz.builderId.y, tz.builderId);

    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const timestamp = `${months[now.getMonth()]} ${now.getFullYear()}`;
    drawTextWithFont(ctx, timestamp, tz.timestamp.x, tz.timestamp.y, tz.timestamp);

    if (data.socials) {
      const socialsColor = data.frame.paletteMode === 'dark' ? '#00FF96' : '#FF007A';
      drawSocialsRow(ctx, data.socials, tz.title.x, tz.title.y + 40, socialsColor);
    }
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
