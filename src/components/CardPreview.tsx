'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FrameConfig } from '@/lib/frames';
import { ProcessedImage, PhotoFilterMode, applyFilterToCanvas } from '@/lib/imageProcessor';
import { ImageTransform } from './PhotoEditor';
import PhotoEditor from './PhotoEditor';
import { formatBuilderId } from '@/lib/idGenerator';
import styles from '@/styles/components/CardPreview.module.css';

interface CardPreviewProps {
  image: ProcessedImage;
  transform: ImageTransform;
  onChangeTransform: (transform: ImageTransform) => void;
  filter: PhotoFilterMode;
  frame: FrameConfig;
  format: 'builder-id' | 'pfp';
  name: string;
  stack: string;
  title: string;
  builderId: string;
  socials: Record<string, string>;
  allowFlip?: boolean;
}

export default function CardPreview({
  image,
  transform,
  onChangeTransform,
  filter,
  frame,
  format,
  name,
  stack,
  title,
  builderId,
  socials,
  allowFlip = true,
}: CardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  const isPfp = format === 'pfp';
  const photoZone = isPfp ? frame.pfpPhotoZone : frame.photoZone;

  const baseW = 1080;
  const baseH = isPfp ? 1080 : 1350;

  const isCircular = frame.id === 'goa-genesis' && !isPfp;

  const photoStyle = {
    left: `${(photoZone.x / baseW) * 100}%`,
    top: `${(photoZone.y / baseH) * 100}%`,
    width: `${(photoZone.width / baseW) * 100}%`,
    height: `${(photoZone.height / baseH) * 100}%`,
    borderRadius: isCircular ? '50%' : '0px',
  };

  // Render Background Artwork canvas
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    bgCanvas.width = baseW;
    bgCanvas.height = baseH;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, baseW, baseH);
    if (!isPfp && frame.renderBackground) {
      frame.renderBackground(ctx, baseW, baseH);
    }
  }, [frame, isPfp, baseW, baseH]);

  // Render Foreground Overlay & Text canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = baseW;
    canvas.height = baseH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, baseW, baseH);

    // Apply photo filter onto photo zone overlay if filter selected
    if (filter !== 'natural') {
      ctx.save();
      ctx.beginPath();
      if (isCircular) {
        const cx = photoZone.x + photoZone.width / 2;
        const cy = photoZone.y + photoZone.height / 2;
        ctx.arc(cx, cy, photoZone.width / 2, 0, Math.PI * 2);
      } else {
        ctx.rect(photoZone.x, photoZone.y, photoZone.width, photoZone.height);
      }
      ctx.clip();
      applyFilterToCanvas(ctx, baseW, baseH, filter);
      ctx.restore();
    }

    // Frame decorations (borders, titles, stamps)
    if (isPfp) {
      frame.renderPfpDecorations(ctx, baseW, baseH);
    } else {
      frame.renderDecorations(ctx, baseW, baseH);

      const tz = frame.textZones;

      const drawText = (
        text: string,
        zone: typeof tz.name,
        fallbackText: string = ''
      ) => {
        if (!text && !fallbackText) return;
        const val = text || fallbackText;
        const family =
          zone.fontFamily === 'mono'
            ? '"JetBrains Mono", monospace'
            : '"Space Grotesk", sans-serif';
        const weight = zone.weight || '700';

        ctx.font = `${weight} ${zone.fontSize}px ${family}`;
        ctx.fillStyle = text ? zone.color : 'rgba(150, 150, 150, 0.4)';
        ctx.textAlign = zone.align || 'left';
        ctx.textBaseline = 'top';

        let displayText = val;
        while (
          ctx.measureText(displayText).width > zone.maxWidth &&
          displayText.length > 1
        ) {
          displayText = displayText.slice(0, -1);
        }
        if (displayText !== val) displayText += '…';

        ctx.fillText(displayText, zone.x, zone.y);
      };

      drawText(name, tz.name, 'YOUR NAME');
      drawText(stack, tz.stack, 'STACK / ROLE');
      drawText(title, tz.title, 'BUILDER TITLE');
      drawText(formatBuilderId(builderId), tz.builderId);

      const now = new Date();
      const months = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
      ];
      drawText(`${months[now.getMonth()]} ${now.getFullYear()}`, tz.timestamp);

      const socialEntries = Object.entries(socials).filter(([, v]) => v.trim());
      if (socialEntries.length > 0) {
        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.fillStyle =
          frame.paletteMode === 'dark' ? '#00FF96' : '#FF007A';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        let sx = tz.title.x;
        const sy = tz.title.y + 40;

        for (const [key, value] of socialEntries) {
          const prefix =
            key === 'x'
              ? '@'
              : key === 'github'
              ? 'gh/'
              : key === 'website'
              ? '🔗 '
              : key === 'email'
              ? '✉ '
              : '';
          const str = `${prefix}${value}`;
          if (sx + ctx.measureText(str).width > tz.title.x + 900) break;
          ctx.fillText(str, sx, sy);
          sx += ctx.measureText(str).width + 24;
        }
      }
    }
  }, [
    frame,
    format,
    name,
    stack,
    title,
    builderId,
    socials,
    filter,
    baseW,
    baseH,
    isPfp,
    isCircular,
    photoZone,
  ]);

  const handleCardClick = () => {
    if (allowFlip && !isPfp) {
      setIsFlipped(!isFlipped);
    }
  };

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/builder/${builderId}`
      : `https://hhgoa.com/builder/${builderId}`;

  return (
    <div className={styles.previewWrapper}>
      <div
        className={`${styles.cardContainer} ${
          isFlipped ? styles.isFlipped : ''
        }`}
        style={{ backgroundColor: frame.bgColor }}
        onClick={handleCardClick}
      >
        <div
          className={`${styles.aspectRatioBox} ${
            isPfp ? styles.aspectPfp : styles.aspectBuilderId
          }`}
        >
          {/* FRONT */}
          <div className={styles.cardFront}>
            {/* Background Artwork Canvas (drawn behind photo) */}
            <canvas
              ref={bgCanvasRef}
              className={styles.decorationCanvas}
              style={{ zIndex: 0 }}
            />

            {/* Photo Safe Zone (in middle layer) */}
            <div className={styles.photoZoneWrapper} style={photoStyle}>
              <PhotoEditor
                image={image}
                transform={transform}
                onChangeTransform={onChangeTransform}
              />
            </div>

            {/* Foreground Decorations Canvas (drawn on top of photo) */}
            <canvas ref={canvasRef} className={styles.decorationCanvas} />
          </div>

          {/* BACK (Builder ID only) */}
          {!isPfp && (
            <div className={styles.cardBack}>
              <div className={styles.backHeader}>
                <span className={styles.backTitle}>HACKER HOUSE GOA</span>
                <span className={styles.backId}>{formatBuilderId(builderId)}</span>
              </div>

              <div className={styles.qrBox}>
                <QRCodeSVG
                  value={profileUrl}
                  size={160}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#004D34"
                />
              </div>

              <div className={styles.backFooter}>
                <p className={styles.backHelp}>
                  Need help?{' '}
                  <a
                    href="https://hhgoa.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.backLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    hhgoa.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {allowFlip && !isPfp && (
        <p className={styles.flipHint}>
          {isFlipped ? '🔄 Tap card to view front' : '🔄 Tap card to view back & QR'}
        </p>
      )}
    </div>
  );
}
