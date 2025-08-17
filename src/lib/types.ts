
export interface Artist {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
}
  
export interface Artwork {
    id:string;
    artist: Artist;
    title: string;
    imageUrl: string;
    imageAiHint: string;
    discussionId?: string;
    tags?: string[];
}

export interface Post {
    id: string;
    artworkId: string;
    artist: Artist;
    imageUrl: string;
    imageAiHint: string;
    caption: string;
    likes: number;
    commentsCount: number;
    timestamp: string;
    createdAt: number;
    discussionId?: string;
    listing?: {
        type: 'sale' | 'auction';
        endDate?: string;
    };
    resharedBy?: Artist;
}

export interface CaptionConfig {
  id: string;
  text: string;
  color: string;
  backgroundColor: string;
  hasBackground: boolean;
  x: number;
  y: number;
  fontSize: number;
  rotation?: number;
}

export interface StoryItem {
    id: string;
    artistId: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: number;
    captionConfigs?: CaptionConfig[];
    mediaConfig?: {
        scale: number;
        x: number;
        y: number;
        bgColor: string;
    };
}

export interface Story {
    id: string;
    artist: Artist;
}

export interface Event {
    id: string;
    title: string;
    imageUrl: string;
    imageAiHint: string;
    date: string;
    type: 'Auction' | 'Exhibition' | 'Workshop';
    artist: Artist;
    locationType: 'Online' | 'In-person';
    locationName?: string;
    locationAddress?: string;
    description: string;
    discussionId: string;
}

export interface ChatMessage {
    id: string;
    user: {
        name: string;
        avatarUrl?: string;
    };
    text: string;
    timestamp: string;
    isOwnMessage?: boolean;
}

export interface Reply {
    id: string;
    author: Artist;
    timestamp: string;
    content: string;
    upvotes: number;
    downvotes: number;
    isPinned?: boolean;
    replies?: Reply[];
    replyCount?: number;
}

export interface Discussion {
    id: string;
    title: string;
    author: Artist;
    timestamp: string;
    content: string;
    upvotes: number;
    downvotes: number;
    isPinned: boolean;
    replyCount: number;
    replies?: Reply[];
}

export interface Report {
  id: string;
  contentId: string;
  contentType: 'Artwork' | 'Discussion' | 'Reply' | 'Post';
  content: string; // The title or a snippet of the content
  reportedBy: string; // handle of reporter
  offenderId: string;
  offenderHandle: string;
  reason: string;
  details?: string;
  timestamp: string;
}
