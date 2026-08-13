// ═══════════════════════════════════════════════════════
// HH GOA 2026 — SHARED CARD TEXT/SOCIALS RENDERER
// Clean social handles with logos, single source of truth
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

/** Strips protocol/domain noise so pasted full URLs render as clean handles. */
export function formatSocialValue(key: string, raw: string): string {
  let v = raw.trim();
  v = v.replace(/^https?:\/\//i, '').replace(/^www\./i, '');

  if (key === 'github') {
    v = v.replace(/^github\.com\//i, '');
  } else if (key === 'x') {
    v = v.replace(/^(x\.com|twitter\.com)\//i, '');
  } else if (key === 'linkedin') {
    v = v.replace(/^linkedin\.com\/in\//i, '');
  } else if (key === 'website') {
    v = v.split('/')[0]; // clean domain only
  }

  v = v.replace(/^@/, '').replace(/\/+$/, '');

  if (key === 'website' || key === 'email' || key === 'phone') {
    return v;
  }
  return `@${v}`;
}

function socialPrefix(key: string): string {
  switch (key) {
    case 'x':
      return '𝕏 ';
    case 'github':
      return '💻 ';
    case 'linkedin':
      return '💼 ';
    case 'website':
      return '🌐 ';
    case 'email':
      return '✉ ';
    default:
      return '';
  }
}

/**
 * Draws the optional-socials row inside its OWN dedicated zone.
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
  const maxEntryWidth = zone.maxWidth * 0.45;

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

  const pad = Math.round(zone.size * 0.08);
  ctx.save();
  ctx.fillStyle = options?.light || '#ffffff';
  ctx.beginPath();
  ctx.roundRect(zone.x - pad, zone.y - pad, zone.size + pad * 2, zone.size + pad * 2, 6);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(qrCanvas, zone.x, zone.y, zone.size, zone.size);
}
