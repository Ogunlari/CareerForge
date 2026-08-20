// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Search, TrendingUp, ArrowRight, Sparkles, Target, Zap, Award } from 'lucide-react';

// import { fetchJobs, fetchAllCompanies } from '@/services/jobs.service';
// import type { Job, Company } from '@/types';
// import JobCard from '@/component/jobs/JobCard';

// export default function Home() {
//   const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [stats, setStats] = useState({ jobs: 0, companies: 0 });
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     (async () => {
//       const { data: jobs } = await fetchJobs({ limit: 6 });
//       setFeaturedJobs(jobs || []);
//       setStats((s) => ({ ...s, jobs: (jobs || []).length }));
//       const { data: comps } = await fetchAllCompanies();
//       const companies = comps || [];
//       setCompanies(companies.slice(0, 8));
//       setStats((s) => ({ ...s, companies: companies.length }));
//     })();
//   }, []);

//   const features = [
//     { icon: Target, title: 'Smart Matching', desc: 'Get matched with jobs that fit your skills and career goals.' },
//     { icon: Zap, title: 'Quick Apply', desc: 'Apply to multiple jobs with a single profile in seconds.' },
//     { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor your application status in real-time dashboard.' },
//     { icon: Award, title: 'Top Companies', desc: 'Connect with leading employers across industries.' },
//   ];

//   const steps = [
//     { num: '01', title: 'Create Your Profile', desc: 'Build a professional profile showcasing your skills and experience.' },
//     { num: '02', title: 'Discover Jobs', desc: 'Browse thousands of openings and get personalized recommendations.' },
//     { num: '03', title: 'Apply & Track', desc: 'Submit applications and track your progress all in one place.' },
//   ];

//   return (
//     <div className="bg-white">
//       {/* Hero */}
//       <section className="relative pt-32 pb-20 overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white" />
//         <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="max-w-3xl mx-auto text-center">
//             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6 animate-fade-in">
//               <Sparkles className="w-4 h-4" /> Your career, forged for success
//             </div>
//             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 leading-[1.1] tracking-tight animate-slide-up">
//               Find your dream job
//               <span className="block text-black-600 mt-2">at top companies</span>
//             </h1>
//             <p className="text-lg text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed animate-slide-up">
//               Connect with thousands of employers, track your applications, and land the role you deserve. CareerForge makes job hunting effortless.
//             </p>

//             {/* Search bar */}
//             <div className="max-w-2xl mx-auto mt-10 animate-slide-up">
//               <div className="card p-2 flex items-center gap-2 shadow-lg shadow-indigo-900/5">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search for jobs, companies, or keywords..."
//                     className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
//                   />
//                 </div>
//                 <Link to={`/jobs?search=${encodeURIComponent(search)}`} className="btn-primary py-3.5 px-8">
//                   Search
//                 </Link>
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="flex items-center justify-center gap-8 sm:gap-12 mt-12 animate-fade-in">
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-slate-900">{stats.jobs}+</div>
//                 <div className="text-sm text-slate-500 mt-1">Active Jobs</div>
//               </div>
//               <div className="w-px h-12 bg-slate-200" />
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-slate-900">{stats.companies}+</div>
//                 <div className="text-sm text-slate-500 mt-1">Companies</div>
//               </div>
//               <div className="w-px h-12 bg-slate-200" />
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-slate-900">10k+</div>
//                 <div className="text-sm text-slate-500 mt-1">Job Seekers</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="py-20 bg-slate-50/50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">Why CareerForge?</h2>
//             <p className="text-slate-600 mt-3 max-w-xl mx-auto">Everything you need to find, apply, and land your next role.</p>
//           </div>

//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
//             {features.map((f, i) => {
//               const Icon = f.icon;
//               return (
//                 <div key={i} className="card p-6 hover:shadow-md transition-shadow group">
//                   <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
//                     <Icon className="w-6 h-6" />
//                   </div>
//                   <h3 className="font-bold text-slate-900 mt-4">{f.title}</h3>
//                   <p className="text-sm text-slate-500 mt-2 leading-relaxed">{f.desc}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Featured Jobs */}
//       {featuredJobs.length > 0 && (
//         <section className="py-20">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6">
//             <div className="flex items-end justify-between mb-8">
//               <div>
//                 <h2 className="text-3xl font-display font-bold text-slate-900">Featured Jobs</h2>
//                 <p className="text-slate-500 mt-2">Latest opportunities from top companies</p>
//               </div>
//               <Link to="/jobs" className="btn-ghost text-sm group flex items-center gap-1">
//                 View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               {featuredJobs.slice(0, 4).map((job) => (
//                 <JobCard key={job.id} job={job} />
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* How it works */}
//       <section className="py-20 bg-slate-50/50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">How It Works</h2>
//             <p className="text-slate-600 mt-3">Three simple steps to your next career move</p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-6">
//             {steps.map((step, i) => (
//               <div key={i} className="relative card p-8">
//                 <div className="text-5xl font-display font-extrabold text-indigo-200">{step.num}</div>
//                 <h3 className="text-lg font-bold text-slate-900 mt-4">{step.title}</h3>
//                 <p className="text-sm text-slate-500 mt-2 leading-relaxed">{step.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Companies */}
//       {companies.length > 0 && (
//         <section className="py-20">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6">
//             <div className="text-center mb-10">
//               <h2 className="text-3xl font-display font-bold text-slate-900">Top Companies</h2>
//               <p className="text-slate-500 mt-2">Discover opportunities at leading organizations</p>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//               {companies.map((company) => (
//                 <Link
//                   key={company.id}
//                   to={`/companies/${company.id}`}
//                   className="card p-6 hover:shadow-md hover:border-indigo-200 transition-all text-center group"
//                 >
//                   <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xl mx-auto group-hover:scale-110 transition-transform">
//                     {company.name[0]?.toUpperCase()}
//                   </div>
//                   <h3 className="font-bold text-slate-900 mt-3 text-sm truncate">{company.name}</h3>
//                   <p className="text-xs text-slate-500 mt-1">{company.industry || company.location || 'Company'}</p>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* CTA Section */}
//       <section className="py-20 bg-gradient-to-br from-white-600 to-white-800 relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
//         <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
//           <h2 className="text-3xl sm:text-4xl font-display font-bold text-black">
//             Ready to forge your career?
//           </h2>
//           <p className="text-black-100 mt-3 text-lg">
//             Join thousands of job seekers who found their dream role.
//           </p>
//           <div className="flex items-center justify-center gap-3 mt-8">
//             <Link
//               to="/auth/register"
//               className="inline-flex items-center justify-center rounded-xl bg-black/10 text-indigo-700 hover:bg-indigo-50 px-8 py-3 text-base font-bold transition-colors shadow-lg"
//             >
//               Get Started Free
//             </Link>
//             <Link
//               to="/jobs"
//               className="inline-flex items-center justify-center rounded-xl bg-black/10 text-black hover:bg-white/20 px-8 py-3 text-base font-bold border border-white/20 transition-colors"
//             >
//               Browse Jobs
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }









