import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            Sorry, there was an error confirming your authentication. This link may have expired or already been used.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="default">
              Try Logging In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}