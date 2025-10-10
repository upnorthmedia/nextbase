/**
 * Get the site URL for OAuth redirects
 * This helper ensures we use the correct URL in both development and production
 */
export function getSiteURL(): string {
  // In production, always use the environment variable if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // In Vercel deployments, use the VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Default to localhost for development
  return 'http://localhost:3000'
}