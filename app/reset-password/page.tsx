import { ResetPasswordClient } from "@/components/auth/reset-password-client";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <ResetPasswordClient message={params.message} error={params.error} />;
}