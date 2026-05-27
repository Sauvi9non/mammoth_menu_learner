/**
 * 1회성 마이그레이션: src/data/mammoth_menu.json → Firestore menus 컬렉션
 *
 * 실행 전 준비:
 *   Firebase 콘솔 → Firestore → 규칙을 아래로 임시 변경 (5분짜리 작업)
 *
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /{document=**} {
 *         allow read, write: if true;   // ← 임시 개방
 *       }
 *     }
 *   }
 *
 * 실행:
 *   node scripts/migrate.mjs
 *
 * 완료 후:
 *   Firebase 콘솔에서 규칙을 아래로 되돌리세요:
 *
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /menus/{menuId} {
 *         allow read: if true;
 *         allow write: if request.auth != null;
 *       }
 *     }
 *   }
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Firebase config (클라이언트 키는 공개해도 안전 — 보안은 Security Rules가 담당)
const firebaseConfig = {
  apiKey: "AIzaSyDpcUp0PXMh_Anv10rCev0HwDsLnzHZcNs",
  authDomain: "mammoth-menu-learner.firebaseapp.com",
  projectId: "mammoth-menu-learner",
  storageBucket: "mammoth-menu-learner.firebasestorage.app",
  messagingSenderId: "470344094157",
  appId: "1:470344094157:web:5db550bbcb0559ecdfb484",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const raw = JSON.parse(
  readFileSync(join(__dirname, "../src/data/mammoth_menu.json"), "utf-8")
);

const menus = raw.menus;
const now = new Date().toISOString();

console.log(`총 ${menus.length}개 메뉴를 업로드합니다...`);

let count = 0;
for (const menu of menus) {
  await setDoc(doc(db, "menus", menu.name), {
    ...menu,
    verified: false,
    updated_at: now,
  });
  count++;
  process.stdout.write(`\r${count}/${menus.length} 완료`);
}

console.log("\n마이그레이션 완료!");
process.exit(0);
