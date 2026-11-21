'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { FilterSelect } from '@/components/filter-select';
import { MovieCard } from '@/components/movies/movie-card';
import { Pagination } from '@/components/pagination';
import { Button, buttonVariants } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  ALL_GENRES,
  applyCatalogueFilters,
  availableGenres,
  QUICK_GENRES,
  readCatalogueFilters,
  type CatalogueFilters,
  type Sort,
} from '@/lib/catalogue';
import { countLabel } from '@/lib/format';
import { GENRES } from '@/lib/genres';
import { routes } from '@/lib/links';
import { TMDB_MAX_PAGE } from '@/lib/params';
import type { MovieList } from '@/lib/types';

export type Period = 'day' | 'week';

const PERIODS: { value: Period; label: string; description: string }[] = [
  { value: 'day', label: 'Today', description: 'The most popular films today' },
  { value: 'week', label: 'This week', description: 'The most popular films this week' },
];

export const Explorer = ({
  data,
  query,
  period,
}: {
  data: MovieList;
  query: string;
  period: Period;
}) => {
  const searchParams = useSearchParams();
  const genres = availableGenres(data.results);
  const filters = readCatalogueFilters(searchParams, genres);
  const movies = applyCatalogueFilters(data.results, filters);

  // Filters only reorder this page, so they update the URL without a server round trip.
  // Next.js keeps useSearchParams in sync with history.replaceState.
  const setFilters = (change: Partial<CatalogueFilters>) => {
    const { genre, sort } = { ...filters, ...change };
    const params = new URLSearchParams(searchParams);
    if (genre === ALL_GENRES) params.delete('genre');
    else params.set('genre', String(genre));
    if (sort === 'trending') params.delete('sort');
    else params.set('sort', sort);
    window.history.replaceState(null, '', `?${params}${window.location.hash}`);
  };

  const totalPages = Math.min(TMDB_MAX_PAGE, data.total_pages);
  const pageHref = (page: number) => {
    const params = new URLSearchParams({ ...(query && { q: query }), window: period });
    params.set('page', String(page));
    return `${routes.home}?${params}#movies`;
  };
  const Heading = query ? 'h1' : 'h2';
  const description = query
    ? `${countLabel(data.total_results, 'film')} found`
    : data.demo
      ? 'A sample collection to explore'
      : PERIODS.find((option) => option.value === period)?.description;

  return (
    <section className="catalogue section-shell" id="movies">
      <div className="section-heading">
        <div>
          <Heading>
            {query ? `Results for “${query}”` : data.demo ? 'A few favorites' : 'Trending now'}
          </Heading>
          <p className="section-description">{description}</p>
        </div>
        {!query && !data.demo && (
          <div className="segmented" aria-label="Trending period">
            {PERIODS.map((option) => (
              <Link
                key={option.value}
                href={`${routes.home}?window=${option.value}#movies`}
                className={period === option.value ? 'selected' : undefined}
                aria-current={period === option.value ? 'page' : undefined}
              >
                {option.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="filter-bar">
        <FilterSelect
          id="genre"
          label="Genre"
          value={filters.genre}
          onChange={(genre) => setFilters({ genre })}
          options={[
            { value: ALL_GENRES, label: 'All genres' },
            ...genres.map((id) => ({ value: id, label: GENRES[id] })),
          ]}
          contentClassName="min-w-48"
        />
        <div className="genre-shortcuts" aria-label="Quick genre filters">
          {QUICK_GENRES.filter((id) => genres.includes(id)).map((id) => (
            <Toggle
              variant="outline"
              key={id}
              pressed={filters.genre === id}
              onPressedChange={(pressed) => setFilters({ genre: pressed ? id : ALL_GENRES })}
            >
              {GENRES[id]}
            </Toggle>
          ))}
        </div>
        <FilterSelect<Sort>
          id="movie-sort"
          label="Sort by"
          value={filters.sort}
          onChange={(sort) => setFilters({ sort })}
          options={[
            { value: 'trending', label: query ? 'Relevance' : 'Popularity' },
            { value: 'rating', label: 'Top rated' },
            { value: 'newest', label: 'Newest' },
          ]}
          align="end"
        />
      </div>
      {movies.length ? (
        <div className="movie-grid">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              // The home marquee already preloads its artwork on page one of trending.
              priority={index < 2 && Boolean(query || data.page > 1)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={24} strokeWidth={1.5} />
          <h3>No films found</h3>
          {filters.genre ? (
            <>
              <p>Try another genre, or clear the filter to see every movie on this page.</p>
              <Button onClick={() => setFilters({ genre: ALL_GENRES })}>Clear filter</Button>
            </>
          ) : (
            <>
              <p>Try a different title or check the spelling.</p>
              <Link href={routes.home} className={buttonVariants()}>
                Back to discover
              </Link>
            </>
          )}
        </div>
      )}
      <Pagination
        page={data.page}
        totalPages={totalPages}
        hrefForPage={pageHref}
        label="Movie pages"
        linkClassName={buttonVariants({ variant: 'outline' })}
      />
    </section>
  );
};
