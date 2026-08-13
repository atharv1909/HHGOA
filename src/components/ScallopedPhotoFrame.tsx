'use client';

import React from 'react';
import PhotoEditor, { ImageTransform } from './PhotoEditor';
import { ProcessedImage } from '@/lib/imageProcessor';
import styles from '@/styles/components/ScallopedPhotoFrame.module.css';

interface ScallopedPhotoFrameProps {
  image: ProcessedImage;
  transform: ImageTransform;
  onChangeTransform: (transform: ImageTransform) => void;
}

export default function ScallopedPhotoFrame({
  image,
  transform,
  onChangeTransform,
}: ScallopedPhotoFrameProps) {
  return (
    <div className={styles.frameContainer}>
      {/* Sunburst Ray Backdrop Graphic */}
      <svg
        className={styles.sunburstBg}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#FCE9AA" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
          {/* Top-Left Radiating Sun Rays */}
          <line x1="50" y1="50" x2="120" y2="120" />
          <line x1="90" y1="20" x2="140" y2="100" />
          <line x1="20" y1="90" x2="100" y2="140" />
          <line x1="160" y1="10" x2="180" y2="90" />
          <line x1="10" y1="160" x2="90" y2="180" />
          <line x1="230" y1="15" x2="230" y2="85" />
          <line x1="15" y1="230" x2="85" y2="230" />
          <line x1="300" y1="30" x2="270" y2="95" />
          <line x1="30" y1="300" x2="95" y2="270" />
          <line x1="370" y1="60" x2="320" y2="120" />
          <line x1="60" y1="370" x2="120" y2="320" />
        </g>
      </svg>

      {/* Outer Yellow Scalloped Frame Border */}
      <div className={styles.scallopedOuter}>
        {/* Scalloped Edge Mask Frame */}
        <div className={styles.photoContainer}>
          <PhotoEditor
            image={image}
            transform={transform}
            onChangeTransform={onChangeTransform}
          />
        </div>
      </div>
    </div>
  );
}
