/**
 * Shapes of the Firestore documents the feed screens read. Field names are the
 * ones the legacy `index.html` app writes and reads, kept optional where the
 * older documents in production predate a field.
 */

export type FirestoreDate = unknown;

/**
 * The sound a post was published with. `owner*` credits the sound's original
 * creator — which is not always the post author, because a reused sound keeps the
 * owner it was first published under, while `credit*` names the post author who
 * used it.
 */
export type CustomAudio = {
  id?: string;
  title?: string;
  artist?: string;
  thumbnail?: string;
  url?: string;
  duration?: number | string;
  image?: string;
  cover?: string;
  creditUser?: string;
  creditName?: string;
  creditUsername?: string;
  ownerUserId?: string;
  ownerUsername?: string;
  ownerName?: string;
  ownerProfilePic?: string;
  ownerVideoId?: string;
  songId?: string;
  isReusedSound?: boolean;
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
  /** The picker in `channeldashboard.html` writes the channel's genre here. */
  category?: string;
  /** Every spelling of the channel picture the legacy reads when it falls back. */
  profileURL?: string;
  photoURL?: string;
  profileImage?: string;
  profilePicture?: string;
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
  description?: string;
  episodeNumber?: number;
  /** A draft episode is filtered out of the season panel the way a video is. */
  status?: string;
  videoUrl?: string;
  thumbnail?: string;
  thumbnailURL?: string;
  thumbnailUrl?: string;
  duration?: string;
  /** A scheduled episode lists with an UPCOMING badge and does not play. */
  scheduledDate?: FirestoreDate;
  watchProgress?: number;
  coinPrice?: number;
  priceMode?: string;
  isPremium?: boolean;
  locked?: boolean;
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
