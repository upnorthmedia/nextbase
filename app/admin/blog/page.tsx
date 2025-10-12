import { Suspense } from 'react';
import Link from 'next/link';
import { getBlogPosts, getDashboardStats } from '@/lib/blog/api';
import { formatDate } from '@/lib/blog/utils';
import {
  FileText,
  Eye,
  FolderOpen,
  Users,
  Edit,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

async function DashboardStats() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Published',
      value: stats.publishedPosts,
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Drafts',
      value: stats.draftPosts,
      icon: FileText,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Categories',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Authors',
      value: stats.totalAuthors,
      icon: Users,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-lg border bg-card p-6"
          >
            <div className={`rounded-lg p-3 ${stat.bgColor}`}>
              <Icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

async function RecentPosts() {
  const result = await getBlogPosts({
    limit: 10,
    orderBy: 'updated_at',
    order: 'desc',
    // Don't include status filter to show all posts (drafts, published, archived)
  });

  const { posts } = result;

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating your first blog post.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/blog/new">Create Post</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h3 className="font-semibold">Recent Posts</h3>
      </div>
      <div className="divide-y">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{post.title}</h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    post.status === 'published'
                      ? 'bg-green-500/10 text-green-500'
                      : post.status === 'draft'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-gray-500/10 text-gray-500'
                  }`}
                >
                  {post.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatDate(post.updated_at)}</span>
                {post.author && <span>by {post.author.name}</span>}
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.view_count}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {post.status === 'published' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View post</span>
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <Link href={`/admin/blog/edit/${post.id}`}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit post</span>
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-6">
          <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="divide-y">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminBlogPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your blog posts and content
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <FileText className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Recent Posts */}
      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>
    </div>
  );
}
