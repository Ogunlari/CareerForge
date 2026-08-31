import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, Briefcase, FileText, Users, Menu } from 'lucide-react';
import Navbar from '@/component/navbar/Navbar';
import Footer from '@/component/footer/Footer';
import MobileDashboardDrawer from '@/component/common/MobileDashboardDrawer';
import BottomTabBar from '@/component/common/BottomTabBar';

const links = [
  { to: '/recruiter/dashboard', label: 'Dashboard' },
  { to: '/recruiter/create-job', label: 'Post Job' },
  { to: '/recruiter/manage-jobs', label: 'My Jobs' },
  { to: '/recruiter/applicants', label: 'Applicants' },
  { to: '/recruiter/company-profile', label: 'Company Profile' },
];

const tabItems = [
  { to: '/recruiter/dashboard', label: 'Home', icon: LayoutGrid },
  { to: '/recruiter/create-job', label: 'Post', icon: Briefcase },
  { to: '/recruiter/manage-jobs', label: 'Jobs', icon: FileText },
  { to: '/recruiter/applicants', label: 'Applicants', icon: Users },
];

export default function RecruiterLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 pb-16 md:pb-0">
        <aside className="hidden md:block w-64 bg-white shadow shrink-0">
          <nav className="p-6">
            <h3 className="font-bold text-lg mb-6">Recruiter Portal</h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `block ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <MobileDashboardDrawer
          title="Recruiter Portal"
          links={links}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <main className="flex-1 p-4 md:p-8">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 rounded-lg px-3 py-2 border border-slate-200 hover:bg-slate-50"
          >
            <Menu className="h-4 w-4" /> Menu
          </button>
          <Outlet />
        </main>
      </div>
      <Footer />
      <BottomTabBar items={tabItems} onMenu={() => setDrawerOpen(true)} />
    </div>
  );
}
