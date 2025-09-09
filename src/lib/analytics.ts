import { getAnalytics, logEvent, setUserId, setUserProperties, Analytics } from 'firebase/analytics';
import { app } from './firebase';

// Initialize Firebase Analytics
let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && app) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
}

export class AnalyticsService {
  static trackEvent(eventName: string, parameters?: { [key: string]: any }) {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
    }
  }

  static setUserId(userId: string) {
    if (analytics) {
      setUserId(analytics, userId);
    }
  }

  static setUserProperties(properties: { [key: string]: any }) {
    if (analytics) {
      setUserProperties(analytics, properties);
    }
  }

  static trackPageView(pageName: string) {
    this.trackEvent('page_view', { page_name: pageName });
  }

  static trackUserAction(action: string, category: string, label?: string) {
    this.trackEvent('user_action', { action, category, label });
  }

  static trackArtworkView(artworkId: string, artistId: string) {
    this.trackEvent('artwork_view', { artwork_id: artworkId, artist_id: artistId });
  }

  static trackAuctionBid(auctionId: string, bidAmount: number) {
    this.trackEvent('auction_bid', { auction_id: auctionId, bid_amount: bidAmount });
  }

  static trackPurchase(productId: string, amount: number) {
    this.trackEvent('purchase', { product_id: productId, value: amount });
  }
}
