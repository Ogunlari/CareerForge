export interface AuthUser {
  id: string;
  role: 'student' | 'recruiter' | 'admin';
  jti?: string;
}
