import { z } from 'zod';

/**
 * Zod validation schemas for blog forms
 */

// Blog Post Validation
export const blogPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be 200 characters or less')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),

  content: z
    .string()
    .min(1, 'Content is required')
    .max(100000, 'Content must be 100,000 characters or less'),

  excerpt: z
    .string()
    .max(500, 'Excerpt must be 500 characters or less')
    .optional(),

  featured_image: z
    .string()
    .url('Featured image must be a valid URL')
    .optional()
    .or(z.literal('')),

  author_id: z
    .string()
    .uuid('Invalid author ID')
    .optional(),

  status: z
    .enum(['draft', 'published', 'archived'])
    .default('draft'),

  published_at: z
    .string()
    .datetime()
    .optional(),

  meta_title: z
    .string()
    .max(60, 'Meta title must be 60 characters or less')
    .optional(),

  meta_description: z
    .string()
    .max(160, 'Meta description must be 160 characters or less')
    .optional(),

  meta_keywords: z
    .array(z.string())
    .max(10, 'Maximum 10 keywords allowed')
    .optional(),

  category_ids: z
    .array(z.string().uuid())
    .max(5, 'Maximum 5 categories allowed')
    .optional(),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

// Category Validation
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Name must be 50 characters or less'),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be 50 characters or less')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),

  description: z
    .string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #3B82F6)')
    .default('#3B82F6'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// Author Validation
export const authorSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),

  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less'),

  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or less')
    .optional(),

  avatar_url: z
    .string()
    .url('Avatar must be a valid URL')
    .optional()
    .or(z.literal('')),

  social_links: z
    .object({
      twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
      linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
      github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
      website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    })
    .optional(),
});

export type AuthorFormValues = z.infer<typeof authorSchema>;

// Validation helper functions
export function validateBlogPost(data: unknown) {
  return blogPostSchema.safeParse(data);
}

export function validateCategory(data: unknown) {
  return categorySchema.safeParse(data);
}

export function validateAuthor(data: unknown) {
  return authorSchema.safeParse(data);
}

// Extract error messages for display
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.issues.forEach((err: z.ZodIssue) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
}
