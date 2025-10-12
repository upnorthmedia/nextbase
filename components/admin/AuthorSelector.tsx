'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Author } from '@/lib/blog/types';
import { getAuthorsForSelector } from './AuthorSelector.actions';
import { User } from 'lucide-react';

interface AuthorSelectorProps {
  selectedAuthorId?: string;
  onChange: (authorId: string | undefined) => void;
}

export function AuthorSelector({
  selectedAuthorId,
  onChange,
}: AuthorSelectorProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuthors() {
      try {
        const result = await getAuthorsForSelector();
        if (result.success) {
          setAuthors(result.authors);
        }
      } catch (error) {
        console.error('Error loading authors:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthors();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Author</Label>
        <div className="text-sm text-muted-foreground">Loading authors...</div>
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Author</Label>
        <div className="text-sm text-muted-foreground">
          No authors available.
        </div>
      </div>
    );
  }

  const selectedAuthor = authors.find((a) => a.id === selectedAuthorId);

  return (
    <div className="space-y-2">
      <Label htmlFor="author-select">Author</Label>
      <Select
        value={selectedAuthorId || 'none'}
        onValueChange={(value) => onChange(value === 'none' ? undefined : value)}
      >
        <SelectTrigger id="author-select" className="w-full">
          <SelectValue>
            {selectedAuthor ? (
              <div className="flex items-center gap-2">
                {selectedAuthor.avatar_url ? (
                  <Image
                    src={selectedAuthor.avatar_url}
                    alt={selectedAuthor.name}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
                <span>{selectedAuthor.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select author...</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">No author</span>
          </SelectItem>
          {authors.map((author) => (
            <SelectItem key={author.id} value={author.id}>
              <div className="flex items-center gap-2">
                {author.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt={author.name}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{author.name}</span>
                  {author.email && (
                    <span className="text-xs text-muted-foreground">
                      {author.email}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select the author for this post
      </p>
    </div>
  );
}
