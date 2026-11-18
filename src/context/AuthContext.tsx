import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  readCachedGoogleProfile,
} from '../services/firebase';
import {
  fetchClientVipProfile,
  fetchMyStaffAccess,
  isCentralOwnerEmail,
  redeemClientVipReward,
  saveClientVipProfileWithConsent,
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
          const existingProfile = await fetchClientVipProfile(firebaseUser.uid);

          if (existingProfile) {
            docExists = true;
            loadedData = {
              stamps: existingProfile.stamps,
              rewardsClaimed: existingProfile.rewardsClaimed,
              history: existingProfile.history,
            };

            const existingName = existingProfile.displayName.trim();

            resolvedName =
              existingName && existingName !== 'Clienta VIP'
                ? existingName
                : googleIdentity.displayName || '';
            resolvedEmail = existingProfile.email.trim() || googleIdentity.email;
            resolvedPhone = existingProfile.phone.trim();
            resolvedConsent = Boolean(existingProfile.dataConsentAccepted);
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

    const googleIdentity = await resolveGoogleIdentity(user);
    const photoURL = (user.photoURL || googleIdentity.photoURL || '').trim().slice(0, 500);

    let nextLoyalty = loyalty;

    if (db) {
      const savedProfile = await saveClientVipProfileWithConsent({
        uid: user.uid,
        email: cleanEmail,
        displayName: cleanName,
        phone: cleanPhone,
        photoURL,
      });

      nextLoyalty = {
        stamps: savedProfile.stamps,
        rewardsClaimed: savedProfile.rewardsClaimed,
        history: savedProfile.history,
      };
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

    const googleIdentity = await resolveGoogleIdentity(user);
    const photoURL = (user.photoURL || googleIdentity.photoURL || '').trim().slice(0, 500);

    if (db) {
      const savedProfile = await saveClientVipProfileWithConsent({
        uid: user.uid,
        email: cleanEmail,
        displayName: cleanName,
        phone: cleanPhone,
        photoURL,
      });

      const syncedLoyalty: LoyaltyData = {
        stamps: savedProfile.stamps,
        rewardsClaimed: savedProfile.rewardsClaimed,
        history: savedProfile.history,
      };

      setLoyalty(syncedLoyalty);
      localStorage.setItem(`meraki_loyalty_${user.uid}`, JSON.stringify(syncedLoyalty));
    }

    setHasVipCard(true);
    setProfileName(cleanName);
    setProfileEmail(cleanEmail);
    setProfilePhone(cleanPhone);
    setDataConsentAccepted(true);
  };

  const claimReward = async (): Promise<boolean> => {
    if (!user || loyalty.stamps < 5) return false;

    const googleIdentity = await resolveGoogleIdentity(user);
    const fallbackPhoto = (user.photoURL || googleIdentity.photoURL || '').trim().slice(0, 500);

    if (db) {
      try {
        const redeemed = await redeemClientVipReward({
          uid: user.uid,
          fallbackEmail: profileEmail || googleIdentity.email,
          fallbackDisplayName: profileName || googleIdentity.displayName || 'Clienta VIP',
          fallbackPhone: profilePhone,
          fallbackPhotoURL: fallbackPhoto,
        });

        if (redeemed) {
          const nextLoyalty: LoyaltyData = {
            stamps: redeemed.stamps,
            rewardsClaimed: redeemed.rewardsClaimed,
            history: redeemed.history,
          };

          setLoyalty(nextLoyalty);
          localStorage.setItem(`meraki_loyalty_${user.uid}`, JSON.stringify(nextLoyalty));

          return true;
        }
      } catch (err) {
        console.warn('Could not sync reward claim to Firestore:', err);

        return false;
      }
    }

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
