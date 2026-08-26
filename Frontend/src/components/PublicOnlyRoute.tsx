import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

export default function PublicOnlyRoute() {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.accessToken);

  if (token && user) {
    const redirectMap: Record<string, string> = {
      student: '/student/dashboard',
      recruiter: '/recruiter/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirectMap[user.role] ?? '/'} replace />;
  }

  return <Outlet />;
}
