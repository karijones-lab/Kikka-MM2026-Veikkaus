import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SINUN",
  authDomain: "SINUN",
  projectId: "SINUN",
  storageBucket: "SINUN",
  messagingSenderId: "SINUN",
  appId: "SINUN"
};

const app = initializeApp(firebaseConfig);

// 🔥 TÄRKEÄ: EI extra options tähän
export const db = getFirestore(app);
