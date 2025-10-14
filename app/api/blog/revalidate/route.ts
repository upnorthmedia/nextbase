import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * API endpoint for on-demand revalidation of blog pages
 *
 * This endpoint allows the admin dashboard to trigger cache revalidation
 * when blog posts, categories, or authors are created, updated, or deleted.
 *
 * Usage:
 * POST /api/blog/revalidate
 * Body: {
 *   type: 'post' | 'category' | 'author' | 'all',
 *   slug?: string, // optional, for specific post/category
 *   tags?: string[] // optional, for tag-based revalidation
 * }
 */

interface RevalidationRequest {
  type: 'post' | 'category' | 'author' | 'all';
  slug?: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: RevalidationRequest = await request.json();
    const { type, slug, tags } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Revalidation type is required' },
        { status: 400 }
      );
    }

    // Perform revalidation based on type
    switch (type) {
      case 'post':
        if (slug) {
          // Revalidate specific post page
          revalidatePath(`/blog/${slug}`);
        }
        // Revalidate blog listing pages
        revalidatePath('/blog');
        // Revalidate all category/post pages (post might appear in multiple categories)
        revalidatePath('/blog/[slug]', 'page');
        break;

      case 'category':
        if (slug) {
          // Revalidate specific category page (now at /blog/slug)
          revalidatePath(`/blog/${slug}`);
        }
        // Revalidate blog listing (category filter)
        revalidatePath('/blog');
        break;

      case 'author':
        // Revalidate all blog pages (author info might appear anywhere)
        revalidatePath('/blog');
        revalidatePath('/blog/[slug]', 'page');
        break;

      case 'all':
        // Nuclear option: revalidate everything
        revalidatePath('/blog', 'layout');
        revalidatePath('/blog/[slug]', 'page');
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid revalidation type' },
          { status: 400 }
        );
    }

    // Tag-based revalidation (optional)
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        revalidateTag(tag);
      });
    }

    return NextResponse.json({
      success: true,
      revalidated: {
        type,
        slug,
        tags,
        timestamp: new Date().toISOString(),
      },
    });

  } catch {
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Blog revalidation API',
    methods: ['POST'],
  });
}
