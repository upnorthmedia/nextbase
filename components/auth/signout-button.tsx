'use client'

import { Button } from "@/components/ui/button"
import { signOutAction } from "@/app/auth/actions-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

interface SignOutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
  children?: React.ReactNode
}

export function SignOutButton({
  className,
  variant = "default",
  size = "default",
  children = "Sign Out"
}: SignOutButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent multiple clicks
    if (isPending) return

    startTransition(async () => {
      try {
        const result = await signOutAction()

        if (result.success) {
          toast.success(result.message || "Successfully signed out")
          // Navigate immediately after successful sign out
          router.push('/')
          router.refresh()
        } else {
          toast.error(result.error || "Failed to sign out")
        }
      } catch (error) {
        console.error("Sign out error:", error)
        toast.error("An unexpected error occurred while signing out")
      }
    })
  }

  return (
    <Button
      onClick={handleSignOut}
      variant={variant}
      size={size}
      className={className}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        children
      )}
    </Button>
  )
}