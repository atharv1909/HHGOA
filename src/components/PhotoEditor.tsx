'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { ProcessedImage } from '@/lib/imageProcessor';
import styles from '@/styles/components/PhotoEditor.module.css';

export interface ImageTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface PhotoEditorProps {
  image: ProcessedImage;
  transform: ImageTransform;
  onChangeTransform: (transform: ImageTransform) => void;
  aspectRatio?: number; // e.g. 4/3 or 1/1
}

export default function PhotoEditor({
  image,
  transform,
  onChangeTransform,
}: PhotoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const transformStartRef = useRef<ImageTransform>({ scale: 1, offsetX: 0, offsetY: 0 });

  // Touch pinch tracking
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  // Render photo on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !image.bitmap) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const img = image.bitmap;
    const imgAspect = img.width / img.height;
    const zoneAspect = rect.width / rect.height;

    let baseScale: number;
    if (imgAspect > zoneAspect) {
      baseScale = rect.height / img.height;
    } else {
      baseScale = rect.width / img.width;
    }

    const finalScale = baseScale * transform.scale;
    const drawWidth = img.width * finalScale;
    const drawHeight = img.height * finalScale;

    // Convert pixel offsets relative to container size
    const drawX = (rect.width - drawWidth) / 2 + transform.offsetX;
    const drawY = (rect.height - drawHeight) / 2 + transform.offsetY;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }, [image, transform]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // Pointer events for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    transformStartRef.current = { ...transform };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    onChangeTransform({
      ...transformStartRef.current,
      offsetX: transformStartRef.current.offsetX + dx,
      offsetY: transformStartRef.current.offsetY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore pointer capture release error if lost
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.max(0.5, Math.min(4, transform.scale * zoomFactor));
    onChangeTransform({
      ...transform,
      scale: newScale,
    });
  };

  // Touch pinch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchDistanceRef.current = dist;
      initialScaleRef.current = transform.scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialTouchDistanceRef.current;
      const newScale = Math.max(0.5, Math.min(4, initialScaleRef.current * factor));
      onChangeTransform({
        ...transform,
        scale: newScale,
      });
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null;
  };

  const zoomIn = () => {
    onChangeTransform({
      ...transform,
      scale: Math.min(4, transform.scale * 1.2),
    });
  };

  const zoomOut = () => {
    onChangeTransform({
      ...transform,
      scale: Math.max(0.5, transform.scale / 1.2),
    });
  };

  const resetTransform = () => {
    onChangeTransform({ scale: 1, offsetX: 0, offsetY: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={styles.editorContainer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      title="Pinch or drag to position photo"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.controlsOverlay}>
        <button
          className={styles.controlBtn}
          onClick={(e) => {
            e.stopPropagation();
            zoomIn();
          }}
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className={styles.controlBtn}
          onClick={(e) => {
            e.stopPropagation();
            zoomOut();
          }}
          title="Zoom out"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          className={styles.controlBtn}
          onClick={(e) => {
            e.stopPropagation();
            resetTransform();
          }}
          title="Reset position"
          aria-label="Reset position"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
