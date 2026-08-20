import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentProfile, signIn as signInService, signOut as signOutService, signUp as signUpService } from '@/services/auth.service';
import type { Profile, UserRole } from '@/types';

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const profile = await getCurrentProfile();
        if (mounted) {
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to initialize auth session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user, error } = await signInService(email, password);
    if (!error && user) setUser(user);
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    const { user, error } = await signUpService(email, password, name, role);
    if (!error && user) setUser(user);
    return { error };
  };

  const signOut = async () => {
    await signOutService();
    setUser(null);
  };

  const refreshUser = async () => {
    const profile = await getCurrentProfile();
    setUser(profile);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}