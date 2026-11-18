import { FirebaseError, initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAdditionalUserInfo,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type ParsedToken,
} from 'firebase/auth';
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

googleProvider.addScope('openid');

googleProvider.addScope('profile');

googleProvider.addScope('email');

googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface CachedGoogleIdentity {
  email: string;
  displayName: string;
  photoURL: string;
}

const memoryGoogleCache = new Map<string, CachedGoogleIdentity>();

function readTokenClaim(claims: ParsedToken, key: string): string {
  const val = claims[key];

  return Object.prototype.toString.call(val) === '[object String]' ? String(val).trim() : '';
}

export function readCachedGoogleProfile(uid: string): CachedGoogleIdentity | null {
  const inMem = memoryGoogleCache.get(uid);

  if (inMem) return inMem;

  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(`meraki_google_identity_${uid}`);

    if (!raw) return null;

    // SAFETY: JSON string written by cacheGoogleProfile below
    const parsed = JSON.parse(raw) as CachedGoogleIdentity;

    if (parsed && (parsed.email || parsed.displayName)) {
      memoryGoogleCache.set(uid, parsed);

      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function cacheGoogleProfile(uid: string, identity: CachedGoogleIdentity): void {
  memoryGoogleCache.set(uid, identity);

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(`meraki_google_identity_${uid}`, JSON.stringify(identity));
    } catch {
      // Ignore storage quota errors
    }
  }
}

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
    const additionalInfo = getAdditionalUserInfo(result);
    const profileMap = new Map<string, string>();

    if (additionalInfo?.profile) {
      for (const [k, v] of Object.entries(additionalInfo.profile)) {
        if (Object.prototype.toString.call(v) === '[object String]') {
          profileMap.set(k, String(v).trim());
        }
      }
    }

    let tokenEmail = '';
    let tokenName = '';
    let tokenPhoto = '';

    try {
      const tokenRes = await result.user.getIdTokenResult();

      tokenEmail = readTokenClaim(tokenRes.claims, 'email');
      tokenName = readTokenClaim(tokenRes.claims, 'name');
      tokenPhoto = readTokenClaim(tokenRes.claims, 'picture');
    } catch {
      // Token claims fallback optional
    }

    const providerEmail = result.user.providerData.find((p) => Boolean(p.email))?.email?.trim() || '';
    const providerName = result.user.providerData.find((p) => Boolean(p.displayName))?.displayName?.trim() || '';
    const providerPhoto = result.user.providerData.find((p) => Boolean(p.photoURL))?.photoURL?.trim() || '';

    const fullGivenFamily = [profileMap.get('given_name') || '', profileMap.get('family_name') || '']
      .filter(Boolean)
      .join(' ')
      .trim();

    const resolvedEmail = (
      result.user.email ||
      providerEmail ||
      profileMap.get('email') ||
      tokenEmail
    ).trim().slice(0, 160);

    const resolvedName = (
      result.user.displayName ||
      providerName ||
      profileMap.get('name') ||
      fullGivenFamily ||
      tokenName
    ).trim().slice(0, 120);

    const resolvedPhoto = (
      result.user.photoURL ||
      providerPhoto ||
      profileMap.get('picture') ||
      tokenPhoto
    ).trim().slice(0, 500);

    cacheGoogleProfile(result.user.uid, {
      email: resolvedEmail,
      displayName: resolvedName,
      photoURL: resolvedPhoto,
    });

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
