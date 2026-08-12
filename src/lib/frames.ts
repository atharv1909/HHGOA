// ═══════════════════════════════════════════════════════
// HH GOA 2026 — ULTIMATE FRAME ENGINE WITH DEDICATED ARTWORKS
// High contrast, stunning UI/UX, unique AI artwork per frame template
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

export interface FrameConfig {
  id: string;
  name: string;
  description: string;
  paletteMode: 'dark' | 'light';
  bgColor: string;
  photoZone: { x: number; y: number; width: number; height: number };
  textZones: {
    name: TextZone;
    stack: TextZone;
    title: TextZone;
    builderId: TextZone;
    timestamp: TextZone;
  };
  renderBackground?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  renderDecorations: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  pfpPhotoZone: { x: number; y: number; width: number; height: number };
  renderPfpDecorations: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

// ── DEDICATED ARTWORK IMAGE CACHE ──
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

// ── ARTWORK HELPERS ──

function drawHindiText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string = '#FF007A'
) {
  ctx.save();
  ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(255, 0, 122, 0.6)';
  ctx.shadowBlur = 12;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawLanyardSlot(ctx: CanvasRenderingContext2D, w: number, y: number = 25) {
  const holeW = 120;
  const holeH = 20;
  const holeX = (w - holeW) / 2;

  ctx.fillStyle = '#021a14';
  ctx.beginPath();
  ctx.roundRect(holeX, y, holeW, holeH, 10);
  ctx.fill();

  ctx.strokeStyle = '#FFF78C';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#FF007A';
  ctx.fillRect(holeX + 15, y - 25, holeW - 30, 25);
  ctx.fillStyle = '#FFF78C';
  ctx.font = '800 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HH GOA', w / 2, y - 8);
}

// ══════════════════════════════════════════════════════
// FRAME 1: GOA GENESIS (Hero Official Badge with Beach Sunset Art)
// ══════════════════════════════════════════════════════
const GOA_GENESIS: FrameConfig = {
  id: 'goa-genesis',
  name: 'Goa Genesis',
  description: 'Hero official badge with Goa beach sunset illustration & sunburst rim.',
  paletteMode: 'light',
  bgColor: '#012119',
  photoZone: { x: 240, y: 340, width: 600, height: 600 },
  textZones: {
    name: { x: 540, y: 1010, maxWidth: 960, fontSize: 48, fontFamily: 'display', color: '#021a14', align: 'center', weight: '900' },
    stack: { x: 540, y: 1070, maxWidth: 800, fontSize: 24, fontFamily: 'mono', color: '#FF007A', align: 'center', weight: '800' },
    title: { x: 540, y: 1115, maxWidth: 800, fontSize: 22, fontFamily: 'mono', color: '#004D34', align: 'center', weight: '700' },
    builderId: { x: 540, y: 1165, maxWidth: 400, fontSize: 20, fontFamily: 'mono', color: '#004D34', align: 'center', weight: '800' },
    timestamp: { x: 540, y: 1205, maxWidth: 400, fontSize: 14, fontFamily: 'mono', color: 'rgba(2,26,20,0.6)', align: 'center' },
  },
  renderBackground: (ctx, w) => {
    const artImg = getFrameImage('/brand/frame_art_goa_genesis.png');
    if (artImg && artImg.complete && artImg.naturalWidth > 0) {
      ctx.drawImage(artImg, 0, 250, w, 710);
    } else {
      ctx.fillStyle = '#004D34';
      ctx.fillRect(0, 250, w, 710);
    }
  },
  renderDecorations: (ctx, w, h) => {
    // Card Border
    ctx.strokeStyle = '#FFF78C';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, w - 10, h - 10);

    // Lanyard punch hole
    drawLanyardSlot(ctx, w, 28);

    // Header Title: HACKER (Left), गोवा (Center), HOUSE (Right) — HIGH CONTRAST SUNSHINE YELLOW
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFF78C';
    ctx.font = '900 64px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('HACKER', 70, 185);

    drawHindiText(ctx, 'गोवा', 540, 195, 76, '#FF007A');

    ctx.fillStyle = '#FFF78C';
    ctx.font = '900 64px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('HOUSE', w - 70, 185);
    ctx.restore();

    // Subtitle Bar
    ctx.fillStyle = '#004D34';
    ctx.fillRect(70, 215, w - 140, 36);
    ctx.strokeStyle = '#FFF78C';
    ctx.lineWidth = 2;
    ctx.strokeRect(70, 215, w - 140, 36);
    ctx.fillStyle = '#FFF78C';
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GOA, INDIA · 28 – 31 OCT 2026 · 2:47 PM STUDIO', w / 2, 238);

    // Photo Ring Rim
    ctx.strokeStyle = '#FF007A';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(540, 640, 308, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FFF78C';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(540, 640, 303, 0, Math.PI * 2);
    ctx.stroke();

    // Sand Data Banner Box
    ctx.fillStyle = '#FFF78C';
    ctx.fillRect(40, 960, w - 80, 270);
    ctx.strokeStyle = '#021a14';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 960, w - 80, 270);

    // Tagline
    ctx.fillStyle = '#FFF78C';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHIP FROM PARADISE · 500 BUILDERS · #FRAMEINGOA', w / 2, h - 35);
  },
  pfpPhotoZone: { x: 90, y: 90, width: 900, height: 900 },
  renderPfpDecorations: (ctx, w, h) => {
    ctx.strokeStyle = '#FFF78C';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, w - 14, h - 14);

    ctx.fillStyle = '#FFF78C';
    ctx.font = '900 36px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('HACKER', 45, 55);

    drawHindiText(ctx, 'गोवा', w / 2, 60, 48, '#FF007A');

    ctx.fillStyle = '#FFF78C';
    ctx.font = '900 36px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('HOUSE', w - 45, 55);

    ctx.fillStyle = '#004D34';
    ctx.fillRect(0, h - 55, w, 55);
    ctx.fillStyle = '#FFF78C';
    ctx.font = '800 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('#FrameInGoa · 28-31 OCT 2026', w / 2, h - 22);
  },
};

