'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

interface PlayerAvatarProps {
  imageUrl?: string;
  name: string;
  size?: number;
}

export function PlayerAvatar({ imageUrl, name, size = 32 }: PlayerAvatarProps) {
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
        className="rounded-full bg-gray-200 flex items-center justify-center"
        style={{ width: size, height: size }}
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
    <div className="relative overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <Image
        src={sanitizedImageUrl}
        alt={name}
        fill
        className="rounded-full object-cover"
        unoptimized
        onError={() => setImageError(true)}
      />
    </div>
  );
}
