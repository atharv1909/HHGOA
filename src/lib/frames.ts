// ═══════════════════════════════════════════════════════
// HH GOA 2026 — FRAME ENGINE
// 100% Pixel-Perfect Coordinate Alignment against card.png (1748 x 1240)
// ═══════════════════════════════════════════════════════

export interface TextZoneConfig {
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  fontFamily: 'display' | 'mono' | 'sans';
  color: string;
  align: 'left' | 'center' | 'right';
  weight?: string;
  shadow?: boolean;
}

export interface SocialsZoneConfig {
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  color: string;
}

export interface ZoneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QrZoneConfig {
  x: number;
  y: number;
  size: number;
}

export interface FrameConfig {
  id: string;
  name: string;
  tagline: string;
  badgeText: string;
  bgColor: string;

  photoZone: ZoneBounds;
  pfpPhotoZone: ZoneBounds;
  idBoxZone: ZoneBounds;
  qrZone: QrZoneConfig;
  barcodeZone: ZoneBounds;

  textZones: {
    name: TextZoneConfig;
    stack: TextZoneConfig;
    title: TextZoneConfig;
    builderId: TextZoneConfig;
    timestamp: TextZoneConfig;
    socials: SocialsZoneConfig;
  };

  renderBackground: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    img?: HTMLImageElement | null
  ) => void;
  renderDecorations: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => void;
  renderPfpDecorations: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => void;
}

const CARD_IMAGE_PATH = '/card.png';
let cachedCardImage: HTMLImageElement | null = null;
let imageLoadPromise: Promise<HTMLImageElement> | null = null;

export function loadCardImage(): Promise<HTMLImageElement> {
  if (cachedCardImage && cachedCardImage.complete && cachedCardImage.naturalWidth > 0) {
    return Promise.resolve(cachedCardImage);
  }

  if (imageLoadPromise) {
    return imageLoadPromise;
  }

  imageLoadPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      cachedCardImage = img;
      resolve(img);
    };

    img.onerror = () => {
      // Fallback path check
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        cachedCardImage = fallbackImg;
        resolve(fallbackImg);
      };
      fallbackImg.onerror = (err) => reject(err);
      fallbackImg.src = '/brand/card.png';
    };

    img.src = CARD_IMAGE_PATH;
  });

  return imageLoadPromise;
}

const GREEN_DARK = '#012119';

export const FRAMES: Record<string, FrameConfig> = {
  HACKERHOUSE_GOA: {
    id: 'HACKERHOUSE_GOA',
    name: 'Hacker House Goa Official Card',
    tagline: 'Official 2026 Participant ID Card',
    badgeText: 'GOA 2026',
    bgColor: GREEN_DARK,

    // Inner pink window inside scalloped photo frame
    photoZone: { x: 645, y: 240, width: 460, height: 430 },
    pfpPhotoZone: { x: 190, y: 190, width: 700, height: 700 },

    // Yellow ID box bounds
    idBoxZone: { x: 467, y: 770, width: 814, height: 140 },

    // QR Code — left white plate inside yellow box
    qrZone: { x: 490, y: 780, size: 125 },

    // Horizontal Barcode — bottom right inside yellow box
    barcodeZone: { x: 650, y: 835, width: 600, height: 65 },

    textZones: {
      name: {
        x: 874,
        y: 645,
        maxWidth: 1000,
        fontSize: 54,
        fontFamily: 'display',
        color: '#FBE6A2',
        align: 'center',
        weight: '900',
      },
      stack: {
        x: 874,
        y: 730,
        maxWidth: 1000,
        fontSize: 26,
        fontFamily: 'mono',
        color: '#FFFFFF',
        align: 'center',
        weight: '800',
      },
      builderId: {
        x: 650,
        y: 782,
        maxWidth: 600,
        fontSize: 44,
        fontFamily: 'mono',
        color: '#012119',
        align: 'left',
        weight: '900',
      },
      title: {
        x: 874,
        y: 760,
        maxWidth: 900,
        fontSize: 24,
        fontFamily: 'sans',
        color: '#FFFFFF',
        align: 'center',
      },
      timestamp: {
        x: 1620,
        y: 1180,
        maxWidth: 400,
        fontSize: 22,
        fontFamily: 'mono',
        color: '#28C76F',
        align: 'right',
      },
      socials: {
        x: 874,
        y: 1180,
        maxWidth: 800,
        fontSize: 20,
        color: '#FFFFFF',
      },
    },

    renderBackground(ctx, w, h, img) {
      ctx.fillStyle = GREEN_DARK;
      ctx.fillRect(0, 0, w, h);

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, w, h);
      } else if (cachedCardImage && cachedCardImage.complete) {
        ctx.drawImage(cachedCardImage, 0, 0, w, h);
      }
    },

    renderDecorations(_ctx, _w, _h) {
      // Background artwork card.png contains all decorative elements
    },

    renderPfpDecorations(ctx, w, h) {
      ctx.fillStyle = GREEN_DARK;
      ctx.fillRect(0, 0, w, h);
    },
  },
};

export function getFrame(id?: string): FrameConfig {
  return FRAMES[id || 'HACKERHOUSE_GOA'] || FRAMES.HACKERHOUSE_GOA;
}
