'use client';

import { useState, useEffect } from 'react';
import { downloadImage, shareToX, buildCaption } from '@/lib/shareUtils';
import styles from '@/styles/components/ResultScreen.module.css';

interface ResultScreenProps {
  imageBlob: Blob;
  name: string;
  title: string;
  stack: string;
  format: 'builder-id' | 'pfp';
  onReset: () => void;
}

export default function ResultScreen({
  imageBlob,
  name,
  title,
  stack,
  format,
  onReset,
}: ResultScreenProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(imageBlob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageBlob]);

  const handleDownload = () => {
    const filename = `hh-goa-${format === 'pfp' ? 'pfp' : 'builder-id'}-${name.toLowerCase().replace(/\s+/g, '-') || 'builder'}.png`;
    downloadImage(imageBlob, filename);
  };

  const handleShare = async () => {
    setIsSharing(true);
    setShareStatus(null);
    try {
      const caption = buildCaption(name, title, stack);
      const shared = await shareToX(imageBlob, caption);
      if (shared) {
        setShareStatus('Opened X composer');
      }
    } catch {
      setShareStatus('Download the image and post with #FrameInGoa');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={styles.resultContainer}>
      <div className={styles.imagePreviewWrapper}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated HH Goa graphic"
            className={styles.previewImage}
          />
        )}
      </div>

      <div className={styles.actionsGroup}>
        <div className={styles.buttonRow}>
          <button className={styles.secondaryBtn} onClick={handleDownload}>
            ⬇ Download PNG
          </button>
          <button
            className={styles.primaryBtn}
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? 'Sharing...' : '🚀 Share to X'}
          </button>
        </div>

        {shareStatus && <p className={styles.shareStatus}>{shareStatus}</p>}

        <button className={styles.outlineBtn} onClick={onReset}>
          + Generate another card / Add teammate
        </button>
      </div>

      {/* Radar Integration Confirmation */}
      <div className={styles.radarCard}>
        <div className={styles.radarHeader}>
          <span className={styles.radarDot} />
          <span>W Celeb Radar Integration</span>
        </div>
        <p className={styles.radarText}>
          Post your graphic on X using <strong>#FrameInGoa</strong> to get automatically tracked and ranked on the HH Goa 2026 leaderboard.
        </p>
        <a
          href="https://hhgoa.com/radar"
          target="_blank"
          rel="noreferrer"
          className={styles.radarLink}
        >
          View live Radar leaderboard ↗
        </a>
      </div>
    </div>
  );
}
