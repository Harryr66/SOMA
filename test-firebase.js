// Simple Firebase connection test
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBi_3rG4Kn31tvjsXl6kB_C2iYZhdOEuO0",
  authDomain: "soma-social.firebaseapp.com",
  projectId: "soma-social",
  storageBucket: "soma-social.firebasestorage.app",
  messagingSenderId: "44064741792",
  appId: "1:44064741792:web:232214570fc8bc58dcecc5",
  measurementId: "G-KS591CG0QZ"
};

async function testConnection() {
  try {
    console.log('Testing Firebase connection...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Firebase initialized successfully');
    console.log('Project ID:', app.options.projectId);
    
    // Try to read from a collection
    const testDoc = doc(db, 'userProfiles', 'test');
    const docSnap = await getDoc(testDoc);
    
    console.log('✅ Database connection successful!');
    console.log('Document exists:', docSnap.exists());
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testConnection();
