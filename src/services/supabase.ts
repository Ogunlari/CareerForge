// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// // Database types (generated from Supabase schema)
// export type Database = {
//   public: {
//     Tables: {
//       profiles: {
//         Row: {
//           id: string;
//           email: string;
//           name: string;
//           role: 'student' | 'recruiter' | 'admin';
//           avatar: string | null;
//           created_at: string;
//           updated_at: string;
//         };
//         Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
//         Update: Partial<Database['public']['Tables']['profiles']['Row']>;
//       };
//       jobs: {
//         Row: {
//           id: string;
//           title: string;
//           description: string;
//           location: string;
//           job_type: string;
//           salary_min: number | null;
//           salary_max: number | null;
//           experience_level: string;
//           requirements: string[];
//           benefits: string[];
//           company_id: string;
//           recruiter_id: string;
//           posted_at: string;
//           deadline: string | null;
//           created_at: string;
//           updated_at: string;
//         };
//         Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>;
//         Update: Partial<Database['public']['Tables']['jobs']['Row']>;
//       };
//       applications: {
//         Row: {
//           id: string;
//           student_id: string;
//           job_id: string;
//           status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';
//           cover_letter: string | null;
//           resume_url: string | null;
//           applied_at: string;
//           updated_at: string;
//         };
//         Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'applied_at' | 'updated_at'>;
//         Update: Partial<Database['public']['Tables']['applications']['Row']>;
//       };
//       notifications: {
//         Row: {
//           id: string;
//           user_id: string;
//           type: string;
//           title: string;
//           message: string;
//           related_id: string | null;
//           is_read: boolean;
//           created_at: string;
//         };
//         Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
//         Update: Partial<Database['public']['Tables']['notifications']['Row']>;
//       };
//     };
//   };
// };
