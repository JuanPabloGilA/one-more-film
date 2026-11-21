'use client';
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import { ExternalLink, Film } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { YOUTUBE_EMBED_ORIGIN, youtubeEmbedUrl, youtubeWatchUrl } from '@/lib/links';
import type { Trailer } from '@/lib/types';
import { loadYouTube, PLAYER_STATE_PLAYING, type YouTubePlayer } from '@/lib/youtube';
import { cachedTrailer, fetchTrailer, hasCachedTrailer } from './trailer-cache';

const PLAYER_TIMEOUT_MS = 15_000;

type FeedTrailerProps = {
  movieId: number;
  title: string;
  /** The film currently on screen: its trailer plays. */
  active: boolean;
  /** The next film: its player loads paused so scrolling to it feels instant. */
  prepare: boolean;
  /** Tells the feed this film no longer needs the network, so the next one can warm up. */
  onWarm: (movieId: number) => void;
};

const VideoMessage = ({
  loading = false,
  children,
}: {
  loading?: boolean;
  children: ReactNode;
}) => (
  <div className="feed-video-message" role="status">
    {loading ? <span className="video-loading-mark" /> : <Film size={28} />}
    {children}
  </div>
);

/** Looks up a film's trailer, then hands it to the YouTube player. */
export const FeedTrailer = ({ movieId, title, active, prepare, onWarm }: FeedTrailerProps) => {
  const [trailer, setTrailer] = useState(() => cachedTrailer(movieId));
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (hasCachedTrailer(movieId)) return;
    const controller = new AbortController();
    fetchTrailer(movieId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setTrailer(result);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : 'Could not load the trailer.');
      });
    return () => controller.abort();
  }, [movieId, attempt]);

  // Nothing will play for this film, so the next one may start loading.
  useEffect(() => {
    if (active && (error || trailer === null)) onWarm(movieId);
  }, [active, error, trailer, movieId, onWarm]);

  if (trailer) {
    if (!active && !prepare) return null;
    return (
      <TrailerPlayer
        key={trailer.key}
        trailer={trailer}
        title={title}
        active={active}
        onWarm={() => onWarm(movieId)}
      />
    );
  }
  if (!active) return null;
  if (error)
    return (
      <VideoMessage>
        <p>{error}</p>
        <Button
          variant="outline"
          onClick={() => {
            setError('');
            setAttempt((count) => count + 1);
          }}
        >
          Try again
        </Button>
      </VideoMessage>
    );
  if (trailer === undefined)
    return (
      <VideoMessage loading>
        <p>Loading trailer…</p>
      </VideoMessage>
    );
  return (
    <VideoMessage>
      <h2>No trailer available yet</h2>
      <p>See the film details, or scroll to the next trailer.</p>
    </VideoMessage>
  );
};

const createTrailerFrame = (videoKey: string, title: string) => {
  const frame = document.createElement('iframe');
  frame.src = youtubeEmbedUrl(videoKey, {
    enablejsapi: '1',
    autoplay: '0',
    mute: '1',
    controls: '1',
    playsinline: '1',
    rel: '0',
    origin: window.location.origin,
  });
  frame.title = `${title} trailer`;
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  return frame;
};

/**
 * Drives a YouTube iframe through the IFrame Player API. The iframe is created imperatively
 * because the API takes ownership of it; React only provides the host element.
 */
const TrailerPlayer = ({
  trailer,
  title,
  active,
  onWarm,
}: {
  trailer: Trailer;
  title: string;
  active: boolean;
  onWarm: () => void;
}) => {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  // Effect events read the latest props without re-creating the player when they change.
  const warmIfActive = useEffectEvent(() => {
    if (active) onWarm();
  });
  const shouldStayPaused = useEffectEvent(() => !active || document.hidden);

  useEffect(() => {
    let disposed = false;
    let instance: YouTubePlayer | null = null;
    const fail = (message: string) => {
      if (disposed) return;
      window.clearTimeout(timeout);
      setError(message);
      warmIfActive();
    };
    const timeout = window.setTimeout(
      () => fail('The video player took too long to load.'),
      PLAYER_TIMEOUT_MS,
    );
    const frame = createTrailerFrame(trailer.key, title);

    // Attach after the remote origin loads, avoiding about:blank postMessage warnings.
    const attachPlayer = async () => {
      try {
        const api = await loadYouTube();
        if (disposed || !frame.isConnected) return;
        instance = new api.Player(frame, {
          host: YOUTUBE_EMBED_ORIGIN,
          events: {
            onReady: ({ target }) => {
              if (disposed) return;
              window.clearTimeout(timeout);
              setError('');
              player.current = target;
              target.mute();
              setReady(true);
            },
            onStateChange: ({ target, data }) => {
              if (disposed || data !== PLAYER_STATE_PLAYING) return;
              if (shouldStayPaused()) target.pauseVideo();
              else warmIfActive();
            },
            onError: () => fail('This trailer can’t play here.'),
            // YouTube shows its own play control when autoplay is blocked.
            onAutoplayBlocked: () => {
              if (!disposed) warmIfActive();
            },
          },
        });
      } catch {
        fail('The video player could not load.');
      }
    };
    frame.addEventListener('load', attachPlayer, { once: true });
    host.current?.appendChild(frame);

    const pauseWhenHidden = () => {
      if (document.hidden) player.current?.pauseVideo();
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      frame.removeEventListener('load', attachPlayer);
      instance?.destroy();
      frame.remove();
      player.current = null;
    };
  }, [trailer.key, title]);

  useEffect(() => {
    if (!ready || !player.current) return;
    if (active && !document.hidden) player.current.playVideo();
    else player.current.pauseVideo();
  }, [active, ready]);

  return (
    <>
      <div className="feed-player" data-player-ready={ready} data-player-active={active}>
        <div ref={host} className="feed-player-frame" />
      </div>
      {active && error && (
        <VideoMessage>
          <p>{error}</p>
          <a
            className={buttonVariants({ variant: 'outline' })}
            href={youtubeWatchUrl(trailer.key)}
            target="_blank"
            rel="noreferrer"
          >
            Watch on YouTube <ExternalLink size={16} />
          </a>
        </VideoMessage>
      )}
      {active && !error && !ready && (
        <VideoMessage loading>
          <p>Loading player…</p>
        </VideoMessage>
      )}
    </>
  );
};
