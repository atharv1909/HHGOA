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
  socials?: Record<string, string>;
  onReset: () => void;
}

export default function ResultScreen({
  imageBlob,
  name,
  title,
  stack,
  format,
  socials = {},
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

  const getSocialLink = (key: string, val: string) => {
    if (!val) return '';
    const clean = val.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    if (key === 'x') return `https://x.com/${clean.replace(/^@/, '')}`;
    if (key === 'github') return `https://github.com/${clean.replace(/^@/, '')}`;
    if (key === 'linkedin') return `https://linkedin.com/in/${clean.replace(/^@/, '')}`;
    if (key === 'email') return `mailto:${clean}`;
    if (key === 'website') return `https://${clean}`;
    return clean;
  };

  const socialIcons: Record<string, { icon: string; label: string }> = {
    x: { icon: '𝕏', label: 'X / Twitter' },
    github: { icon: '💻', label: 'GitHub' },
    linkedin: { icon: '💼', label: 'LinkedIn' },
    website: { icon: '🌐', label: 'Website' },
    email: { icon: '✉️', label: 'Email' },
    phone: { icon: '📞', label: 'Phone' },
  };

  const activeSocialKeys = Object.keys(socials).filter((k) => socials[k] && socials[k].trim() !== '');

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

      {/* Clickable Social Links Row */}
      {activeSocialKeys.length > 0 && (
        <div className={styles.socialsRow} aria-label="Builder social links">
          {activeSocialKeys.map((key) => {
            const url = getSocialLink(key, socials[key]);
            const meta = socialIcons[key] || { icon: '🔗', label: key };
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className={styles.socialIconBtn}
                title={`${meta.label}: ${socials[key]}`}
              >
                <span className={styles.socialIconSymbol}>{meta.icon}</span>
                <span className={styles.socialIconText}>{socials[key]}</span>
              </a>
            );
          })}
        </div>
      )}

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
