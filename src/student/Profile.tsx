import { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, X, Save, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/services/auth.service';
import Button from '@/component/common/Button';
import ErrorMessage from '@/component/common/ErrorMessage';
import type { ExperienceItem, EducationItem } from '@/types';

export default function StudentProfile() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState<ExperienceItem[]>((user?.experience as ExperienceItem[] | undefined) || []);
  const [education, setEducation] = useState<EducationItem[]>((user?.education as EducationItem[] | undefined) || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const addExperience = () => {
    setExperience([...experience, { title: '', company: '', start_date: '', end_date: null, description: '', current: false }]);
  };

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', field: '', start_date: '', end_date: null, current: false }]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { error } = await updateProfile(user.id, {
      full_name: fullName, title, bio, phone, location, skills,
      experience: experience as unknown as typeof user.experience,
      education: education as unknown as typeof user.education,
    });
    if (error) setError(error);
    else { setSuccess(true); refreshUser(); }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Update your profile to improve job matches</p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && (
        <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-medium">
          Profile updated successfully!
        </div>
      )}

      {/* Basic Info */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary-500" /> Basic Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={user?.email || ''} disabled className="input pl-11 bg-slate-50" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Professional Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="input" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" className="input pl-11" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="input pl-11" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell employers about yourself..." className="input resize-none" />
        </div>
      </div>

      {/* Skills */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-primary-500" /> Skills</h2>
        <div className="flex gap-2 mb-3">
          <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill..." className="input flex-1" />
          <Button variant="secondary" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="badge bg-primary-50 text-primary-700">
              {skill}
              <button onClick={() => setSkills(skills.filter((s) => s !== skill))} className="hover:text-primary-900"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary-500" /> Experience</h2>
          <Button variant="secondary" size="sm" onClick={addExperience}><Plus className="w-4 h-4" /> Add</Button>
        </div>
        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div className="grid sm:grid-cols-2 gap-3 flex-1">
                  <input value={exp.title} onChange={(e) => { const c = [...experience]; c[i] = { ...exp, title: e.target.value }; setExperience(c); }} placeholder="Job Title" className="input" />
                  <input value={exp.company} onChange={(e) => { const c = [...experience]; c[i] = { ...exp, company: e.target.value }; setExperience(c); }} placeholder="Company" className="input" />
                </div>
                <button onClick={() => setExperience(experience.filter((_, idx) => idx !== i))} className="ml-2 p-1.5 rounded-lg hover:bg-error-50 text-error-500"><X className="w-4 h-4" /></button>
              </div>
              <textarea value={exp.description} onChange={(e) => { const c = [...experience]; c[i] = { ...exp, description: e.target.value }; setExperience(c); }} placeholder="Description..." rows={2} className="input resize-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary-500" /> Education</h2>
          <Button variant="secondary" size="sm" onClick={addEducation}><Plus className="w-4 h-4" /> Add</Button>
        </div>
        <div className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div className="grid sm:grid-cols-2 gap-3 flex-1">
                  <input value={edu.institution} onChange={(e) => { const c = [...education]; c[i] = { ...edu, institution: e.target.value }; setEducation(c); }} placeholder="Institution" className="input" />
                  <input value={edu.degree} onChange={(e) => { const c = [...education]; c[i] = { ...edu, degree: e.target.value }; setEducation(c); }} placeholder="Degree" className="input" />
                </div>
                <button onClick={() => setEducation(education.filter((_, idx) => idx !== i))} className="ml-2 p-1.5 rounded-lg hover:bg-error-50 text-error-500"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4" /> Save Profile</Button>
      </div>
    </div>
  );
}
