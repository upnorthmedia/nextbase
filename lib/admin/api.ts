import { createClient } from '@/lib/supabase/server';
import { getDashboardStats } from '@/lib/blog/api';
import type { AdminStats } from './types';

/**
 * Get comprehensive admin statistics including user counts and blog stats
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  // Fetch user counts in parallel
  const [totalUsersResult, adminUsersResult, editorUsersResult, blogStats] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'editor'),
      getDashboardStats(),
    ]);

  const totalUsers = totalUsersResult.count || 0;
  const adminUsers = adminUsersResult.count || 0;
  const editorUsers = editorUsersResult.count || 0;
  const regularUsers = totalUsers - adminUsers - editorUsers;

  return {
    totalUsers,
    adminUsers,
    editorUsers,
    regularUsers,
    blogStats: {
      totalPosts: blogStats.totalPosts,
      publishedPosts: blogStats.publishedPosts,
      draftPosts: blogStats.draftPosts,
      totalCategories: blogStats.totalCategories,
      totalAuthors: blogStats.totalAuthors,
      totalViews: blogStats.totalViews,
    },
  };
}

/**
 * Get total user count
 */
export async function getUsersCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching users count:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Get admin users count
 */
export async function getAdminUsersCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  if (error) {
    console.error('Error fetching admin users count:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Get editor users count
 */
export async function getEditorUsersCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'editor');

  if (error) {
    console.error('Error fetching editor users count:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Get user's role from their profile
 */
export async function getUserRole(userId: string): Promise<'user' | 'admin' | 'editor' | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role as 'user' | 'admin' | 'editor' || null;
}
