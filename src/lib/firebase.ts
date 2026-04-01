import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';

// Import the Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4UjFwg5YceYJGnWs_h5eC1XmWdjXatWQ",
  authDomain: "aaspaas-app.firebaseapp.com",
  projectId: "aaspaas-app-308f7",
  storageBucket: "aaspaas-app-308f7.firebasestorage.app",
  messagingSenderId: "707938822578",
  appId: "1:707938822578:web:744ae846622ca988bddcab",
  measurementId: "G-TQE75EQ7ZJ"
};

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    
  } catch (error: any) {
    console.error("Sign in error:", error);
    // Re-throw to be handled by the UI
    throw error;
  }
};
export const logOut = () => signOut(auth);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export { 
  collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, onAuthStateChanged
};
