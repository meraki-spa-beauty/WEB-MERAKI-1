import { FirebaseError, initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const isConfigured =
  Boolean(firebaseConfig?.apiKey) &&
  firebaseConfig.apiKey !== 'AQUÍ_TU_API_KEY' &&
  !firebaseConfig.apiKey.includes('AQUÍ');

export const app = isConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;

export const db = app ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : null;

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

function mapFirebaseAuthCodeToMessage(code: string, fallbackMessage: string): string {
  switch (code) {
    case 'auth/unauthorized-domain': {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'este dominio';

      return `El dominio "${host}" aún no está autorizado en Firebase. Agrégalo en Firebase Console → Authentication → Configuración → Dominios autorizados.`;
    }

    case 'auth/operation-not-allowed':
      return 'El inicio de sesión con Google aún no está habilitado en tu consola de Firebase (Authentication → Sign-in method → Google).';

    case 'auth/popup-blocked':
      return 'Tu navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes e inténtalo nuevamente.';

    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Se cerró la ventana de inicio de sesión antes de completar el acceso.';

    case 'auth/network-request-failed':
      return 'Sin conexión a internet. Verifica tu red e inténtalo de nuevo.';

    default:
      return fallbackMessage;
  }
}

export async function loginWithGoogle() {
  if (!auth) {
    throw new Error(
      'Firebase no está configurado. Por favor, completa tu archivo firebase-applet-config.json con las credenciales de tu proyecto de Firebase.',
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);

    return result.user;
  } catch (err) {
    if (err instanceof FirebaseError) {
      throw new Error(mapFirebaseAuthCodeToMessage(err.code, err.message));
    }

    if (err instanceof Error) {
      throw err;
    }

    throw new Error('Error al iniciar sesión con Google.');
  }
}

export async function logoutUser() {
  if (!auth) return;

  await signOut(auth);
}
