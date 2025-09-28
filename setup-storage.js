// Script to help set up Firebase Storage
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyBi_3rG4Kn31tvjsXl6kB_C2iYZhdOEuO0",
  authDomain: "soma-social.firebaseapp.com",
  projectId: "soma-social",
  storageBucket: "soma-social.firebasestorage.app",
  messagingSenderId: "44064741792",
  appId: "1:44064741792:web:232214570fc8bc58dcecc5",
  measurementId: "G-KS591CG0QZ"
};

try {
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  console.log('✅ Firebase Storage initialized successfully!');
  console.log('Storage bucket:', storage.bucket);
} catch (error) {
  console.error('❌ Firebase Storage initialization failed:', error.message);
  console.log('\n🔧 Manual setup required:');
  console.log('1. Go to https://console.firebase.google.com/project/soma-social/storage');
  console.log('2. Click "Get Started" to initialize Firebase Storage');
  console.log('3. Choose your storage location (preferably us-central1)');
  console.log('4. Choose security rules (start in test mode)');
  console.log('5. Run this script again after setup');
}
