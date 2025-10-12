import { createClient } from '@/lib/supabase/server';
import type {
  BlogPost,
  BlogPostsResponse,
  Category,
  Author,
  PaginationParams,
  BlogFilters,
  SearchResult,
  DashboardStats,
  BlogPostFormData,
  CategoryFormData,
  AuthorFormData,
} from './types';

const POSTS_PER_PAGE = 12;

// ============= Blog Posts APIs =============

export async function getBlogPosts(
  params: PaginationParams & BlogFilters = {}
): Promise<BlogPostsResponse> {
  const supabase = await createClient();

  const {
    page = 1,
    limit = POSTS_PER_PAGE,
    orderBy = 'published_at',
    order = 'desc',
    status, // No default - must be explicitly provided if filtering is desired
    category,
    author,
    search,
    startDate,
    endDate,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // If we need to filter by category, first get the post IDs
  let postIdsInCategory: string[] | null = null;
  if (category) {
    const { data: categoryPosts } = await supabase
      .from('blog_post_categories')
      .select('blog_post_id')
      .eq('category_id', category);

    if (categoryPosts && categoryPosts.length > 0) {
      postIdsInCategory = categoryPosts.map(cp => cp.blog_post_id);
    } else {
      // No posts in this category, return empty result
      return {
        posts: [],
        count: 0,
        page,
        totalPages: 0,
        hasMore: false,
      };
    }
  }

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*),
      categories:blog_post_categories(
        category:categories(*)
      )
    `, { count: 'exact' });

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  // Only show published posts that are not in the future
  if (status === 'published') {
    query = query.lte('published_at', new Date().toISOString());
  }

  if (author) {
    query = query.eq('author_id', author);
  }

  if (postIdsInCategory) {
    query = query.in('id', postIdsInCategory);
  }

  if (search) {
    // Use full-text search
    query = query.textSearch('fts', search, {
      type: 'websearch',
      config: 'english',
    });
  }

  if (startDate) {
    query = query.gte('published_at', startDate);
  }

  if (endDate) {
    query = query.lte('published_at', endDate);
  }

  // Apply ordering and pagination
  query = query
    .order(orderBy, { ascending: order === 'asc' })
    .range(from, to);

  const { data: posts, count, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return {
    posts: posts || [],
    count: count || 0,
    page,
    totalPages,
    hasMore: page < totalPages,
  };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*),
      categories:blog_post_categories(
        category:categories(*)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Post not found
    }
    console.error('Error fetching blog post:', error);
    throw error;
  }

  return data;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*),
      categories:blog_post_categories(
        category:categories(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching blog post:', error);
    throw error;
  }

  return data;
}

export async function createBlogPost(data: BlogPostFormData): Promise<BlogPost> {
  const supabase = await createClient();

  const { category_ids, ...postData } = data;

  // Start a transaction by creating the post first
  const { data: post, error: postError } = await supabase
    .from('blog_posts')
    .insert(postData)
    .select()
    .single();

  if (postError) {
    console.error('Error creating blog post:', postError);
    throw postError;
  }

  // Add categories if provided
  if (category_ids && category_ids.length > 0) {
    const categoryRelations = category_ids.map(categoryId => ({
      blog_post_id: post.id,
      category_id: categoryId,
    }));

    const { error: categoryError } = await supabase
      .from('blog_post_categories')
      .insert(categoryRelations);

    if (categoryError) {
      console.error('Error adding categories:', categoryError);
      // Note: In production, you might want to delete the post here
      throw categoryError;
    }
  }

  // Return the complete post with relations
  return getBlogPostById(post.id) as Promise<BlogPost>;
}

export async function updateBlogPost(
  id: string,
  data: Partial<BlogPostFormData>
): Promise<BlogPost> {
  console.log('🔴 updateBlogPost called with id:', id);
  console.log('🔴 Data received:', JSON.stringify(data, null, 2));

  const supabase = await createClient();

  const { category_ids, ...postData } = data;
  console.log('🔴 Category IDs:', category_ids);
  console.log('🔴 Post data (without category_ids):', postData);

  // Update the post - don't select here to avoid RLS policy issues with auth.users
  console.log('🔴 Updating blog_posts table...');
  const { error: postError } = await supabase
    .from('blog_posts')
    .update(postData)
    .eq('id', id);

  if (postError) {
    console.error('❌ Error updating blog post - Full error object:');
    console.error('❌ Error Code:', postError.code);
    console.error('❌ Error Message:', postError.message);
    console.error('❌ Error Details:', postError.details);
    console.error('❌ Error Hint:', postError.hint);
    console.error('❌ Complete Error:', JSON.stringify(postError, null, 2));
    throw postError;
  }

  console.log('🟢 Post updated successfully');

  // Update categories if provided
  if (category_ids !== undefined) {
    console.log('🔴 Updating categories...');

    // Delete existing categories
    console.log('🔴 Deleting existing categories...');
    const { error: deleteError } = await supabase
      .from('blog_post_categories')
      .delete()
      .eq('blog_post_id', id);

    if (deleteError) {
      console.error('❌ Error deleting categories:', deleteError);
    } else {
      console.log('🟢 Existing categories deleted');
    }

    // Add new categories
    if (category_ids.length > 0) {
      console.log('🔴 Inserting new categories:', category_ids);
      const categoryRelations = category_ids.map(categoryId => ({
        blog_post_id: id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from('blog_post_categories')
        .insert(categoryRelations);

      if (categoryError) {
        console.error('❌ Error inserting categories:', categoryError);
        throw categoryError;
      }
      console.log('🟢 Categories inserted successfully');
    } else {
      console.log('🔵 No categories to insert (empty array)');
    }
  } else {
    console.log('🔵 category_ids is undefined, skipping category update');
  }

  console.log('🔴 Fetching updated post with relations...');
  const updatedPost = await getBlogPostById(id);
  console.log('🟢 Final updated post:', updatedPost);

  if (!updatedPost) {
    throw new Error('Post not found after update');
  }

  return updatedPost;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
}

export async function incrementViewCount(postId: string): Promise<void> {
  const supabase = await createClient();

  // Use the database function for atomic increment
  const { error } = await supabase
    .rpc('increment_view_count', { post_id: postId });

  if (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw - view counting shouldn't break the page
  }
}

// ============= Categories APIs =============

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      post_count:blog_post_categories(count)
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  // Transform the data to extract count from the nested object
  interface CategoryFromDB {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color: string;
    created_at: string;
    post_count?: Array<{ count: number }>;
  }

  const categories = (data || []).map((category: CategoryFromDB): Category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    color: category.color,
    created_at: category.created_at,
    post_count: Array.isArray(category.post_count)
      ? category.post_count[0]?.count || 0
      : 0
  }));

  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching category:', error);
    throw error;
  }

  return data;
}

export async function createCategory(data: CategoryFormData): Promise<Category> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from('categories')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<Category> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ============= Authors APIs =============

export async function getAuthors(): Promise<Author[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }

  return data || [];
}

export async function getAuthorByEmail(email: string): Promise<Author | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching author:', error);
    throw error;
  }

  return data;
}

export async function createAuthor(data: AuthorFormData): Promise<Author> {
  const supabase = await createClient();

  const { data: author, error } = await supabase
    .from('authors')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating author:', error);
    throw error;
  }

  return author;
}

export async function updateAuthor(
  id: string,
  data: Partial<AuthorFormData>
): Promise<Author> {
  const supabase = await createClient();

  const { data: author, error } = await supabase
    .from('authors')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating author:', error);
    throw error;
  }

  return author;
}

// ============= Search APIs =============

export async function searchBlogPosts(query: string): Promise<SearchResult[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      author:authors(name, avatar_url)
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .textSearch('fts', query, {
      type: 'websearch',
      config: 'english',
    })
    .limit(10);

  if (error) {
    console.error('Error searching blog posts:', error);
    throw error;
  }

  return (data || []).map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    published_at: post.published_at,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
  }));
}

// ============= Related Posts APIs =============

export async function getRelatedPosts(
  postId: string,
  limit: number = 3
): Promise<BlogPost[]> {
  const supabase = await createClient();

  // Get the current post's categories
  const { data: currentPost } = await supabase
    .from('blog_posts')
    .select('categories:blog_post_categories(category_id)')
    .eq('id', postId)
    .single();

  if (!currentPost || !currentPost.categories) {
    return [];
  }

  const categoryIds = currentPost.categories.map((c: { category_id: string }) => c.category_id);

  // Find posts with similar categories
  const { data: relatedPostIds } = await supabase
    .from('blog_post_categories')
    .select('blog_post_id')
    .in('category_id', categoryIds)
    .neq('blog_post_id', postId);

  if (!relatedPostIds || relatedPostIds.length === 0) {
    // Fallback to recent posts
    return getRecentPosts(limit, postId);
  }

  const postIds = [...new Set(relatedPostIds.map(p => p.blog_post_id))];

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*),
      categories:blog_post_categories(
        category:categories(*)
      )
    `)
    .in('id', postIds)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return data || [];
}

