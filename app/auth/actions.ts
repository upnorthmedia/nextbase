'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteURL } from '@/lib/utils/site-url'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Type-casting here for convenience
  // In practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect('/signup?error=Passwords do not match')
  }

  // Validate password length
  if (password.length < 6) {
    redirect('/signup?error=Password must be at least 6 characters')
  }

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup error:', error)
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (authData?.user?.identities?.length === 0) {
    redirect('/signup?error=User already exists')
  }

  // If email confirmation is required, redirect to a confirmation page
  // Otherwise, redirect to login
  redirect('/login?message=Check your email to confirm your account')
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/dashboard?error=Error signing out')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const siteURL = getSiteURL()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteURL}/auth/confirm`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    redirect('/login?error=Error with Google sign in')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithGitHub() {
  const supabase = await createClient()
  const siteURL = getSiteURL()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${siteURL}/auth/confirm`,
    },
  })

  if (error) {
    redirect('/login?error=Error with GitHub sign in')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const siteURL = getSiteURL()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteURL}/auth/reset-password`,
  })

  if (error) {
    redirect('/forgot-password?error=Error sending reset email')
  }

  redirect('/forgot-password?message=Check your email for the reset link')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    redirect('/auth/reset-password?error=Error updating password')
  }

  redirect('/dashboard?message=Password updated successfully')
}