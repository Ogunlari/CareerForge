import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { resetPassword } from '@/services/auth.service';
import { validateEmail } from '@/utilities/validator';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) { setError(error); setLoading(false); }
    else { setSuccess(true); setLoading(false); }
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
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-success-500" />
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-900 mt-4">Check your email</h1>
              <p className="text-slate-500 mt-2 text-sm">We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span></p>
              <Link to="/auth/login" className="btn-secondary mt-6 inline-flex">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-slate-900 text-center">Forgot password?</h1>
              <p className="text-slate-500 text-center mt-2 text-sm">Enter your email and we'll send you a reset link</p>

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
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
