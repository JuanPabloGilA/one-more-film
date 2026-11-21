'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  CLASSIC_BEFORE_YEAR,
  defaultPreferences,
  LONG_MIN_MINUTES,
  MAX_GENRES,
  RECENT_YEARS,
  SHORT_MAX_MINUTES,
  type DiscoveryPreferences,
  type Era,
  type Length,
} from '@/lib/discovery';
import { GENRES } from '@/lib/genres';
import { routes } from '@/lib/links';
import { useDiscovery } from './discovery-provider';
import { PreferenceOptions, type PreferenceOption } from './preference-options';
import { requestFilms } from './request-films';

// The feed and the YouTube player code load only once someone starts discovering.
const DiscoveryFeed = dynamic(
  () => import('./discovery-feed').then((module) => module.DiscoveryFeed),
  {
    loading: () => (
      <main id="main-content" className="empty-state" role="status">
        Opening your films…
      </main>
    ),
  },
);

const GENRE_CHOICES = [28, 12, 35, 18, 878, 53, 10749, 27, 16, 99, 14, 9648];
const ERA_OPTIONS: PreferenceOption<Era>[] = [
  { value: 'any', label: 'Any era', hint: 'Good stories don’t age' },
  { value: 'recent', label: 'Recent', hint: `The last ${RECENT_YEARS} years` },
  { value: 'classic', label: 'Classics', hint: `Before ${CLASSIC_BEFORE_YEAR}` },
];
const LENGTH_OPTIONS: PreferenceOption<Length>[] = [
  { value: 'any', label: 'No rush', hint: 'Any length' },
  { value: 'short', label: 'Keep it short', hint: `${SHORT_MAX_MINUTES} minutes or less` },
  { value: 'long', label: 'Make a night of it', hint: `${LONG_MIN_MINUTES / 60} hours or more` },
];

/** The preference form, which becomes the trailer feed once films are found. */
export const FilmDiscovery = () => {
  const { session, setSession } = useDiscovery();
  const [preferences, setPreferences] = useState(session?.preferences ?? defaultPreferences);
  const [editing, setEditing] = useState(!session);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const update = (change: Partial<DiscoveryPreferences>) =>
    setPreferences((previous) => ({ ...previous, ...change }));
  const toggleGenre = (id: number, selected: boolean) =>
    setPreferences((previous) => ({
      ...previous,
      genres: selected ? [...previous.genres, id] : previous.genres.filter((genre) => genre !== id),
    }));

  const start = async (event: FormEvent) => {
    event.preventDefault();
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setPending(true);
    setError('');
    try {
      const data = await requestFilms(preferences, 1, request.signal);
      if (!data.results.length) {
        setError(
          data.page < data.total_pages
            ? 'No matches in the first few pages. Try another genre, era, or length.'
            : 'No films match this combination. Try another genre, era, or length.',
        );
        return;
      }
      setSession({
        preferences,
        movies: data.results,
        page: data.page,
        totalPages: data.total_pages,
        active: 0,
        demo: data.demo,
      });
      setEditing(false);
    } catch (reason) {
      if (!request.signal.aborted)
        setError(reason instanceof Error ? reason.message : 'Could not load films. Try again.');
    } finally {
      if (!request.signal.aborted) setPending(false);
    }
  };

  if (!editing && session)
    return (
      <DiscoveryFeed
        onEdit={() => {
          setPreferences(session.preferences);
          setError('');
          setEditing(true);
        }}
      />
    );

  const openToAnything = preferences.genres.length === 0;
  return (
    <main id="main-content" className="preference-page section-shell">
      <div className="preference-intro">
        <Link href={routes.home} className="back-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <span className="eyebrow">A little direction. A new discovery.</span>
        <h1>
          What are you
          <br />
          in the mood for?
        </h1>
        <p>
          Tell us what you like. We’ll find the films.
          <br />
          Watch the trailers. Scroll to find your next film.
        </p>
        <div className="preference-note">
          <span>01</span> Choose your taste <ArrowRight size={16} />
          <span>02</span> Find your film
        </div>
      </div>
      <form className="preference-form" onSubmit={start} aria-busy={pending}>
        <fieldset disabled={pending}>
          <legend>
            <span>01</span> Pick your genres
          </legend>
          <p>
            Choose up to {MAX_GENRES}, or keep an open mind. Horror is only included if you choose
            it or stay open to anything.
          </p>
          <div className="preference-genres">
            <Toggle
              variant="outline"
              type="button"
              pressed={openToAnything}
              onPressedChange={() => update({ genres: [] })}
            >
              Open to anything {openToAnything && <Check size={16} />}
            </Toggle>
            {GENRE_CHOICES.map((id) => {
              const selected = preferences.genres.includes(id);
              return (
                <Toggle
                  variant="outline"
                  key={id}
                  type="button"
                  pressed={selected}
                  disabled={!selected && preferences.genres.length === MAX_GENRES}
                  onPressedChange={(pressed) => toggleGenre(id, pressed)}
                >
                  {GENRES[id]}
                  {selected && <Check size={16} />}
                </Toggle>
              );
            })}
          </div>
        </fieldset>
        <PreferenceOptions
          name="era"
          step="02"
          legend="From which era?"
          options={ERA_OPTIONS}
          value={preferences.era}
          disabled={pending}
          onChange={(era) => update({ era })}
        />
        <PreferenceOptions
          name="length"
          step="03"
          legend="How much time do you have?"
          options={LENGTH_OPTIONS}
          value={preferences.length}
          disabled={pending}
          onChange={(length) => update({ length })}
        />
        {error && (
          <p className="discovery-error" role="alert">
            {error}
          </p>
        )}
        <div className="preference-submit">
          <Button className="discovery-cta" disabled={pending} type="submit">
            {pending ? 'Finding your films…' : 'Find my next film'}
            <ArrowRight size={18} />
          </Button>
          {session && (
            <Button
              variant="ghost"
              type="button"
              disabled={pending}
              onClick={() => setEditing(false)}
            >
              Back to my films
            </Button>
          )}
        </div>
        <p className="preference-privacy">English-language films only. No account needed.</p>
      </form>
    </main>
  );
};
