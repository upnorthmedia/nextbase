'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import { forgotPasswordAction } from "@/app/auth/actions-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

interface ForgotPasswordProps {
  message?: string;
  error?: string;
}

export function ForgotPasswordClient({
  message,
  error,
}: ForgotPasswordProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Display error from URL params
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Clean up URL to remove the error param
      router.replace('/forgot-password');
    }
    if (message) {
      toast.info(message);
      router.replace('/forgot-password');
    }
  }, [message, error, router]);

  async function handleForgotPassword(formData: FormData) {
    const email = formData.get('email') as string;
    setUserEmail(email);

    startTransition(async () => {
      const loadingToast = toast.loading("Sending reset email...");

      try {
        const result = await forgotPasswordAction(formData);

        toast.dismiss(loadingToast);

        if (result.success) {
          setShowSuccess(true);
          toast.success(result.message || "Reset email sent!");
        } else {
          toast.error(result.error || "Failed to send reset email");
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("An unexpected error occurred");
        console.error('Forgot password error:', error);
      }
    });
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
            <div className="min-w-sm flex w-full bg-muted max-w-sm flex-col items-center gap-y-6 rounded-lg border px-6 py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Check your email</h2>
                  <p className="text-sm text-muted-foreground">
                    We&#39;ve sent a password reset link to
                  </p>
                  <p className="font-medium text-sm">{userEmail}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-5 w-5" />
                  <span className="text-center">Click the link in your email to reset your password</span>
                </div>

                <div className="relative w-full my-4">
                  <div className="border-border absolute h-[1px] w-full border-t"></div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Didn&#39;t receive the email? Check your spam folder or try again.
                </p>

                <Link href="/login" className="w-full">
                  <Button className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Reset password form
            <div className="min-w-sm flex w-full max-w-sm bg-muted flex-col items-center gap-y-4 rounded-lg border px-6 py-12">
              <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-xl font-semibold">Reset your password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we&#39;ll send you a link to reset your password.
                </p>
              </div>

              <form action={handleForgotPassword} className="flex w-full flex-col gap-4">
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
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            </div>
          )}

          {!showSuccess && (
            <div className="text-muted-foreground flex justify-center gap-1 text-sm">
              <p>Remember your password?</p>
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}