import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, LogOut, LayoutDashboard, User, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface NavItem {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface Props {
  title: string;
  links: NavItem[];
  open: boolean;
  onClose: () => void;
}

export default function MobileDashboardDrawer({ title, links, open, onClose }: Props) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handler = () => onClose();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [open, onClose]);

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'recruiter' ? '/recruiter/dashboard'
    : user?.role === 'admin' ? '/admin/dashboard'
    : '/student/dashboard';

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-white shadow-xl transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <span className="badge bg-primary-50 text-primary-600 mt-1">
              {user.role === 'student' ? 'Job Seeker' : user.role === 'recruiter' ? 'Recruiter' : 'Admin'}
            </span>
          </div>
        )}

        <nav className="p-4 space-y-1 overflow-y-auto">
          {user && (
            <NavLink
              to={dashboardPath}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5 text-slate-400" /> Dashboard
            </NavLink>
          )}
          {user?.role === 'student' && (
            <NavLink
              to="/student/profile"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <User className="h-5 w-5 text-slate-400" /> Profile
            </NavLink>
          )}
          {user?.role === 'recruiter' && (
            <NavLink
              to="/recruiter/company-profile"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Settings className="h-5 w-5 text-slate-400" /> Company Profile
            </NavLink>
          )}
          <div className="border-t border-slate-100 pt-2 mt-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.icon ? <link.icon className="h-5 w-5 text-slate-400" /> : null} {link.label}
              </NavLink>
            ))}
          </div>
          {user && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 transition mt-2"
            >
              <LogOut className="h-5 w-5" /> Sign Out
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
