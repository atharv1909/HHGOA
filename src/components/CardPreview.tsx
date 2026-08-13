'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FrameConfig } from '@/lib/frames';
import { ProcessedImage, PhotoFilterMode } from '@/lib/imageProcessor';
import { ImageTransform } from './PhotoEditor';
import PhotoEditor from './PhotoEditor';
import BarcodeSVG from './BarcodeSVG';
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
  const cardDomRef = useRef<HTMLDivElement>(null);

  const isPfp = format === 'pfp';
  const formattedId = formatBuilderId(builderId);

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/builder/${builderId}`
      : `https://hhgoa.com/builder/${builderId}`;

  const displayName = name && name.trim() ? name.trim() : 'Your Name';
  const displayStack = stack && stack.trim()
    ? `STACK / ROLE: ${stack.toUpperCase().trim()}`
    : 'STACK / ROLE: RUST >& BACKEND';

  const handleCardClick = () => {
    if (allowFlip && !isPfp) {
      setIsFlipped(!isFlipped);
    }
  };

  const filterStyle = {
    filter:
      filter === 'goa-sunset'
        ? 'sepia(30%) saturate(140%) hue-rotate(-15deg)'
        : filter === 'riso-dither'
        ? 'contrast(120%) saturate(150%) sepia(20%)'
        : 'none',
  };

  return (
    <div className={styles.previewWrapper}>
      <div
        ref={cardDomRef}
        id="dom-card-preview"
        className={`${styles.cardContainer} ${
          isFlipped ? styles.isFlipped : ''
        }`}
        onClick={handleCardClick}
      >
        <div
          className={`${styles.aspectRatioBox} ${
            isPfp ? styles.aspectPfp : styles.aspectBuilderId
          }`}
        >
          {/* FRONT OF THE CARD */}
          <div className={styles.cardFront}>
            {/* Background Template Artwork (clean image with zero artifacts) */}
            <div
              className={styles.cleanBgLayer}
              style={{ backgroundImage: `url('/clean_card.png')` }}
            />

            {/* 1. SCALLOPED PHOTO FRAME WINDOW (DOM ELEMENT) */}
            <div className={styles.domPhotoZone}>
              {/* Sunburst Rays SVG Backdrop */}
              <svg
                className={styles.sunburstRays}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke="#FCE9AA" strokeWidth="1.8" opacity="0.85">
                  <line x1="10" y1="10" x2="30" y2="30" />
                  <line x1="20" y1="5" x2="35" y2="25" />
                  <line x1="5" y1="20" x2="25" y2="35" />
                  <line x1="40" y1="2" x2="45" y2="20" />
                  <line x1="2" y1="40" x2="20" y2="45" />
                  <line x1="60" y1="5" x2="55" y2="22" />
                  <line x1="5" y1="60" x2="22" y2="55" />
                  <line x1="80" y1="15" x2="70" y2="32" />
                  <line x1="15" y1="80" x2="32" y2="70" />
                </g>
              </svg>

              {/* Pink Scalloped Photo Window Container */}
              <div className={styles.scallopedWindow} style={filterStyle}>
                <PhotoEditor
                  image={image}
                  transform={transform}
                  onChangeTransform={onChangeTransform}
                />
              </div>
            </div>

            {/* 2. USER NAME (DOM ELEMENT) */}
            <div className={styles.domNameZone}>
              <h2 className={styles.nameText}>{displayName}</h2>
            </div>

            {/* 3. STACK / ROLE (DOM ELEMENT) */}
            <div className={styles.domStackZone}>
              <p className={styles.stackText}>{displayStack}</p>
            </div>

            {/* 4. YELLOW ID BADGE BOX (DOM ELEMENT) */}
            <div className={styles.domYellowBox}>
              {/* Left Zone: Compact White QR Code Plate */}
              <div className={styles.qrPlate}>
                <QRCodeSVG
                  value={profileUrl}
                  size={42}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#012119"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Right Zone: Builder ID & Horizontal Barcode */}
              <div className={styles.idDetailsZone}>
                <span className={styles.builderIdText}>{formattedId}</span>
                <div className={styles.barcodeWrapper}>
                  <BarcodeSVG value={builderId || 'HHG-5VJEQ'} color="#012119" height="100%" />
                </div>
              </div>
            </div>

            {/* 5. BUILDER CLASS CIRCLE BADGE (DOM ELEMENT) */}
            <div className={styles.builderBadge}>
              <div className={styles.badgeInner}>
                <span>BUILDER</span>
                <span>CLASS</span>
              </div>
            </div>
          </div>

          {/* BACK OF THE CARD (FOR FLIP ANIMATION) */}
          {!isPfp && (
            <div className={styles.cardBack}>
              <div className={styles.backHeader}>
                <span className={styles.backTitle}>HACKER HOUSE GOA</span>
                <span className={styles.backId}>{formattedId}</span>
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
