'use server';

import { getCategories } from '@/lib/blog/api';

export async function getCategoriesForSelector() {
  try {
    const categories = await getCategories();
    return { success: true, categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories', categories: [] };
  }
}
