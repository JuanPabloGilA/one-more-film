import { UserRound } from 'lucide-react';
import { MovieImage } from '@/components/movies/movie-image';
import { imageUrl } from '@/lib/links';

export const PersonPortrait = ({
  path,
  name,
  sizes,
  priority = false,
  alt = name,
}: {
  path: string | null;
  name: string;
  sizes: string;
  priority?: boolean;
  alt?: string;
}) => (
  <MovieImage
    src={imageUrl(path, priority ? 'w500' : 'w185')}
    alt={alt}
    sizes={sizes}
    priority={priority}
    fallback={<UserRound className="person-placeholder" strokeWidth={1.25} aria-hidden="true" />}
  />
);
