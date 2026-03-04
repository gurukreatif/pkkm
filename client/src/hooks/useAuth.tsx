// src/hooks/useAuth.tsx — Firebase Auth
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FBUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Ambil atau buat profil user di Firestore collection 'users'
async function getUserProfile(fbUser: FBUser): Promise<User> {
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { uid: fbUser.uid, email: fbUser.email!, ...snap.data() } as User;
  }
  // Default: role operator jika belum ada profil
  const profile: User = {
    uid: fbUser.uid,
    email: fbUser.email!,
    displayName: fbUser.displayName || fbUser.email!.split('@')[0],
    role: 'operator',
  };
  await setDoc(ref, { displayName: profile.displayName, role: profile.role });
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(cred.user);
    setUser(profile);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
