import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
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
  adminPermissions: AdminPermissions;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  claimReward: () => Promise<boolean>;
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

function parseLoyaltyFromDoc(raw: LoyaltyData): LoyaltyData {
  const safeHistory: LoyaltyHistoryItem[] = [];

  if (Array.isArray(raw.history)) {
    for (const item of raw.history) {
      if (isLoyaltyArrayItem(item)) {
        safeHistory.push({
          id: String(item.id || 'entry'),
          date: String(item.date || ''),
          service: String(item.service || 'Servicio Meraki'),
          price: Number(item.price || 0),
        });
      }
    }
  }

  return {
    stamps: Math.max(0, Math.min(5, Number(raw.stamps || 0))),
    rewardsClaimed: Math.max(0, Number(raw.rewardsClaimed || 0)),
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
        setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
        setLoading(false);

        return;
      }

      // Compute role / permissions for central owner or active Pancake-style staff member
      const verifiedEmail = firebaseUser.emailVerified ? firebaseUser.email : null;
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

      // Load or create loyalty profile in Firestore (with safe localStorage fallback)
      let loadedData: LoyaltyData | null = null;

      if (db) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            // SAFETY: Firestore document data conforms to LoyaltyData contract
            loadedData = parseLoyaltyFromDoc(docSnap.data() as LoyaltyData);

            // Keep display profile synced without modifying stamps or history
            try {
              await updateDoc(userDocRef, {
                email: (firebaseUser.email || '').slice(0, 160),
                displayName: (firebaseUser.displayName || 'Clienta VIP').slice(0, 120),
                photoURL: (firebaseUser.photoURL || '').slice(0, 500),
                updatedAt: serverTimestamp(),
              });
            } catch {
              // Ignore sync errors
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
                email: (firebaseUser.email || '').slice(0, 160),
                displayName: (firebaseUser.displayName || 'Clienta VIP').slice(0, 120),
                photoURL: (firebaseUser.photoURL || '').slice(0, 500),
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
            loadedData = parseLoyaltyFromDoc(JSON.parse(saved) as LoyaltyData);
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
    setAdminPermissions(DEFAULT_ADMIN_PERMISSIONS);
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
        adminPermissions,
        login,
        logout,
        claimReward,
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