// ══════════════════════════════════════════════════════
// FRAME 2: HACKER HAVEN (Beach Lounge Hackathon Setup)
// ══════════════════════════════════════════════════════
const HACKER_HAVEN: FrameConfig = {
  id: 'hacker-haven',
  name: 'Hacker Haven',
  description: 'Beach lounge hackathon setup with laptop workstation & sunset sky.',
  paletteMode: 'dark',
  bgColor: '#011c14',
  photoZone: { x: 120, y: 240, width: 840, height: 680 },
  textZones: {
    name: { x: 120, y: 980, maxWidth: 840, fontSize: 48, fontFamily: 'display', color: '#FFF78C', weight: '900' },
    stack: { x: 120, y: 1045, maxWidth: 600, fontSize: 24, fontFamily: 'mono', color: '#FF007A', weight: '800' },
    title: { x: 120, y: 1090, maxWidth: 600, fontSize: 22, fontFamily: 'mono', color: '#00FF96', weight: '600' },
    builderId: { x: 960, y: 1045, maxWidth: 300, fontSize: 22, fontFamily: 'mono', color: '#FFF78C', align: 'right', weight: '800' },
    timestamp: { x: 960, y: 1085, maxWidth: 300, fontSize: 14, fontFamily: 'mono', color: 'rgba(255,255,255,0.6)', align: 'right' },
  },
  renderBackground: (ctx, w) => {
    const artImg = getFrameImage('/brand/frame_art_hacker_haven.png');
    if (artImg && artImg.complete && artImg.naturalWidth > 0) {
      ctx.drawImage(artImg, 0, 220, w, 720);
    }
  },
  renderDecorations: (ctx, w, h) => {
    ctx.strokeStyle = '#00FF96';
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    ctx.fillStyle = '#01281d';
    ctx.fillRect(15, 15, w - 30, 185);

    ctx.fillStyle = '#FFF78C';
    ctx.font = '900 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('HACKER HAVEN', 50, 95);

    drawHindiText(ctx, 'गोवा', w - 180, 105, 54, '#FF007A');

    ctx.fillStyle = '#00FF96';
    ctx.font = '800 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BEACH LOUNGE RESIDENCY // 28-31 OCT 2026', 50, 155);

    ctx.strokeStyle = '#FF007A';
    ctx.lineWidth = 5;
    ctx.strokeRect(117, 237, 846, 686);

    ctx.fillStyle = '#01281d';
    ctx.fillRect(40, 935, w - 80, 280);
    ctx.strokeStyle = '#00FF96';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 935, w - 80, 280);

    ctx.fillStyle = '#FFF78C';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LESS NOISE. MORE SIGNAL. // HH GOA 2026', w / 2, h - 35);
  },
  pfpPhotoZone: { x: 60, y: 60, width: 960, height: 960 },
  renderPfpDecorations: (ctx, w, h) => {
    ctx.strokeStyle = '#00FF96';
    ctx.lineWidth = 8;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    ctx.fillStyle = '#FFF78C';
    ctx.font = '800 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HACKER HAVEN', 35, 45);

    ctx.textAlign = 'right';
    ctx.fillText('HH GOA', w - 35, 45);
  },
};

