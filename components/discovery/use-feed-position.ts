'use client';
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useDiscovery } from './discovery-provider';

// A film counts as "on screen" once most of it is visible.
const VISIBLE_RATIO = 0.6;
const NEXT_KEYS = ['ArrowDown', 'PageDown'];
const PREVIOUS_KEYS = ['ArrowUp', 'PageUp'];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Tracks which full-height slide of the feed is on screen. Slide `movies.length` is the
 * "end of selection" panel, which has no film and is reported through `endVisible`.
 */
export const useFeedPosition = ({ onFilmVisible }: { onFilmVisible: (index: number) => void }) => {
  const viewport = useRef<HTMLDivElement>(null);
  const { session, setSession } = useDiscovery();
  const filmCount = session?.movies.length ?? 0;
  const [endVisible, setEndVisible] = useState(false);
  const visibleIndex = useRef(session?.active ?? 0);

  // Reopen on the last film watched, and keep it in place when the phone rotates.
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let height = element.clientHeight;
    element.scrollTo({ top: visibleIndex.current * height, behavior: 'instant' });
    element.focus({ preventScroll: true });
    const resize = new ResizeObserver(() => {
      if (element.clientHeight === height) return;
      height = element.clientHeight;
      element.scrollTo({ top: visibleIndex.current * height, behavior: 'instant' });
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, []);

  const onSlideVisible = useEffectEvent((index: number) => {
    visibleIndex.current = index;
    setEndVisible(index === filmCount);
    if (index === filmCount) return;
    setSession((previous) => (previous ? { ...previous, active: index } : previous));
    onFilmVisible(index);
  });

  // Re-observe whenever films are appended. Observing reports the slide already on screen,
  // so callers also hear about it after a batch loads.
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO)
            onSlideVisible(Number((entry.target as HTMLElement).dataset.index));
      },
      { root: element, threshold: VISIBLE_RATIO },
    );
    element.querySelectorAll('[data-index]').forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [filmCount]);

  const move = (direction: 1 | -1) => {
    const element = viewport.current;
    if (!element) return;
    const current = Math.round(element.scrollTop / element.clientHeight);
    const next = Math.max(0, Math.min(filmCount, current + direction));
    element.scrollTo({
      top: next * element.clientHeight,
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    });
  };

  /** Arrow and Page keys step one film at a time, like the on-screen arrows. */
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const modified = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
    if (modified || target.closest('input,select,textarea')) return;
    const direction = NEXT_KEYS.includes(event.key)
      ? 1
      : PREVIOUS_KEYS.includes(event.key)
        ? -1
        : 0;
    if (!direction) return;
    event.preventDefault();
    move(direction);
  };

  return { viewport, endVisible, move, onKeyDown };
};
