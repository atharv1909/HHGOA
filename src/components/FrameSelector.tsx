'use client';

import { PhotoFilterMode } from '@/lib/imageProcessor';
import styles from '@/styles/components/FrameSelector.module.css';

interface FrameSelectorProps {
  selectedFilter: PhotoFilterMode;
  onSelectFilter: (filter: PhotoFilterMode) => void;
}

const FILTERS: { id: PhotoFilterMode; label: string; icon: string }[] = [
  { id: 'natural', label: 'Natural', icon: '🌿' },
  { id: 'goa-sunset', label: 'Goa Sunset', icon: '🌅' },
  { id: 'riso-dither', label: 'Vintage Riso', icon: '🎨' },
];

export default function FrameSelector({
  selectedFilter,
  onSelectFilter,
}: FrameSelectorProps) {
  return (
    <div className={styles.selectorContainer}>
      <div className={styles.sectionGroup}>
        <span className={styles.sectionTitle}>PHOTO FILTER</span>
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
    </div>
  );
}
