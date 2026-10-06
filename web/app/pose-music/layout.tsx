import type { Metadata, Viewport } from 'next';

const DESCRIPTION =
  'Discover and use sounds for Pose videos. Browse creator music, trending tracks, and royalty tools built for African creators.';

export const metadata: Metadata = {
  title: 'Pose Music — Sound for Creators',
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.poseweb.site/posemusic.html' },
  openGraph: {
    type: 'website',
    url: 'https://www.poseweb.site/posemusic.html',
    siteName: 'Pose',
    title: 'Pose Music — Sound for Creators',
    description:
      'Discover and use sounds for Pose videos. Music and royalty tools built for African creators.',
    images: [{ url: 'https://www.poseweb.site/logo-512.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pose Music — Sound for Creators',
    description:
      'Discover and use sounds for Pose videos. Music and royalty tools built for African creators.',
    images: ['https://www.poseweb.site/logo-512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function PoseMusicLayout({ children }: LayoutProps<'/pose-music'>) {
  return children;
}
