'use client';
import { ViewTransition } from 'react';
import { imageUrl } from '@/lib/links';
import { MovieImage } from '@/components/movies/movie-image';
import { useMovieNavigation } from '@/components/movies/movie-navigation';

export const MoviePoster = ({
  movieId,
  path,
  title,
  name,
  detail = false,
  priority = false,
  className = '',
  sizes,
}: {
  movieId: number;
  path: string | null;
  title: string;
  name?: string;
  detail?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) => {
  const { origins } = useMovieNavigation();
  const origin = origins[movieId];
  const posterName =
    detail && origin?.artwork === 'backdrop'
      ? `detail-poster-${movieId}`
      : ((detail ? origin?.posterName : name) ?? `poster-${movieId}`);
  return (
    <ViewTransition name={posterName} share="poster-morph" default="none">
      <div className={`poster-image ${className}`} data-poster-name={posterName}>
        <MovieImage
          src={imageUrl(path)}
          alt={`${title} poster`}
          sizes={
            sizes ??
            (detail
              ? '(max-width: 520px) 104px, (max-width: 760px) 160px, 240px'
              : '(max-width: 520px) calc((100vw - 56px) / 2), (max-width: 760px) calc((100vw - 72px) / 3), (max-width: 1150px) calc((100vw - 124px) / 4), (max-width: 1416px) calc((100vw - 196px) / 6), 204px')
          }
          priority={priority}
        />
      </div>
    </ViewTransition>
  );
};
