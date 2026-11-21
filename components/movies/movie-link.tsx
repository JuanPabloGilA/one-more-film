'use client';
import { useState, type ReactNode } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { useMovieNavigation, type ArtworkKind } from '@/components/movies/movie-navigation';

// Fetch the full dynamic route on intent, rather than fetching every movie's
// cast, videos and recommendations when a grid appears. This reduces loading
// time for the film the user is about to open.
const PendingIndicator = () => {
  const { pending } = useLinkStatus();
  return (
    <span className={`navigation-pending${pending ? ' is-pending' : ''}`} role="status">
      {pending ? 'Opening film…' : ''}
    </span>
  );
};

export const MovieLink = ({
  movieId,
  children,
  className,
  ariaLabel,
  posterName,
  artwork = 'poster',
}: {
  movieId: number;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  posterName?: string;
  artwork?: ArtworkKind;
}) => {
  const [prefetch, setPrefetch] = useState(false);
  const { remember } = useMovieNavigation();
  return (
    <Link
      href={`/movie/${movieId}`}
      scroll={false}
      onNavigate={() => remember(movieId, posterName ?? `poster-${movieId}`, artwork)}
      className={className}
      aria-label={ariaLabel}
      prefetch={prefetch}
      onTouchStart={() => setPrefetch(true)}
      onMouseEnter={() => setPrefetch(true)}
      onFocus={() => setPrefetch(true)}
    >
      {children}
      <PendingIndicator />
    </Link>
  );
};
