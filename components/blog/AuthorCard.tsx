import Image from 'next/image';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Globe } from 'lucide-react';
import type { Author } from '@/lib/blog/types';
import { cn } from '@/lib/utils';

interface AuthorCardProps {
  author: Author;
  className?: string;
  showBio?: boolean;
  showSocial?: boolean;
}

export function AuthorCard({
  author,
  className,
  showBio = true,
  showSocial = true,
}: AuthorCardProps) {
  const socialLinks = author.social_links || {};

  return (
    <div className={cn('flex gap-4 p-6', className)}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {author.avatar_url ? (
          <Image
            src={author.avatar_url}
            alt={author.name}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold">
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <h3 className="font-semibold text-lg">{author.name}</h3>
          {author.email && (
            <a
              href={`mailto:${author.email}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {author.email}
            </a>
          )}
        </div>

        {showBio && author.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {author.bio}
          </p>
        )}

        {showSocial && Object.keys(socialLinks).length > 0 && (
          <div className="flex gap-2">
            {socialLinks.twitter && (
              <Link
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Twitter"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
            )}

            {socialLinks.github && (
              <Link
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="GitHub"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            )}

            {socialLinks.linkedin && (
              <Link
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            )}

            {socialLinks.website && (
              <Link
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="Website"
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Website</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact author display for post header
export function AuthorMeta({ author, date }: { author: Author; date: string }) {
  return (
    <div className="flex items-center gap-3">
      {author.avatar_url ? (
        <Image
          src={author.avatar_url}
          alt={author.name}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
          {author.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex flex-col">
        <span className="font-medium text-sm">{author.name}</span>
        <time className="text-xs text-muted-foreground" dateTime={date}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </div>
    </div>
  );
}
