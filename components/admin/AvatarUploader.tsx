'use client';

import { ImageUploader } from './ImageUploader';

interface AvatarUploaderProps {
  currentAvatar?: string;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
}

export function AvatarUploader({
  currentAvatar,
  onUploadComplete,
  onDelete,
}: AvatarUploaderProps) {
  return (
    <div className="max-w-[200px]">
      <ImageUploader
        path="avatars"
        currentImage={currentAvatar}
        onUploadComplete={onUploadComplete}
        onDelete={onDelete}
        aspectRatio="1/1"
        label="Avatar"
        description="Square image. Max 5MB."
        className="[&_img]:rounded-full [&>div]:rounded-full"
      />
    </div>
  );
}
