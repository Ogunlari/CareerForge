import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, Eye, EyeOff, AlertCircle, GraduationCap, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword, validateName } from '@/utilities/validator';
import type { UserRole } from '@/types';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (nameErr || emailErr || passwordErr) {
      setError(nameErr || emailErr || passwordErr);
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name, role);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate(role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
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
          <h1 className="text-2xl font-display font-bold text-slate-900 text-center">Create your account</h1>
          <p className="text-slate-500 text-center mt-2 text-sm">Join CareerForge and start your journey</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mt-4 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'student', label: 'Job Seeker', icon: GraduationCap },
                  { value: 'recruiter', label: 'Recruiter', icon: Building2 },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button key={r.value} type="button" onClick={() => setRole(r.value as UserRole)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === r.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-semibold">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-11 pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-2">
            Already have an account? <Link to="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign in
            </Link>

            <nav className = "mt-10">
              <Link to="/home" className="text-primary-600 hover:text-primary-700 font-semibold">
              Home
              </Link>
              </nav>

          </p>
        </div>
      </div>
    </div>
  );
}
