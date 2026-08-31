import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';
import type { UserRole } from '@/types';

const dashboardPaths: Record<UserRole, string> = {
  student: '/student/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/companies', label: 'Companies' },
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? 'border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl'
        : 'border-b border-transparent bg-white/70 backdrop-blur-sm'
        }`}
    >
      <nav className="mx-auto flex h-20 w-full max-w-7xl flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3 group" aria-label="CareerForge home">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground
           shadow-lg transition-transform duration-200 group-hover:scale-105">
            <Briefcase className="h-5 w-5" />
          </div>
          
          <span className="font-display text-lg font-bold text-slate-900 sm:text-xl">
            CareerForge
          </span>
        </Link>

        {/* Fixed typo: items-center */}
        <div className="hidden flex-row items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold 
                transition-all duration-200 ${isActiveLink(link.to)
                ? 'bg-primary-50 text-primary-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden flex-row items-center gap-3 md:flex">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/auth/login"
                className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold
                 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Sign In
              </Link>

              <Link
                to="/auth/register"
                className="whitespace-nowrap rounded-lg bg-primary-600 px-4 py-2 
                text-sm font-semibold text-slate-600 shadow-sm shadow-primary-600/30 
                transition hover:bg-primary-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Fixed toggle function: setMobileOpen((prev) => !prev) */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 
          text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block rounded-lg px-4 py-2.5 text-sm font-semibold transition ${isActiveLink(link.to)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-200 pt-3">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="badge bg-primary-50 text-primary-600 mt-0.5">
                        {user.role === 'student' ? 'Job Seeker' : user.role === 'recruiter' ? 'Recruiter' : 'Admin'}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={dashboardPaths[user.role]}
                    className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                  </Link>
                  {user.role === 'student' && (
                    <Link
                      to="/student/profile"
                      className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </Link>
                  )}
                  {user.role === 'recruiter' && (
                    <Link
                      to="/recruiter/company-profile"
                      className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4 text-slate-400" /> Company Profile
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-error-600 transition hover:bg-error-50"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/auth/login"
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm 
                    font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm
                    font-semibold text-slate-600 shadow-sm shadow-primary-600/30 
                    transition hover:bg-primary-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}