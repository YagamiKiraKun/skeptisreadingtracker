import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDyACADGW1yDe5wiu-8TZXB-z6OoDuRG4",
  authDomain: "readingtracker-fe4d6.firebaseapp.com",
  projectId: "readingtracker-fe4d6",
  storageBucket: "readingtracker-fe4d6.firebasestorage.app",
  messagingSenderId: "315669085665",
  appId: "1:315669085665:web:da668142f8d490de64e6a0",
  measurementId: "G-GWJ3L1S7BF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Tambahkan try...catch untuk menangani pop-up yang diblokir atau dibatalkan pengguna
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      alert('Pop-up login diblokir oleh browser. Harap izinkan pop-up untuk situs ini.');
    } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      // Abaikan jika user menutup jendela login secara sengaja
      console.warn('Login Google dibatalkan atau jendela pop-up ditutup.');
    } else {
      console.error('Error saat login:', error);
    }
  }
};

export const logoutUser = () => signOut(auth);