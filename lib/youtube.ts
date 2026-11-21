export type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
};
type PlayerEvent = { target: YouTubePlayer; data: number };
type YouTubeAPI = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId?: string;
      host: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, string | number>;
      events: {
        onReady: (event: PlayerEvent) => void;
        onStateChange: (event: PlayerEvent) => void;
        onError: () => void;
        onAutoplayBlocked: () => void;
      };
    },
  ) => YouTubePlayer;
};
declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}
/** YT.PlayerState.PLAYING */
export const PLAYER_STATE_PLAYING = 1;
const API_TIMEOUT_MS = 12_000;

// One shared script load; reset on failure so a later call can retry.
let apiPromise: Promise<YouTubeAPI> | null = null;

/** Loads the YouTube IFrame Player API once, resolving when `window.YT` is ready. */
export const loadYouTube = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      apiPromise = null;
      script.remove();
      reject(new Error('The video player took too long to load.'));
    }, API_TIMEOUT_MS);
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      if (window.YT) resolve(window.YT);
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      apiPromise = null;
      script.remove();
      reject(new Error('The video player could not load.'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
};
