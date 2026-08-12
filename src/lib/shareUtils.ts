// ═══════════════════════════════════════════════════════
// HH GOA 2026 — SHARE UTILITIES
// Web Share API + X intent fallback
// ═══════════════════════════════════════════════════════

export function buildCaption(name: string, title: string, stack: string): string {
  return `Just got issued my HH Goa 2026 Builder ID 🏗️\n\n${title} · ${stack}\n\n${name} checking in. See you on the sand. 🌊\n\n#FrameInGoa #HHGoa2026`;
}

export async function shareToX(imageBlob: Blob, caption: string): Promise<boolean> {
  // Try Web Share API first (mobile-native experience)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([imageBlob], 'hh-goa-builder-id.png', { type: 'image/png' });
      const shareData: ShareData = {
        text: caption,
        files: [file],
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return true;
      }
    } catch (e) {
      // User cancelled or share failed — fall through to intent
      if (e instanceof Error && e.name === 'AbortError') {
        return false; // User cancelled
      }
    }
  }

  // Fallback: X intent URL (text only, no image attachment possible)
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
  window.open(intentUrl, '_blank', 'noopener,noreferrer');
  return true;
}

export function downloadImage(blob: Blob, filename: string = 'hh-goa-builder-id.png'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
