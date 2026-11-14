import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../services/firebase';

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

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const saved = localStorage.getItem(`meraki_loyalty_${firebaseUser.uid}`);

        if (saved) {
          try {
            setLoyalty(JSON.parse(saved));
          } catch {
            // fallback
          }
        } else {
          // Default initial loyalty for new user
          setLoyalty({
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
          });
        }
      } else {
        setLoyalty({ stamps: 0, rewardsClaimed: 0, history: [] });
      }
    });

    return () => unsubscribe();
  }, []);

  const saveLoyalty = (newData: LoyaltyData, userId?: string) => {
    setLoyalty(newData);

    const uid = userId || user?.uid;

    if (uid) {
      localStorage.setItem(`meraki_loyalty_${uid}`, JSON.stringify(newData));
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

    saveLoyalty(updated);
  };

  const claimReward = () => {
    if (!user || loyalty.stamps < 5) return false;

    const updated: LoyaltyData = {
      ...loyalty,
      stamps: 0,
      rewardsClaimed: loyalty.rewardsClaimed + 1,
    };

    saveLoyalty(updated);

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
