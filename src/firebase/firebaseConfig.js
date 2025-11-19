// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ⬇️ Replace these values with the config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyBzXMYJUWx73Xv0B198JeUOdKxctXqKyPk",
  authDomain: "altar-pro.firebaseapp.com",
  projectId: "altar-pro",
  storageBucket: "altar-pro.firebasestorage.app",
  messagingSenderId: "814903743018",
  appId: "1:814903743018:web:264286182003fe16a16953"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
