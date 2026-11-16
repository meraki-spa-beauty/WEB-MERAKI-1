import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, type DocumentData } from 'firebase/firestore';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  readCachedGoogleProfile,
} from '../services/firebase';
import {
  fetchMyStaffAccess,
  isCentralOwnerEmail,
  testFirestoreConnection,
} from '../services/merakiFirestore';
import type { LoyaltyHistoryItem, StaffAccessEntry } from '../types';

export interface LoyaltyData {
  stamps: number;
  rewardsClaimed: number;
  history: LoyaltyHistoryItem[];
}

export interface AdminPermissions {
  isCentralOwner: boolean;
  isAuthorizedAdmin: boolean;
  canManageAgenda: boolean;
  canManageBookings: boolean;
  canStampVip: boolean;
  staffProfile: StaffAccessEntry | null;
}

export interface ActivateVipCardInput {
  displayName: string;
  email: string;
  phone: string;
  consentAccepted: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loyalty: LoyaltyData;
  profileName: string;
  profileEmail: string;
  profilePhone: string;
  hasVipCard: boolean;
  needsVipRegistration: boolean;
  dataConsentAccepted: boolean;
  adminPermissions: AdminPermissions;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  claimReward: () => Promise<boolean>;
  activateVipCard: (input: ActivateVipCardInput) => Promise<void>;
  updateMemberProfile: (displayName: string, phone: string, email?: string) => Promise<void>;
  isConfigured: boolean;
}

