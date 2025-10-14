import Image, { StaticImageData } from "next/image";
import { Lock, FileText, BarChart3 } from "lucide-react";
import authFeature from "@/public/auth-feature.png";
import blogFeature from "@/public/blog-feature.png";
import adminFeature from "@/public/admin-feature.png";

interface Feature {
  title: string;
  description: string;
  features: string[];
  image: StaticImageData;
  imageAlt: string;
  icon: React.ComponentType<{ className?: string }>;
}

const features: Feature[] = [
  {
    title: "Complete Authentication System",
    description:
      "Production-ready authentication with email verification, password recovery, and OAuth integration. Everything you need to secure your application from day one.",
    features: [
      "Email & password authentication with verification",
      "OAuth integration (Google) ready to extend",
      "Secure password recovery flow",
      "Protected routes with middleware",
      "User profile management",
    ],
    image: authFeature,
    imageAlt: "Authentication system interface",
    icon: Lock,
  },
  {
    title: "SEO-Optimized Blog Platform",
    description:
      "Launch your content marketing strategy immediately with a fully-featured blog system. Manage posts, categories, and authors with an intuitive interface.",
    features: [
      "Rich text editor for blog posts",
      "Categories and author management",
      "Automatic sitemap generation",
      "SEO metadata and structured data",
      "Fast, optimized image handling",
    ],
    image: blogFeature,
    imageAlt: "Blog management dashboard",
    icon: FileText,
  },
  {
    title: "Powerful Admin Dashboard",
    description:
      "Monitor your application with a comprehensive admin dashboard. Manage users, analyze metrics, and control your blog content all in one place.",
    features: [
      "User analytics and management",
      "Blog post performance metrics",
      "Real-time data visualization",
      "Content moderation tools",
      "Role-based access control ready",
    ],
    image: adminFeature,
    imageAlt: "Analytics dashboard with charts",
    icon: BarChart3,
  },
];

const FeatureShowcase = () => {
  return (
    <section className="py-22">
      <div className="container">
        <div className="mb-12 text-center">
          <p className="bg-muted rounded-full px-4 py-1 text-xs uppercase inline-block">
            Core Features
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Built for Speed & Scale
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Every feature you need to launch and grow your application, pre-built and ready to customize.
          </p>
        </div>

        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className={`flex flex-col gap-8 lg:gap-12 ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center`}
              >
                {/* Image Side */}
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2">
                  <div className="mb-4 inline-flex rounded-lg p-3">
                    <Icon className="text-primary size-6" />
                  </div>
                  <h3 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg
                          className="text-primary mt-1 size-5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { FeatureShowcase };
