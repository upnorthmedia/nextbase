import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/auth/signout-button'
import { WelcomeMessage } from '@/components/dashboard/welcome-message'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const error = params.error

  return (
    <div className="container mx-auto py-32">
      <WelcomeMessage />

      {error === 'unauthorized' && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Access Denied:</strong> You don&apos;t have permission to access the admin dashboard.
              Please contact an administrator if you need access.
            </p>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.email}!
          </p>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Account Information</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Last Sign In</span>
              <span>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>

          <div className="flex gap-4">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  )
}