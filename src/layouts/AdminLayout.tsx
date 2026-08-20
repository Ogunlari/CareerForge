import { Outlet } from 'react-router-dom';
import Navbar from '@/component/navbar/Navbar';
import Footer from '@/component/footer/Footer';

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow">
          <nav className="p-6">
            <h3 className="font-bold text-lg mb-6">Admin Panel</h3>
            <ul className="space-y-3">
              <li>
                <a href="/admin/dashboard" className="text-gray-700 hover:text-blue-600 block">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/admin/users" className="text-gray-700 hover:text-blue-600 block">
                  Users
                </a>
              </li>
              <li>
                <a href="/admin/companies" className="text-gray-700 hover:text-blue-600 block">
                  Companies
                </a>
              </li>
              <li>
                <a href="/admin/jobs" className="text-gray-700 hover:text-blue-600 block">
                  Jobs
                </a>
              </li>
              <li>
                <a href="/admin/reports" className="text-gray-700 hover:text-blue-600 block">
                  Reports
                </a>
              </li>
              <li>
                <a href="/admin/audit-logs" className="text-gray-700 hover:text-blue-600 block">
                  Audit Logs
                </a>
              </li>
              <li>
                <a href="/admin/security" className="text-gray-700 hover:text-blue-600 block">
                  Security
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
