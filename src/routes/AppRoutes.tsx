import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import StudentLayout from '@/layouts/StudentLayout';
import RecruiterLayout from '@/layouts/RecruiterLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Public Pages
import Home from '@/pages/public/Home';
import Jobs from '@/pages/public/Jobs';
import JobDetails from '@/pages/public/JobDetails';
import Companies from '@/pages/public/Companies';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgetPassword from '@/pages/auth/ForgetPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Student Pages
import StudentDashboard from '@/student/Dashboard';
import StudentProfile from '@/student/Profile';
import StudentApplications from '@/student/Application';
import SavedJobs from '@/student/Saved.Jobs';
import RecommendedJobs from '@/student/Recommended.Jobs';
import StudentNotifications from '@/student/Notifications';

// Recruiter Pages
import RecruiterDashboard from '@/pages/recruiter/Dashboard';
import CompanyProfile from '@/pages/recruiter/CompanyProfile';
import CreateJob from '@/pages/recruiter/CreateJob';
import ManageJobs from '@/pages/recruiter/ManageJobs';
import Applicants from '@/pages/recruiter/Applicants';
import ApplicantDetails from '@/pages/recruiter/ApplicantDetails';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import ManageUsers from '@/pages/admin/Users';
import ManageCompanies from '@/pages/admin/Companies';
import ManageJobsAdmin from '@/pages/admin/Jobs';
import Reports from '@/pages/admin/Reports';
import AuditLogs from '@/pages/admin/AuditLogs';
import Security from '@/pages/admin/Security';

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: 'jobs',
        element: <Jobs />,
      },
      {
        path: 'jobs/:id',
        element: <JobDetails />,
      },
      {
        path: 'companies',
        element: <Companies />,
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgetPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },
];

const studentRoutes: RouteObject[] = [
  {
    element: <StudentLayout />,
    children: [
      {
        path: 'student',
        children: [
          {
            path: 'dashboard',
            element: <StudentDashboard />,
          },
          {
            path: 'profile',
            element: <StudentProfile />,
          },
          {
            path: 'applications',
            element: <StudentApplications />,
          },
          {
            path: 'saved-jobs',
            element: <SavedJobs />,
          },
          {
            path: 'recommended-jobs',
            element: <RecommendedJobs />,
          },
          {
            path: 'notifications',
            element: <StudentNotifications />,
          },
        ],
      },
    ],
  },
];

const recruiterRoutes: RouteObject[] = [
  {
    element: <RecruiterLayout />,
    children: [
      {
        path: 'recruiter',
        children: [
          {
            path: 'dashboard',
            element: <RecruiterDashboard />,
          },
          {
            path: 'company-profile',
            element: <CompanyProfile />,
          },
          {
            path: 'create-job',
            element: <CreateJob />,
          },
          {
            path: 'manage-jobs',
            element: <ManageJobs />,
          },
          {
            path: 'applicants',
            element: <Applicants />,
          },
          {
            path: 'applicants/:applicationId',
            element: <ApplicantDetails />,
          },
        ],
      },
    ],
  },
];

const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      {
        path: 'admin',
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <ManageUsers />,
          },
          {
            path: 'companies',
            element: <ManageCompanies />,
          },
          {
            path: 'jobs',
            element: <ManageJobsAdmin />,
          },
          {
            path: 'reports',
            element: <Reports />,
          },
          {
            path: 'audit-logs',
            element: <AuditLogs />,
          },
          {
            path: 'security',
            element: <Security />,
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