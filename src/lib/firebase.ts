import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase 클라이언트 키는 공개해도 안전 — 보안은 Firestore Security Rules가 담당
const firebaseConfig = {
  apiKey: "AIzaSyDpcUp0PXMh_Anv10rCev0HwDsLnzHZcNs",
  authDomain: "mammoth-menu-learner.firebaseapp.com",
  projectId: "mammoth-menu-learner",
  storageBucket: "mammoth-menu-learner.firebasestorage.app",
  messagingSenderId: "470344094157",
  appId: "1:470344094157:web:5db550bbcb0559ecdfb484",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
