'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Film } from 'lucide-react';
import { loadYouTube, type YouTubePlayer } from '@/lib/youtube';

type TrailerData = { key: string; name: string } | null;
const trailerCache = new Map<number, TrailerData>();
export const FeedTrailer = ({
  movieId,
  title,
  active,
  prepare,
  onWarm,
}: {
  movieId: number;
  title: string;
  active: boolean;
  prepare: boolean;
  onWarm: (movieId: number) => void;
}) => {
  const [trailer, setTrailer] = useState<TrailerData | undefined>(() => trailerCache.get(movieId));
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (trailerCache.has(movieId)) {
      setTrailer(trailerCache.get(movieId));
      return;
    }
    const controller = new AbortController();
    fetch(`/api/movie/${movieId}/trailer`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) throw new Error(data.error || 'Could not load the trailer.');
        if (trailerCache.size >= 100) trailerCache.delete(trailerCache.keys().next().value!);
        trailerCache.set(movieId, data.trailer);
        setTrailer(data.trailer);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : 'Could not load the trailer.');
      });
    return () => controller.abort();
  }, [movieId, attempt]);
  useEffect(() => {
    if (active && (error || trailer === null)) onWarm(movieId);
  }, [active, error, trailer, movieId, onWarm]);
  if (error)
    return !active ? null : (
      <div className="feed-video-message" role="status">
        <Film size={28} />
        <p>{error}</p>
        <Button
          variant="outline"
          className="button"
          onClick={() => {
            setError('');
            setAttempt((a) => a + 1);
          }}
        >
          Try again
        </Button>
      </div>
    );
  if (trailer === undefined)
    return !active ? null : (
      <div className="feed-video-message" role="status">
        <span className="video-loading-mark" />
        <p>Loading trailer…</p>
      </div>
    );
  if (!trailer)
    return !active ? null : (
      <div className="feed-video-message">
        <Film size={28} />
        <h2>No trailer available yet</h2>
        <p>See the film details, or scroll to the next trailer.</p>
      </div>
    );
  return active || prepare ? (
    <TrailerPlayer
      key={trailer.key}
      videoKey={trailer.key}
      title={title}
      active={active}
      movieId={movieId}
      onWarm={onWarm}
    />
  ) : null;
};

const TrailerPlayer = ({
  videoKey,
  title,
  active,
  movieId,
  onWarm,
}: {
  videoKey: string;
  title: string;
  active: boolean;
  movieId: number;
  onWarm: (movieId: number) => void;
}) => {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const onWarmRef = useRef(onWarm);
  onWarmRef.current = onWarm;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let disposed = false;
    let instance: YouTubePlayer | null = null;
    const fail = (message: string) => {
      if (disposed) return;
      window.clearTimeout(timeout);
      setError(message);
      if (activeRef.current) onWarmRef.current(movieId);
    };
    const timeout = window.setTimeout(() => fail('The video player took too long to load.'), 15000);
    const frame = document.createElement('iframe');
    const params = new URLSearchParams({
      enablejsapi: '1',
      autoplay: '0',
      mute: '1',
      controls: '1',
      playsinline: '1',
      rel: '0',
      origin: window.location.origin,
    });
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoKey)}?${params}`;
    frame.title = `${title} trailer`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    // Attach after the remote origin loads, avoiding about:blank postMessage warnings.
    const attachPlayer = () => {
      loadYouTube()
        .then((api) => {
          if (disposed || !frame.isConnected) return;
          instance = new api.Player(frame, {
            host: 'https://www.youtube-nocookie.com',
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
                if (disposed) return;
                if (data === 1 && (!activeRef.current || document.hidden)) {
                  target.pauseVideo();
                  return;
                }
                if (data === 1) onWarmRef.current(movieId);
              },
              onError: () => fail('This trailer can’t play here.'),
              // YouTube exposes its own play control when autoplay is blocked.
              onAutoplayBlocked: () => {
                if (!disposed && activeRef.current) onWarmRef.current(movieId);
              },
            },
          });
        })
        .catch(() => fail('The video player could not load.'));
    };
    frame.addEventListener('load', attachPlayer, { once: true });
    host.current?.appendChild(frame);
    const visibility = () => {
      if (document.hidden) player.current?.pauseVideo();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      document.removeEventListener('visibilitychange', visibility);
      frame.removeEventListener('load', attachPlayer);
      instance?.destroy();
      frame.remove();
      player.current = null;
    };
  }, [videoKey, title, movieId]);
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
      {active && error ? (
        <div className="feed-video-message" role="status">
          <Film size={28} />
          <p>{error}</p>
          <a
            className={buttonVariants({ variant: 'outline', className: 'button' })}
            href={`https://www.youtube.com/watch?v=${videoKey}`}
            target="_blank"
            rel="noreferrer"
          >
            Watch on YouTube <ExternalLink size={16} />
          </a>
        </div>
      ) : active && !ready ? (
        <div className="feed-video-message" role="status">
          <span className="video-loading-mark" />
          <p>Loading player…</p>
        </div>
      ) : null}
    </>
  );
};
