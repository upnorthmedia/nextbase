import { Suspense } from 'react';
import { getAdminStats } from '@/lib/admin/api';
import {
  Users,
  Shield,
  Edit,
  FileText,
  FolderOpen,
  Eye,
  UserCheck,
} from 'lucide-react';

async function AdminStats() {
  const stats = await getAdminStats();

  const userStatCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Admin Users',
      value: stats.adminUsers,
      icon: Shield,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Editor Users',
      value: stats.editorUsers,
      icon: Edit,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Regular Users',
      value: stats.regularUsers,
      icon: UserCheck,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  const blogStatCards = [
    {
      label: 'Total Posts',
      value: stats.blogStats.totalPosts,
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Published',
      value: stats.blogStats.publishedPosts,
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Categories',
      value: stats.blogStats.totalCategories,
      icon: FolderOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Total Views',
      value: stats.blogStats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {userStatCards.map((stat) => {
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
      </div>

      {/* Blog Statistics Preview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Blog Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {blogStatCards.map((stat) => {
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
      </div>
    </div>
  );
}




function StatsSkeleton() {
  return (
    <div className="space-y-8">
      {/* User Stats Skeleton */}
      <div>
        <div className="h-6 w-40 bg-muted animate-pulse rounded mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border bg-card p-6"
            >
              <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Stats Skeleton */}
      <div>
        <div className="h-6 w-40 bg-muted animate-pulse rounded mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border bg-card p-6"
            >
              <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default async function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            System overview and administration
          </p>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<StatsSkeleton />}>
        <AdminStats />
      </Suspense>
    </div>
  );
}
