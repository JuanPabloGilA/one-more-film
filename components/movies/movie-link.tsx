'use client';
import { useState, type ReactNode } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { useMovieNavigation, type ArtworkKind } from '@/components/movies/movie-navigation';
import { routes } from '@/lib/links';

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
  // Prefetch on intent instead of on render: a grid would otherwise fetch the cast,
  // videos and recommendations of every film it shows.
  const [prefetch, setPrefetch] = useState(false);
  const enablePrefetch = () => setPrefetch(true);
  const { remember } = useMovieNavigation();
  return (
    <Link
      href={routes.movie(movieId)}
      scroll={false}
      onNavigate={() => remember(movieId, posterName ?? `poster-${movieId}`, artwork)}
      className={className}
      aria-label={ariaLabel}
      prefetch={prefetch}
      onTouchStart={enablePrefetch}
      onMouseEnter={enablePrefetch}
      onFocus={enablePrefetch}
    >
      {children}
      <PendingIndicator />
    </Link>
  );
};
