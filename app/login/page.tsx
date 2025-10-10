import { LoginClient } from "@/components/auth/login-client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <LoginClient message={params.message} error={params.error} />;
}