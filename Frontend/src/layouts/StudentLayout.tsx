import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '@/component/navbar/Navbar';
import Footer from '@/component/footer/Footer';

const links = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/applications', label: 'Applications' },
  { to: '/student/saved-jobs', label: 'Saved Jobs' },
  { to: '/student/recommended-jobs', label: 'Recommended Jobs' },
  { to: '/student/notifications', label: 'Notifications' },
  { to: '/student/profile', label: 'Profile' },
];

export default function StudentLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow">
          <nav className="p-6">
            <h3 className="font-bold text-lg mb-6">Dashboard</h3>
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
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
