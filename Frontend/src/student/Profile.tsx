import { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, X, Save, Star, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUpdateProfileMutation } from '@/features/users/usersApi';
import Button from '@/component/common/Button';
import ErrorMessage from '@/component/common/ErrorMessage';
import { ProfileSchema } from '@/utilities/schemas';
import type { ExperienceItem, EducationItem } from '@/types';

export default function StudentProfile() {
  const { user, refreshUser } = useAuth();
  const [updateProfile] = useUpdateProfileMutation();
  const [editing, setEditing] = useState(false);
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const startEditing = () => {
    setError(null);
    setSuccess(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setError(null);
    setSuccess(false);
    setFieldErrors({});
    setEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const addExperience = () => {
    setExperience([...experience, { id: crypto.randomUUID(), title: '', company: '', start_date: '', end_date: null, description: '', current: false }]);
  };

  const addEducation = () => {
    setEducation([...education, { id: crypto.randomUUID(), institution: '', degree: '', field: '', start_date: '', end_date: null, current: false }]);
  };

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const result = ProfileSchema.safeParse({
      full_name: fullName,
      email: user.email,
      phone,
      bio,
      location,
    });
    if (!result.success) {
      const { fieldErrors: fe } = result.error.flatten();
      setFieldErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? ''])));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        id: user.id,
        updates: {
          full_name: fullName, title, bio, phone, location, skills,
          experience: experience as unknown as typeof user.experience,
          education: education as unknown as typeof user.education,
        },
      }).unwrap();
      setSuccess(true);
      refreshUser();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
    setSaving(false);
  };

  if (editing) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Edit Profile</h1>
            <p className="text-slate-500 mt-1">Update your profile to improve job matches</p>
          </div>
          <Button variant="secondary" onClick={cancelEditing}>Cancel</Button>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary-500" /> Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Full Name</label>
              <input value={fullName} onChange={(e) => { setFullName(e.target.value); if (fieldErrors.full_name) setFieldErrors((p) => { const n = { ...p }; delete n.full_name; return n; }); }} className={`input ${fieldErrors.full_name ? 'border-red-500' : ''}`} />
              {fieldErrors.full_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.full_name}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={user?.email || ''} disabled className="input pl-11 bg-slate-50" />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Professional Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="input" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={phone} onChange={(e) => { setPhone(e.target.value); if (fieldErrors.phone) setFieldErrors((p) => { const n = { ...p }; delete n.phone; return n; }); }} placeholder="+1 234 567 890" className={`input pl-11 ${fieldErrors.phone ? 'border-red-500' : ''}`} />
              </div>
              {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={location} onChange={(e) => { setLocation(e.target.value); if (fieldErrors.location) setFieldErrors((p) => { const n = { ...p }; delete n.location; return n; }); }} placeholder="City, Country" className={`input pl-11 ${fieldErrors.location ? 'border-red-500' : ''}`} />
              </div>
              {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Bio</label>
            <textarea value={bio} onChange={(e) => { setBio(e.target.value); if (fieldErrors.bio) setFieldErrors((p) => { const n = { ...p }; delete n.bio; return n; }); }} rows={4} placeholder="Tell employers about yourself..." className={`input resize-none ${fieldErrors.bio ? 'border-red-500' : ''}`} />
            {fieldErrors.bio && <p className="text-red-500 text-xs mt-1">{fieldErrors.bio}</p>}
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

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={cancelEditing}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4" /> Save Profile</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Update your profile to improve job matches</p>
        </div>
        <Button onClick={startEditing}><Pencil className="w-4 h-4" /> Edit Profile</Button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-medium">
          Profile updated successfully!
        </div>
      )}

      {/* Basic Info */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary-500" /> Basic Information</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</dt>
            <dd className="mt-1 text-slate-900 font-medium">{fullName || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</dt>
            <dd className="mt-1 text-slate-900 font-medium">{user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Professional Title</dt>
            <dd className="mt-1 text-slate-900 font-medium">{title || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</dt>
            <dd className="mt-1 text-slate-900 font-medium">{phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</dt>
            <dd className="mt-1 text-slate-900 font-medium">{location || '—'}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bio</dt>
          <dd className="mt-1 text-slate-900">{bio || '—'}</dd>
        </div>
      </div>

      {/* Skills */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-primary-500" /> Skills</h2>
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="badge bg-primary-50 text-primary-700">{skill}</span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No skills added yet.</p>
        )}
      </div>

      {/* Experience */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary-500" /> Experience</h2>
        {experience.length ? (
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900">{exp.title || 'Untitled role'}</div>
                {exp.company && <div className="text-sm text-slate-600">{exp.company}</div>}
                {exp.description && <p className="mt-2 text-sm text-slate-600">{exp.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No experience added yet.</p>
        )}
      </div>

      {/* Education */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary-500" /> Education</h2>
        {education.length ? (
          <div className="space-y-4">
            {education.map((edu, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900">{edu.institution || 'Untitled institution'}</div>
                {edu.degree && <div className="text-sm text-slate-600">{edu.degree}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No education added yet.</p>
        )}
      </div>
    </div>
  );
}
