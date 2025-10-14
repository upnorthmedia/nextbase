'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { resetPasswordAction } from "@/app/auth/actions-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition, useEffect, useState } from "react";

interface ResetPasswordProps {
  message?: string;
  error?: string;
}

export function ResetPasswordClient({
  message,
  error,
}: ResetPasswordProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [passwordError, setPasswordError] = useState("");

  // Display error from URL params
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Clean up URL to remove the error param
      router.replace('/reset-password');
    }
    if (message) {
      toast.info(message);
      router.replace('/reset-password');
    }
  }, [message, error, router]);

  async function handleResetPassword(formData: FormData) {
    setPasswordError("");

    startTransition(async () => {
      const loadingToast = toast.loading("Resetting password...");

      try {
        const result = await resetPasswordAction(formData);

        toast.dismiss(loadingToast);

        if (result.success) {
          toast.success(result.message || "Password reset successfully!");
          // Redirect to login page
          router.push('/login?message=' + encodeURIComponent('Password reset successfully! Please log in with your new password.'));
        } else {
          setPasswordError(result.error || "Failed to reset password");
          toast.error(result.error || "Failed to reset password");
        }
      } catch {
        toast.dismiss(loadingToast);
        toast.error("An unexpected error occurred");
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

          <div className="min-w-sm flex w-full bg-muted max-w-sm flex-col items-center gap-y-4 rounded-lg border px-6 py-12">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-xl font-semibold">Reset your password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            <form action={handleResetPassword} className="flex w-full flex-col gap-4">
              {passwordError && (
                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md">
                  {passwordError}
                </div>
              )}

              <div className="flex w-full flex-col gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  className="bg-background text-sm"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="flex w-full flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-background text-sm"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={isPending}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </div>

          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>Remember your password?</p>
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}