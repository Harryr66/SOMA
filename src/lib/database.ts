import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  onSnapshot, 
  writeBatch,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  User, 
  Follow, 
  Conversation, 
  Message, 
  Community, 
  CommunityPost, 
  Auction, 
  Bid, 
  Product, 
  Order, 
  CartItem, 
  Notification,
  Report,
  AnalyticsEvent
} from './types';

// User Management
export class UserService {
  static async createUser(userData: Partial<User>): Promise<string> {
    const userRef = await addDoc(collection(db, 'users'), {
      ...userData,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      isVerified: false,
      isProfessional: false,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return userRef.id;
  }

  static async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async searchUsers(searchTerm: string, limitCount: number = 20): Promise<User[]> {
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '>=', searchTerm),
      where('username', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }
}

// Following System
export class FollowService {
  static async followUser(followerId: string, followingId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Add to following collection
    batch.set(doc(db, 'users', followerId, 'following', followingId), {
      createdAt: serverTimestamp()
    });
    
    // Add to followers collection
    batch.set(doc(db, 'users', followingId, 'followers', followerId), {
      createdAt: serverTimestamp()
    });
    
    // Update follower counts
    batch.update(doc(db, 'users', followerId), {
      followingCount: increment(1)
    });
    
    batch.update(doc(db, 'users', followingId), {
      followerCount: increment(1)
    });
    
    await batch.commit();
  }

  static async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Remove from following collection
    batch.delete(doc(db, 'users', followerId, 'following', followingId));
    
    // Remove from followers collection
    batch.delete(doc(db, 'users', followingId, 'followers', followerId));
    
    // Update follower counts
    batch.update(doc(db, 'users', followerId), {
      followingCount: increment(-1)
    });
    
    batch.update(doc(db, 'users', followingId), {
      followerCount: increment(-1)
    });
    
    await batch.commit();
  }

  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const followDoc = await getDoc(doc(db, 'users', followerId, 'following', followingId));
    return followDoc.exists();
  }

  static async getFollowers(userId: string): Promise<User[]> {
    const followersSnapshot = await getDocs(collection(db, 'users', userId, 'followers'));
    const followerIds = followersSnapshot.docs.map(doc => doc.id);
    
    const followers: User[] = [];
    for (const followerId of followerIds) {
      const user = await UserService.getUser(followerId);
      if (user) followers.push(user);
    }
    
    return followers;
  }

  static async getFollowing(userId: string): Promise<User[]> {
    const followingSnapshot = await getDocs(collection(db, 'users', userId, 'following'));
    const followingIds = followingSnapshot.docs.map(doc => doc.id);
    
    const following: User[] = [];
    for (const followingId of followingIds) {
      const user = await UserService.getUser(followingId);
      if (user) following.push(user);
    }
    
    return following;
  }
}

// Messaging System
export class MessagingService {
  static async createConversation(participantIds: string[]): Promise<string> {
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      participants: participantIds,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      unreadCount: {}
    });
    return conversationRef.id;
  }

  static async sendMessage(
    conversationId: string, 
    senderId: string, 
    recipientId: string, 
    text: string,
    type: 'text' | 'image' | 'video' | 'file' = 'text',
    mediaUrl?: string
  ): Promise<string> {
    const messageRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId,
      recipientId,
      text,
      timestamp: serverTimestamp(),
      isRead: false,
      type,
      mediaUrl
    });

    // Update conversation last message
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: {
        text,
        senderId,
        timestamp: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });

    return messageRef.id;
  }

  static async getConversations(userId: string): Promise<Conversation[]> {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(conversationsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  }

  static async markAsRead(conversationId: string, userId: string): Promise<void> {
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(messagesQuery);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
  }
}

