import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { app } from './firebase';

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

if (typeof window !== 'undefined' && app) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing messaging:', error);
  }
}

// VAPID key for push notifications
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'your-vapid-key';

export class MessagingService {
  static async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async getToken(): Promise<string | null> {
    if (!messaging) return null;
    
    try {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  static onMessage(callback: (payload: any) => void) {
    if (!messaging) return () => {};
    return onMessage(messaging, callback);
  }
}
