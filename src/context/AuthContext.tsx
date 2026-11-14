import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser } from '../services/firebase';

interface LoyaltyData {
  stamps: number;
  rewardsClaimed: number;
  history: { id: string; date: string; service: string; price: number }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loyalty: LoyaltyData;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addStamp: (serviceName: string, price: number) => void;
  claimReward: () => boolean;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [loyalty, setLoyalty] = useState<LoyaltyData>({
    stamps: 0,
    rewardsClaimed: 0,
    history: [],
  });

  const isConfigured = Boolean(auth);

  useEffect(() => {
    if (!auth) {
      setLoading(false);

      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        let loadedData: LoyaltyData | null = null;

        // Try loading from Firestore if db is available
        if (db) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
              // SAFETY: Firestore document data matches LoyaltyData interface contract
              loadedData = docSnap.data() as LoyaltyData;
            }
          } catch (err) {
            console.warn('Could not fetch loyalty from Firestore, falling back to localStorage:', err);
          }
        }

        // Fallback to localStorage if not in Firestore
        if (!loadedData) {
          const saved = localStorage.getItem(`meraki_loyalty_${firebaseUser.uid}`);

          if (saved) {
            try {
              loadedData = JSON.parse(saved);
            } catch {
              // fallback
            }
          }
        }

        if (loadedData) {
          setLoyalty(loadedData);
        } else {
          // Default initial loyalty for new user
          const defaultData: LoyaltyData = {
            stamps: 1, // 1 welcome stamp!
            rewardsClaimed: 0,
            history: [
              {
                id: 'welcome',
                date: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
                service: 'Bienvenida a Meraki VIP',
                price: 0,
              },
            ],
          };

          setLoyalty(defaultData);
          saveLoyaltyToCloudAndLocal(defaultData, firebaseUser.uid);
        }
      } else {
        setLoyalty({ stamps: 0, rewardsClaimed: 0, history: [] });
      }
    });

    return () => unsubscribe();
  }, []);

  const saveLoyaltyToCloudAndLocal = async (newData: LoyaltyData, userId?: string) => {
    setLoyalty(newData);

    const uid = userId || user?.uid;

    if (!uid) return;

    localStorage.setItem(`meraki_loyalty_${uid}`, JSON.stringify(newData));

    if (db) {
      try {
        const userDocRef = doc(db, 'users', uid);

        await setDoc(userDocRef, newData, { merge: true });
      } catch (err) {
        console.warn('Could not save loyalty to Firestore:', err);
      }
    }
  };

  const login = async () => {
    try {
      const firebaseUser = await loginWithGoogle();

      setUser(firebaseUser);
    } catch (err) {
      console.error('Error logging in:', err);
      throw err;
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setLoyalty({ stamps: 0, rewardsClaimed: 0, history: [] });
  };

  const addStamp = (serviceName: string, price: number) => {
    if (!user) return;

    const newStamps = Math.min(5, loyalty.stamps + 1);

    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
      service: serviceName,
      price,
    };

    const updated: LoyaltyData = {
      ...loyalty,
      stamps: newStamps,
      history: [newEntry, ...loyalty.history],
    };

    saveLoyaltyToCloudAndLocal(updated);
  };

  const claimReward = () => {
    if (!user || loyalty.stamps < 5) return false;

    const updated: LoyaltyData = {
      ...loyalty,
      stamps: 0,
      rewardsClaimed: loyalty.rewardsClaimed + 1,
    };

    saveLoyaltyToCloudAndLocal(updated);

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loyalty,
        login,
        logout,
        addStamp,
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