// Community System
export class CommunityService {
  static async createCommunity(communityData: Partial<Community>): Promise<string> {
    const communityRef = await addDoc(collection(db, 'communities'), {
      ...communityData,
      memberCount: 0,
      postCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return communityRef.id;
  }

  static async joinCommunity(communityId: string, userId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Add user to community members
    batch.set(doc(db, 'communities', communityId, 'members', userId), {
      joinedAt: serverTimestamp(),
      role: 'member'
    });
    
    // Update member count
    batch.update(doc(db, 'communities', communityId), {
      memberCount: increment(1)
    });
    
    await batch.commit();
  }

  static async leaveCommunity(communityId: string, userId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Remove user from community members
    batch.delete(doc(db, 'communities', communityId, 'members', userId));
    
    // Update member count
    batch.update(doc(db, 'communities', communityId), {
      memberCount: increment(-1)
    });
    
    await batch.commit();
  }

  static async createCommunityPost(postData: Partial<CommunityPost>): Promise<string> {
    const postRef = await addDoc(collection(db, 'communities', postData.communityId!, 'posts'), {
      ...postData,
      likes: 0,
      commentsCount: 0,
      isPinned: false,
      isLocked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update community post count
    await updateDoc(doc(db, 'communities', postData.communityId!), {
      postCount: increment(1)
    });

    return postRef.id;
  }

  static async getCommunities(limitCount: number = 20): Promise<Community[]> {
    const communitiesQuery = query(
      collection(db, 'communities'),
      where('isActive', '==', true),
      orderBy('memberCount', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(communitiesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community));
  }
}

// Auction System
export class AuctionService {
  static async createAuction(auctionData: Partial<Auction>): Promise<string> {
    const auctionRef = await addDoc(collection(db, 'auctions'), {
      ...auctionData,
      bidCount: 0,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return auctionRef.id;
  }

  static async placeBid(auctionId: string, bidderId: string, amount: number): Promise<string> {
    const batch = writeBatch(db);
    
    // Create bid
    const bidRef = doc(collection(db, 'auctions', auctionId, 'bids'));
    batch.set(bidRef, {
      bidderId,
      amount,
      timestamp: serverTimestamp(),
      isWinning: false,
      isAutoBid: false
    });
    
    // Update auction
    batch.update(doc(db, 'auctions', auctionId), {
      currentPrice: amount,
      bidCount: increment(1),
      updatedAt: serverTimestamp()
    });
    
    // Add participant if not already
    batch.set(doc(db, 'auctions', auctionId, 'participants', bidderId), {
      joinedAt: serverTimestamp()
    });
    
    await batch.commit();
    return bidRef.id;
  }

  static async getActiveAuctions(limitCount: number = 20): Promise<Auction[]> {
    const auctionsQuery = query(
      collection(db, 'auctions'),
      where('status', '==', 'active'),
      orderBy('endDate', 'asc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(auctionsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Auction));
  }

  static async getAuctionBids(auctionId: string): Promise<Bid[]> {
    const bidsQuery = query(
      collection(db, 'auctions', auctionId, 'bids'),
      orderBy('amount', 'desc')
    );
    
    const snapshot = await getDocs(bidsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bid));
  }
}

// Product/Shop System
export class ProductService {
  static async createProduct(productData: Partial<Product>): Promise<string> {
    const productRef = await addDoc(collection(db, 'products'), {
      ...productData,
      salesCount: 0,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return productRef.id;
  }

  static async addToCart(userId: string, productId: string, quantity: number = 1): Promise<void> {
    await setDoc(doc(db, 'users', userId, 'cart', productId), {
      productId,
      quantity,
      addedAt: serverTimestamp()
    });
  }

  static async removeFromCart(userId: string, productId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId, 'cart', productId));
  }

  static async getCart(userId: string): Promise<CartItem[]> {
    const cartSnapshot = await getDocs(collection(db, 'users', userId, 'cart'));
    return cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
  }

  static async createOrder(orderData: Partial<Order>): Promise<string> {
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return orderRef.id;
  }

  static async getProducts(category?: string, limitCount: number = 20): Promise<Product[]> {
    let productsQuery = query(
      collection(db, 'products'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (category) {
      productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(productsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }
}

// Notification System
export class NotificationService {
  static async createNotification(notificationData: Partial<Notification>): Promise<string> {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      isRead: false,
      createdAt: serverTimestamp()
    });
    return notificationRef.id;
  }

  static async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true
    });
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
  }
}

// Analytics System
export class AnalyticsService {
  static async trackEvent(event: string, properties: { [key: string]: any }, userId?: string): Promise<void> {
    await addDoc(collection(db, 'analytics'), {
      userId,
      event,
      properties,
      timestamp: serverTimestamp(),
      sessionId: this.getSessionId()
    });
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
}

// Search System
export class SearchService {
  static async searchUsers(searchTerm: string): Promise<User[]> {
    return UserService.searchUsers(searchTerm);
  }

  static async searchProducts(searchTerm: string, category?: string): Promise<Product[]> {
    let productsQuery = query(
      collection(db, 'products'),
      where('isActive', '==', true),
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff')
    );
    
    if (category) {
      productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        where('category', '==', category),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff')
      );
    }
    
    const snapshot = await getDocs(productsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  static async searchCommunities(searchTerm: string): Promise<Community[]> {
    const communitiesQuery = query(
      collection(db, 'communities'),
      where('isActive', '==', true),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    
    const snapshot = await getDocs(communitiesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community));
  }
}
