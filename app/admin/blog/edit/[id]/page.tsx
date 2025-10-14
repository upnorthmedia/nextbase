'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getBlogPostAction, updateBlogPostAction, deleteBlogPostAction } from './actions';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { CategorySelector } from '@/components/admin/CategorySelector';
import { AuthorSelector } from '@/components/admin/AuthorSelector';
import { FeaturedImageUploader } from '@/components/admin/FeaturedImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { BlogPost } from '@/lib/blog/types';
import { validateBlogPost, getValidationErrors } from '@/lib/blog/validation';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    author_id: undefined as string | undefined,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    category_ids: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
  });

  // Load post data
  useEffect(() => {
    async function loadPost() {
      try {
        const result = await getBlogPostAction(id);
        if (!result.success || !result.post) {
          toast.error('Post not found');
          router.push('/admin/blog');
          return;
        }

        setPost(result.post);
        setFormData({
          title: result.post.title,
          slug: result.post.slug,
          content: result.post.content,
          excerpt: result.post.excerpt || '',
          featured_image: result.post.featured_image || '',
          author_id: result.post.author_id,
          meta_title: result.post.meta_title || '',
          meta_description: result.post.meta_description || '',
          meta_keywords: Array.isArray(result.post.meta_keywords)
            ? result.post.meta_keywords.join(', ')
            : '',
          category_ids: result.post.categories
            ? result.post.categories.map((c) => c.category?.id).filter(Boolean) as string[]
            : [],
          status: result.post.status,
        });
      } catch {
        toast.error('Failed to load post');
        router.push('/admin/blog');
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [id, router]);

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      // Only auto-generate slug if it hasn't been manually edited
      slug: prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published' | 'archived') => {
    setIsSubmitting(true);

    try {
      // Prepare data for validation
      interface DataToValidate {
        title: string;
        slug: string;
        content: string;
        excerpt?: string;
        featured_image?: string;
        author_id?: string;
        status: 'draft' | 'published' | 'archived';
        published_at?: string;
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string[];
        category_ids?: string[];
      }

      const dataToValidate: DataToValidate = {
        ...formData,
        status,
        meta_keywords: formData.meta_keywords
          ? formData.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
      };

      // Only set published_at if changing from draft to published
      // Don't include it if already published (preserve existing value)
      if (status === 'published' && post?.status === 'draft') {
        dataToValidate.published_at = new Date().toISOString();
      }

      // Validate with Zod
      const validation = validateBlogPost(dataToValidate);

      if (!validation.success) {
        const errors = getValidationErrors(validation.error);
        const firstError = Object.values(errors)[0];
        toast.error(firstError || 'Validation failed');
        return;
      }

      const result = await updateBlogPostAction(id, validation.data);

      if (!result.success) {
        toast.error(result.error || 'Failed to update post');
        return;
      }

      toast.success(
        status === 'published'
          ? 'Post published successfully!'
          : 'Changes saved successfully!'
      );

      router.refresh();
    } catch {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteBlogPostAction(id);

      if (!result.success) {
        toast.error(result.error || 'Failed to delete post');
        setIsDeleting(false);
        return;
      }

      toast.success('Post deleted successfully');
      router.push('/admin/blog');
      router.refresh();
    } catch {
      toast.error('Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
            <p className="text-muted-foreground mt-1">
              Last updated: {new Date(post.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting || isDeleting}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting || isDeleting}
          >
            <Eye className="mr-2 h-4 w-4" />
            {post.status === 'published' ? 'Update' : 'Publish'}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            post.status === 'published'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
        >
          {post.status}
        </span>
        {post.published_at && (
          <span className="text-sm text-muted-foreground">
            Published: {new Date(post.published_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title..."
              className="text-lg"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="post-url-slug"
            />
            <p className="text-xs text-muted-foreground">
              URL: /blog/{formData.slug || 'post-slug'}
            </p>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <div className="border rounded-lg overflow-hidden h-[600px]">
              <BlogEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Short description..."
              className="w-full h-24 px-3 py-2 text-sm rounded-md border bg-background resize-none"
            />
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <FeaturedImageUploader
              currentImage={formData.featured_image}
              onUploadComplete={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  featured_image: url,
                }))
              }
              onDelete={() =>
                setFormData((prev) => ({
                  ...prev,
                  featured_image: '',
                }))
              }
            />
          </div>

          {/* Author */}
          <div className="border-t pt-6">
            <AuthorSelector
              selectedAuthorId={formData.author_id}
              onChange={(author_id) =>
                setFormData((prev) => ({ ...prev, author_id }))
              }
            />
          </div>

          {/* Categories */}
          <div className="border-t pt-6">
            <CategorySelector
              selectedCategoryIds={formData.category_ids}
              onChange={(category_ids) =>
                setFormData((prev) => ({ ...prev, category_ids }))
              }
            />
          </div>

          {/* SEO Section */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">SEO Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                }
                placeholder="Leave empty to use post title"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_title.length}/60
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meta_description: e.target.value,
                  }))
                }
                placeholder="Leave empty to use excerpt"
                maxLength={160}
                className="w-full h-20 px-3 py-2 text-sm rounded-md border bg-background resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_description.length}/160
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_keywords">Keywords</Label>
              <Input
                id="meta_keywords"
                value={formData.meta_keywords}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meta_keywords: e.target.value,
                  }))
                }
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-xs text-muted-foreground">
                Separate with commas
              </p>
            </div>
          </div>

          {/* Post Stats */}
          <div className="border-t pt-6 space-y-2">
            <h3 className="font-semibold">Post Statistics</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Views: {post.view_count || 0}</p>
              <p>Created: {new Date(post.created_at).toLocaleDateString()}</p>
              {post.author && (
                <p>Author: {post.author.name || post.author.email}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
