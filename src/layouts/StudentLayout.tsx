import { Outlet } from 'react-router-dom';
import Navbar from '@/component/navbar/Navbar';
import Footer from '@/component/footer/Footer';

export default function StudentLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow">
          <nav className="p-6">
            <h3 className="font-bold text-lg mb-6">Dashboard</h3>
            <ul className="space-y-3">
              <li>
                <a href="/student/dashboard" className="text-gray-700 hover:text-blue-600 block">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/student/applications" className="text-gray-700 hover:text-blue-600 block">
                  Applications
                </a>
              </li>
              <li>
                <a href="/student/saved-jobs" className="text-gray-700 hover:text-blue-600 block">
                  Saved Jobs
                </a>
              </li>
              <li>
                <a href="/student/recommended-jobs" className="text-gray-700 hover:text-blue-600 block">
                  Recommended Jobs
                </a>
              </li>
              <li>
                <a href="/student/notifications" className="text-gray-700 hover:text-blue-600 block">
                  Notifications
                </a>
              </li>
              <li>
                <a href="/student/profile" className="text-gray-700 hover:text-blue-600 block">
                  Profile
                </a>
              </li>
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
