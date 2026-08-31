import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword } from '@/utilities/validator';
import GoogleButton from '@/component/common/GoogleButton';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) {
      setError(emailErr || passErr);
      return;
    }
    setLoading(true);
    const { error, user } = await signIn(email, password, remember);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      const dashboardPath: Record<string, string> = {
        student: '/student/dashboard',
        recruiter: '/recruiter/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(dashboardPath[user?.role || 'student']);
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
          <h1 className="text-2xl font-display font-bold text-slate-900 text-center">Welcome back</h1>
          <p className="text-slate-500 text-center mt-2 text-sm">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mt-4 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Password</ label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-11 " />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" /> Remember me
              </label>
              <Link to="/auth/forgot-password" className="text-primary-600 hover:text-primary-700 font-semibold">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-2">
            Don't have an account?
             <Link to="/auth/register" className="text-primary-600 hover:text-primary-700 font-semibold"> Sign up</Link>
          </p>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">or continue with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="card p-6">
          <GoogleButton />
        </div>
      </div>
    </div>
  );
}
