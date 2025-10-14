'use server';

import { getAuthors, createAuthor, updateAuthor } from '@/lib/blog/api';
import { revalidateAfterAuthorChange } from '@/lib/blog/revalidation';
import type { AuthorFormData } from '@/lib/blog/types';

export async function getAuthorsAction() {
  try {
    const authors = await getAuthors();
    return { success: true, authors };
  } catch {
    return { success: false, error: 'Failed to fetch authors', authors: [] };
  }
}

export async function createAuthorAction(data: AuthorFormData) {
  try {
    const author = await createAuthor(data);
    await revalidateAfterAuthorChange();
    return { success: true, author };
  } catch {
    return { success: false, error: 'Failed to create author' };
  }
}

export async function updateAuthorAction(id: string, data: Partial<AuthorFormData>) {
  try {
    const author = await updateAuthor(id, data);
    await revalidateAfterAuthorChange();
    return { success: true, author };
  } catch {
    return { success: false, error: 'Failed to update author' };
  }
}
