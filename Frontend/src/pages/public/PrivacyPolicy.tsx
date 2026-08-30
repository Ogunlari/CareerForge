import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Database, Eye, FileText } from 'lucide-react';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly when you create an account and use the platform, including your name, email address, phone number, professional title, location, biography, skills, work experience, and educational history. When you apply for a job, we also process your application details and any supporting information you provide.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to operate and improve CareerForge: to create and manage your account, display your profile to employers, recommend relevant job opportunities, process and track job applications, and send you service-related communications such as password reset links and account notifications.',
  },
  {
    title: '3. How We Share Information',
    body: 'We share the information you choose to put on your profile with employers on our platform so they can evaluate and contact you about opportunities. We do not sell your personal information. We may share data with trusted service providers who help operate the platform, and we will disclose information if required by law.',
  },
  {
    title: '4. Your Data & Choices',
    body: (
      <>
        You can review and update most of your profile information at any time from your profile settings. If you
        would like to access, correct, or delete the personal data we hold about you, or close your account, please
        contact us at{' '}
        <a href="mailto:support@careerforge.com" className="text-primary-600 hover:text-primary-700 font-semibold">support@careerforge.com</a>{' '}
        and we will process your request in accordance with applicable law.
      </>
    ),
  },
  {
    title: '5. Data Security',
    body: 'We take reasonable technical and organizational measures to protect your information from unauthorized access, alteration, disclosure, or destruction. Passwords are hashed, and access to sensitive data is restricted. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain your information for as long as your account is active or as needed to provide our services. When you close your account, we will delete or anonymize your personal information, except where we are required to retain it to comply with legal obligations or to resolve disputes.',
  },
  {
    title: '7. Children\u2019s Privacy',
    body: 'CareerForge is intended for users who are at least 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. When we make material changes, we will update the date at the top of this page and notify affected users where appropriate. Your continued use of the platform after changes take effect constitutes acceptance of the revised policy.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-primary-100 bg-white/10 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
            <ShieldCheck className="w-4 h-4" /> Privacy Policy
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold">Your privacy matters</h1>
          <p className="flex justify-center mt-4 -auto text-primary-100 text-lg">
            This policy explains what information CareerForge collects, how we use it, and the choices you have.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <FileText className="w-4 h-4" /> Effective date: {new Date().toLocaleDateString()}
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="card p-5 text-center">
            <Lock className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">We don't sell your data</p>
          </div>
          <div className="card p-5 text-center">
            <Eye className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">You control your profile</p>
          </div>
          <div className="card p-5 text-center">
            <Database className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Secure by design</p>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="card p-6">
              <h2 className="font-bold text-slate-900">{s.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Questions about this policy? Contact us at{' '}
            <a href="mailto:support@careerforge.com" className="text-primary-600 hover:text-primary-700 font-semibold">support@careerforge.com</a>.
          </p>
          <Link to="/" onClick={scrollToTop} className="btn-secondary inline-flex mt-4">Back to Home</Link>
        </div>
      </section>
    </div>
  );
}
