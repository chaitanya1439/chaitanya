import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ Correct import

const firebaseConfig = {
  apiKey: "AIzaSyAXt8laOXa8OYnHeFYu-QKSHGd1ovMK_6w",
  authDomain: "normal-2a466.firebaseapp.com",
  projectId: "normal-2a466",
  storageBucket: "normal-2a466.appspot.com",
  messagingSenderId: "864436503164",
  appId: "1:864436503164:web:ffced5de55be5a9c333ff9",
  measurementId: "G-E5JH4Z0PGX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
