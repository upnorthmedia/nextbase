'use client';

import { useState, useEffect } from 'react';
import { getCategoriesForSelector } from './CategorySelector.actions';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/lib/blog/types';
import { Tag } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategoryIds: string[];
  onChange: (categoryIds: string[]) => void;
}

export function CategorySelector({
  selectedCategoryIds,
  onChange,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await getCategoriesForSelector();
        if (result.success) {
          setCategories(result.categories);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  const handleSelect = (categoryId: string) => {
    if (categoryId === 'none') {
      onChange([]);
      return;
    }

    // Single selection only
    onChange([categoryId]);
  };

  const selectedCategory = selectedCategoryIds.length > 0
    ? categories.find((cat) => cat.id === selectedCategoryIds[0])
    : null;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="text-sm text-muted-foreground">
          Loading categories...
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="text-sm text-muted-foreground">
          No categories available. Create one first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="category-select">Category</Label>
      <Select
        value={selectedCategoryIds[0] || 'none'}
        onValueChange={handleSelect}
      >
        <SelectTrigger id="category-select" className="w-full">
          <SelectValue>
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span>{selectedCategory.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select category...</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">No category</span>
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <span className="font-medium">{category.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select a category for this post
      </p>
    </div>
  );
}
