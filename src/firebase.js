import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SINUN",
  authDomain: "SINUN",
  projectId: "SINUN",
  storageBucket: "SINUN",
  messagingSenderId: "SINUN",
  appId: "SINUN"
};

const app = initializeApp(firebaseConfig);

// 🔥 TÄMÄ ON OIKEA FIX
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});
