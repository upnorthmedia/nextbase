'use server';

import { createClient } from '@/lib/supabase/server';
import type { Author } from '@/lib/blog/types';

export async function getAuthorsForSelector(): Promise<{
  success: boolean;
  authors: Author[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: authors, error } = await supabase
      .from('authors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return {
        success: false,
        authors: [],
        error: 'Failed to load authors',
      };
    }

    return {
      success: true,
      authors: authors || [],
    };
  } catch {
    return {
      success: false,
      authors: [],
      error: 'An unexpected error occurred',
    };
  }
}
