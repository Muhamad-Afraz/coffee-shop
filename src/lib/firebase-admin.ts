import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let _app: App | undefined;
let _db: Firestore | undefined;
let _storage: Storage | undefined;

function ensureApp(): App {
  if (getApps().length > 0) return getApps()[0];
  if (_app) return _app;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-coffee-project";

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountRaw) {
    const parsed = JSON.parse(serviceAccountRaw);
    _app = initializeApp({
      credential: cert(parsed),
      projectId: parsed.project_id || projectId,
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${projectId}.firebasestorage.app`,
    });
  } else {
    _app = initializeApp({
      projectId,
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${projectId}.firebasestorage.app`,
    });
  }

  return _app;
}

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}

export function getStorageClient(): Storage {
  if (!_storage) _storage = getStorage(ensureApp());
  return _storage;
}

export function isFirebaseConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT;
}