import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, ArrowRight, Sparkles, Target, Zap, Award } from 'lucide-react';

import { fetchJobs, fetchAllCompanies } from '@/services/jobs.service';
import type { Job, Company } from '@/types';
import JobCard from '@/component/jobs/JobCard';

// Background images for the hero slideshow
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=80',
];

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({ jobs: 0, companies: 0 });
  const [search, setSearch] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background image rotation effect (changes every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: jobs } = await fetchJobs({ limit: 6 });
      setFeaturedJobs(jobs || []);
      setStats((s) => ({ ...s, jobs: (jobs || []).length }));
      const { data: comps } = await fetchAllCompanies();
      const companies = comps || [];
      setCompanies(companies.slice(0, 8));
      setStats((s) => ({ ...s, companies: companies.length }));
    })();
  }, []);

  const features = [
    { icon: Target, title: 'Smart Matching', desc: 'Get matched with jobs that fit your skills and career goals.' },
    { icon: Zap, title: 'Quick Apply', desc: 'Apply to multiple jobs with a single profile in seconds.' },
    { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor your application status in real-time dashboard.' },
    { icon: Award, title: 'Top Companies', desc: 'Connect with leading employers across industries.' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Build a professional profile showcasing your skills and experience.' },
    { num: '02', title: 'Discover Jobs', desc: 'Browse thousands of openings and get personalized recommendations.' },
    { num: '03', title: 'Apply & Track', desc: 'Submit applications and track your progress all in one place.' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950 text-white min-h-[600px] flex items-center">
        {/* Changing Background Images */}
        {HERO_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 pointer-events-none ${
              index === currentImageIndex ? 'opacity-50' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${image}')` }}
          />
        ))}

        {/* Dark High-Contrast Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950 pointer-events-none" />
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99, 102, 241, 0.4), transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-sm font-semibold mb-6 animate-fade-in backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Your career, forged for success
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white leading-[1.1] tracking-tight animate-slide-up">
              Find your dream job
              <span className="block text-indigo-400 mt-2">at top companies</span>
            </h1>
            <p className="text-lg text-slate-300 mt-6 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              Connect with thousands of employers, track your applications, and land the role you deserve. CareerForge makes job hunting effortless.
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto mt-10 animate-slide-up">
              <div className="card p-2 flex items-center gap-2 bg-white backdrop-blur shadow-2xl rounded-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for jobs, companies, or keywords..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <Link to={`/jobs?search=${encodeURIComponent(search)}`} className="btn-primary py-3.5 px-8">
                  Search
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-12 mt-12 animate-fade-in">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.jobs}+</div>
                <div className="text-sm text-slate-400 mt-1">Active Jobs</div>
              </div>
              <div className="w-px h-12 bg-white/15" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.companies}+</div>
                <div className="text-sm text-slate-400 mt-1">Companies</div>
              </div>
              <div className="w-px h-12 bg-white/15" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10k+</div>
                <div className="text-sm text-slate-400 mt-1">Job Seekers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">Why CareerForge?</h2>
            <p className="text-slate-600 mt-3 max-w-xl mx-auto">Everything you need to find, apply, and land your next role.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card p-6 hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mt-4">{f.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-900">Featured Jobs</h2>
                <p className="text-slate-500 mt-2">Latest opportunities from top companies</p>
              </div>
              <Link to="/jobs" className="btn-ghost text-sm group flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {featuredJobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-600 mt-3">Three simple steps to your next career move</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative card p-8 hover:border-indigo-200 transition-all hover:shadow-md group">
                <div className="text-4xl font-display font-black text-indigo-600 tracking-tight">{step.num}</div>
                <h3 className="text-lg font-bold text-slate-900 mt-4">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      {companies.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-display font-bold text-slate-900">Top Companies</h2>
              <p className="text-slate-500 mt-2">Discover opportunities at leading organizations</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  to={`/companies/${company.id}`}
                  className="card p-6 hover:shadow-md hover:border-indigo-200 transition-all text-center group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xl mx-auto group-hover:scale-110 transition-transform">
                    {company.name[0]?.toUpperCase()}
                  </div>
                  <h3 className="font-bold text-slate-900 mt-3 text-sm truncate">{company.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{company.industry || company.location || 'Company'}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
            Ready to forge your career?
          </h2>
          <p className="text-slate-600 mt-3 text-lg">
            Join thousands of job seekers who found their dream role.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 text-base font-bold transition-colors shadow-lg shadow-indigo-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-3.5 text-base font-bold border border-slate-200 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}