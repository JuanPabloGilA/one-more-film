'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { defaultPreferences, type DiscoveryPreferences } from '@/lib/discovery';
import { GENRES } from '@/lib/types';
import { useDiscovery } from './discovery-provider';
import { requestFilms } from './request-films';

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
const genreChoices = [28, 12, 35, 18, 878, 53, 10749, 27, 16, 99, 14, 9648];

export const FilmDiscovery = () => {
  const { session, setSession } = useDiscovery();
  const [preferences, setPreferences] = useState<DiscoveryPreferences>(
    session?.preferences ?? defaultPreferences,
  );
  const [editing, setEditing] = useState(!session);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
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
        totalPages: Math.min(500, data.total_pages),
        active: 0,
        demo: data.demo,
      });
      setEditing(false);
    } catch (error) {
      if (!request.signal.aborted)
        setError(error instanceof Error ? error.message : 'Could not load films. Try again.');
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
  return (
    <main id="main-content" className="preference-page section-shell">
      <div className="preference-intro">
        <Link href="/" className="back-link">
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
            Choose up to three, or keep an open mind. Horror is only included if you choose it or
            stay open to anything.
          </p>
          <div className="preference-genres">
            <button
              type="button"
              className={`preference-choice ${!preferences.genres.length ? 'selected' : ''}`}
              aria-pressed={!preferences.genres.length}
              onClick={() => setPreferences((p) => ({ ...p, genres: [] }))}
            >
              Open to anything {!preferences.genres.length && <Check size={16} />}
            </button>
            {genreChoices.map((id) => {
              const selected = preferences.genres.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={`preference-choice ${selected ? 'selected' : ''}`}
                  aria-pressed={selected}
                  disabled={!selected && preferences.genres.length === 3}
                  onClick={() =>
                    setPreferences((p) => ({
                      ...p,
                      genres: selected ? p.genres.filter((g) => g !== id) : [...p.genres, id],
                    }))
                  }
                >
                  {GENRES[id]}
                  {selected && <Check size={16} />}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset disabled={pending}>
          <legend>
            <span>02</span> From which era?
          </legend>
          <div className="preference-options">
            {(
              [
                ['any', 'Any era', 'Good stories don’t age'],
                ['recent', 'Recent', 'The last five years'],
                ['classic', 'Classics', 'Before 2000'],
              ] as const
            ).map(([value, label, hint]) => (
              <label key={value} className="preference-radio">
                <input
                  type="radio"
                  name="era"
                  value={value}
                  checked={preferences.era === value}
                  onChange={() => setPreferences((p) => ({ ...p, era: value }))}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
                <span className="radio-mark" />
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={pending}>
          <legend>
            <span>03</span> How much time do you have?
          </legend>
          <div className="preference-options">
            {(
              [
                ['any', 'No rush', 'Any length'],
                ['short', 'Keep it short', '100 minutes or less'],
                ['long', 'Make a night of it', 'Two hours or more'],
              ] as const
            ).map(([value, label, hint]) => (
              <label key={value} className="preference-radio">
                <input
                  type="radio"
                  name="length"
                  value={value}
                  checked={preferences.length === value}
                  onChange={() => setPreferences((p) => ({ ...p, length: value }))}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
                <span className="radio-mark" />
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p className="discovery-error" role="alert">
            {error}
          </p>
        )}
        <div className="preference-submit">
          <button className="button button-primary discovery-cta" disabled={pending} type="submit">
            {pending ? 'Finding your films…' : 'Find my next film'}
            <ArrowRight size={18} />
          </button>
          {session && (
            <button
              className="button button-quiet"
              type="button"
              disabled={pending}
              onClick={() => setEditing(false)}
            >
              Back to my films
            </button>
          )}
        </div>
        <p className="preference-privacy">English-language films only. No account needed.</p>
      </form>
    </main>
  );
};
