// ═══════════════════════════════════════════════════════
// HH GOA 2026 — CARD CANVAS RENDER ENGINE
// High resolution canvas text, QR code, and Barcode drawer
// ═══════════════════════════════════════════════════════

import QRCode from 'qrcode';
import { TextZoneConfig, SocialsZoneConfig, QrZoneConfig, ZoneBounds } from './frames';

export interface RenderTextOptions {
  clearBg?: boolean;
}

const GREEN_DARK = '#012119';

/**
 * Draws text onto canvas with explicit cover-up rect over baseline template text.
 */
export function drawTextZone(
  ctx: CanvasRenderingContext2D,
  text: string,
  zone: TextZoneConfig,
  options: RenderTextOptions = {}
): void {
  const hasCustomText = !!text && text.trim().length > 0;
  const displayText = hasCustomText ? text.trim() : '';

  ctx.save();

  // Draw solid dark green box to cover template placeholders ("Your Name", "STACK/ROLE")
  if (options.clearBg) {
    ctx.fillStyle = GREEN_DARK;

    if (zone.fontSize > 40) {
      // Covers "Your Name" on card.png (y = 765 to 860)
      ctx.fillRect(350, 765, 1040, 95);
    } else if (zone.fontSize > 20 && zone.fontSize <= 40) {
      // Covers "STACK / ROLE: RUST >& BACKEND" on card.png (y = 870 to 935)
      ctx.fillRect(350, 870, 1040, 65);
    }
  }

  if (!displayText) {
    ctx.restore();
    return;
  }

  const fontFamily =
    zone.fontFamily === 'display'
      ? "'Outfit', 'Plus Jakarta Sans', sans-serif"
      : zone.fontFamily === 'mono'
      ? "'JetBrains Mono', 'Fira Code', monospace"
      : "'Inter', sans-serif";

  const weight = zone.weight || '700';
  ctx.font = `${weight} ${zone.fontSize}px ${fontFamily}`;
  ctx.fillStyle = zone.color;
  ctx.textAlign = zone.align;
  ctx.textBaseline = 'middle';

  ctx.fillText(displayText, zone.x, zone.y, zone.maxWidth);

  ctx.restore();
}

export function drawSocialsZone(
  ctx: CanvasRenderingContext2D,
  socials: Record<string, string>,
  zone: SocialsZoneConfig,
  color: string
): void {
  const handles = Object.entries(socials)
    .filter(([_, value]) => value && value.trim())
    .map(([key, value]) => `${key.toUpperCase()}: ${value.trim()}`);

  if (handles.length === 0) return;

  const text = handles.join('  •  ');

  ctx.save();
  ctx.font = `600 ${zone.fontSize}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, zone.x, zone.y, zone.maxWidth);
  ctx.restore();
}

/**
 * Draws QR code into the specified QrZone inside the Yellow Box.
 */
export async function drawQrCode(
  ctx: CanvasRenderingContext2D,
  dataUrl: string,
  qrZone: QrZoneConfig,
  colors: { dark: string; light: string } = { dark: '#012119', light: '#ffffff' }
): Promise<void> {
  try {
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, dataUrl, {
      width: qrZone.size,
      margin: 1,
      color: {
        dark: colors.dark,
        light: colors.light,
      },
    });

    ctx.save();
    // Draw clean white plate background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrZone.x, qrZone.y, qrZone.size, qrZone.size);

    ctx.drawImage(qrCanvas, qrZone.x, qrZone.y, qrZone.size, qrZone.size);
    ctx.restore();
  } catch (err) {
    console.error('Failed to generate QR code:', err);
  }
}

/**
 * Draws a clean deterministic horizontal barcode inside the Yellow Box.
 */
export function drawBarcode(
  ctx: CanvasRenderingContext2D,
  text: string,
  zone: ZoneBounds,
  options: { bar?: string; bg?: string } = {}
): void {
  const barColor = options.bar || '#012119';

  ctx.save();

  // Clear barcode background area inside yellow box
  ctx.fillStyle = options.bg || GREEN_DARK;
  ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

  // Generate deterministic bar pattern from text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const numBars = 65;
  const barWidth = zone.width / numBars;

  ctx.fillStyle = barColor;
  for (let i = 0; i < numBars; i++) {
    const bit = (hash >> (i % 31)) & 1;
    const isThin = (i % 2 === 0) || (bit === 1);

    if (isThin || i === 0 || i === numBars - 1) {
      const x = zone.x + i * barWidth;
      const w = barWidth * (isThin ? 0.7 : 0.45);
      ctx.fillRect(x, zone.y, w, zone.height);
    }
  }

  ctx.restore();
}
