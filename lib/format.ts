import type { Movie } from './types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});
const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

export const year = (date?: string) => date?.slice(0, 4) || 'TBA';

export const runtimeLabel = (minutes: number | null) =>
  minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : 'Runtime unavailable';

export const fullDate = (value?: string | null) => {
  if (!value || !ISO_DATE.test(value)) return 'Not listed';
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects impossible dates such as 2024-02-31, which Date silently rolls over.
  const isRealDate = Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
  return isRealDate ? dateFormat.format(date) : 'Not listed';
};

export const money = (value?: number) =>
  value && Number.isFinite(value) && value > 0 ? usdFormat.format(value) : 'Not reported';

export const ratingLabel = (
  movie: Pick<Movie, 'vote_average' | 'vote_count'>,
  unratedLabel = 'New',
) => (movie.vote_count ? movie.vote_average.toFixed(1) : unratedLabel);

/** "1 film", "2,431 films". The locale is fixed so server and client output match. */
export const countLabel = (count: number, noun: string) =>
  `${count.toLocaleString('en-US')} ${count === 1 ? noun : `${noun}s`}`;

export const languageName = (code: string) => {
  try {
    return languageNames.of(code) || code;
  } catch {
    return code;
  }
};
