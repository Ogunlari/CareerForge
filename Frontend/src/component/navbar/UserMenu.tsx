import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const dashboardPath: Record<UserRole, string> = {
    student: '/student/dashboard',
    recruiter: '/recruiter/dashboard',
    admin: '/admin/dashboard',
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
          {user.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user.full_name?.split(' ')[0]}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 card p-2 animate-slide-down z-50">
          <div className="px-3 py-2.5 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <span className="badge bg-primary-50 text-primary-600 mt-1.5">{user.role === 'student' ? 'Job Seeker' : user.role === 'recruiter' ? 'Recruiter' : 'Admin'}</span>
          </div>

          <div className="py-1">
            <Link
              to={dashboardPath[user.role]}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
            </Link>
            {user.role === 'student' && (
              <Link
                to="/student/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" /> My Profile
              </Link>
            )}
            {user.role === 'recruiter' && (
              <Link
                to="/recruiter/company-profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Company Profile
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-error-600 hover:bg-error-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
