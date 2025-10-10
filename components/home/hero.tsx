import { ArrowDownRight, Star } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="py-22">
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="bg-muted flex justify-end">
          <Image
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
            alt="placeholder hero"
            width={800}
            height={600}
            className="max-h-[600px] w-full rounded-md object-cover lg:max-h-[800px]"
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
            <Button className="w-full sm:w-auto">Sign Up</Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Get Started
              <ArrowDownRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
