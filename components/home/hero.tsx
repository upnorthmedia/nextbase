"use client";

import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to light theme image during SSR
  const heroImage = mounted && theme === "dark" ? "/hero-img-dark.png" : "/hero-img.png";

  return (
    <section className="pb-22 pt-10">
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="bg-muted flex justify-end">
          <Image
            src={heroImage}
            alt="placeholder hero"
            width={1100}
            height={1100}
            className="max-h-[400px] w-full rounded-md lg:max-h-[600px]"
          />
        </div>
        <div className="flex flex-col items-center text-center lg:max-w-3xl lg:items-start lg:text-left">
          <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl xl:text-7xl">
            NextJS + Supabase Starter Kit
          </h1>
          <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
            Finely crafted starter kit for NextJS, Typescript, TailwindCSS, ShadCN and Supabase.
            Everything you need to build your next project.
          </p>
          <div className="mb-12 flex w-fit flex-col items-center gap-4 sm:flex-row">
            <span className="inline-flex items-center -space-x-4">
              <Avatar className="size-12 border">
                <AvatarImage
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp"
                  alt="placeholder"
                />
              </Avatar>
              <Avatar className="size-12 border">
                <AvatarImage
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp"
                  alt="placeholder"
                />
              </Avatar>
              <Avatar className="size-12 border">
                <AvatarImage
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp"
                  alt="placeholder"
                />
              </Avatar>
              <Avatar className="size-12 border">
                <AvatarImage
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp"
                  alt="placeholder"
                />
              </Avatar>
              <Avatar className="size-12 border">
                <AvatarImage
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp"
                  alt="placeholder"
                />
              </Avatar>
            </span>
            <div>
              <div className="flex items-center gap-1">
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">5.0</span>
              </div>
              <p className="text-muted-foreground text-left font-medium">
                from 200+ reviews
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
            <Button size="lg" className="w-full text-lg px-8 py-6 sm:w-auto" asChild>
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
