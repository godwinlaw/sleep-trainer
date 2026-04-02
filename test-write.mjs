import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore/lite";
import * as dotenv from "dotenv";

dotenv.config();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

async function test() {
  try {
    console.log("Attempting to write to 'feeds'...");
    const docRef = await addDoc(collection(db, "feeds"), {
      test: true,
      timestamp: new Date().toISOString(),
    });
    console.log("Success! Wrote doc ID:", docRef.id);
    process.exit(0);
  } catch (e) {
    console.error("Write Error:", e);
    process.exit(1);
  }
}
test();
