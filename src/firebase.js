import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHCmGAL9Wl6VKhDynbpmicUS0bYc6ivwg",
  authDomain: "kikka-mm2026-kisaveikkaus.firebaseapp.com",
  databaseURL: "https://kikka-mm2026-kisaveikkaus-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kikka-mm2026-kisaveikkaus",
  storageBucket: "kikka-mm2026-kisaveikkaus.firebasestorage.app",
  messagingSenderId: "568046283394",
  appId: "1:568046283394:web:3a1ce9fc8d63253727629b",
  measurementId: "G-GPYDDEM424"
};

console.log("🔥 PROJECT ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);

// 🔥 timeout fix
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
