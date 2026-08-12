'use client';

import styles from '@/styles/components/BeachBackground.module.css';

export default function BeachBackground() {
  return (
    <div className={styles.bgWrapper} aria-hidden="true">
      {/* High-Res Goa Sunset Beach Background */}
      <img
        src="/brand/goa_sunset_beach_hd.png"
        alt="Goa Beach Background"
        className={styles.beachBgImg}
      />
      {/* Dark Radial Overlay */}
      <div className={styles.darkOverlay} />
      {/* Halftone Matrix Grid Overlay */}
      <div className={styles.matrixGrid} />
    </div>
  );
}
