'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBlogPostAction } from './actions';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { CategorySelector } from '@/components/admin/CategorySelector';
import { AuthorSelector } from '@/components/admin/AuthorSelector';
import { FeaturedImageUploader } from '@/components/admin/FeaturedImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { validateBlogPost, getValidationErrors } from '@/lib/blog/validation';

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    status: 'draft' as 'draft' | 'published',
  });

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setIsSubmitting(true);

    try {
      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        status,
        meta_keywords: formData.meta_keywords
          ? formData.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
        published_at: status === 'published' ? new Date().toISOString() : undefined,
      };

      // Validate with Zod
      const validation = validateBlogPost(dataToValidate);

      if (!validation.success) {
        const errors = getValidationErrors(validation.error);
        const firstError = Object.values(errors)[0];
        toast.error(firstError || 'Validation failed');
        return;
      }

      const result = await createBlogPostAction(validation.data);

      if (!result.success) {
        toast.error(result.error || 'Failed to create post');
        return;
      }

      toast.success(
        status === 'published'
          ? 'Post published successfully!'
          : 'Draft saved successfully!'
      );

      router.push(`/admin/blog/edit/${result.post?.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">New Post</h1>
            <p className="text-muted-foreground mt-1">
              Create a new blog post
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
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
        </div>
      </div>
    </div>
  );
}
