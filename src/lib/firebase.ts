// This is your master file for connecting to Firebase.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Temporary hardcoded configuration for testing
const firebaseConfig = {
  apiKey: "AIzaSyBi_3rG4Kn31tvjsXl6kB_C2iYZhdOEuO0",
  authDomain: "soma-social.firebaseapp.com",
  projectId: "soma-social",
  storageBucket: "soma-social.firebasestorage.app",
  messagingSenderId: "44064741792",
  appId: "1:44064741792:web:232214570fc8bc58dcecc5",
  measurementId: "G-KS591CG0QZ"
};

console.log('Firebase Config (hardcoded):', {
  apiKey: firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
});

// This is a more robust way to initialize Firebase in a Next.js environment.
// It prevents re-initializing the app on every hot-reload.
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase has been initialized from the central lib/firebase.ts file!");
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize and export Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
