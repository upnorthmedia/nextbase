'use server';

import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/blog/api';
import { revalidateAfterCategoryChange, revalidateAfterCategoryDelete } from '@/lib/blog/revalidation';
import type { CategoryFormData } from '@/lib/blog/types';

export async function getCategoriesAction() {
  try {
    const categories = await getCategories();

    // Transform post_count from Supabase aggregate format to number
    const transformedCategories = categories.map(category => ({
      ...category,
      post_count: Array.isArray(category.post_count) && category.post_count.length > 0
        ? category.post_count[0].count
        : 0
    }));

    return { success: true, categories: transformedCategories };
  } catch {
    return { success: false, error: 'Failed to fetch categories', categories: [] };
  }
}

export async function createCategoryAction(data: CategoryFormData) {
  try {
    const category = await createCategory(data);
    await revalidateAfterCategoryChange(category.slug);
    return { success: true, category };
  } catch {
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategoryAction(id: string, data: Partial<CategoryFormData>) {
  try {
    const category = await updateCategory(id, data);
    if (data.slug) {
      await revalidateAfterCategoryChange(data.slug);
    }
    return { success: true, category };
  } catch {
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await deleteCategory(id);
    await revalidateAfterCategoryDelete();
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete category. It may be in use by posts.' };
  }
}
