import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Full Stack Developer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
    content:
      "This boilerplate saved me weeks of setup time. The authentication system is rock solid and the blog integration is seamless. I launched my SaaS in days, not months!",
  },
  {
    name: "Michael Rodriguez",
    role: "Startup Founder",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
    content:
      "The admin dashboard is incredibly powerful. Managing blog content and monitoring user analytics has never been easier. Best investment for our MVP launch.",
  },
  {
    name: "Emily Watson",
    role: "Indie Hacker",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
    content:
      "I've tried many Next.js starters, but this one stands out. The SEO optimization is top-notch and the Supabase integration just works. Highly recommended!",
  },
  {
    name: "David Kim",
    role: "Product Manager",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
    content:
      "Our team loves the clean code structure and TypeScript setup. The blog system helped us launch our content marketing strategy immediately. Worth every penny.",
  },
  {
    name: "Lisa Thompson",
    role: "Frontend Developer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
    content:
      "The authentication flow with email verification and OAuth is production-ready. No bugs, no hassle. Just clone and customize for your brand.",
  },
  {
    name: "James Park",
    role: "Tech Lead",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp",
    content:
      "Best Next.js boilerplate I've used. The dashboard, blog, and user management features are enterprise-grade. Saved our team countless hours of development.",
  },
];

const Testimonial = () => {
  return (
    <section className="py-22">
      <div className="container">
        <Carousel className="w-full">
          <div className="mb-8 flex justify-between px-1 lg:mb-12">
            <h2 className="text-2xl font-semibold lg:text-5xl">
              What Developers Are Saying
            </h2>
            <div className="flex items-center space-x-2">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </div>
          <CarouselContent>
            {testimonials.map((testimonial, idx) => (
              <CarouselItem
                key={idx}
                className="basis-full md:basis-1/2 lg:basis-1/3"
              >
                <div className="h-full p-1">
                  <div className="flex h-full flex-col justify-between rounded-lg border p-6 bg-muted">
                    <q className="text-foreground/70 leading-7">
                      {testimonial.content}
                    </q>
                    <div className="mt-6 flex gap-4 leading-5">
                      <Avatar className="ring-input size-9 rounded-full ring-1">
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Testimonial };
