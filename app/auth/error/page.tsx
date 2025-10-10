import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; description?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const description = params.description

  const getErrorMessage = () => {
    if (description) return description

    switch (error) {
      case 'session_exchange_failed':
        return 'Failed to complete the sign-in process. Please try again.'
      case 'unexpected_error':
        return 'An unexpected error occurred. Please try again.'
      case 'invalid_request':
        return 'Invalid authentication request. Please try signing in again.'
      case 'access_denied':
        return 'Access was denied during the authentication process.'
      case 'verification_expired':
        return 'This verification link has expired. Please sign up again or request a new verification email.'
      case 'verification_failed':
        return 'Unable to verify your email. The link may be invalid or already used.'
      default:
        return 'Sorry, there was an error confirming your authentication. This link may have expired or already been used.'
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage()}
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-muted-foreground font-mono">
              Error code: {error}
            </p>
          )}
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