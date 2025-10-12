'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAuthorsAction, createAuthorAction, updateAuthorAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Author } from '@/lib/blog/types';
import { validateAuthor, getValidationErrors } from '@/lib/blog/validation';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: '',
    social_links: {
      twitter: '',
      linkedin: '',
      github: '',
      website: '',
    },
  });

  useEffect(() => {
    loadAuthors();
  }, []);

  async function loadAuthors() {
    try {
      const result = await getAuthorsAction();
      if (result.success) {
        setAuthors(result.authors);
      } else {
        toast.error('Failed to load authors');
      }
    } catch (error) {
      console.error('Error loading authors:', error);
      toast.error('Failed to load authors');
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      bio: '',
      avatar_url: '',
      social_links: {
        twitter: '',
        linkedin: '',
        github: '',
        website: '',
      },
    });
    setEditingId(null);
    setShowNewForm(false);
  };

  const startEdit = (author: Author) => {
    setFormData({
      name: author.name,
      email: author.email,
      bio: author.bio || '',
      avatar_url: author.avatar_url || '',
      social_links: {
        twitter: author.social_links?.twitter || '',
        linkedin: author.social_links?.linkedin || '',
        github: author.social_links?.github || '',
        website: author.social_links?.website || '',
      },
    });
    setEditingId(author.id);
    setShowNewForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clean up empty social links
      const cleanedData = {
        ...formData,
        social_links: Object.fromEntries(
          Object.entries(formData.social_links).filter(([, value]) => value.trim() !== '')
        ),
      };

      // Validate with Zod
      const validation = validateAuthor(cleanedData);

      if (!validation.success) {
        const errors = getValidationErrors(validation.error);
        const firstError = Object.values(errors)[0];
        toast.error(firstError || 'Validation failed');
        return;
      }

      if (editingId) {
        // Update existing author
        const result = await updateAuthorAction(editingId, validation.data);
        if (!result.success) {
          toast.error(result.error || 'Failed to update author');
          return;
        }
        toast.success('Author updated successfully!');
      } else {
        // Create new author
        const result = await createAuthorAction(validation.data);
        if (!result.success) {
          toast.error(result.error || 'Failed to create author');
          return;
        }
        toast.success('Author created successfully!');
      }

      resetForm();
      await loadAuthors();
    } catch (error) {
      console.error('Error saving author:', error);
      toast.error('Failed to save author. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading authors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authors</h1>
          <p className="text-muted-foreground mt-1">
            Manage blog post authors
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
          New Author
        </Button>
      </div>

      {/* New/Edit Form */}
      {(showNewForm || editingId) && (
        <div className="border rounded-lg p-6 bg-muted/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Author' : 'New Author'}
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Short bio about the author..."
                  className="w-full h-24 px-3 py-2 text-sm rounded-md border bg-background resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/500
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold">Social Links</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={formData.social_links.twitter}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        social_links: { ...prev.social_links, twitter: e.target.value },
                      }))
                    }
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.social_links.linkedin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        social_links: { ...prev.social_links, linkedin: e.target.value },
                      }))
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    id="github"
                    type="url"
                    value={formData.social_links.github}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        social_links: { ...prev.social_links, github: e.target.value },
                      }))
                    }
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.social_links.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        social_links: { ...prev.social_links, website: e.target.value },
                      }))
                    }
                    placeholder="https://example.com"
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

      {/* Authors List */}
      {authors.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            No authors yet. Create your first author to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {authors.map((author) => (
            <div
              key={author.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {author.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt={author.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xl font-semibold">
                      {author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{author.name}</h3>
                      <p className="text-sm text-muted-foreground">{author.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(author)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {author.bio && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {author.bio}
                    </p>
                  )}

                  {author.social_links && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {author.social_links.twitter && (
                        <a
                          href={author.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Twitter
                        </a>
                      )}
                      {author.social_links.linkedin && (
                        <a
                          href={author.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                      {author.social_links.github && (
                        <a
                          href={author.social_links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                      {author.social_links.website && (
                        <a
                          href={author.social_links.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
