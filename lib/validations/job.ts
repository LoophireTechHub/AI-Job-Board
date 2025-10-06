import { z } from 'zod';

export const jobFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),

  department: z.string().min(2, 'Department must be at least 2 characters').max(50).optional().or(z.literal('')),

  location_type: z.enum(['remote', 'hybrid', 'onsite'], {
    required_error: 'Please select a location type',
  }),

  location_city: z.string().optional().or(z.literal('')),
  location_state: z.string().optional().or(z.literal('')),
  location_country: z.string().default('US'),

  job_type: z.enum(['full-time', 'part-time', 'contract', 'internship'], {
    required_error: 'Please select a job type',
  }),

  experience_level: z.enum(['entry', 'mid', 'senior', 'lead'], {
    required_error: 'Please select an experience level',
  }),

  salary_min: z.coerce.number().positive().optional().or(z.literal('')),
  salary_max: z.coerce.number().positive().optional().or(z.literal('')),
  salary_currency: z.string().default('USD'),

  description: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Description is too long'),

  requirements: z.string().min(20, 'Requirements must be at least 20 characters').max(3000).optional().or(z.literal('')),

  status: z.enum(['draft', 'active']).default('draft'),
}).refine((data) => {
  // If salary_min and salary_max are both provided, max must be greater than min
  if (data.salary_min && data.salary_max) {
    return data.salary_max > data.salary_min;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than minimum salary',
  path: ['salary_max'],
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