export async function getRecentPosts(
  limit: number = 5,
  excludeId?: string
): Promise<BlogPost[]> {
  const supabase = await createClient();

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*),
      categories:blog_post_categories(
        category:categories(*)
      )
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }

  return data || [];
}

export async function getPopularPosts(limit: number = 5): Promise<BlogPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*),
      categories:blog_post_categories(
        category:categories(*)
      )
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular posts:', error);
    return [];
  }

  return data || [];
}

// ============= Dashboard Stats =============

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Fetch all stats in parallel
  const [
    totalPostsResult,
    publishedPostsResult,
    draftPostsResult,
    totalViewsResult,
    totalAuthorsResult,
    totalCategoriesResult,
    recentPosts,
    popularPosts,
  ] = await Promise.all([
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft'),
    supabase
      .from('blog_posts')
      .select('view_count')
      .then(({ data }) =>
        data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0
      ),
    supabase.from('authors').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    getRecentPosts(5),
    getPopularPosts(5),
  ]);

  return {
    totalPosts: totalPostsResult.count || 0,
    publishedPosts: publishedPostsResult.count || 0,
    draftPosts: draftPostsResult.count || 0,
    totalViews: totalViewsResult,
    totalAuthors: totalAuthorsResult.count || 0,
    totalCategories: totalCategoriesResult.count || 0,
    recentPosts,
    popularPosts,
  };
}

// ============= Sitemap & RSS Helpers =============

export async function getAllPublishedPostSlugs(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }

  return (data || []).map(post => post.slug);
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('slug');

  if (error) {
    console.error('Error fetching category slugs:', error);
    return [];
  }

  return (data || []).map(category => category.slug);
}