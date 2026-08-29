import { z } from 'zod';

const educationItem = z.object({
  id: z.string(),
  school: z.string().optional(),
  institution: z.string().optional(),
  degree: z.string().optional(),
  field: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullish(),
  current: z.boolean().default(false),
});

const experienceItem = z.object({
  id: z.string(),
  company: z.string().optional(),
  position: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullish(),
  current: z.boolean().default(false),
});

export const updateProfileSchema = z
  .object({
    full_name: z.string().min(2).max(120).optional(),
    avatar: z.string().url().max(500).optional(),
    title: z.string().max(120).optional(),
    bio: z.string().max(2000).optional(),
    phone: z.string().max(40).optional(),
    location: z.string().max(120).optional(),
    skills: z.array(z.string().max(60)).max(50).optional(),
    education: z.array(educationItem).max(20).optional(),
    experience: z.array(experienceItem).max(30).optional(),
    resume_url: z.string().url().max(500).optional(),
    position: z.string().max(120).optional(),
    company_id: z.string().min(1).max(120).optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
