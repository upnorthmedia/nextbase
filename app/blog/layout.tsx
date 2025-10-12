import { ReactNode } from 'react';
import { NewsletterSignup } from '@/components/blog/NewsletterSignup';

export default function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Optional: Add a blog-specific header or navigation here */}
      <main className="flex-1">
        {children}
      </main>

      {/* Newsletter signup section */}
      <section className="border-t mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Stay Updated
            </h3>
            <p className="text-muted-foreground mb-6">
              Get the latest posts delivered directly to your inbox.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </div>
  );
}