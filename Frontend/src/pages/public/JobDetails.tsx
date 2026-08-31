import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Briefcase, Clock, Building2, Users, ArrowLeft,
  Bookmark, BookmarkCheck, Check, FileText, ChevronRight,
} from 'lucide-react';

import { useGetJobByIdQuery } from '@/features/jobs/jobsApi';
import {
  useCheckJobSavedQuery,
  useSaveJobMutation,
  useUnsaveJobMutation,
} from '@/features/savedJobs/savedJobsApi';
import {
  useCheckExistingApplicationQuery,
  useCreateApplicationMutation,
} from '@/features/applications/applicationsApi';
import { extractErrorMessage } from '@/features/api/baseApi';
import { useAuth } from '@/context/AuthContext';
import type { StudentProfile } from '@/types';
import { formatSalary, getRelativeTime, formatDate } from '@/utilities/formatDate';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '@/utilities/constants';
import Button from '@/component/common/Button';
import Loader from '@/component/common/Loader';
import Modal from '@/component/common/Modal';
import ErrorMessage from '@/component/common/ErrorMessage';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const isStudent = user?.role === 'student';
  const jobId = id ?? '';
  const studentId = isStudent ? user!.id : '';

  const {
    data: job,
    isLoading: loading,
    error: loadError,
  } = useGetJobByIdQuery(jobId, { skip: !jobId });

  const { data: saved = false } = useCheckJobSavedQuery(
    { studentId, jobId },
    { skip: !studentId || !jobId },
  );
  const { data: alreadyApplied = false } = useCheckExistingApplicationQuery(
    { studentId, jobId },
    { skip: !studentId || !jobId },
  );
  const applied = Boolean(alreadyApplied);

  const [saveJob] = useSaveJobMutation();
  const [unsaveJob] = useUnsaveJobMutation();
  const [createApplication, { isLoading: applying }] = useCreateApplicationMutation();

  const handleSave = async () => {
    if (!user || user.role !== 'student') {
      navigate('/auth/login');
      return;
    }
    try {
      if (saved) {
        await unsaveJob({ studentId: user.id, jobId }).unwrap();
      } else {
        await saveJob({ studentId: user.id, jobId }).unwrap();
      }
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const handleApply = async () => {
    if (!user || user.role !== 'student') {
      navigate('/auth/login');
      return;
    }
    setActionError(null);
    const student = user as StudentProfile;
    try {
      await createApplication({
        studentId: user.id,
        jobId,
        coverLetter,
        resumeUrl: student.resume_url || undefined,
      }).unwrap();
      setApplyOpen(false);
      setCoverLetter('');
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  if (loading) return <div className="pt-16"><Loader fullPage label="Loading job details..." /></div>;
  if (!job) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400 text-lg">{loadError ? 'Unable to load this job. Please try again.' : 'Job not found.'}</p>
        <Link to="/jobs" className="btn-primary mt-4">Browse Jobs</Link>
      </div>
    </div>
  );

  const jobType = JOB_TYPES.find((t) => t.value === job.job_type);
  const expLevel = EXPERIENCE_LEVELS.find((e) => e.value === job.experience_level);
  const company = job.company;

  return (
    <div className="pt-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/jobs" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {company?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-display font-bold text-slate-900">{job.title}</h1>
                  <Link to={`/companies/${company?.id}`} className="text-primary-600 hover:text-primary-700 font-semibold text-sm mt-1 flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> {company?.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                    {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>}
                    {jobType && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {jobType.label}</span>}
                    {expLevel && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {expLevel.label}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {getRelativeTime(job.posted_at || job.created_at)}</span>
                  </div>
                </div>
              </div>

              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-3">Job Description</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="card p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-3">Requirements</h2>
                <div className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="card p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-3">Responsibilities</h2>
                <div className="space-y-2">
                  {job.responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{resp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Salary</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{formatSalary(job.salary_min ?? 0, job.salary_max ?? 0, job.currency)}</p>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Job Type</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{jobType?.label || 'Not specified'}</p>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Experience</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{expLevel?.label || 'Not specified'}</p>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Location</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{job.location || 'Remote'}</p>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Posted</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{formatDate(job.posted_at || job.created_at, 'long')}</p>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Applicants</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{job.applicants_count}</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {applied ? (
                  <Button disabled className="w-full bg-success-50 text-success-700 border border-success-200">
                    <Check className="w-4 h-4" /> Applied
                  </Button>
                ) : (
                  <Button onClick={() => setApplyOpen(true)} className="w-full">
                    <FileText className="w-4 h-4" /> Apply Now
                  </Button>
                )}
                <Button variant="secondary" onClick={handleSave} className="w-full">
                  {saved ? <BookmarkCheck className="w-4 h-4 text-primary-500" /> : <Bookmark className="w-4 h-4" />}
                  {saved ? 'Saved' : 'Save Job'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for this position">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">You're applying for:</p>
            <p className="font-bold text-slate-900">{job.title} at {company?.name}</p>
          </div>

          {actionError && <ErrorMessage message={actionError} onDismiss={() => setActionError(null)} />}

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              placeholder="Tell the employer why you're a great fit for this role..."
              className="input resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">Your profile resume will be attached automatically.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setApplyOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleApply} loading={applying} className="flex-1">Submit Application</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}




