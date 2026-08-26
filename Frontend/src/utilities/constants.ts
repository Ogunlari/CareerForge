export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Manager' },
] as const;

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
] as const;

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Marketing',
  'Consulting',
  'Media',
  'Real Estate',
  'Transportation',
  'Energy',
  'Other',
] as const;

export const APPLICATION_STATUS = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  reviewing: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  accepted: { label: 'Accepted', color: 'bg-success-100 text-success-700', dot: 'bg-success-500' },
  rejected: { label: 'Rejected', color: 'bg-error-100 text-error-700', dot: 'bg-error-500' },
  withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
} as const;

export const JOB_STATUS = {
  active: { label: 'Active', color: 'bg-success-100 text-success-700', dot: 'bg-success-500' },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  draft: { label: 'Draft', color: 'bg-warning-100 text-warning-700', dot: 'bg-warning-500' },
} as const;

export const NOTIFICATION_TYPES = {
  application: 'Application Update',
  job: 'New Job',
  system: 'System',
  message: 'Message',
} as const;

export const PAGE_SIZE = 10;
