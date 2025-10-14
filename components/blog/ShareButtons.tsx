'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export function ShareButtons({ url, title, description, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  const handleShare = () => {
    // Track analytics if needed
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm font-medium text-muted-foreground">Share:</span>

      {/* Twitter */}
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9"
        onClick={() => {
          handleShare();
          window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer');
        }}
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
        <span className="sr-only">Share on Twitter</span>
      </Button>

      {/* Facebook */}
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9"
        onClick={() => {
          handleShare();
          window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer');
        }}
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
        <span className="sr-only">Share on Facebook</span>
      </Button>

      {/* LinkedIn */}
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9"
        onClick={() => {
          handleShare();
          window.open(shareLinks.linkedin, '_blank', 'noopener,noreferrer');
        }}
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        <span className="sr-only">Share on LinkedIn</span>
      </Button>

      {/* Copy Link */}
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9"
        onClick={handleCopyLink}
        title="Copy link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        <span className="sr-only">{copied ? 'Link copied!' : 'Copy link'}</span>
      </Button>
    </div>
  );
}

// Compact vertical share buttons for sidebar
export function ShareButtonsVertical({ url, title, description, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer')}
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer')}
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => window.open(shareLinks.linkedin, '_blank', 'noopener,noreferrer')}
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={handleCopyLink}
        title="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
