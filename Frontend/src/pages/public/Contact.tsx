import { useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE } from '@/features/api/baseApi';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email us',
    lines: ['support@careerforge.com', 'We reply within 24 hours'],
  },
  {
    icon: MapPin,
    title: 'Visit us',
    lines: ['Lagos, Nigeria', 'Remote team across Africa'],
  },
  {
    icon: Clock,
    title: 'Support hours',
    lines: ['Monday – Friday', '9:00 AM – 6:00 PM (WAT)'],
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Failed to send message.');
      }
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong sending your message. Please try again or email support@careerforge.com directly.');
    }
  };

  return (
    <div>
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-primary-100 bg-white/10 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide mb-4">
            <Mail className="w-4 h-4" /> Contact Us
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white">We're here to help</h1>
          <p className="flex justify-center mt-4  mx-auto text-primary-100 text-lg">
            Questions about your account, a job posting, or your application? 
          </p>
            <p>Reach out — we'd love to hear from you. </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((m) => (
            <div key={m.title} className="card p-6 text-center">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <m.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900">{m.title}</h3>
              {m.lines.map((l) => (
                <p key={l} className="mt-1 text-sm text-slate-500">{l}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Send us a message</h2>
            <p className="mt-2 text-slate-500 text-sm">Fill out the form and our team will get back to you as soon as possible.</p>

            {status === 'success' && (
              <div className="mt-4 p-4 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Thanks! Your message has been received. We'll be in touch.
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Name</label>
                  <input value={form.name} onChange={update('name')} placeholder="Your name" className="input" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email</label>
                  <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="input" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Subject</label>
                <input value={form.subject} onChange={update('subject')} placeholder="How can we help?" className="input" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Message</label>
                <textarea value={form.message} onChange={update('message')} rows={5} placeholder="Tell us more..." className="input resize-none" />
              </div>
              <button type="submit" disabled={status === 'sending'} className="btn-primary w-full inline-flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-900">Frequently asked</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-semibold text-slate-800 text-sm">I never received a password reset email.</p>
                <p className="mt-1 text-sm text-slate-500">Check your spam or junk folder. If it's still missing, try again or reach out to support@careerforge.com.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">How do I create a job seeker profile?</p>
                <p className="mt-1 text-sm text-slate-500">Sign up, then go to your Profile to add your skills, experience, and education — employers will find you more easily.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">How do I post a job as an employer?</p>
                <p className="mt-1 text-sm text-slate-500">Register as a recruiter, set up your company profile, and you'll be able to post openings and manage applicants.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
