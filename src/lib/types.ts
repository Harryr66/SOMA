export interface Artist {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  followerCount: number;
  followingCount: number;
  createdAt: Date;
  isVerified?: boolean;
  isProfessional?: boolean;
  location?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Artwork {
  id: string;
  artist: Artist;
  title: string;
  description?: string;
  imageUrl: string;
  imageAiHint: string;
  discussionId?: string;
  tags: string[];
  price?: number;
  currency?: string;
  isForSale?: boolean;
  isAuction?: boolean;
  auctionId?: string;
  category?: string;
  medium?: string;
  dimensions?: {
    width: number;
    height: number;
    unit: 'cm' | 'in' | 'px';
  };
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  likes?: number;
  isAI?: boolean;
  aiAssistance?: 'none' | 'assisted' | 'generated';
  processExplanation?: string;
  materialsList?: string;
  supportingImages?: string[];
  supportingVideos?: string[];
  statement?: string;
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
  tags?: string[];
  location?: string;
  isAI?: boolean;
  aiAssistance?: 'none' | 'assisted' | 'generated';
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
  views?: number;
  expiresAt: number;
}

export interface Story {
  id: string;
  artist: Artist;
  items: StoryItem[];
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
  attendees?: string[];
  maxAttendees?: number;
  price?: number;
  currency?: string;
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
  tags?: string[];
  category?: string;
  isLocked?: boolean;
  isSticky?: boolean;
}

export interface Report {
  id: string;
  contentId: string;
  contentType: 'Artwork' | 'Discussion' | 'Reply' | 'Post' | 'User' | 'Community';
  content: string;
  reportedBy: string;
  offenderId: string;
  offenderHandle: string;
  reason: string;
  details?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
}

// New types for production features

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isProfessional: boolean;
  isActive: boolean;
  lastSeen?: Date;
  artistType?: string;
  isTipJarEnabled?: boolean;
  profileRingColor?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
    tiktok?: string;
  };
  preferences?: {
    notifications: {
      likes: boolean;
      comments: boolean;
      follows: boolean;
      messages: boolean;
      auctions: boolean;
    };
    privacy: {
      showEmail: boolean;
      showLocation: boolean;
      allowMessages: boolean;
    };
  };
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  unreadCount?: { [userId: string]: number };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  replyTo?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  memberCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  isActive: boolean;
  rules?: string[];
  tags?: string[];
  category?: string;
  location?: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  author: Artist;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  likes: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLocked: boolean;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  artworkId: string;
  sellerId: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  winnerId?: string;
  bidCount: number;
  imageUrl: string;
  category?: string;
  tags?: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
  isAutoBid: boolean;
  maxBid?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  sellerId: string;
  price: number;
  currency: string;
  category: string;
  tags?: string[];
  images: string[];
  isDigital: boolean;
  isPhysical: boolean;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  salesCount: number;
  rating: number;
  reviewCount: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: 'cm' | 'in';
  };
  weight?: number;
  shippingInfo?: {
    freeShipping: boolean;
    shippingCost: number;
    estimatedDays: number;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'auction' | 'order' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  imageUrl?: string;
}

export interface SearchResult {
  type: 'user' | 'artwork' | 'post' | 'community' | 'auction' | 'product';
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  relevance: number;
  data: any;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  event: string;
  properties: { [key: string]: any };
  timestamp: Date;
  sessionId?: string;
}

export interface UserActivity {
  userId: string;
  lastActive: Date;
  totalSessions: number;
  totalTime: number;
  pagesVisited: string[];
  actionsPerformed: { [action: string]: number };
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface ModerationAction {
  id: string;
  adminId: string;
  targetType: 'user' | 'post' | 'artwork' | 'community' | 'auction';
  targetId: string;
  action: 'warn' | 'suspend' | 'ban' | 'delete' | 'approve' | 'reject';
  reason: string;
  duration?: number; // in days for suspensions
  createdAt: Date;
  expiresAt?: Date;
}
