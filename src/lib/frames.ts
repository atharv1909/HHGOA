// ═══════════════════════════════════════════════════════
// HH GOA 2026 — CARD ENGINE
// Single dedicated Builder ID card design based directly on the
// card.png reference template image.
// ═══════════════════════════════════════════════════════

export interface TextZone {
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  fontFamily: 'display' | 'mono';
  color: string;
  align?: CanvasTextAlign;
  weight?: string;
}

export interface BoxZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameConfig {
  id: string;
  name: string;
  description: string;
  paletteMode: 'dark' | 'light';
  bgColor: string;
  photoZone: BoxZone;
  idBoxZone: BoxZone;
  qrZone: { x: number; y: number; size: number };
  barcodeZone: BoxZone;
  textZones: {
    name: TextZone;
    stack: TextZone;
    title: TextZone;
    builderId: TextZone;
    timestamp: TextZone;
    socials: TextZone;
  };
  renderBackground?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  renderDecorations: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  pfpPhotoZone: BoxZone;
  renderPfpDecorations: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

const imageCache: Record<string, HTMLImageElement> = {};

function getFrameImage(path: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (!imageCache[path]) {
    const img = new Image();
    img.src = path;
    imageCache[path] = img;
  }
  return imageCache[path];
}

const GREEN_DARK = '#012119';
const CREAM = '#FBE6A2';
const WHITE = '#FFFFFF';

const HACKERHOUSE_GOA: FrameConfig = {
  id: 'hackerhouse-goa',
  name: 'HackerHouse Goa 2026',
  description: 'The official HH Goa 2026 Builder ID Card.',
  paletteMode: 'dark',
  bgColor: GREEN_DARK,

  // Inner square photo window matching card.png pink UPLOAD PHOTO area
  photoZone: { x: 637, y: 350, width: 500, height: 372 },

  // Yellow ID Box
  idBoxZone: { x: 467, y: 955, width: 814, height: 180 },
  qrZone: { x: 490, y: 965, size: 150 },
  barcodeZone: { x: 670, y: 1045, width: 590, height: 75 },

  textZones: {
    name: { x: 874, y: 790, maxWidth: 900, fontSize: 64, fontFamily: 'display', color: CREAM, align: 'center', weight: '900' },
    stack: { x: 874, y: 896, maxWidth: 900, fontSize: 28, fontFamily: 'mono', color: WHITE, align: 'center', weight: '800' },
    title: { x: 1546, y: 1060, maxWidth: 220, fontSize: 24, fontFamily: 'mono', color: GREEN_DARK, align: 'center', weight: '900' },
    builderId: { x: 670, y: 970, maxWidth: 600, fontSize: 48, fontFamily: 'mono', color: GREEN_DARK, align: 'left', weight: '900' },
    timestamp: { x: 874, y: 1220, maxWidth: 500, fontSize: 14, fontFamily: 'mono', color: 'rgba(251,230,162,0.55)', align: 'center' },
    socials: { x: 874, y: 1180, maxWidth: 900, fontSize: 20, fontFamily: 'mono', color: CREAM, align: 'center', weight: '700' },
  },

  renderBackground: (ctx, w, h) => {
    const artImg = getFrameImage('/card.png') || getFrameImage('/brand/card.png');
    if (artImg && artImg.complete && artImg.naturalWidth > 0) {
      ctx.drawImage(artImg, 0, 0, w, h);
    } else {
      ctx.fillStyle = GREEN_DARK;
      ctx.fillRect(0, 0, w, h);
    }
  },

  renderDecorations: () => {
    // Background card.png contains all artwork. No procedural fake coconuts or flowers!
  },

  pfpPhotoZone: { x: 637, y: 350, width: 500, height: 372 },
  renderPfpDecorations: () => {},
};

export const FRAMES: FrameConfig[] = [HACKERHOUSE_GOA];

export function getFrame(_id?: string): FrameConfig {
  return HACKERHOUSE_GOA;
}
