import { Metadata } from "next";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Cta } from "@/components/home/cta";
import { Testimonial } from "@/components/home/testimonials";
import { FeatureShowcase } from "@/components/home/feature-showcase";
import { TechStack } from "@/components/home/tech-stack";
import { siteConfig } from "@/lib/seo/constants";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: siteConfig.name, // Homepage gets just the site name, no template
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function Home() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Hero />
      <Features />
      <FeatureShowcase />
      <TechStack />
      <Testimonial />
      <Cta heading="Get Started Today" description="Sign up now to experience all the features we offer." />
    </>
  )
}