import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, type DocumentData } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser } from '../services/firebase';
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loyalty: LoyaltyData;
  profileName: string;
  profileEmail: string;
  profilePhone: string;
  adminPermissions: AdminPermissions;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  claimReward: () => Promise<boolean>;
  updateMemberProfile: (displayName: string, phone: string) => Promise<void>;
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

interface GoogleIdentity {
  email: string;
  displayName: string;
  photoURL: string;
}

function extractGoogleIdentity(firebaseUser: User): GoogleIdentity {
  let email = (firebaseUser.email || '').trim();
  let displayName = (firebaseUser.displayName || '').trim();
  let photoURL = (firebaseUser.photoURL || '').trim();

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
        setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
        setLoading(false);

        return;
      }

      const googleIdentity = extractGoogleIdentity(firebaseUser);
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

      let loadedData: LoyaltyData | null = null;
      let resolvedName = googleIdentity.displayName || 'Clienta VIP';
      let resolvedEmail = googleIdentity.email;
      let resolvedPhone = '';

      if (db) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const docData = docSnap.data();

            loadedData = parseLoyaltyFromDoc(docData);

            const existingName = readDocText(docData, 'displayName');
            const existingEmail = readDocText(docData, 'email');
            const existingPhone = readDocText(docData, 'phone');
            const existingPhoto = readDocText(docData, 'photoURL');

            resolvedName =
              existingName && existingName !== 'Clienta VIP'
                ? existingName
                : googleIdentity.displayName || existingName || 'Clienta VIP';
            resolvedEmail = existingEmail || googleIdentity.email;
            resolvedPhone = existingPhone;

            const resolvedPhoto = googleIdentity.photoURL || existingPhoto;

            if (
              resolvedEmail !== existingEmail ||
              resolvedName !== existingName ||
              resolvedPhoto !== existingPhoto
            ) {
              try {
                await updateDoc(userDocRef, {
                  email: resolvedEmail.slice(0, 160),
                  displayName: resolvedName.slice(0, 120),
                  phone: resolvedPhone.slice(0, 30),
                  photoURL: resolvedPhoto.slice(0, 500),
                  updatedAt: serverTimestamp(),
                });
              } catch {
                // Keep existing stored values if schema has legacy fields handled by admin sync
              }
            }
          } else {
            const initialLoyalty: LoyaltyData = {
              stamps: 1,
              rewardsClaimed: 0,
              history: [
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
              ],
            };

            loadedData = initialLoyalty;

            try {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: resolvedEmail.slice(0, 160),
                displayName: resolvedName.slice(0, 120),
                phone: '',
                adminNote: '',
                photoURL: googleIdentity.photoURL.slice(0, 500),
                stamps: 1,
                rewardsClaimed: 0,
                history: initialLoyalty.history,
                updatedAt: serverTimestamp(),
              });
            } catch (writeErr) {
              console.warn('Could not initialize loyalty profile in Firestore:', writeErr);
            }
          }
        } catch (err) {
          console.warn('Could not fetch loyalty from Firestore, falling back to localStorage:', err);
        }
      }

      if (!loadedData) {
        const saved = localStorage.getItem(`meraki_loyalty_${firebaseUser.uid}`);

        if (saved) {
          try {
            // SAFETY: Parsed from localStorage stored by this provider
            loadedData = parseLoyaltyFromDoc(JSON.parse(saved) as DocumentData);
          } catch {
            loadedData = null;
          }
        }
      }

      const finalLoyalty = loadedData ?? {
        stamps: 1,
        rewardsClaimed: 0,
        history: [
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
        ],
      };

      setProfileName(resolvedName);
      setProfileEmail(resolvedEmail);
      setProfilePhone(resolvedPhone);
      setLoyalty(finalLoyalty);
      localStorage.setItem(`meraki_loyalty_${firebaseUser.uid}`, JSON.stringify(finalLoyalty));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
  };

  const updateMemberProfile = async (displayName: string, phone: string): Promise<void> => {
    if (!user) return;

    const cleanName = displayName.trim().slice(0, 120) || 'Clienta VIP';
    const cleanPhone = phone.trim().slice(0, 30);

    if (db) {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: cleanName,
        phone: cleanPhone,
        email: (profileEmail || user.email || '').trim().slice(0, 160),
        photoURL: (user.photoURL || '').trim().slice(0, 500),
        updatedAt: serverTimestamp(),
      });
    }

    setProfileName(cleanName);
    setProfilePhone(cleanPhone);
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
        adminPermissions,
        login,
        logout,
        claimReward,
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
