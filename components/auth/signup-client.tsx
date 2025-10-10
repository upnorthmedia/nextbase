'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { CheckCircle2, Mail } from "lucide-react";
import { signInWithGoogle, signInWithGitHub } from "@/app/auth/actions";
import { signupAction } from "@/app/auth/actions-client";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

interface SignupProps {
  buttonText?: string;
  googleText?: string;
  githubText?: string;
  loginText?: string;
  loginUrl?: string;
}

export function SignupClient({
  buttonText = "Create Account",
  googleText = "Continue with Google",
  githubText = "Continue with GitHub",
  loginText = "Already a user?",
  loginUrl = "/login",
}: SignupProps = {}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [error, setError] = useState("")

  async function handleSignup(formData: FormData) {
    const email = formData.get('email') as string
    setUserEmail(email)
    setError("")

    startTransition(async () => {
      try {
        const result = await signupAction(formData)

        if (result.success) {
          // If email confirmation is needed, show success UI
          if (result.message?.includes('email')) {
            setShowSuccess(true)
          } else {
            // Direct login without email confirmation
            router.push('/dashboard')
            router.refresh()
          }
        } else {
          setError(result.error || "Error creating account")
        }
      } catch (error) {
        setError("An unexpected error occurred")
        console.error('Signup error:', error)
      }
    })
  }

  return (
    <section className="bg-background py-32">
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 lg:justify-start">
          {/* Logo */}
          <Image
            src="/logo.png"
            width={32}
            height={32}
            alt="Nextbase Logo"
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold tracking-tighter">
            Nextbase
          </span>

          {showSuccess ? (
            // Success state - Check email message
            <div className="min-w-sm flex w-full max-w-sm flex-col items-center gap-y-6 rounded-lg border px-6 py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Check your email</h2>
                  <p className="text-sm text-muted-foreground">
                    We&#39;ve sent a confirmation link to
                  </p>
                  <p className="font-medium text-sm">{userEmail}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Click the link in your email to confirm your account</span>
                </div>

                <div className="relative w-full my-4">
                  <div className="border-border absolute h-[1px] w-full border-t"></div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Didn&#39;t receive the email? Check your spam folder or try signing up again.
                </p>

                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Sign up form
            <div className="min-w-sm flex w-full max-w-sm flex-col items-center gap-y-4 rounded-lg border px-6 py-12">
              <form action={signInWithGoogle} className="w-full">
                <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
                  <FcGoogle className="mr-2 size-5" />
                  {googleText}
                </Button>
              </form>

              <form action={signInWithGitHub} className="w-full">
                <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
                  <FaGithub className="mr-2 size-5" />
                  {githubText}
                </Button>
              </form>

              <div className="relative flex w-full items-center justify-center py-2">
                <div className="border-border absolute h-[1px] w-full border-t"></div>
                <span className="bg-background text-muted-foreground relative px-2 text-xs">
                  OR
                </span>
              </div>

              <form action={handleSignup} className="flex w-full flex-col gap-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex w-full flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="bg-background text-sm"
                    autoComplete="email"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="flex w-full flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    className="bg-background text-sm"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="flex w-full flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    className="bg-background text-sm"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isPending}
                  />
                </div>
                <Button type="submit" className="w-full" variant="secondary" disabled={isPending}>
                  {isPending ? "Creating account..." : buttonText}
                </Button>
              </form>
            </div>
          )}

          {!showSuccess && (
            <div className="text-muted-foreground flex justify-center gap-1 text-sm">
              <p>{loginText}</p>
              <Link
                href={loginUrl}
                className="text-primary font-medium hover:underline"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}