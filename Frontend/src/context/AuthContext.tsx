import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { extractErrorMessage } from '@/features/api/baseApi';
import { authApi, useGetMeQuery, useLoginMutation, useLogoutMutation, useSignUpMutation } from '@/features/auth/authApi';
import { clearCredentials, setUser } from '@/features/auth/authSlice';
import type { Profile, UserRole } from '@/types';

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ error: string | null; user?: Profile }>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.accessToken);

  const [login] = useLoginMutation();
  const [signUpMutation] = useSignUpMutation();
  const [logoutMutation] = useLogoutMutation();

  const skipMe = !token;
  const { data: meData, isFetching: meFetching, error: meError } = useGetMeQuery(undefined, { skip: skipMe });

  useEffect(() => {
    if (meData?.user) {
      dispatch(setUser(meData.user));
    }
  }, [meData, dispatch]);

  useEffect(() => {
    if (meError) {
      dispatch(clearCredentials());
    }
  }, [meError, dispatch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: skipMe ? false : meFetching,

      async signIn(email, password, remember = false) {
        try {
          const data = await login({ email, password }).unwrap();
          if (!remember) {
            const handler = () => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            };
            window.addEventListener('beforeunload', handler);
          }
          return { error: null, user: data.user };
        } catch (err) {
          return { error: extractErrorMessage(err) };
        }
      },

      async signUp(email, password, name, role) {
        try {
          await signUpMutation({ email, password, name, role }).unwrap();
          return { error: null };
        } catch (err) {
          return { error: extractErrorMessage(err) };
        }
      },

      async signOut() {
        try {
          await logoutMutation().unwrap();
        } catch {
          dispatch(clearCredentials());
        }
      },

      async refreshUser() {
        if (!token) return;
        try {
          const result = await dispatch(
            authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
          );
          if ('data' in result && result.data?.user) {
            dispatch(setUser(result.data.user));
          }
        } catch {
          /* keep last known user */
        }
      },
    }),
    [user, skipMe, meFetching, login, signUpMutation, logoutMutation, dispatch, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
