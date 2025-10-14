'use client';

import { useState, useEffect } from 'react';
import { getCategoriesAction, createCategoryAction, updateCategoryAction, deleteCategoryAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/lib/blog/types';
import { validateCategory, getValidationErrors } from '@/lib/blog/validation';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const result = await getCategoriesAction();
      if (result.success) {
        setCategories(result.categories);
      } else {
        toast.error('Failed to load categories');
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
    });
    setEditingId(null);
    setShowNewForm(false);
  };

  const startEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color,
    });
    setEditingId(category.id);
    setShowNewForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate with Zod
      const validation = validateCategory(formData);

      if (!validation.success) {
        const errors = getValidationErrors(validation.error);
        const firstError = Object.values(errors)[0];
        toast.error(firstError || 'Validation failed');
        return;
      }

      if (editingId) {
        // Update existing category
        const result = await updateCategoryAction(editingId, validation.data);
        if (!result.success) {
          toast.error(result.error || 'Failed to update category');
          return;
        }
        toast.success('Category updated successfully!');
      } else {
        // Create new category
        const result = await createCategoryAction(validation.data);
        if (!result.success) {
          toast.error(result.error || 'Failed to create category');
          return;
        }
        toast.success('Category created successfully!');
      }

      resetForm();
      await loadCategories();
    } catch {
      toast.error('Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteCategoryAction(id);
      if (!result.success) {
        toast.error(result.error || 'Failed to delete category');
        return;
      }
      toast.success('Category deleted successfully');
      await loadCategories();
    } catch {
      toast.error('Failed to delete category. It may be in use by posts.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage blog post categories
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setShowNewForm(true);
          }}
          disabled={showNewForm || editingId !== null}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* New/Edit Form */}
      {(showNewForm || editingId) && (
        <div className="border rounded-lg p-6 bg-muted/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: prev.slug || generateSlug(name),
                    }));
                  }}
                  placeholder="Enter category name..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="category-slug"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Short description..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            No categories yet. Create your first category to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEdit(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                /{category.slug}
              </p>

              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}

              {category.post_count !== undefined && (
                <p className="text-xs text-muted-foreground mt-2">
                  {category.post_count} {category.post_count === 1 ? 'post' : 'posts'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
