"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

interface LoginProps {
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
}

const Login = ({
  buttonText = "Login",
  googleText = "Login with Google",
  signupText = "Need an account?",
  signupUrl = "/signup",
}: LoginProps = {}) => {
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
            <Button className="w-full">
              <FcGoogle className="mr-2 size-5" />
              {googleText}
            </Button>

            <div className="relative flex w-full items-center justify-center py-2">
              <div className="border-border absolute h-[1px] w-full border-t"></div>
              <span className="bg-background text-muted-foreground relative px-2 text-xs">
                OR
              </span>
            </div>

            <form className="flex w-full flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
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
                  placeholder="Password"
                  className="bg-background text-sm"
                  autoComplete="current-password"
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
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login };
