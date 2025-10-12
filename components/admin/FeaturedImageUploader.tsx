'use client';

import { ImageUploader } from './ImageUploader';

interface FeaturedImageUploaderProps {
  currentImage?: string;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
}

export function FeaturedImageUploader({
  currentImage,
  onUploadComplete,
  onDelete,
}: FeaturedImageUploaderProps) {
  return (
    <ImageUploader
      path="featured"
      currentImage={currentImage}
      onUploadComplete={onUploadComplete}
      onDelete={onDelete}
      aspectRatio="16/9"
      label="Featured Image"
      description="Recommended: 1200x675px (16:9). Max 10MB."
    />
  );
}
