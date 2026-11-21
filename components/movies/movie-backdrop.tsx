'use client';
import { ViewTransition } from 'react';
import { imageUrl } from '@/lib/types';
import { MovieImage } from '@/components/movies/movie-image';
import { useMovieNavigation } from '@/components/movies/movie-navigation';
export const MovieBackdrop = ({
  movieId,
  path,
  fallbackPath,
  title,
  detail = false,
  className = '',
}: {
  movieId: number;
  path: string | null;
  fallbackPath: string | null;
  title: string;
  detail?: boolean;
  className?: string;
}) => {
  const { origins } = useMovieNavigation();
  const selected = origins[movieId]?.artwork === 'backdrop';
  const name = detail && !selected ? `detail-backdrop-${movieId}` : `backdrop-${movieId}`;
  return (
    <ViewTransition name={name} share="backdrop-morph" default="none">
      <div className={`backdrop-image ${className}`} data-artwork-name={name}>
        <MovieImage
          src={imageUrl(path, 'w1280')}
          fallbackSrc={imageUrl(fallbackPath)}
          alt={`A scene from ${title}`}
          sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1150px) calc(100vw - 64px), (max-width: 1416px) calc(100vw - 96px), 1320px"
          priority
        />
      </div>
    </ViewTransition>
  );
};
