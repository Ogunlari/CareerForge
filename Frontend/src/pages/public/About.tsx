import { Link } from 'react-router-dom';
import { Briefcase, Target, Users, Sparkles, Rocket, Shield } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    text: 'To close the talent gap across Africa by connecting students and early-career professionals with employers who are looking for real, transferable potential.',
  },
  {
    icon: Sparkles,
    title: 'What We Do',
    text: 'CareerForge is a talent marketplace where job seekers build rich profiles, discover relevant roles, and apply in minutes — and where recruiters find and hire the right people faster.',
  },
  {
    icon: Users,
    title: 'For Job Seekers',
    text: 'Create a standout profile, highlight your skills and experience, get personalized job recommendations, and track every application from one dashboard.',
  },
  {
    icon: Briefcase,
    title: 'For Employers',
    text: 'Post openings, review applicants in one place, manage your company profile, and connect with vetted talent that matches your needs.',
  },
];

const stats = [
  { value: 'Live', label: 'Platform live and growing' },
  { value: 'Multi-role', label: 'Students, recruiters & admins' },
  { value: 'Africa', label: 'Focused on continental talent' },
];

export default function About() {
  return (
    <div>
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-primary-100 bg-white/10 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
            <Rocket className="w-4 h-4" /> About CareerForge
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white">Everyone deserves a better career</h1>
          <p className="flex justify-center mt-4  mx-auto text-primary-100 text-lg">
            CareerForge is a one-stop platform that helps talented people find meaningful work and helps companies build world-class teams.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-slate-900">Who we are</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            CareerForge was built on a simple belief: opportunity should not be limited by where you live, where you studied, or who you know. We bring students, graduates, and early-career professionals together with employers across Africa — making it easier for great people to find great jobs, and for great companies to find great talent.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            From a polished profile to personalized recommendations, from a single-click application to transparent tracking, we give both sides of the hiring table the tools they need to move faster and make better matches.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-12">
          {values.map((v) => (
            <div key={v.title} className="card p-6">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{v.title}</h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-3xl font-display font-bold text-primary-600">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
        <Shield className="w-10 h-10 text-primary-400 mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold text-slate-900">Ready to take the next step in your career?</h2>
        <p className="mt-3 text-slate-600">Join CareerForge today and turn your skills into opportunity.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/auth/register" className="btn-primary inline-flex px-6">Get Started</Link>
          <Link to="/jobs" className="btn-secondary inline-flex px-6">Browse Jobs</Link>
        </div>
      </section>
    </div>
  );
}
