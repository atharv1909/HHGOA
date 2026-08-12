import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HH Goa 2026 — Frame / Builder ID Generator',
  description:
    'Generate your official HH Goa 2026 Builder ID Card or PFP frame. Upload your photo, personalize your stack, download your graphic, and share to X with #FrameInGoa.',
  keywords: [
    'HH Goa 2026',
    'Hacker House Goa',
    'Frame Generator',
    'Builder ID',
    'FrameInGoa',
    '2:47 pm Studio',
  ],
  authors: [{ name: '2:47 pm Studio' }],
  openGraph: {
    title: 'HH Goa 2026 — Frame / Builder ID Generator',
    description:
      'Upload your photo and get issued your official HH Goa 2026 builder credential. Post on X with #FrameInGoa to rank on the W Celeb Radar.',
    url: 'https://hhgoa.com',
    siteName: 'HH Goa 2026',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HH Goa 2026 — Builder ID Generator',
    description: 'Get issued your official HH Goa 2026 builder credential.',
    creator: '@247pmstudio',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
