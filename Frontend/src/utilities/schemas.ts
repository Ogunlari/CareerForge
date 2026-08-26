import { z } from 'zod';

const jobTypeValues = ['full-time', 'part-time', 'contract', 'internship', 'remote'] as const;

export const CreateJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be at most 5000 characters'),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be at most 200 characters'),
  job_type: z.enum(jobTypeValues, { errorMap: () => ({ message: 'Please select a valid job type' }) }),
  salary_min: z.coerce.number().min(0, 'Salary must be at least 0').optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
  salary_max: z.coerce.number().min(0, 'Salary must be at least 0').optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
  experience_level: z.string().optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
  requirements: z.string().optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
  benefits: z.string().optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
});

export type CreateJobFormData = z.infer<typeof CreateJobSchema>;

export const CompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Name must be at most 200 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().max(200, 'Location must be at most 200 characters').optional().or(z.literal('')),
  industry: z.string().max(100, 'Industry must be at most 100 characters').optional().or(z.literal('')),
  size: z.string().max(50, 'Size must be at most 50 characters').optional().or(z.literal('')),
});

export type CompanyFormData = z.infer<typeof CompanySchema>;

export const ProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name must be at most 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio must be at most 1000 characters').optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;
