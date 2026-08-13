// ═══════════════════════════════════════════════════════
// HH GOA 2026 — CARD ENGINE
// Dedicated Builder ID card design based directly on the
// card.png reference image template.
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

export function loadCardImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    const path = '/card.png';
    if (imageCache[path] && imageCache[path].complete && imageCache[path].naturalWidth > 0) {
      resolve(imageCache[path]);
      return;
    }
    const img = new Image();
    img.onload = () => {
      imageCache[path] = img;
      resolve(img);
    };
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => {
        imageCache['/brand/card.png'] = fallback;
        resolve(fallback);
      };
      fallback.src = '/brand/card.png';
    };
    img.src = path;
  });
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

  // Inner pink square window inside the scalloped border on card.png
  photoZone: { x: 635, y: 278, width: 398, height: 398 },

  // Yellow ID Box: x=467, y=800, width=814, height=150
  idBoxZone: { x: 467, y: 800, width: 814, height: 150 },
  qrZone: { x: 488, y: 812, size: 125 },
  barcodeZone: { x: 640, y: 868, width: 600, height: 65 },

  textZones: {
    name: { x: 834, y: 650, maxWidth: 900, fontSize: 58, fontFamily: 'display', color: CREAM, align: 'center', weight: '900' },
    stack: { x: 834, y: 745, maxWidth: 900, fontSize: 26, fontFamily: 'mono', color: WHITE, align: 'center', weight: '800' },
    title: { x: 1546, y: 910, maxWidth: 220, fontSize: 22, fontFamily: 'mono', color: GREEN_DARK, align: 'center', weight: '900' },
    builderId: { x: 640, y: 812, maxWidth: 600, fontSize: 44, fontFamily: 'mono', color: GREEN_DARK, align: 'left', weight: '900' },
    timestamp: { x: 834, y: 1180, maxWidth: 500, fontSize: 14, fontFamily: 'mono', color: 'rgba(251,230,162,0.55)', align: 'center' },
    socials: { x: 834, y: 1150, maxWidth: 900, fontSize: 18, fontFamily: 'mono', color: CREAM, align: 'center', weight: '700' },
  },

  renderBackground: (ctx, w, h) => {
    loadCardImage().then((img) => {
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, w, h);
      }
    }).catch(() => {
      ctx.fillStyle = GREEN_DARK;
      ctx.fillRect(0, 0, w, h);
    });
  },

  renderDecorations: () => {},

  pfpPhotoZone: { x: 635, y: 278, width: 398, height: 398 },
  renderPfpDecorations: () => {},
};

export const FRAMES: FrameConfig[] = [HACKERHOUSE_GOA];

export function getFrame(_id?: string): FrameConfig {
  return HACKERHOUSE_GOA;
}
