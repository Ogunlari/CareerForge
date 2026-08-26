import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Briefcase className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">CareerForge</span>
            </div>
            <p className="text-sm leading-relaxed">Connecting talent with opportunity. Your career journey starts here.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Looking For Job</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-white transition-colors">Companies</Link></li>
              <li><Link to="/auth/register" className="hover:text-white transition-colors">Create Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/auth/register" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/auth/register" className="hover:text-white transition-colors">Find Talent</Link></li>
              <li><Link to="/auth/register" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CareerForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