const DEFAULT_ADMIN_PERMISSIONS: AdminPermissions = {
  isCentralOwner: false,
  isAuthorizedAdmin: false,
  canManageAgenda: false,
  canManageBookings: false,
  canStampVip: false,
  staffProfile: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isLoyaltyArrayItem(value: LoyaltyHistoryItem | null | undefined): value is LoyaltyHistoryItem {
  return Boolean(value && value.service && value.date && value.id);
}

function readDocText(data: DocumentData, key: string): string {
  const raw = data[key];

  return Object.prototype.toString.call(raw) === '[object String]' ? String(raw).trim() : '';
}

function readDocBool(data: DocumentData, key: string): boolean {
  const raw = data[key];

  return Object.prototype.toString.call(raw) === '[object Boolean]' ? Boolean(raw) : false;
}

interface GoogleIdentity {
  email: string;
  displayName: string;
  photoURL: string;
}

async function resolveGoogleIdentity(firebaseUser: User): Promise<GoogleIdentity> {
  const cached = readCachedGoogleProfile(firebaseUser.uid);

  let email = (firebaseUser.email || cached?.email || '').trim();
  let displayName = (firebaseUser.displayName || cached?.displayName || '').trim();
  let photoURL = (firebaseUser.photoURL || cached?.photoURL || '').trim();

  for (const provider of firebaseUser.providerData) {
    if (!email && provider.email) {
      email = provider.email.trim();
    }

    if (!displayName && provider.displayName) {
      displayName = provider.displayName.trim();
    }

    if (!photoURL && provider.photoURL) {
      photoURL = provider.photoURL.trim();
    }
  }

  if (!email || !displayName) {
    try {
      const tokenRes = await firebaseUser.getIdTokenResult();

      if (!email && Object.prototype.toString.call(tokenRes.claims.email) === '[object String]') {
        email = String(tokenRes.claims.email).trim();
      }

      if (!displayName && Object.prototype.toString.call(tokenRes.claims.name) === '[object String]') {
        displayName = String(tokenRes.claims.name).trim();
      }

      if (!photoURL && Object.prototype.toString.call(tokenRes.claims.picture) === '[object String]') {
        photoURL = String(tokenRes.claims.picture).trim();
      }
    } catch {
      // Token claims fallback optional
    }
  }

  return {
    email: email.slice(0, 160),
    displayName: displayName.slice(0, 120),
    photoURL: photoURL.slice(0, 500),
  };
}

function parseLoyaltyFromDoc(raw: DocumentData): LoyaltyData {
  const safeHistory: LoyaltyHistoryItem[] = [];

  if (Array.isArray(raw.history)) {
    for (const item of raw.history) {
      if (isLoyaltyArrayItem(item)) {
        safeHistory.push({
          id: String(item.id || 'entry').slice(0, 64),
          date: String(item.date || '').slice(0, 40),
          service: String(item.service || 'Servicio Meraki').slice(0, 160),
          price: Math.max(0, Math.min(10000, Number(item.price || 0))),
        });
      }
    }
  }

  return {
    stamps: Math.max(0, Math.min(5, Math.round(Number(raw.stamps || 0)))),
    rewardsClaimed: Math.max(0, Math.round(Number(raw.rewardsClaimed || 0))),
    history: safeHistory,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [loyalty, setLoyalty] = useState<LoyaltyData>({
    stamps: 0,
    rewardsClaimed: 0,
    history: [],
  });

  const [profileName, setProfileName] = useState<string>('');
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [hasVipCard, setHasVipCard] = useState<boolean>(false);
  const [dataConsentAccepted, setDataConsentAccepted] = useState<boolean>(false);

  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions>(
    DEFAULT_ADMIN_PERMISSIONS,
  );

  const isConfigured = Boolean(auth);

  useEffect(() => {
    void testFirestoreConnection();

    if (!auth) {
      setLoading(false);

      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setLoyalty({ stamps: 0, rewardsClaimed: 0, history: [] });
        setProfileName('');
        setProfileEmail('');
        setProfilePhone('');
        setHasVipCard(false);
        setDataConsentAccepted(false);
        setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
        setLoading(false);

        return;
      }

      const googleIdentity = await resolveGoogleIdentity(firebaseUser);
      const effectiveEmail = firebaseUser.email || googleIdentity.email;
      const verifiedEmail = firebaseUser.emailVerified ? effectiveEmail : null;
      const centralOwner = isCentralOwnerEmail(verifiedEmail);

      if (centralOwner) {
        setAdminPermissions({
          isCentralOwner: true,
          isAuthorizedAdmin: true,
          canManageAgenda: true,
          canManageBookings: true,
          canStampVip: true,
          staffProfile: null,
        });
      } else if (verifiedEmail) {
        try {
          const staff = await fetchMyStaffAccess(verifiedEmail);

          if (staff && staff.isActive) {
            setAdminPermissions({
              isCentralOwner: false,
              isAuthorizedAdmin:
                staff.canManageAgenda || staff.canManageBookings || staff.canStampVip,
              canManageAgenda: staff.canManageAgenda,
              canManageBookings: staff.canManageBookings,
              canStampVip: staff.canStampVip,
              staffProfile: staff,
            });
          } else {
            setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
          }
        } catch {
          setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
        }
      } else {
        setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
      }

      let resolvedName = googleIdentity.displayName;
      let resolvedEmail = googleIdentity.email;
      let resolvedPhone = '';
      let docExists = false;
      let resolvedConsent = false;

      let loadedData: LoyaltyData = {
        stamps: 0,
        rewardsClaimed: 0,
        history: [],
      };

      if (db) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            docExists = true;
            const docData = docSnap.data();

            loadedData = parseLoyaltyFromDoc(docData);

            const existingName = readDocText(docData, 'displayName');
            const existingEmail = readDocText(docData, 'email');
            const existingPhone = readDocText(docData, 'phone');
            const existingConsent = readDocBool(docData, 'dataConsentAccepted');

            resolvedName =
              existingName && existingName !== 'Clienta VIP'
                ? existingName
                : googleIdentity.displayName || '';
            resolvedEmail = existingEmail || googleIdentity.email;
            resolvedPhone = existingPhone;
            resolvedConsent = existingConsent;
          }
        } catch (err) {
          console.warn('Could not fetch loyalty from Firestore:', err);
        }
      }

      setHasVipCard(docExists);
      setDataConsentAccepted(resolvedConsent);
      setProfileName(resolvedName);
      setProfileEmail(resolvedEmail);
      setProfilePhone(resolvedPhone);
      setLoyalty(loadedData);

      if (docExists) {
        localStorage.setItem(`meraki_loyalty_${firebaseUser.uid}`, JSON.stringify(loadedData));
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const needsVipRegistration = Boolean(
    user &&
      (!hasVipCard ||
        !dataConsentAccepted ||
        !profileName.trim() ||
        profileName.trim() === 'Clienta VIP' ||
        !profileEmail.trim()),
  );

  const login = async () => {
    const firebaseUser = await loginWithGoogle();

    setUser(firebaseUser);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setLoyalty({ stamps: 0, rewardsClaimed: 0, history: [] });
    setProfileName('');
    setProfileEmail('');
    setProfilePhone('');
    setHasVipCard(false);
    setDataConsentAccepted(false);
    setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
  };

  const activateVipCard = async (input: ActivateVipCardInput): Promise<void> => {
    if (!user) {
      throw new Error('Debes iniciar sesión con Google primero.');
    }

    const cleanName = input.displayName.trim().slice(0, 120);
    const cleanEmail = input.email.trim().toLowerCase().slice(0, 160);
    const cleanPhone = input.phone.trim().slice(0, 30);

    if (cleanName.length < 2 || cleanName === 'Clienta VIP') {
      throw new Error('Por favor ingresa tu nombre y apellido reales.');
    }

    if (cleanEmail.length < 5 || !cleanEmail.includes('@')) {
      throw new Error('Por favor ingresa un correo electrónico válido.');
    }

    if (!input.consentAccepted) {
      throw new Error('Debes aceptar el consentimiento de datos para activar tu tarjeta Club VIP.');
    }

    const consentIso = new Date().toISOString().slice(0, 40);
    const googleIdentity = await resolveGoogleIdentity(user);
    const photoURL = (user.photoURL || googleIdentity.photoURL || '').trim().slice(0, 500);

    let nextLoyalty = loyalty;

    if (db) {
      const userDocRef = doc(db, 'users', user.uid);

      if (hasVipCard) {
        await updateDoc(userDocRef, {
          email: cleanEmail,
          displayName: cleanName,
          phone: cleanPhone,
          photoURL,
          dataConsentAccepted: true,
          dataConsentAt: consentIso,
          updatedAt: serverTimestamp(),
        });
      } else {
        const welcomeHistory: LoyaltyHistoryItem[] = [
          {
            id: 'welcome',
            date: new Date().toLocaleDateString('es-PE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            service: 'Bienvenida a Meraki VIP',
            price: 0,
          },
        ];

        nextLoyalty = {
          stamps: 1,
          rewardsClaimed: 0,
          history: welcomeHistory,
        };

        await setDoc(userDocRef, {
          uid: user.uid,
          email: cleanEmail,
          displayName: cleanName,
          phone: cleanPhone,
          adminNote: '',
          photoURL,
          dataConsentAccepted: true,
          dataConsentAt: consentIso,
          stamps: 1,
          rewardsClaimed: 0,
          history: welcomeHistory,
          updatedAt: serverTimestamp(),
        });
      }
    }

    setHasVipCard(true);
    setDataConsentAccepted(true);
    setProfileName(cleanName);
    setProfileEmail(cleanEmail);
    setProfilePhone(cleanPhone);
    setLoyalty(nextLoyalty);
    localStorage.setItem(`meraki_loyalty_${user.uid}`, JSON.stringify(nextLoyalty));
  };

  const updateMemberProfile = async (
    displayName: string,
    phone: string,
    email?: string,
  ): Promise<void> => {
    if (!user) return;

    const cleanName = displayName.trim().slice(0, 120);
    const cleanPhone = phone.trim().slice(0, 30);
    const cleanEmail = (email ?? (profileEmail || user.email || '')).trim().toLowerCase().slice(0, 160);

    if (cleanName.length < 2 || cleanName === 'Clienta VIP') {
      throw new Error('Ingresa un nombre y apellido válido.');
    }

    if (cleanEmail.length < 5 || !cleanEmail.includes('@')) {
      throw new Error('Ingresa un correo electrónico válido.');
    }

    if (db) {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        photoURL: (user.photoURL || '').trim().slice(0, 500),
        dataConsentAccepted: true,
        dataConsentAt: new Date().toISOString().slice(0, 40),
        updatedAt: serverTimestamp(),
      });
    }

    setProfileName(cleanName);
    setProfileEmail(cleanEmail);
    setProfilePhone(cleanPhone);
    setDataConsentAccepted(true);
  };

  const claimReward = async (): Promise<boolean> => {
    if (!user || loyalty.stamps < 5) return false;

    const updatedRewards = loyalty.rewardsClaimed + 1;

    const redeemEntry: LoyaltyHistoryItem = {
      id: `redeem-${Date.now().toString(36)}`,
      date: new Date().toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      service: 'Canje de Beneficio Meraki VIP',
      price: 0,
    };

    const nextLoyalty: LoyaltyData = {
      stamps: 0,
      rewardsClaimed: updatedRewards,
      history: [redeemEntry, ...loyalty.history].slice(0, 100),
    };

    setLoyalty(nextLoyalty);
    localStorage.setItem(`meraki_loyalty_${user.uid}`, JSON.stringify(nextLoyalty));

    if (db) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          stamps: 0,
          rewardsClaimed: updatedRewards,
          history: nextLoyalty.history,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Could not sync reward claim to Firestore:', err);
      }
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loyalty,
        profileName,
        profileEmail,
        profilePhone,
        hasVipCard,
        needsVipRegistration,
        dataConsentAccepted,
        adminPermissions,
        login,
        logout,
        claimReward,
        activateVipCard,
        updateMemberProfile,
        isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
