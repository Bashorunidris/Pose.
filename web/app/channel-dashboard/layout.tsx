import type { Metadata, Viewport } from 'next';

import './dashboard.css';

const DESCRIPTION =
  'Run your Pose channel — upload videos and seasons, track views and earnings, and manage payouts.';

export const metadata: Metadata = {
  title: 'Pose Channel Dashboard',
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#7C3AED',
};

export default function ChannelDashboardLayout({ children }: LayoutProps<'/channel-dashboard'>) {
  return children;
}
