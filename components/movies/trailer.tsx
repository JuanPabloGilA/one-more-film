'use client';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const Trailer = ({ videoKey, title }: { videoKey: string; title: string }) => (
  <Dialog>
    <DialogTrigger render={<Button className="button" />}>
      <Play size={17} fill="currentColor" />
      Watch trailer
    </DialogTrigger>
    <DialogContent className="sm:max-w-5xl">
      <DialogHeader className="pr-8">
        <DialogTitle>{title}: trailer</DialogTitle>
        <DialogDescription className="sr-only">
          Official trailer hosted on YouTube. Press Escape to close.
        </DialogDescription>
      </DialogHeader>
      <iframe
        className="aspect-video w-full rounded-lg border-0"
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoKey)}?autoplay=1`}
        title={`${title} trailer`}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </DialogContent>
  </Dialog>
);
