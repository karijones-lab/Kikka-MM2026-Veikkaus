import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SINUN",
  authDomain: "SINUN",
  projectId: "SINUN",
  storageBucket: "SINUN",
  messagingSenderId: "SINUN",
  appId: "SINUN"
};

const app = initializeApp(firebaseConfig);

// 🔥 TÄRKEÄ LISÄYS
export const db = getFirestore(app, {
  experimentalForceLongPolling: true
});
