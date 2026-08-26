import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

// Layouts — kept eager since they're tiny and always needed.
import PublicLayout from '@/layouts/PublicLayout';
import StudentLayout from '@/layouts/StudentLayout';
import RecruiterLayout from '@/layouts/RecruiterLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Route guards
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicOnlyRoute from '@/components/PublicOnlyRoute';

// Public pages
const Home = lazy(() => import('@/pages/public/Home'));
const Jobs = lazy(() => import('@/pages/public/Jobs'));
const JobDetails = lazy(() => import('@/pages/public/JobDetails'));
const Companies = lazy(() => import('@/pages/public/Companies'));

// Auth pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgetPassword = lazy(() => import('@/pages/auth/ForgetPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

// Student pages
const StudentDashboard = lazy(() => import('@/student/Dashboard'));
const StudentProfile = lazy(() => import('@/student/Profile'));
const StudentApplications = lazy(() => import('@/student/Application'));
const SavedJobs = lazy(() => import('@/student/Saved.Jobs'));
const RecommendedJobs = lazy(() => import('@/student/Recommended.Jobs'));
const StudentNotifications = lazy(() => import('@/student/Notifications'));

// Recruiter pages
const RecruiterDashboard = lazy(() => import('@/pages/recruiter/Dashboard'));
const CompanyProfile = lazy(() => import('@/pages/recruiter/CompanyProfile'));
const CreateJob = lazy(() => import('@/pages/recruiter/CreateJob'));
const ManageJobs = lazy(() => import('@/pages/recruiter/ManageJobs'));
const Applicants = lazy(() => import('@/pages/recruiter/Applicants'));
const ApplicantDetails = lazy(() => import('@/pages/recruiter/ApplicantDetails'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ManageUsers = lazy(() => import('@/pages/admin/Users'));
const ManageCompanies = lazy(() => import('@/pages/admin/Companies'));
const ManageJobsAdmin = lazy(() => import('@/pages/admin/Jobs'));
const Reports = lazy(() => import('@/pages/admin/Reports'));
const AuditLogs = lazy(() => import('@/pages/admin/AuditLogs'));
const Security = lazy(() => import('@/pages/admin/Security'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-gray-500">Loading...</div>}>{children}</Suspense>;
}

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <SuspenseWrapper><Home /></SuspenseWrapper> },
      { path: 'jobs', element: <SuspenseWrapper><Jobs /></SuspenseWrapper> },
      { path: 'jobs/:id', element: <SuspenseWrapper><JobDetails /></SuspenseWrapper> },
      { path: 'companies', element: <SuspenseWrapper><Companies /></SuspenseWrapper> },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: 'auth',
        children: [
          { path: 'login', element: <SuspenseWrapper><Login /></SuspenseWrapper> },
          { path: 'register', element: <SuspenseWrapper><Register /></SuspenseWrapper> },
          { path: 'forgot-password', element: <SuspenseWrapper><ForgetPassword /></SuspenseWrapper> },
          { path: 'reset-password', element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper> },
        ],
      },
    ],
  },
];

const studentRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          {
            path: 'student',
            children: [
              { path: 'dashboard', element: <SuspenseWrapper><StudentDashboard /></SuspenseWrapper> },
              { path: 'profile', element: <SuspenseWrapper><StudentProfile /></SuspenseWrapper> },
              { path: 'applications', element: <SuspenseWrapper><StudentApplications /></SuspenseWrapper> },
              { path: 'saved-jobs', element: <SuspenseWrapper><SavedJobs /></SuspenseWrapper> },
              { path: 'recommended-jobs', element: <SuspenseWrapper><RecommendedJobs /></SuspenseWrapper> },
              { path: 'notifications', element: <SuspenseWrapper><StudentNotifications /></SuspenseWrapper> },
            ],
          },
        ],
      },
    ],
  },
];

const recruiterRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute allowedRoles={['recruiter']} />,
    children: [
      {
        element: <RecruiterLayout />,
        children: [
          {
            path: 'recruiter',
            children: [
              { path: 'dashboard', element: <SuspenseWrapper><RecruiterDashboard /></SuspenseWrapper> },
              { path: 'company-profile', element: <SuspenseWrapper><CompanyProfile /></SuspenseWrapper> },
              { path: 'create-job', element: <SuspenseWrapper><CreateJob /></SuspenseWrapper> },
              { path: 'manage-jobs', element: <SuspenseWrapper><ManageJobs /></SuspenseWrapper> },
              { path: 'applicants', element: <SuspenseWrapper><Applicants /></SuspenseWrapper> },
              { path: 'applicants/:applicationId', element: <SuspenseWrapper><ApplicantDetails /></SuspenseWrapper> },
            ],
          },
        ],
      },
    ],
  },
];

const adminRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'admin',
            children: [
              { path: 'dashboard', element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper> },
              { path: 'users', element: <SuspenseWrapper><ManageUsers /></SuspenseWrapper> },
              { path: 'companies', element: <SuspenseWrapper><ManageCompanies /></SuspenseWrapper> },
              { path: 'jobs', element: <SuspenseWrapper><ManageJobsAdmin /></SuspenseWrapper> },
              { path: 'reports', element: <SuspenseWrapper><Reports /></SuspenseWrapper> },
              { path: 'audit-logs', element: <SuspenseWrapper><AuditLogs /></SuspenseWrapper> },
              { path: 'security', element: <SuspenseWrapper><Security /></SuspenseWrapper> },
            ],
          },
        ],
      },
    ],
  },
];

export const routes: RouteObject[] = [
  ...publicRoutes,
  ...studentRoutes,
  ...recruiterRoutes,
  ...adminRoutes,
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export const router = createBrowserRouter(routes);
