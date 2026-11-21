'use client';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CastCard } from '@/components/people/cast-card';
import type { CastMember } from '@/lib/types';

export const FullCast = ({ cast, title }: { cast: CastMember[]; title: string }) => (
  <Dialog>
    <DialogTrigger render={<Button variant="outline" />}>
      See full cast <span className="cast-count">{cast.length}</span> <ArrowRight size={16} />
    </DialogTrigger>
    <DialogContent className="max-h-[min(85dvh,720px)] overflow-hidden sm:max-w-3xl">
      <DialogHeader className="pr-8">
        <DialogTitle>Full cast</DialogTitle>
        <DialogDescription>
          {title} · {cast.length} cast members
        </DialogDescription>
      </DialogHeader>
      <ul className="full-cast-list min-h-0 overflow-y-auto" aria-label="Full cast">
        {cast.map((person, index) => (
          <li key={`${person.id}-${index}`}>
            <CastCard person={person} className="full-cast-person" sizes="56px" />
          </li>
        ))}
      </ul>
    </DialogContent>
  </Dialog>
);
