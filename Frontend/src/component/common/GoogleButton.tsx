import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { GraduationCap, Building2, Loader2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/features/api/baseApi';
import Modal from '@/component/common/Modal';

const dashboardPaths: Record<string, string> = {
  student: '/student/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

export default function GoogleButton({ role = 'student' }: { role?: 'student' | 'recruiter' }) {
  const { signInWithGoogle, checkGoogleUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loadingRole, setLoadingRole] = useState<'student' | 'recruiter' | null>(null);

  const handleGoogleCredential = async (credential: string) => {
    setError(null);
    const { exists } = await checkGoogleUser(credential);
    if (!exists) {
      setPendingCredential(credential);
      setShowRoleModal(true);
    } else {
      await completeSignIn(credential);
    }
  };

  const onSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Google sign-in failed. No credential returned.');
      return;
    }
    await handleGoogleCredential(response.credential);
  };

  const completeSignIn = async (credential: string, chosenRole?: 'student' | 'recruiter') => {
    setError(null);
    const result = await signInWithGoogle(credential, chosenRole);
    if (result.error) {
      setError(result.error);
    } else {
      navigate(dashboardPaths[result.user?.role || role]);
    }
  };

  const chooseRole = async (chosenRole: 'student' | 'recruiter') => {
    if (!pendingCredential) return;
    setLoadingRole(chosenRole);
    setError(null);
    await completeSignIn(pendingCredential, chosenRole);
    setShowRoleModal(false);
    setPendingCredential(null);
    setLoadingRole(null);
  };

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  const googleBtnStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  };

  return (
    <div className="w-full">
      <div style={googleBtnStyle}>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => setError('Google sign-in failed. Please try again.')}
          useOneTap={false}
          shape="pill"
          theme="outline"
          size="large"
          text={role === 'recruiter' ? 'signup_with' : 'continue_with'}
        />
      </div>
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
