export type LiveMode = 'video' | 'voice' | 'chat' | 'gaming';

/** A `live_sessions/{sid}` doc as the feed reads it. */
export type LiveSession = {
  id: string;
  mode: LiveMode;
  hostUid: string;
  hostName: string;
  title: string;
  viewerCount: number;
  status: string;
};

export const LIVE_MODES: readonly LiveMode[] = ['video', 'voice', 'chat', 'gaming'];

/** Modes whose CTA is still locked; only voice and chat reach the setup page. */
export const COMING_SOON_MODES: readonly LiveMode[] = ['video', 'gaming'];

export const LIVE_TARGET_USERS = 5000;
