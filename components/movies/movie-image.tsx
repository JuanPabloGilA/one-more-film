'use client';
import Image from 'next/image';
import { Film } from 'lucide-react';
import { useState } from 'react';
export const MovieImage = ({
  src,
  fallbackSrc,
  alt,
  sizes,
  priority = false,
  className = '',
}: {
  src: string | null;
  fallbackSrc?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) => {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const source = [src, fallbackSrc].find((candidate): candidate is string =>
    Boolean(candidate && !failedSources.includes(candidate)),
  );
  if (!source)
    return (
      <div
        className={`image-fallback ${className}`}
        role="img"
        aria-label={`${alt} — artwork unavailable`}
      >
        <Film size={24} strokeWidth={1.5} />
        <span>Artwork unavailable</span>
      </div>
    );
  return (
    <Image
      key={source}
      src={source}
      alt={alt}
      fill
      sizes={sizes}
      quality={60}
      preload={priority}
      loading={priority ? undefined : 'lazy'}
      fetchPriority={priority ? 'high' : 'low'}
      className={className}
      onError={() => setFailedSources((previous) => [...previous, source])}
    />
  );
};
