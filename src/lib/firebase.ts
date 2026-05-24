import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBtPSr3Ky2_p3YqEqPEnxxW-vDfuNJrfJ4",
  authDomain: "orchids-44f86.firebaseapp.com",
  databaseURL: "https://orchids-44f86-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "orchids-44f86",
  storageBucket: "orchids-44f86.firebasestorage.app",
  messagingSenderId: "456597052380",
  appId: "1:456597052380:web:67d40b8e2485205f1ccd19"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const messagingPromise = isSupported().then(yes => yes ? getMessaging(app) : null);
export const rtdb = getDatabase(app);
