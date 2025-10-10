'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function WelcomeMessage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  useEffect(() => {
    if (message) {
      // Show success toast for welcome/verification messages
      toast.success(message)

      // Clean up the URL to remove the message parameter
      router.replace('/dashboard')
    }
  }, [message, router])

  return null
}