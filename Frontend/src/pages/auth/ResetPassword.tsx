import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { extractErrorMessage } from '@/features/api/baseApi';
import { validatePassword } from '@/utilities/validator';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetPassword, { isLoading: loading }] = useResetPasswordMutation();

  const missingToken = !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const passErr = validatePassword(password);
    if (passErr) { setError(passErr); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    try {
      await resetPassword({ token, password }).unwrap();
      navigate('/auth/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900">Career<span className="text-primary-600">Forge</span></span>
        </Link>

        <div className="card p-8 animate-slide-up">
          {missingToken ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-error-500" />
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-900 mt-4">Invalid Reset Link</h1>
              <p className="text-slate-500 mt-2 text-sm">
                No reset token found. Please use the reset link from your email.
              </p>
              <Link to="/auth/forgot-password" className="btn-primary mt-6 inline-flex">
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-slate-900 text-center">Set new password</h1>
              <p className="text-slate-500 text-center mt-2 text-sm">Enter your new password below</p>

              {error && (
                <div className="flex items-center gap-2 p-3 mt-4 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-11 pr-11" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="input pl-11" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                <Link to="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
