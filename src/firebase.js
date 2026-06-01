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

// 🔥 tämä ratkaisee timeoutin
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
