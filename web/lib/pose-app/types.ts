/**
 * Shapes of the Firestore documents the feed screens read. Field names are the
 * ones the legacy `index.html` app writes and reads, kept optional where the
 * older documents in production predate a field.
 */

export type FirestoreDate = unknown;

export type CustomAudio = {
  ownerProfilePic?: string;
  thumbnail?: string;
  image?: string;
  cover?: string;
};

export type PoseVideo = {
  id: string;
  videoUrl?: string;
  isPhoto?: boolean;
  type?: string;
  /** Photos and stories carry their still frame here instead of `videoUrl`. */
  imageUrl?: string;
  images?: string[];
  userId?: string;
  userName?: string;
  displayName?: string;
  name?: string;
  creatorName?: string;
  author?: string;
  verified?: boolean;
  userProfilePic?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  thumbnailURL?: string;
  coverImage?: string;
  caption?: string;
  hashtags?: string[];
  tags?: string[];
  customAudio?: CustomAudio;
  isUploadedFile?: boolean;
  likeCount?: number;
  likes?: number | Record<string, unknown>;
  comments?: number;
  commentCount?: number;
  viewCount?: number;
  views?: number;
  repostCount?: number;
  reposts?: number | Record<string, unknown>;
  shareCount?: number;
  createdAt?: FirestoreDate;
};

export type BuzzPost = {
  id: string;
  type?: string;
  date?: string;
  text?: string;
  hashtags?: string[];
  mediaUrl?: string;
  mediaType?: string;
  audioUrl?: string;
  audioName?: string;
  userId?: string;
  userName?: string;
  username?: string;
  name?: string;
  userProfilePic?: string;
  likes?: number;
  likedBy?: Record<string, unknown>;
  buzzhit?: number;
  buzzhitBy?: Record<string, unknown>;
  buzzpass?: number;
  buzzpassBy?: Record<string, unknown>;
  reposts?: number | Record<string, unknown>;
  repostedBy?: Record<string, unknown>;
  comments?: number;
  allowComments?: boolean;
  allowAds?: boolean;
  createdAt?: FirestoreDate;
};

export type TrendRow = { video: PoseVideo; likeCount: number };

export type TrendingDay = {
  label: string;
  rows: TrendRow[];
};

export type PoseChannel = {
  id: string;
  name?: string;
  channelName?: string;
  channelId?: string;
  avatar?: string;
  channelAvatar?: string;
  profilePic?: string;
  subscribers?: number;
  userId?: string;
};

export type PoseSeason = {
  id: string;
  title?: string;
  seasonName?: string;
  episodeCount?: number;
  status?: string;
  thumbnail?: string;
  createdAt?: FirestoreDate;
};

export type PoseEpisode = {
  id: string;
  title?: string;
  episodeNumber?: number;
  videoUrl?: string;
  thumbnail?: string;
  createdAt?: FirestoreDate;
};

export type PoseTabContent = {
  channels: PoseChannel[];
  videosByChannel: Record<string, PoseVideo[]>;
  seasonsByChannel: Record<string, PoseSeason[]>;
};

export type PoseNotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'message'
  | 'visit'
  | 'view'
  | 'pose';

export type PoseNotification = {
  id: string;
  type: PoseNotificationType | string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserUsername?: string;
  fromUserPic?: string;
  commentText?: string;
  preview?: string;
  message?: string;
  thumbUrl?: string;
  videoId?: string;
  commentId?: string;
  chatRoomId?: string;
  followedBack?: boolean;
  read?: boolean;
  createdAt?: FirestoreDate;
};

export type PoseUser = {
  id: string;
  name?: string;
  displayName?: string;
  username?: string;
  profilePicUrl?: string;
  userProfilePic?: string;
  photoURL?: string;
  bio?: string;
  followers?: number;
};
