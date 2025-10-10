'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signInWithGoogle, signInWithGitHub } from "@/app/auth/actions";
import { loginAction } from "@/app/auth/actions-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface LoginProps {
  buttonText?: string;
  googleText?: string;
  githubText?: string;
  signupText?: string;
  signupUrl?: string;
  forgotPasswordUrl?: string;
}

export function LoginClient({
  buttonText = "Login",
  googleText = "Continue with Google",
  githubText = "Continue with GitHub",
  signupText = "Need an account?",
  signupUrl = "/signup",
  forgotPasswordUrl = "/forgot-password",
}: LoginProps = {}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleLogin(formData: FormData) {
    startTransition(async () => {
      const loadingToast = toast.loading("Logging in...")

      try {
        const result = await loginAction(formData)

        toast.dismiss(loadingToast)

        if (result.success) {
          toast.success(result.message || "Welcome back!")
          router.push('/dashboard')
          router.refresh()
        } else {
          toast.error(result.error || "Invalid credentials")
        }
      } catch (error) {
        toast.dismiss(loadingToast)
        toast.error("An unexpected error occurred")
        console.error('Login error:', error)
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

            <form action={handleLogin} className="flex w-full flex-col gap-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href={forgotPasswordUrl}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="bg-background text-sm"
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                />
              </div>
              <Button type="submit" className="w-full" variant="secondary" disabled={isPending}>
                {isPending ? "Logging in..." : buttonText}
              </Button>
            </form>
          </div>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <Link
              href={signupUrl}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}