console.log("🔥 PROJECT ID:", firebaseConfig.projectId);
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SINUN",
  authDomain: "SINUN",
  projectId: "SINUN",
  storageBucket: "SINUN",
  messagingSenderId: "SINUN",
  appId: "SINUN"
};

const app = initializeApp(firebaseConfig);

// 🔥 timeout fix
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
