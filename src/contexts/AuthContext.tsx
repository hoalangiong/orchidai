import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      }, (err) => {
        console.error('[Auth] onAuthStateChanged error:', err);
        setError(err.message);
        setLoading(false);
      });
    } catch (err: any) {
      console.error('[Auth] Firebase init error:', err);
      setError(err.message || 'Firebase initialization failed');
      setLoading(false);
    }

    // Timeout fallback: if loading takes more than 10s, stop waiting
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Auth timeout - proceeding without auth');
        setLoading(false);
      }
    }, 10000);

    return () => {
      unsubscribe?.();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor plugin for native platforms
      const result = await FirebaseAuthentication.signInWithGoogle();
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      await signInWithCredential(auth, credential);
    } else {
      // Use popup for web
      const { signInWithPopup } = await import('firebase/auth');
      const { googleProvider } = await import('../lib/firebase');
      await signInWithPopup(auth, googleProvider);
    }
  };

  const logout = async () => {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
