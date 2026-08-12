'use client';

import { useRef, useState, useCallback } from 'react';
import { processImage, ProcessedImage, ERROR_MESSAGES, ImageError } from '@/lib/imageProcessor';
import styles from '@/styles/components/UploadZone.module.css';

interface UploadZoneProps {
  onImageReady: (image: ProcessedImage) => void;
}

export default function UploadZone({ onImageReady }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);
    try {
      const processed = await processImage(file);
      onImageReady(processed);
    } catch (e) {
      const errorType = (e instanceof Error ? e.message : 'unknown') as ImageError;
      setError(ERROR_MESSAGES[errorType] || ERROR_MESSAGES['unknown']);
    } finally {
      setIsProcessing(false);
    }
  }, [onImageReady]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Generate a sample avatar photo on canvas for quick instant demo!
  const handleLoadSample = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext('2d')!;

      // Create stylish avatar gradient
      const grad = ctx.createLinearGradient(0, 0, 800, 800);
      grad.addColorStop(0, '#004D34');
      grad.addColorStop(0.5, '#FF007A');
      grad.addColorStop(1, '#FFF78C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 800);

      // Draw stylized hacker silhouette
      ctx.fillStyle = '#021a14';
      ctx.beginPath();
      ctx.arc(400, 320, 160, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(400, 800, 320, 0, Math.PI * 2);
      ctx.fill();

      // Sunglasses
      ctx.fillStyle = '#FFF78C';
      ctx.fillRect(300, 290, 80, 45);
      ctx.fillRect(420, 290, 80, 45);
      ctx.fillRect(375, 305, 50, 8);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      const sampleFile = new File([blob], 'demo-builder.png', { type: 'image/png' });
      await handleFile(sampleFile);
    } catch {
      setError('Could not create demo photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.uploadWrapper}>
      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload photo"
      >
        <div className={styles.iconCircle}>
          {isProcessing ? '⏳' : '📸'}
        </div>

        <div className={styles.dropTextGroup}>
          <span className={styles.dropTitle}>
            {isProcessing ? 'Processing Photo...' : 'Drop your photo here'}
          </span>
          <span className={styles.dropSubtitle}>
            Tap to browse files or camera roll
          </span>
        </div>

        <span className={styles.dropFormats}>
          JPG · PNG · HEIC · Max 20MB
        </span>
      </div>

      <div className={styles.sampleBar}>
        <span className={styles.sampleLabel}>No photo ready?</span>
        <button className={styles.sampleBtn} onClick={handleLoadSample}>
          ⚡ Try Demo Photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.fileInput}
        aria-hidden="true"
      />

      {error && <div className={styles.errorBox}>{error}</div>}
    </div>
  );
}
