import { Outlet } from 'react-router-dom';
import Navbar from '@/component/navbar/Navbar';
import Footer from '@/component/footer/Footer';

export default function RecruiterLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow">
          <nav className="p-6">
            <h3 className="font-bold text-lg mb-6">Recruiter Portal</h3>
            <ul className="space-y-3">
              <li>
                <a href="/recruiter/dashboard" className="text-gray-700 hover:text-blue-600 block">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/recruiter/create-job" className="text-gray-700 hover:text-blue-600 block">
                  Post Job
                </a>
              </li>
              <li>
                <a href="/recruiter/manage-jobs" className="text-gray-700 hover:text-blue-600 block">
                  My Jobs
                </a>
              </li>
              <li>
                <a href="/recruiter/applicants" className="text-gray-700 hover:text-blue-600 block">
                  Applicants
                </a>
              </li>
              <li>
                <a href="/recruiter/company-profile" className="text-gray-700 hover:text-blue-600 block">
                  Company Profile
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
