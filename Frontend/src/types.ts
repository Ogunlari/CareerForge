// User & Auth Types
export type UserRole = 'student' | 'recruiter' | 'admin';
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
export type NotificationType = 'application' | 'message' | 'job' | 'profile' | 'system';
export type JobStatus = 'active' | 'closed' | 'draft';

// User Profile
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_blocked?: boolean;
  company_id?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  title?: string;
  bio?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  resume_url?: string;
}

// Student Profile Extended
export interface StudentProfile extends Profile {
  role: 'student';
  bio?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  resume_url?: string;
}

// Recruiter Profile Extended
export interface RecruiterProfile extends Profile {
  role: 'recruiter';
  company_id: string;
  position: string;
}

// Admin Profile Extended
export interface AdminProfile extends Profile {
  role: 'admin';
  permissions: AdminPermission[];
}

// Education & Experience
export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  current: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string;
  current: boolean;
}

export interface ExperienceItem {
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
  current: boolean;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
}

// Company
export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  created_at: string;
}

// Job
export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  job_type: JobType;
  salary_min?: number;
  salary_max?: number;
  experience_level: string;
  requirements: string[];
  benefits: string[];
  tags?: string[];
  responsibilities?: string[];
  currency?: string;
  company: Company;
  company_id: string;
  recruiter_id: string;
  status?: 'active' | 'closed' | 'draft';
  posted_at: string;
  deadline?: string;
  applicants_count: number;
  created_at: string;
  updated_at: string;
}

// Job Details for display
export interface JobDetails extends Job {
  is_saved?: boolean;
  can_apply?: boolean;
  applications_count?: number;
}

// Application
export interface Application {
  id: string;
  student_id: string;
  job_id: string;
  status: ApplicationStatus;
  cover_letter?: string;
  resume_url?: string;
  applied_at: string;
  updated_at: string;
  job: Job;
  student?: StudentProfile;
}

// Application Timeline Event
export interface ApplicationTimelineEvent {
  id: string;
  status: ApplicationStatus;
  timestamp: string;
  message: string;
}

// Saved Job
export interface SavedJob {
  id: string;
  student_id: string;
  job_id: string;
  job: Job;
  saved_at: string;
}

// Notification
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

// Admin Types
export type AdminPermission = 'manage_users' | 'manage_jobs' | 'manage_companies' | 'view_reports' | 'manage_security';

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  changes: Record<string, unknown>;
  created_at: string;
}

export interface SystemReport {
  id: string;
  type: string;
  data: Record<string, unknown>;
  generated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface JobFilterParams {
  search?: string;
  location?: string;
  job_type?: JobType;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ApplicationFilterParams {
  status?: ApplicationStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
