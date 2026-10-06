export type Song = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  duration: number;
  genre: string;
  country: string;
  audioUrl: string;
  streamCount: number;
  useCount: number;
  coverUrl: string;
  description?: string;
  pinned?: boolean;
  uploadDate?: string;
  collaborators?: Collaborator[];
};

export type Collaborator = {
  name: string;
  split: number;
};

export type Artist = {
  id: string;
  uid: string;
  name: string;
  email?: string;
  country: string;
  type: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  monthlyStreams?: number;
  bio?: string;
  isCreator?: boolean;
};

export type ViewName =
  | 'search'
  | 'signup'
  | 'dashboard'
  | 'upload'
  | 'catalogue'
  | 'profile';

export type ToastType = 'success' | 'error';
