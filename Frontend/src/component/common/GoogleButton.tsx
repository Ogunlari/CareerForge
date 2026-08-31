import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/features/api/baseApi';
import Modal from '@/component/common/Modal';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: (callback?: unknown) => void;
        };
      };
    };
  }
}

const dashboardPaths: Record<string, string> = {
  student: '/student/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

let gsiInitialized = false;
let gsiLoadPromise: Promise<void> | null = null;

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGsiScript(): Promise<void> {
  if (gsiLoadPromise) return gsiLoadPromise;
  gsiLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Google identity script.')));
      }
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google identity script.'));
    document.head.appendChild(script);
  });
  gsiLoadPromise.catch(() => {
    gsiLoadPromise = null;
  });
  return gsiLoadPromise;
}

function ensureGsiInitialized(callback: (credentialResponse: { credential?: string }) => void) {
  if (!gsiInitialized && window.google?.accounts?.id) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback,
    });
    gsiInitialized = true;
  }
}

interface CredentialResponse {
  credential?: string;
  clientId?: string;
  select_by?: string;
}

export default function GoogleButton({ role = 'student' }: { role?: 'student' | 'recruiter' }) {
  const { signInWithGoogle, checkGoogleUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loadingRole, setLoadingRole] = useState<'student' | 'recruiter' | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const completeSignIn = useCallback(async (credential: string, chosenRole?: 'student' | 'recruiter') => {
    setError(null);
    const result = await signInWithGoogle(credential, chosenRole);
    if (result.error) {
      setError(result.error);
    } else {
      navigate(dashboardPaths[result.user?.role || role]);
    }
  }, [signInWithGoogle, navigate, role]);

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setError(null);
    const { exists } = await checkGoogleUser(credential);
    if (!exists) {
      setPendingCredential(credential);
      setShowRoleModal(true);
    } else {
      await completeSignIn(credential);
    }
  }, [checkGoogleUser, completeSignIn]);

  const onCredential = useCallback((response: CredentialResponse) => {
    if (!response.credential) {
      setError('Google sign-in failed. No credential returned.');
      return;
    }
    handleGoogleCredential(response.credential);
  }, [handleGoogleCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    ensureGsiInitialized(onCredential);

    loadGsiScript()
      .then(() => {
        if (cancelled) return;
        ensureGsiInitialized(onCredential);
        if (window.google?.accounts?.id && buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: role === 'recruiter' ? 'signup_with' : 'continue_with',
            shape: 'pill',
            useOneTap: false,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Google sign-in failed to load.');
      });

    return () => {
      cancelled = true;
    };
  }, [role, onCredential]);

  const chooseRole = async (chosenRole: 'student' | 'recruiter') => {
    if (!pendingCredential) return;
    setLoadingRole(chosenRole);
    setError(null);
    await completeSignIn(pendingCredential, chosenRole);
    setShowRoleModal(false);
    setPendingCredential(null);
    setLoadingRole(null);
  };

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full flex justify-center" />
      {error && <p className="text-sm text-error-700 mt-2 text-center">{extractErrorMessage({ data: { message: error } })}</p>}

      <Modal open={showRoleModal} onClose={() => { setShowRoleModal(false); setPendingCredential(null); }} title="How do you want to use CareerForge?" size="sm">
        <p className="text-sm text-slate-500 mb-4">Almost done! Choose an account type so we can set you up correctly.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => chooseRole('student')}
            disabled={loadingRole !== null}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all disabled:opacity-50"
          >
            <GraduationCap className="w-6 h-6" />
            <span className="text-sm font-semibold">Job Seeker</span>
          </button>
          <button
            type="button"
            onClick={() => chooseRole('recruiter')}
            disabled={loadingRole !== null}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all disabled:opacity-50"
          >
            <Building2 className="w-6 h-6" />
            <span className="text-sm font-semibold">Recruiter</span>
          </button>
        </div>
        {loadingRole && (
          <p className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Creating your account...
          </p>
        )}
      </Modal>
    </div>
  );
}
