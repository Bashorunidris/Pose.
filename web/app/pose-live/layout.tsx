import type { Metadata, Viewport } from 'next';

const DESCRIPTION =
  'Go live and watch African creators on Pose — video streams, voice rooms, live chat, and gaming broadcasts.';

export const metadata: Metadata = {
  title: 'Pose Live — Go Live & Watch Creators',
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  // Canonical stays on the legacy URL until the port replaces poselivevisual.html.
  alternates: { canonical: 'https://www.poseweb.site/poselivevisual.html' },
  openGraph: {
    type: 'website',
    url: 'https://www.poseweb.site/poselivevisual.html',
    siteName: 'Pose',
    title: 'Pose Live — Go Live & Watch Creators',
    description: DESCRIPTION,
    images: [{ url: 'https://www.poseweb.site/logo-512.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pose Live — Go Live & Watch Creators',
    description: DESCRIPTION,
    images: ['https://www.poseweb.site/logo-512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#06060a',
};

export default function PoseLiveLayout({ children }: LayoutProps<'/pose-live'>) {
  return children;
}