// ══════════════════════════════════════════════════════
// FRAME 3: SUNSET RISO (80s Retro Synthwave Goa Sunset)
// ══════════════════════════════════════════════════════
const SUNSET_RISO: FrameConfig = {
  id: 'sunset-riso',
  name: 'Sunset Riso',
  description: '80s retro synthwave Goa sunset print with hot pink waves.',
  paletteMode: 'light',
  bgColor: '#FFF78C',
  photoZone: { x: 120, y: 220, width: 840, height: 720 },
  textZones: {
    name: { x: 120, y: 980, maxWidth: 840, fontSize: 52, fontFamily: 'display', color: '#FF007A', weight: '900' },
    stack: { x: 120, y: 1050, maxWidth: 600, fontSize: 26, fontFamily: 'mono', color: '#004D34', weight: '800' },
    title: { x: 120, y: 1095, maxWidth: 600, fontSize: 22, fontFamily: 'mono', color: '#021a14', weight: '600' },
    builderId: { x: 960, y: 1050, maxWidth: 300, fontSize: 22, fontFamily: 'mono', color: '#FF007A', align: 'right', weight: '900' },
    timestamp: { x: 960, y: 1090, maxWidth: 300, fontSize: 14, fontFamily: 'mono', color: 'rgba(0,77,52,0.6)', align: 'right' },
  },
  renderBackground: (ctx, w) => {
    const artImg = getFrameImage('/brand/frame_art_sunset_riso.png');
    if (artImg && artImg.complete && artImg.naturalWidth > 0) {
      ctx.drawImage(artImg, 0, 200, w, 740);
    }
  },
  renderDecorations: (ctx, w, h) => {
    ctx.fillStyle = '#FF007A';
    ctx.fillRect(20, 20, w - 40, 180);

    ctx.fillStyle = '#FFF78C';
    ctx.fillRect(12, 12, w - 40, 180);

    ctx.strokeStyle = '#004D34';
    ctx.lineWidth = 5;
    ctx.strokeRect(12, 12, w - 40, h - 40);

    // HIGH CONTRAST DEEP EMERALD & PINK
    ctx.fillStyle = '#004D34';
    ctx.font = '900 48px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('HACKER HOUSE', 100, 100);

    drawHindiText(ctx, 'गोवा', 520, 105, 56, '#FF007A');

    ctx.fillStyle = '#004D34';
    ctx.font = '900 48px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('2026', 980, 100);

    ctx.strokeStyle = '#FF007A';
    ctx.lineWidth = 6;
    ctx.strokeRect(117, 217, 846, 726);

    ctx.fillStyle = '#004D34';
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✦ PARADISE BUILD STATION · GOA INDIA ✦', w / 2, h - 45);
  },
  pfpPhotoZone: { x: 80, y: 80, width: 920, height: 920 },
  renderPfpDecorations: (ctx, w, h) => {
    ctx.strokeStyle = '#FF007A';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    ctx.fillStyle = '#FF007A';
    ctx.font = '900 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HACKER GOA HOUSE', w / 2, 50);
  },
};

// ══════════════════════════════════════════════════════
// FRAME 4: CYBER PARADISE (Fiber Optics Ocean Build Station)
// ══════════════════════════════════════════════════════
const CYBER_PARADISE: FrameConfig = {
  id: 'cyber-paradise',
  name: 'Cyber Paradise',
  description: 'Ocean side build station with glowing fiber optics & sunset glow.',
  paletteMode: 'dark',
  bgColor: '#00281C',
  photoZone: { x: 100, y: 240, width: 880, height: 680 },
  textZones: {
    name: { x: 100, y: 970, maxWidth: 880, fontSize: 46, fontFamily: 'display', color: '#FFFFFF', weight: '900' },
    stack: { x: 100, y: 1030, maxWidth: 600, fontSize: 24, fontFamily: 'mono', color: '#00F0FF', weight: '700' },
    title: { x: 100, y: 1075, maxWidth: 600, fontSize: 20, fontFamily: 'mono', color: '#FFF78C', weight: '600' },
    builderId: { x: 980, y: 1030, maxWidth: 300, fontSize: 20, fontFamily: 'mono', color: '#FFF78C', align: 'right', weight: '800' },
    timestamp: { x: 980, y: 1065, maxWidth: 300, fontSize: 13, fontFamily: 'mono', color: 'rgba(255,255,255,0.6)', align: 'right' },
  },
  renderBackground: (ctx, w) => {
    const artImg = getFrameImage('/brand/frame_art_cyber_paradise.png');
    if (artImg && artImg.complete && artImg.naturalWidth > 0) {
      ctx.drawImage(artImg, 0, 210, w, 730);
    }
  },
  renderDecorations: (ctx, w, h) => {
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 5;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.fillStyle = '#001a12';
    ctx.fillRect(20, 20, w - 40, 175);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 48px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CYBER PARADISE', 50, 95);

    drawHindiText(ctx, 'गोवा', w - 180, 105, 54, '#00F0FF');

    ctx.fillStyle = '#FFF78C';
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HIGH SPEED FIBER STATION // 28-31 OCT 2026', 50, 150);

    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 4;
    ctx.strokeRect(98, 238, 884, 684);

    ctx.fillStyle = '#001a12';
    ctx.fillRect(40, 930, w - 80, 280);
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 930, w - 80, 280);

    ctx.fillStyle = '#FFF78C';
    ctx.font = '400 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONFIDENTIAL RESIDENCY BADGE // HH GOA 2026', w / 2, h - 35);
  },
  pfpPhotoZone: { x: 70, y: 70, width: 940, height: 940 },
  renderPfpDecorations: (ctx, w, h) => {
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CYBER PARADISE', 35, 15);
  },
};

export const FRAMES: FrameConfig[] = [GOA_GENESIS, HACKER_HAVEN, SUNSET_RISO, CYBER_PARADISE];

export function getFrame(id: string): FrameConfig {
  return FRAMES.find(f => f.id === id) || GOA_GENESIS;
}
