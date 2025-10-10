import { LoginClient } from "@/components/auth/login-client";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  return <LoginClient message={searchParams.message} error={searchParams.error} />;
}