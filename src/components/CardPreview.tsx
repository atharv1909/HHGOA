'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FrameConfig, loadCardImage } from '@/lib/frames';
import { ProcessedImage, PhotoFilterMode, applyFilterToCanvas } from '@/lib/imageProcessor';
import { ImageTransform } from './PhotoEditor';
import PhotoEditor from './PhotoEditor';
import { formatBuilderId } from '@/lib/idGenerator';
import { drawTextZone, drawSocialsZone, drawQrCode, drawBarcode } from '@/lib/cardRenderer';
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

  const baseW = 1748;
  const baseH = isPfp ? 1080 : 1240;

  const photoStyle = {
    left: `${(photoZone.x / baseW) * 100}%`,
    top: `${(photoZone.y / baseH) * 100}%`,
    width: `${(photoZone.width / baseW) * 100}%`,
    height: `${(photoZone.height / baseH) * 100}%`,
    borderRadius: '0px',
  };

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/builder/${builderId}`
      : `https://hhgoa.com/builder/${builderId}`;

  // Render Background Artwork canvas reliably
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    bgCanvas.width = baseW;
    bgCanvas.height = baseH;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    let active = true;

    loadCardImage().then((artImg) => {
      if (!active) return;
      ctx.clearRect(0, 0, baseW, baseH);
      ctx.drawImage(artImg, 0, 0, baseW, baseH);
    }).catch(() => {
      if (!active) return;
      ctx.fillStyle = frame.bgColor;
      ctx.fillRect(0, 0, baseW, baseH);
    });

    return () => {
      active = false;
    };
  }, [frame, isPfp, baseW, baseH]);

  // Render Foreground Overlay & Text canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = baseW;
    canvas.height = baseH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = async () => {
      ctx.clearRect(0, 0, baseW, baseH);

      // Apply photo filter onto photo zone overlay if filter selected
      if (filter !== 'natural') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoZone.x, photoZone.y, photoZone.width, photoZone.height);
        ctx.clip();
        applyFilterToCanvas(ctx, baseW, baseH, filter);
        ctx.restore();
      }

      if (isPfp) {
        frame.renderPfpDecorations(ctx, baseW, baseH);
        return;
      }

      frame.renderDecorations(ctx, baseW, baseH);

      const tz = frame.textZones;

      drawTextZone(ctx, name, tz.name, { clearBg: true });
      drawTextZone(ctx, stack ? `STACK / ROLE: ${stack.toUpperCase()}` : '', tz.stack, {
        clearBg: true,
      });
      drawTextZone(ctx, title, tz.title);
      drawTextZone(ctx, formatBuilderId(builderId), tz.builderId);

      const now = new Date();
      const months = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
      ];
      drawTextZone(ctx, `${months[now.getMonth()]} ${now.getFullYear()}`, tz.timestamp);

      const hasSocials = Object.values(socials).some((v) => v && v.trim());
      if (hasSocials) {
        drawSocialsZone(ctx, socials, tz.socials, tz.socials.color);
      }

      await drawQrCode(ctx, profileUrl, frame.qrZone, {
        dark: '#021a14',
        light: '#ffffff',
      });

      drawBarcode(ctx, formatBuilderId(builderId), frame.barcodeZone, {
        bar: '#021a14',
      });
    };

    render().catch(() => {});
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
    photoZone,
    profileUrl,
  ]);

  const handleCardClick = () => {
    if (allowFlip && !isPfp) {
      setIsFlipped(!isFlipped);
    }
  };

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
