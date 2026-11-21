'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { GENRES, type MovieList } from '@/lib/types';
import { useMovieNavigation } from '@/components/movies/movie-navigation';
import { MovieCard } from '@/components/movies/movie-card';
export const Explorer = ({
  data,
  query,
  window,
}: {
  data: MovieList;
  query: string;
  window: 'day' | 'week';
}) => {
  const { preferences, savePreferences } = useMovieNavigation();
  const preferenceKey = `${query}-${window}-${data.page}`;
  const { genre, sort } = preferences[preferenceKey] ?? { genre: 0, sort: 'trending' };
  const setGenre = (genre: number) => savePreferences(preferenceKey, { genre, sort });
  const setSort = (sort: string) => savePreferences(preferenceKey, { genre, sort });
  const genres = [...new Set(data.results.flatMap((movie) => movie.genre_ids))]
    .filter((id) => GENRES[id])
    .sort((a, b) => GENRES[a].localeCompare(GENRES[b]));
  const movies = useMemo(() => {
    const filtered = data.results.filter((movie) => !genre || movie.genre_ids.includes(genre));
    if (sort === 'rating') filtered.sort((a, b) => b.vote_average - a.vote_average);
    if (sort === 'newest') filtered.sort((a, b) => b.release_date.localeCompare(a.release_date));
    return filtered;
  }, [data.results, genre, sort]);
  const Heading = query ? 'h1' : 'h2';
  const pageLink = (page: number) =>
    `/?${new URLSearchParams({ ...(query ? { q: query } : {}), window, page: String(page) })}#movies`;
  return (
    <section className="catalogue section-shell" id="movies">
      <div className="section-heading">
        <div>
          <Heading>
            {query ? `Results for “${query}”` : data.demo ? 'A few favorites' : 'Trending now'}
          </Heading>
          <p className="section-description">
            {query
              ? `${data.total_results.toLocaleString()} ${data.total_results === 1 ? 'film' : 'films'} found`
              : data.demo
                ? 'A sample collection to explore'
                : window === 'week'
                  ? 'The most popular films this week'
                  : 'The most popular films today'}
          </p>
        </div>
        {!query && !data.demo && (
          <div className="segmented" aria-label="Trending period">
            <Link
              href="/?window=day#movies"
              className={window === 'day' ? 'selected' : ''}
              aria-current={window === 'day' ? 'page' : undefined}
            >
              Today
            </Link>
            <Link
              href="/?window=week#movies"
              className={window === 'week' ? 'selected' : ''}
              aria-current={window === 'week' ? 'page' : undefined}
            >
              This week
            </Link>
          </div>
        )}
      </div>
      <div className="filter-bar">
        <div className="catalogue-filter">
          <label htmlFor="genre">Genre</label>
          <Select
            items={[
              { value: 0, label: 'All genres' },
              ...genres.map((id) => ({ value: id, label: GENRES[id] })),
            ]}
            value={genre}
            onValueChange={(value) => {
              if (value !== null) setGenre(value);
            }}
          >
            <SelectTrigger id="genre" className="w-full data-[size=default]:h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              className="max-h-[min(320px,var(--available-height))] min-w-48"
            >
              <SelectGroup>
                <SelectItem value={0} className="min-h-11">
                  All genres
                </SelectItem>
                {genres.map((id) => (
                  <SelectItem key={id} value={id} className="min-h-11">
                    {GENRES[id]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="genre-shortcuts" aria-label="Quick genre filters">
          {[28, 18, 35, 878]
            .filter((id) => genres.includes(id))
            .map((id) => (
              <Toggle
                variant="outline"
                key={id}
                onPressedChange={(pressed) => setGenre(pressed ? id : 0)}
                pressed={genre === id}
              >
                {GENRES[id]}
              </Toggle>
            ))}
        </div>
        <div className="catalogue-filter">
          <label htmlFor="movie-sort">Sort by</label>
          <Select
            items={[
              { value: 'trending', label: query ? 'Relevance' : 'Popularity' },
              { value: 'rating', label: 'Top rated' },
              { value: 'newest', label: 'Newest' },
            ]}
            value={sort}
            onValueChange={(value) => {
              if (value !== null) setSort(value);
            }}
          >
            <SelectTrigger id="movie-sort" className="w-full data-[size=default]:h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              <SelectGroup>
                <SelectItem value="trending" className="min-h-11">
                  {query ? 'Relevance' : 'Popularity'}
                </SelectItem>
                <SelectItem value="rating" className="min-h-11">
                  Top rated
                </SelectItem>
                <SelectItem value="newest" className="min-h-11">
                  Newest
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        {movies.length ? (
          <div className="movie-grid">
            {movies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                priority={index < 2 && Boolean(query || data.page > 1)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={24} strokeWidth={1.5} />
            <h3>No films found</h3>
            <p>
              {genre
                ? 'Try another genre, or clear the filter to see every movie on this page.'
                : 'Try a different title or check the spelling.'}
            </p>
            {genre ? (
              <Button className="button" onClick={() => setGenre(0)}>
                Clear filter
              </Button>
            ) : (
              <Link
                href="/"
                className={buttonVariants({ variant: 'default', className: 'button' })}
              >
                Back to discover
              </Link>
            )}
          </div>
        )}
      </div>
      {data.total_pages > 1 && (
        <nav className="pagination" aria-label="Movie pages">
          {data.page > 1 ? (
            <Link
              className={buttonVariants({ variant: 'outline', className: 'button' })}
              href={pageLink(data.page - 1)}
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {data.page} of {Math.min(500, data.total_pages)}
          </span>
          {data.page < Math.min(500, data.total_pages) && (
            <Link
              className={buttonVariants({ variant: 'outline', className: 'button' })}
              href={pageLink(data.page + 1)}
            >
              Next page
            </Link>
          )}
        </nav>
      )}
    </section>
  );
};
