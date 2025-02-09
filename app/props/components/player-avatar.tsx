'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PlayerAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl?: string;
  name: string;
  size?: number;
}

export function PlayerAvatar({ imageUrl, name, size = 32, className, ...props }: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Sanitize and validate the image URL
  const sanitizedImageUrl = useMemo(() => {
    if (!imageUrl) return null;
    try {
      // Remove any trailing whitespace and control characters
      const trimmedUrl = imageUrl.trimEnd();
      // Encode the URL properly
      const encodedUrl = encodeURI(trimmedUrl);
      // Validate that it's a proper URL
      new URL(encodedUrl);
      return encodedUrl;
    } catch (error) {
      console.warn(`Invalid image URL: ${imageUrl}`, error);
      return null;
    }
  }, [imageUrl]);

  // Return initials avatar if no valid image URL or error occurred
  if (!sanitizedImageUrl || imageError) {
    return (
      <div 
        className={cn("rounded-full bg-gray-200 flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <span className="text-gray-600 text-sm font-medium">
          {name.split(' ')
            .map(n => n[0])
            .slice(0, 2) // Only use first two initials
            .join('')
            .toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <Image
        src={sanitizedImageUrl}
        alt={name}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
