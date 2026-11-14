import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const isConfigured = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'AQUÍ_TU_API_KEY' &&
  !firebaseConfig.apiKey.includes('AQUÍ');

export const app = isConfigured 
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;

export const db = app ? getFirestore(app) : null;

export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  if (!auth) {
    throw new Error('Firebase no está configurado. Por favor, completa tu archivo firebase-applet-config.json con las credenciales de tu proyecto de Firebase.');
  }

  const result = await signInWithPopup(auth, googleProvider);

  return result.user;
}

export async function logoutUser() {
  if (!auth) return;

  await signOut(auth);
}
