// ═══════════════════════════════════════════════════════
// HH GOA 2026 — SHARED CARD TEXT/SOCIALS RENDERER
//
// Single source of truth for drawing name/stack/title/id/timestamp
// and the optional-socials row. Used by BOTH CardPreview.tsx (live
// DOM/canvas preview) and canvasExporter.ts (final export), so the
// two can never drift out of sync again.
// ═══════════════════════════════════════════════════════

import QRCode from 'qrcode';
import { TextZone } from './frames';

const FONT_STACK = {
  mono: '"JetBrains Mono", monospace',
  display: '"Space Grotesk", sans-serif',
};

/**
 * Draws a single text zone (name / stack / title / builderId / timestamp),
 * truncating with an ellipsis if it would overflow zone.maxWidth.
 * Optionally accepts a placeholder shown in a muted color when empty.
 */
export function drawTextZone(
  ctx: CanvasRenderingContext2D,
  text: string,
  zone: TextZone,
  options?: { placeholder?: string; placeholderColor?: string }
) {
  const hasValue = !!text && text.trim().length > 0;
  const val = hasValue ? text : options?.placeholder || '';
  if (!val) return;

  const family = FONT_STACK[zone.fontFamily];
  const weight = zone.weight || '700';
  ctx.font = `${weight} ${zone.fontSize}px ${family}`;
  ctx.fillStyle = hasValue ? zone.color : options?.placeholderColor || 'rgba(150,150,150,0.4)';
  ctx.textAlign = zone.align || 'left';
  ctx.textBaseline = 'top';

  let displayText = val;
  while (ctx.measureText(displayText).width > zone.maxWidth && displayText.length > 1) {
    displayText = displayText.slice(0, -1);
  }
  if (displayText !== val) displayText += '…';

  ctx.fillText(displayText, zone.x, zone.y);
}

/** Strips protocol/domain noise so pasted URLs render as short handles. */
export function formatSocialValue(key: string, raw: string): string {
  let v = raw.trim();
  v = v.replace(/^https?:\/\//i, '').replace(/^www\./i, '');

  if (key === 'github') {
    v = v.replace(/^github\.com\//i, '');
  } else if (key === 'x') {
    v = v.replace(/^(x\.com|twitter\.com)\//i, '');
    v = v.replace(/^@/, '');
  }

  v = v.replace(/\/+$/, '');
  return v;
}

function socialPrefix(key: string): string {
  switch (key) {
    case 'x':
      return '@';
    case 'github':
      return 'gh/';
    case 'website':
      return '🔗 ';
    case 'email':
      return '✉ ';
    default:
      return '';
  }
}

/**
 * Draws the optional-socials row inside its OWN dedicated zone.
 * - Respects zone.align (left/center/right) by measuring total row width first.
 * - Truncates any single overlong entry (e.g. a pasted full GitHub URL).
 * - Drops trailing entries (with an ellipsis) rather than letting the row
 *   run past zone.maxWidth into neighboring text.
 * Never reaches into another zone's coordinates — this is what caused the
 * builder-ID / socials overlap previously.
 */
export function drawSocialsZone(
  ctx: CanvasRenderingContext2D,
  socials: Record<string, string>,
  zone: TextZone,
  color: string
) {
  const entries = Object.entries(socials).filter(([, v]) => v && v.trim());
  if (entries.length === 0) return;

  const family = FONT_STACK[zone.fontFamily];
  const weight = zone.weight || '700';
  ctx.font = `${weight} ${zone.fontSize}px ${family}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';

  const gap = zone.fontSize * 1.1;
  const maxEntryWidth = zone.maxWidth * 0.62;

  const parts: string[] = entries.map(([key, value]) => {
    let t = `${socialPrefix(key)}${formatSocialValue(key, value)}`;
    while (ctx.measureText(t).width > maxEntryWidth && t.length > 1) {
      t = t.slice(0, -1);
    }
    if (ctx.measureText(t).width < ctx.measureText(`${socialPrefix(key)}${formatSocialValue(key, value)}`).width) {
      t += '…';
    }
    return t;
  });

  // Greedily fit entries left-to-right within the zone's own width budget.
  const fitted: string[] = [];
  let widthUsed = 0;
  for (const part of parts) {
    const addGap = fitted.length > 0 ? gap : 0;
    const w = ctx.measureText(part).width;
    if (widthUsed + addGap + w > zone.maxWidth) {
      if (fitted.length === 0) {
        let t = part;
        while (ctx.measureText(`${t}…`).width > zone.maxWidth && t.length > 1) {
          t = t.slice(0, -1);
        }
        fitted.push(`${t}…`);
      }
      break;
    }
    fitted.push(part);
    widthUsed += addGap + w;
  }

  const totalWidth = fitted.reduce(
    (sum, p, i) => sum + ctx.measureText(p).width + (i > 0 ? gap : 0),
    0
  );

  let startX = zone.x;
  if (zone.align === 'center') startX = zone.x - totalWidth / 2;
  else if (zone.align === 'right') startX = zone.x - totalWidth;

  ctx.textAlign = 'left';
  let x = startX;
  for (const part of fitted) {
    ctx.fillText(part, x, zone.y);
    x += ctx.measureText(part).width + gap;
  }
}

/**
 * Draws a scannable QR code (encoding the public builder-profile URL)
 * directly onto the card canvas, at the given zone. Every builder gets
 * a unique code since it's derived from their unique builderId.
 */
export async function drawQrCode(
  ctx: CanvasRenderingContext2D,
  value: string,
  zone: { x: number; y: number; size: number },
  options?: { dark?: string; light?: string }
): Promise<void> {
  if (typeof document === 'undefined') return;

  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, value, {
    width: zone.size,
    margin: 0,
    color: {
      dark: options?.dark || '#021a14',
      light: options?.light || '#ffffff',
    },
  });

  // Small white/light quiet-zone card behind the code so it stays scannable
  // even when sitting on a busy or dark background.
  const pad = Math.round(zone.size * 0.08);
  ctx.save();
  ctx.fillStyle = options?.light || '#ffffff';
  ctx.beginPath();
  ctx.roundRect(zone.x - pad, zone.y - pad, zone.size + pad * 2, zone.size + pad * 2, 6);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(qrCanvas, zone.x, zone.y, zone.size, zone.size);
}
