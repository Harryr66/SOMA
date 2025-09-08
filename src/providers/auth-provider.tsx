
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { idbGetAvatar } from '@/lib/idb';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isProfessional: boolean;
  setIsProfessional: React.Dispatch<React.SetStateAction<boolean>>;
  isTipJarEnabled: boolean;
  setIsTipJarEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  hasCustomAvatar: boolean;
  setHasCustomAvatar: React.Dispatch<React.SetStateAction<boolean>>;
  profileRingColor: string | null;
  setProfileRingColor: (color: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isProfessional: false,
  setIsProfessional: () => {},
  isTipJarEnabled: false,
  setIsTipJarEnabled: () => {},
  avatarUrl: null,
  setAvatarUrl: () => {},
  hasCustomAvatar: false,
  setHasCustomAvatar: () => {},
  profileRingColor: null,
  setProfileRingColor: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrlState] = useState<string | null>(null);
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false);
  const [isProfessional, setIsProfessional] = useState(false);
  const [isTipJarEnabled, setIsTipJarEnabled] = useState(false);
  const [profileRingColor, setProfileRingColorState] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Set a shorter timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Firebase auth timeout - proceeding without authentication');
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeoutId);
      setUser(user);
      if (user) {
        // Load user-specific settings from localStorage
        const savedProf = localStorage.getItem(`isProfessional-${user.uid || "demo-user"}`);
        setIsProfessional(savedProf ? JSON.parse(savedProf) : false);

        const savedTipJar = localStorage.getItem(`isTipJarEnabled-${user.uid || "demo-user"}`);
        setIsTipJarEnabled(savedTipJar ? JSON.parse(savedTipJar) : false);

        // Centralized avatar loading logic
        const storedAvatar = await idbGetAvatar(user.uid || "demo-user");
        if (storedAvatar) {
          setAvatarUrlState(URL.createObjectURL(storedAvatar));
          setHasCustomAvatar(true);
        } else {
          setAvatarUrlState(null);
          setHasCustomAvatar(false);
        }
        // Load ring color
        const color = localStorage.getItem(`profileRingColor-${user.uid || "demo-user"}`);
        setProfileRingColorState(color);

      } else {
        // Clear state on logout
        setIsProfessional(false);
        setIsTipJarEnabled(false);
        setAvatarUrlState(null);
        setHasCustomAvatar(false);
        setProfileRingColorState(null);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Firebase auth error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
      // Show user-friendly error message
      toast({
        title: "Authentication Error",
        description: "Please check if Firebase Authentication is enabled in your project.",
        variant: "destructive",
      });
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Persist changes to localStorage for the current user
  useEffect(() => {
    if (user) {
      localStorage.setItem(`isProfessional-${user.uid || "demo-user"}`, JSON.stringify(isProfessional));
    }
  }, [isProfessional, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`isTipJarEnabled-${user.uid || "demo-user"}`, JSON.stringify(isTipJarEnabled));
    }
  }, [isTipJarEnabled, user]);

  const setAvatarUrl = (url: string | null) => {
    setAvatarUrlState(url);
  };
  
  const setProfileRingColor = (color: string | null) => {
    if (user) {
      if (color) {
        localStorage.setItem(`profileRingColor-${user.uid || "demo-user"}`, color);
      } else {
        localStorage.removeItem(`profileRingColor-${user.uid || "demo-user"}`);
      }
      setProfileRingColorState(color);
      toast({
        title: 'Profile Ring Updated!',
        description: 'Your new profile ring color has been saved.',
      });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isProfessional, setIsProfessional, isTipJarEnabled, setIsTipJarEnabled, avatarUrl, setAvatarUrl, hasCustomAvatar, setHasCustomAvatar, profileRingColor, setProfileRingColor }}>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
