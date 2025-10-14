"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BrushCleaning,
  Clock,
  CodeXml,
  Plug2,
  Snowflake,
  Zap,
} from "lucide-react";
import React, { useState } from "react";

import { cn } from "@/lib/utils";

const Features = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const items = [
    {
      title: "Authentication Ready",
      description:
        "Complete auth flow with email verification, OAuth (Google), and password recovery built-in",
      icon: Plug2,
    },
    {
      title: "Blog System",
      description:
        "SEO-optimized blog with categories, authors, and full content management",
      icon: CodeXml,
    },
    {
      title: "Admin Dashboard",
      description:
        "Analytics and management interface for blog posts, users, and content",
      icon: Snowflake,
    },
    {
      title: "User Dashboard",
      description:
        "Personalized user area with profile management and account settings",
      icon: Clock,
    },
    {
      title: "Supabase Backend",
      description:
        "Database, authentication, and storage fully integrated and configured",
      icon: BrushCleaning,
    },
    {
      title: "SEO Optimized",
      description:
        "Built-in metadata, structured data, sitemaps, and performance optimization",
      icon: Zap,
    },
  ];

  return (
    <section className="overflow-hidden py-22">
      <div className="container flex w-full flex-col items-center justify-center px-4">
        <p className="bg-muted rounded-full px-4 py-1 text-xs uppercase">
          Features
        </p>
        <h2 className="relative z-20 py-2 text-center font-sans text-5xl font-semibold tracking-tighter md:py-7 lg:text-6xl">
          Everything You Need to Launch Fast
        </h2>
        <p className="text-md text-muted-foreground mx-auto max-w-xl text-center lg:text-lg">
          A complete Next.js boilerplate with authentication, blog, and admin dashboard ready to deploy.
        </p>

        <div className="relative mt-10 grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group relative block h-full w-full p-2"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {hoveredIndex === idx && (
                  <motion.span
                    className="bg-black absolute inset-0 block h-full w-full rounded-2xl"
                    layoutId="hoverBackground"
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              <Card
                title={item.title}
                description={item.description}
                icon={item.icon}
                className="flex flex-col items-center justify-center"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Features };

const Card = ({
  className,
  title,
  description,
  icon: Icon,
}: {
  className?: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  return (
    <div
      className={cn(
        "bg-muted relative z-20 flex h-full flex-col items-center justify-center gap-4 rounded-2xl p-5 text-center",
        className,
      )}
    >
      <Icon className="text-muted-foreground mt-3 size-8 stroke-1" />
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};
