import { WATCHLIST_KEY } from '@/lib/watchlist';

// localStorage as an external store for useSyncExternalStore. The raw JSON string is the
// snapshot: strings compare by value, so React only re-renders when the list changes.
// `visitCopy` keeps the list for this visit when storage is blocked or full.

let visitCopy: string | null = null;
let writeFailed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

const readStorage = () => {
  try {
    return localStorage.getItem(WATCHLIST_KEY);
  } catch {
    return null;
  }
};

const canReadStorage = () => {
  try {
    void localStorage.length;
    return true;
  } catch {
    return false;
  }
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Another tab changed the list; storage is the source of truth again.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== WATCHLIST_KEY && event.key !== null) return;
    visitCopy = null;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

export const getSnapshot = () => visitCopy ?? readStorage();

/** `undefined` during server rendering and hydration means "not loaded yet". */
export const getServerSnapshot = () => undefined;

export const getStorageAvailable = () => !writeFailed && canReadStorage();

/** Saves the list, returning false when it only lasts for this visit. */
export const writeWatchlist = (value: string) => {
  visitCopy = value;
  try {
    localStorage.setItem(WATCHLIST_KEY, value);
    writeFailed = false;
  } catch {
    writeFailed = true;
  }
  notify();
  return !writeFailed;
};
