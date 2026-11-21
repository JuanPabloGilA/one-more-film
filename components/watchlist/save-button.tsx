'use client';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useWatchlist } from '@/components/watchlist/watchlist-provider';
import type { Movie } from '@/lib/types';
export const SaveButton = ({ movie, compact = false }: { movie: Movie; compact?: boolean }) => {
  const { movies, ready, toggle } = useWatchlist();
  const saved = movies.some((item) => item.id === movie.id);
  return (
    <Button
      type="button"
      variant={saved ? 'secondary' : 'outline'}
      size={compact ? 'icon' : 'default'}
      className={compact ? 'absolute top-2 right-2 bg-background/95' : 'button'}
      aria-label={
        compact
          ? `${saved ? 'Remove' : 'Save'} ${movie.title}${saved ? ' from' : ' to'} watchlist`
          : `${saved ? 'Saved for later' : 'Save for later'}: ${movie.title}${saved ? '. Remove from watchlist' : ''}`
      }
      aria-pressed={saved}
      disabled={!ready}
      onClick={() => toggle(movie)}
    >
      <Bookmark size={16} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} />
      {!compact && (saved ? 'Saved for later' : 'Save for later')}
    </Button>
  );
};
