import type { Metadata, Viewport } from 'next';

import './room.css';

const DESCRIPTION =
  'Host your Pose Live room — run chat, gifts, donations and moderation while you are on air.';

export const metadata: Metadata = {
  title: 'Pose Live — Host Room',
  description: DESCRIPTION,
  // The room is per-session and reached from the setup flow, so it stays out of search.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#06060a',
};

export default function PoseLiveRoomLayout({ children }: LayoutProps<'/pose-live/room'>) {
  return children;
}
