// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

const AuthCtx = createContext(null);

// Providers (keep them outside component so they aren't recreated)
const googleProvider = new GoogleAuthProvider();
// Optional: force account chooser every time
googleProvider.setCustomParameters({ prompt: "select_account" });

const appleProvider = new OAuthProvider("apple.com");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  // Email / password
  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  // OAuth: Google
  async function loginWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  // OAuth: Apple
  async function loginWithApple() {
    await signInWithPopup(auth, appleProvider);
  }

  async function logout() {
    await signOut(auth);
  }

  const value = {
    user,
    initializing,
    // email/password
    login,
    register,
    // social providers
    loginWithGoogle,
    loginWithApple,
    // session
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
