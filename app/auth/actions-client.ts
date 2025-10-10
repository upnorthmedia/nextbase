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