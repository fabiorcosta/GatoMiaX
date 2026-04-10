// Firebase Configuration
// Valores reais devem ser preenchidos no .env.local
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

// Start in mock/prototype mode if no API key is provided
const isConfigured = !!firebaseConfig.apiKey;

const app = isConfigured && !getApps().length ? initializeApp(firebaseConfig) : ({} as any);
export const db = isConfigured ? getFirestore(app) : ({} as any);
export const auth = isConfigured ? getAuth(app) : ({} as any);
export default app;
