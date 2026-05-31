import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "PASTE",
  authDomain: "PASTE",
  projectId: "PASTE",
  storageBucket: "PASTE",
  messagingSenderId: "PASTE",
  appId: "PASTE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);