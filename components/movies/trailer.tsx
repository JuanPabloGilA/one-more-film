'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { Play, X } from 'lucide-react';
export const Trailer = ({ videoKey, title }: { videoKey: string; title: string }) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <button className="button button-primary">
        <Play size={17} fill="currentColor" />
        Watch trailer
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className="dialog-content">
        <Dialog.Title className="dialog-title">{title} — trailer</Dialog.Title>
        <Dialog.Description className="sr-only">
          Official trailer hosted on YouTube. Press Escape to close.
        </Dialog.Description>
        <Dialog.Close className="dialog-close" aria-label="Close trailer">
          <X />
        </Dialog.Close>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoKey)}?autoplay=1`}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
