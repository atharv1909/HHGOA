'use client';

import { useState, useTransition } from 'react';
import UploadZone from '@/components/UploadZone';
import CardPreview from '@/components/CardPreview';
import FrameSelector from '@/components/FrameSelector';
import BuilderForm, { BuilderData } from '@/components/BuilderForm';
import ResultScreen from '@/components/ResultScreen';
import BeachBackground from '@/components/BeachBackground';
import { ProcessedImage, PhotoFilterMode, processImage } from '@/lib/imageProcessor';
import { ImageTransform } from '@/components/PhotoEditor';
import { getFrame } from '@/lib/frames';
import { generateBuilderId } from '@/lib/idGenerator';
import { exportCard } from '@/lib/canvasExporter';
import styles from '@/styles/page.module.css';

type Step = 'upload' | 'edit' | 'result';

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [image, setImage] = useState<ProcessedImage | null>(null);
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilterMode>('natural');
  const [selectedFrameId, setSelectedFrameId] = useState<string>('goa-genesis');
  const [builderId] = useState<string>(() => generateBuilderId());

  const [formData, setFormData] = useState<BuilderData>({
    name: '',
    stack: '',
    title: '',
    format: 'builder-id',
    socials: {},
  });

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleImageReady = (processed: ProcessedImage) => {
    setImage(processed);
    setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    setStep('edit');
  };

  const handleLoadDemo = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext('2d')!;

      const grad = ctx.createLinearGradient(0, 0, 800, 800);
      grad.addColorStop(0, '#004D34');
      grad.addColorStop(0.5, '#FF007A');
      grad.addColorStop(1, '#FFF78C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 800);

      ctx.fillStyle = '#021a14';
      ctx.beginPath();
      ctx.arc(400, 320, 160, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(400, 800, 320, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFF78C';
      ctx.fillRect(300, 290, 80, 45);
      ctx.fillRect(420, 290, 80, 45);
      ctx.fillRect(375, 305, 50, 8);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      const sampleFile = new File([blob], 'demo-builder.png', { type: 'image/png' });
      const processed = await processImage(sampleFile);
      handleImageReady(processed);
    } catch (e) {
      console.error('Demo image load error', e);
    }
  };

  const handleGenerate = () => {
    if (!image) return;

    startTransition(async () => {
      try {
        const frame = getFrame(selectedFrameId);
        const blob = await exportCard({
          image: image.bitmap,
          imageTransform: transform,
          filter: selectedFilter,
          frame,
          format: formData.format,
          name: formData.name || 'ANONYMOUS BUILDER',
          stack: formData.stack || 'BUILDER',
          title: formData.title || 'SIGNAL ARCHITECT',
          builderId,
          socials: formData.socials,
        });
        setResultBlob(blob);
        setStep('result');
      } catch (err) {
        console.error('Export failed', err);
        alert('Failed to generate image. Please try again.');
      }
    });
  };

  const handleReset = () => {
    setStep('upload');
    setImage(null);
    setResultBlob(null);
  };

  const frame = getFrame(selectedFrameId);

  // Step Wizard click actions
  const handleWizardClick = (targetStep: Step) => {
    if (targetStep === 'upload') {
      setStep('upload');
    } else if (targetStep === 'edit') {
      if (!image) {
        handleLoadDemo();
      } else {
        setStep('edit');
      }
    } else if (targetStep === 'result') {
      if (resultBlob) {
        setStep('result');
      } else if (image) {
        handleGenerate();
      } else {
        handleLoadDemo().then(() => handleGenerate());
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Side Palm Trees & Sun Glow Vector Background */}
      <BeachBackground />

      {/* Infinite Animated Marquee Ticker */}
      <div className="marqueeContainer" style={{ zIndex: 10, position: 'relative' }}>
        <div className="marqueeTrack">
          <div className="marqueeContent">
            <span>✦ HACKER HOUSE GOA 2026</span>
            <span>✦ GOA, INDIA · 28-31 OCT 2026</span>
            <span>✦ 2:47 PM STUDIO</span>
            <span>✦ LESS NOISE. MORE SIGNAL.</span>
            <span>✦ #FRAMEINGOA</span>
            <span>✦ 247 BUILDER SEATS</span>
            <span>✦ HACKER HOUSE GOA 2026</span>
            <span>✦ GOA, INDIA · 28-31 OCT 2026</span>
            <span>✦ 2:47 PM STUDIO</span>
            <span>✦ LESS NOISE. MORE SIGNAL.</span>
            <span>✦ #FRAMEINGOA</span>
            <span>✦ 247 BUILDER SEATS</span>
          </div>
        </div>
      </div>

      {/* Header with Clickable Logo Buttons returning to Home */}
      <header className={styles.header} style={{ zIndex: 10, position: 'relative' }}>
        {/* Top Left: 2:47 PM Studio Logo Button */}
        <button
          onClick={handleReset}
          className={styles.logoBtn}
          title="Return to Home Page"
          aria-label="Return to Home Page"
        >
          <img
            src="/brand/studio-logo.png"
            alt="2:47 PM STUDIO"
            className={styles.studioLogoImg}
          />
        </button>

        {/* Top Right: Hacker House Goa Logo Button */}
        <button
          onClick={handleReset}
          className={styles.logoBtn}
          title="Return to Home Page"
          aria-label="Return to Home Page"
        >
          <img
            src="/brand/hacker-house-logo.png"
            alt="HACKER GOA HOUSE"
            className={styles.mainLogoImg}
          />
        </button>
      </header>

      {/* Interactive Step Wizard Progress Bar */}
      <nav className={styles.wizardBar} aria-label="Creation progress" style={{ zIndex: 10, position: 'relative' }}>
        <button
          className={`${styles.wizardStepBtn} ${
            step === 'upload' ? styles.wizardStepActive : styles.wizardStepDone
          }`}
          onClick={() => handleWizardClick('upload')}
          title="Jump to Step 1: Upload Photo"
        >
          1. Upload Photo
        </button>
        <button
          className={`${styles.wizardStepBtn} ${
            step === 'edit'
              ? styles.wizardStepActive
              : step === 'result'
              ? styles.wizardStepDone
              : ''
          }`}
          onClick={() => handleWizardClick('edit')}
          title="Jump to Step 2: Customize Identity"
        >
          2. Customize
        </button>
        <button
          className={`${styles.wizardStepBtn} ${
            step === 'result' ? styles.wizardStepActive : ''
          }`}
          onClick={() => handleWizardClick('result')}
          title="Jump to Step 3: Issue Pass"
        >
          3. Issue Pass
        </button>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection} style={{ zIndex: 10, position: 'relative' }}>
        <h1 className={styles.heroHeadline}>
          {step === 'result'
            ? 'Your Builder Pass is Issued.'
            : 'one photo. one frame. everything in place.'}
        </h1>
        <p className={styles.heroSubtitle}>
          {step === 'upload' &&
            'Drop in a picture and get issued an official HH Goa 2026 builder badge or profile frame in seconds.'}
          {step === 'edit' &&
            'Position your photo, pick a photo filter & frame style, and customize your builder credentials.'}
          {step === 'result' &&
            'Download your high-res graphic or share to X with #FrameInGoa to rank on the W Celeb Radar.'}
        </p>
      </section>

      {/* Main Workspace */}
      <main className={styles.mainContainer} style={{ zIndex: 10, position: 'relative' }}>
        {step === 'upload' && (
          <UploadZone onImageReady={handleImageReady} />
        )}

        {step === 'edit' && image && (
          <>
            <CardPreview
              image={image}
              transform={transform}
              onChangeTransform={setTransform}
              filter={selectedFilter}
              frame={frame}
              format={formData.format}
              name={formData.name}
              stack={formData.stack}
              title={formData.title}
              builderId={builderId}
              socials={formData.socials}
            />

            <FrameSelector
              selectedId={selectedFrameId}
              onSelect={setSelectedFrameId}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
            />

            <BuilderForm data={formData} onChange={setFormData} />

            <div className={styles.generateBar}>
              <button
                className={styles.generateBtn}
                onClick={handleGenerate}
                disabled={isPending}
              >
                {isPending ? 'Generating Pass...' : '⚡ Issue My Builder Pass'}
              </button>
            </div>
          </>
        )}

        {step === 'result' && resultBlob && (
          <ResultScreen
            imageBlob={resultBlob}
            name={formData.name || 'Builder'}
            title={formData.title || 'Signal Architect'}
            stack={formData.stack || 'Developer'}
            format={formData.format}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Extended Showcase Section */}
      <section className={styles.showcaseSection} style={{ zIndex: 10, position: 'relative' }}>
        <div className={styles.showcaseCard}>
          <img
            src="/brand/goa_sunset_beach_hd.png"
            alt="Goa Beach Residency"
            className={styles.showcaseImg}
          />
          <div className={styles.showcaseContent}>
            <h3 className={styles.showcaseTitle}>4 days. one rhythm. everything intentional.</h3>
            <p className={styles.showcaseText}>
              From October 28–31, 2026, 500 elite builders lock in on the sand in Goa. High-speed fiber, ocean views, and pure signal. Frame your build, claim your legacy, and get ranked on the W Celeb Radar.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Marquee Ticker */}
      <div className="marqueeContainer" style={{ marginTop: 'auto', zIndex: 10, position: 'relative' }}>
        <div className="marqueeTrack">
          <div className="marqueeContent">
            <span>✦ SHIP FROM PARADISE</span>
            <span>✦ 500 ELITE BUILDERS</span>
            <span>✦ HIGH-SPEED FIBER & OCEAN AT YOUR DOORSTEP</span>
            <span>✦ LOCK IN AND BUILD YOUR LEGACY</span>
            <span>✦ #FRAMEINGOA</span>
            <span>✦ SHIP FROM PARADISE</span>
            <span>✦ 500 ELITE BUILDERS</span>
            <span>✦ HIGH-SPEED FIBER & OCEAN AT YOUR DOORSTEP</span>
            <span>✦ LOCK IN AND BUILD YOUR LEGACY</span>
            <span>✦ #FRAMEINGOA</span>
          </div>
        </div>
      </div>

      {/* Official Interactive Footer Banner */}
      <footer className={styles.footerBannerContainer} style={{ zIndex: 10, position: 'relative' }}>
        <div className={styles.footerBannerInner}>
          {/* Main Serif Title */}
          <img
            src="/brand/hacker-house-logo.png"
            alt="HACKER GOA HOUSE"
            className={styles.footerTitleImg}
          />
          <span className={styles.footerSubtitle}>
            GOA, INDIA · 28 – 31 OCT 2026 · 2:47 PM STUDIO
          </span>

          {/* Interactive Clickable Links Grid */}
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <a
                href="https://x.com/247pmstudio"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLinkRow}
              >
                <span className={styles.footerLinkIcon}>𝕏</span>
                <span>@247PMSTUDIO</span>
              </a>
              <a
                href="https://t.me/twofourtysevenpm"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLinkRow}
              >
                <span className={styles.footerLinkIcon}>✈</span>
                <span>@TWOFOURTYSEVENPM</span>
              </a>
              <a
                href="mailto:satapathyprayasu@gmail.com"
                className={styles.footerLinkRow}
              >
                <span className={styles.footerLinkIcon}>✉</span>
                <span>SATAPATHYPRAYASU@GMAIL.COM</span>
              </a>
            </div>

            <div className={styles.footerRightCol}>
              <a
                href="https://hacker-house-goa-2026.devfolio.co/"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLinkRow}
              >
                <span>BRAND KIT ↗</span>
              </a>
              <a
                href="https://hhgoa.com/terms"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLinkRow}
              >
                <span>TERM & CONDITIONS ↗</span>
              </a>
              <a
                href="https://hhgoa.com/radar"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLinkRow}
              >
                <span>W CELEB RADAR ↗</span>
              </a>
            </div>
          </div>

          <p className={styles.copyrightText}>
            © 2026 HH-GOA. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
