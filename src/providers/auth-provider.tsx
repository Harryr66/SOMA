'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  avatarUrl: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore using userProfiles collection
          const userDoc = await getDoc(doc(db, 'userProfiles', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              id: firebaseUser.uid,
              username: userData.handle || '',
              email: firebaseUser.email || '',
              displayName: userData.name || userData.displayName || firebaseUser.displayName || '',
              avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
              bio: userData.bio || '',
              website: userData.website || '',
              location: userData.location || '',
              followerCount: userData.followerCount || userData.followers?.length || 0,
              followingCount: userData.followingCount || userData.following?.length || 0,
              postCount: userData.postCount || 0,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              isVerified: userData.isVerified || false,
              isProfessional: userData.isProfessional || false,
              isActive: userData.isActive !== false,
              lastSeen: userData.lastSeen?.toDate(),
              artistType: userData.artistType || '',
              isTipJarEnabled: userData.isTipJarEnabled || false,
              profileRingColor: userData.profileRingColor || '#3b82f6',
              socialLinks: userData.socialLinks || {},
              preferences: userData.preferences || {
                notifications: {
                  likes: true,
                  comments: true,
                  follows: true,
                  messages: true,
                  auctions: true
                },
                privacy: {
                  showEmail: false,
                  showLocation: false,
                  allowMessages: true
                }
              }
            };
            setUser(user);
            setAvatarUrl(user.avatarUrl || null);
          } else {
            // User document doesn't exist, create a basic user object
            const user: User = {
              id: firebaseUser.uid,
              username: firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || '',
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              avatarUrl: firebaseUser.photoURL || undefined,
              bio: '',
              website: '',
              location: '',
              followerCount: 0,
              followingCount: 0,
              postCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              isVerified: false,
              isProfessional: false,
              isActive: true,
              lastSeen: new Date(),
              artistType: '',
              isTipJarEnabled: false,
              profileRingColor: '#3b82f6',
              socialLinks: {},
              preferences: {
                notifications: {
                  likes: true,
                  comments: true,
                  follows: true,
                  messages: true,
                  auctions: true
                },
                privacy: {
                  showEmail: false,
                  showLocation: false,
                  allowMessages: true
                }
              }
            };
            setUser(user);
            setAvatarUrl(user.avatarUrl || null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If Firestore is offline, create a basic user object from Firebase Auth data
          if ((error as any)?.code === 'unavailable' || (error as any)?.message?.includes('offline')) {
            console.log('Firestore offline, creating basic user from Firebase Auth data');
            const basicUser: User = {
              id: firebaseUser.uid,
              username: firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || 'user',
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              avatarUrl: firebaseUser.photoURL || undefined,
              bio: '',
              website: '',
              location: '',
              followerCount: 0,
              followingCount: 0,
              postCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              isVerified: false,
              isProfessional: false,
              isActive: true,
              lastSeen: new Date(),
              artistType: '',
              isTipJarEnabled: false,
              profileRingColor: '#3b82f6',
              socialLinks: {},
              preferences: {
                notifications: {
                  likes: true,
                  comments: true,
                  follows: true,
                  messages: true,
                  auctions: true
                },
                privacy: {
                  showEmail: false,
                  showLocation: false,
                  allowMessages: true
                }
              }
            };
            setUser(basicUser);
            setAvatarUrl(basicUser.avatarUrl || null);
          } else {
            setUser(null);
            setAvatarUrl(null);
          }
        }
      } else {
        setUser(null);
        setAvatarUrl(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        // Get user data from Firestore using userProfiles collection
        const userDoc = await getDoc(doc(db, 'userProfiles', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const user: User = {
            id: firebaseUser.uid,
            username: userData.handle || '',
            email: firebaseUser.email || '',
            displayName: userData.name || userData.displayName || firebaseUser.displayName || '',
            avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
            bio: userData.bio || '',
            website: userData.website || '',
            location: userData.location || '',
            followerCount: userData.followerCount || userData.followers?.length || 0,
            followingCount: userData.followingCount || userData.following?.length || 0,
            postCount: userData.postCount || 0,
            createdAt: userData.createdAt?.toDate() || new Date(),
            updatedAt: userData.updatedAt?.toDate() || new Date(),
            isVerified: userData.isVerified || false,
            isProfessional: userData.isProfessional || false,
            isActive: userData.isActive !== false,
            lastSeen: userData.lastSeen?.toDate(),
            artistType: userData.artistType || '',
            isTipJarEnabled: userData.isTipJarEnabled || false,
            profileRingColor: userData.profileRingColor || '#3b82f6',
            socialLinks: userData.socialLinks || {},
            preferences: userData.preferences || {
              notifications: {
                likes: true,
                comments: true,
                follows: true,
                messages: true,
                auctions: true
              },
              privacy: {
                showEmail: false,
                showLocation: false,
                allowMessages: true
              }
            }
          };
          setUser(user);
          setAvatarUrl(user.avatarUrl || null);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
        // If Firestore is offline, keep the existing user data
        if ((error as any)?.code === 'unavailable' || (error as any)?.message?.includes('offline')) {
          console.log('Firestore offline during refresh, keeping existing user data');
        }
      }
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    avatarUrl,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
