"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const techStack = [
  {
    name: "Next.js",
    logo: "/logos/next.svg",
    category: "Framework",
    invertOnDark: true, // Black logo needs inversion in dark mode
    useTextColor: false,
  },
  {
    name: "TypeScript",
    logo: "/logos/typescript-icon.svg",
    category: "Language",
    invertOnDark: false, // Colored logo works in both modes
    useTextColor: false,
  },
  {
    name: "Supabase",
    logo: "/logos/supabase-original.svg",
    category: "Backend",
    invertOnDark: false, // Colored logo works in both modes
    useTextColor: false,
  },
  {
    name: "Tailwind CSS",
    logo: "/logos/tailwindcss-dark.svg",
    category: "Styling",
    invertOnDark: true,
    useTextColor: false, // Text part needs foreground color
  },
  {
    name: "shadcn/ui",
    logo: "/logos/shadcnui-dark.svg",
    category: "Components",
    invertOnDark: true,
    useTextColor: false, // Uses currentColor, needs text color applied
  }
];

const TechStack = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-22 bg-muted">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold mb-4 lg:text-5xl">
            Built With Modern Technologies
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powered by industry-leading tools and frameworks for optimal performance, developer experience, and scalability
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-5 lg:gap-8">
          {techStack.map((tech) => {
            const shouldInvert = mounted && theme === "dark" && tech.invertOnDark;

            return (
              <div
                key={tech.name}
                className="group relative flex flex-col items-center justify-center p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`relative w-16 h-16 mb-4 flex items-center justify-center ${
                  tech.useTextColor ? "text-foreground" : ""
                }`}>
                  <Image
                    src={tech.logo}
                    alt={`${tech.name} logo`}
                    width={64}
                    height={64}
                    className={`object-contain transition-transform duration-300 group-hover:scale-110 ${
                      shouldInvert ? "invert" : ""
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-center mb-1">{tech.name}</h3>
                <p className="text-muted-foreground text-xs text-center">
                  {tech.category}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { TechStack };
