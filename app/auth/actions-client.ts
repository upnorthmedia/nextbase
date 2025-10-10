'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: error.message || 'Invalid credentials'
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Successfully logged in!'
  }
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Passwords do not match'
    }
  }

  // Validate password length
  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters'
    }
  }

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: error.message
    }
  }

  if (authData?.user?.identities?.length === 0) {
    return {
      success: false,
      error: 'An account with this email already exists'
    }
  }

  // If email confirmation is required
  if (authData?.user && !authData.session) {
    return {
      success: true,
      message: 'Success! Check your email to confirm your account.'
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Account created successfully!'
  }
}

export async function signOutAction() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      success: false,
      error: 'Error signing out'
    }
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Successfully signed out'
  }
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  // Get the current origin for the redirect URL
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?type=recovery&next=/reset-password`,
  })

  if (error) {
    return {
      success: false,
      error: error.message || 'Failed to send reset email'
    }
  }

  return {
    success: true,
    message: 'Password reset email sent! Please check your inbox.'
  }
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Passwords do not match'
    }
  }

  // Validate password length
  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters'
    }
  }

  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return {
      success: false,
      error: error.message || 'Failed to reset password'
    }
  }

  // Sign out the user after password reset for security
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'Password reset successfully! Please log in with your new password.'
  }
}