import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function createFirestore() {
  if (typeof window !== "undefined") {
    try {
      return initializeFirestore(app, {
        localCache: memoryLocalCache(),
      });
    } catch {
      // Already initialized (e.g. HMR) — return existing instance
      return getFirestore(app);
    }
  }
  return getFirestore(app);
}

export const db = createFirestore();

export const auth = typeof window !== "undefined" ? getAuth(app) : undefined;
export const googleProvider = new GoogleAuthProvider();

export default app;
