import { ReactNode } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Settings,
  ArrowLeft,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectedFrom=/admin');
  }

  const navigation = [
    { name: 'Admin Home', href: '/admin', icon: Shield },
    { name: 'Blog Dashboard', href: '/admin/blog', icon: LayoutDashboard },
    { name: 'All Posts', href: '/admin/blog', icon: FileText },
    { name: 'Categories', href: '/admin/blog/categories', icon: FolderOpen },
    { name: 'Authors', href: '/admin/blog/authors', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container flex gap-6 py-6 px-4">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              <Link
                href="/admin/blog/new"
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <FileText className="h-4 w-4" />
                New Post
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
