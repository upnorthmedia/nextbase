import { z } from 'zod';

// Database types
export interface Author {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
  post_count?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id?: string;
  author?: Author;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  reading_time?: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  categories?: BlogPostCategory[];
  table_of_contents?: TableOfContentsItem[];
}

export interface BlogPostCategory {
  blog_post_id: string;
  category_id: string;
  category?: Category;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
  children?: TableOfContentsItem[];
}

// Form schemas
export const createAuthorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
  social_links: z.object({
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
});

export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300).optional(),
  featured_image: z.string().url().optional(),
  author_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().datetime().optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  meta_keywords: z.array(z.string()).max(10).optional(),
  category_ids: z.array(z.string().uuid()).optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

// API Response types
export interface BlogPostsResponse {
  posts: BlogPost[];
  count: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: 'published_at' | 'view_count' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
}

export interface BlogFilters {
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  author?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// JSON-LD types for structured data
export interface JsonLdArticle {
  '@context': 'https://schema.org';
  '@type': 'Article' | 'BlogPosting';
  headline?: string;
  author?: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  datePublished?: string;
  dateModified?: string;
  image?: string;
  description?: string;
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  [key: string]: unknown;
}

// SEO types
export interface BlogSEO {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType: 'article' | 'website';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl: string;
  jsonLd?: JsonLdArticle;
}

// Editor types
export interface EditorState {
  content: string;
  isDirty: boolean;
  lastSaved?: string;
  autosaveEnabled: boolean;
}

export interface ImageUploadResponse {
  url: string;
  publicUrl: string;
  path: string;
  size: number;
  type: string;
}

// Search types
export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  highlight?: string;
  score?: number;
  published_at: string;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

// Analytics types
export interface PostAnalytics {
  views: number;
  uniqueVisitors?: number;
  avgReadTime?: number;
  bounceRate?: number;
  shares?: {
    twitter?: number;
    facebook?: number;
    linkedin?: number;
  };
}

// Admin dashboard types
export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalAuthors: number;
  totalCategories: number;
  recentPosts: BlogPost[];
  popularPosts: BlogPost[];
}

export type BlogPostFormData = z.infer<typeof createBlogPostSchema>;
export type AuthorFormData = z.infer<typeof createAuthorSchema>;
export type CategoryFormData = z.infer<typeof createCategorySchema>;