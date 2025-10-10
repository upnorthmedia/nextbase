import { ForgotPasswordClient } from "@/components/auth/forgot-password-client";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <ForgotPasswordClient message={params.message} error={params.error} />;
}