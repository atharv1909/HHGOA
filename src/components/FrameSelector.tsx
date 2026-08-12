'use client';

import { FRAMES, FrameConfig } from '@/lib/frames';
import { PhotoFilterMode } from '@/lib/imageProcessor';
import styles from '@/styles/components/FrameSelector.module.css';

interface FrameSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  selectedFilter: PhotoFilterMode;
  onSelectFilter: (filter: PhotoFilterMode) => void;
}

const FILTERS: { id: PhotoFilterMode; label: string; icon: string }[] = [
  { id: 'natural', label: 'Natural', icon: '🌿' },
  { id: 'goa-sunset', label: 'Goa Sunset', icon: '🌅' },
  { id: 'riso-dither', label: 'Vintage Riso', icon: '🎨' },
];

export default function FrameSelector({
  selectedId,
  onSelect,
  selectedFilter,
  onSelectFilter,
}: FrameSelectorProps) {
  return (
    <div className={styles.selectorContainer}>
      {/* 1. Photo Filter Selection */}
      <div className={styles.sectionGroup}>
        <span className={styles.sectionTitle}>1. PHOTO FILTER</span>
        <div className={styles.filterGrid}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`${styles.filterBtn} ${
                selectedFilter === f.id ? styles.filterBtnSelected : ''
              }`}
              onClick={() => onSelectFilter(f.id)}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Frame Style Selection */}
      <div className={styles.sectionGroup}>
        <span className={styles.sectionTitle}>2. FRAME STYLE</span>
        <div className={styles.grid}>
          {FRAMES.map((frame: FrameConfig) => {
            const isSelected = frame.id === selectedId;
            return (
              <button
                key={frame.id}
                className={`${styles.cardBtn} ${
                  isSelected ? styles.cardBtnSelected : ''
                }`}
                onClick={() => onSelect(frame.id)}
              >
                <div
                  className={styles.miniPreview}
                  style={{ backgroundColor: frame.bgColor }}
                >
                  <div className={styles.miniHeader}>
                    <span className={styles.miniTitle}>HACKER GOA</span>
                  </div>
                  <div className={styles.miniPhotoZone} />
                  <div className={styles.miniFooter}>
                    <div className={styles.miniLine} />
                    <div className={styles.miniLineShort} />
                  </div>
                </div>
                <span className={styles.cardLabel}>{frame.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
