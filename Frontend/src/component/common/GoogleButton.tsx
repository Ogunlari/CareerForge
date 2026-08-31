import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/features/api/baseApi';

const dashboardPaths: Record<string, string> = {
  student: '/student/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

export default function GoogleButton({ role = 'student' }: { role?: 'student' | 'recruiter' }) {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const onSuccess = async (response: CredentialResponse) => {
    setError(null);
    if (!response.credential) {
      setError('Google sign-in failed. No credential returned.');
      return;
    }
    const result = await signInWithGoogle(response.credential);
    if (result.error) {
      setError(result.error);
    } else {
      navigate(dashboardPaths[result.user?.role || role]);
    }
  };

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => setError('Google sign-in failed. Please try again.')}
        useOneTap={false}
        shape="pill"
        theme="outline"
        size="large"
        text={role === 'recruiter' ? 'signup_with' : 'continue_with'}
        width="100%"
      />
      {error && <p className="text-sm text-error-700 mt-2 text-center">{extractErrorMessage({ data: { message: error } })}</p>}
    </div>
  );
}
