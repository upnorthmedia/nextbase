import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { signup, signInWithGoogle } from "@/app/auth/actions";

interface SignupProps {
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
}

const Signup = ({
  buttonText = "Create Account",
  googleText = "Continue with Google",
  signupText = "Already a user?",
  signupUrl = "/login",
}: SignupProps) => {
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
              <Button type="submit" variant="outline" className="w-full">
                <FcGoogle className="mr-2 size-5" />
                {googleText}
              </Button>
            </form>

            <div className="relative flex w-full items-center justify-center py-2">
              <div className="border-border absolute h-[1px] w-full border-t"></div>
              <span className="bg-background text-muted-foreground relative px-2 text-xs">
                OR
              </span>
            </div>

            <form action={signup} className="flex w-full flex-col gap-4">
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
                />
              </div>
              <Button type="submit" className="w-full" variant="secondary">
                {buttonText}
              </Button>
            </form>
          </div>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <Link
              href={signupUrl}
              className="text-primary font-medium hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Signup };
