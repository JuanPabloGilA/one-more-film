'use client';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/components/watchlist/watchlist-provider';
import type { Movie } from '@/lib/types';

/** `compact` is the icon-only version that sits on a poster. */
export const SaveButton = ({ movie, compact = false }: { movie: Movie; compact?: boolean }) => {
  const { ready, isSaved, toggle } = useWatchlist();
  const saved = isSaved(movie.id);
  const label = saved ? 'Saved for later' : 'Save for later';
  const ariaLabel = compact
    ? `${saved ? 'Remove' : 'Save'} ${movie.title} ${saved ? 'from' : 'to'} watchlist`
    : `${label}: ${movie.title}${saved ? '. Remove from watchlist' : ''}`;
  return (
    <Button
      type="button"
      variant={saved ? 'secondary' : 'outline'}
      size={compact ? 'icon' : 'default'}
      className={compact ? 'absolute top-2 right-2 bg-background/95' : undefined}
      aria-label={ariaLabel}
      aria-pressed={saved}
      disabled={!ready}
      onClick={() => toggle(movie)}
    >
      <Bookmark size={16} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} />
      {!compact && label}
    </Button>
  );
};
