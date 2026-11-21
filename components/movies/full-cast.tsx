'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowRight } from 'lucide-react';
import type { MovieDetails } from '@/lib/types';
import { PersonPortrait } from '@/components/people/person-portrait';

export const FullCast = ({
  cast,
  title,
}: {
  cast: MovieDetails['credits']['cast'];
  title: string;
}) => (
  <Dialog>
    <DialogTrigger render={<Button variant="outline" className="button" />}>
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
            <Link href={`/person/${person.id}`} className="full-cast-person cast-person-link">
              <div className="cast-photo">
                <PersonPortrait path={person.profile_path} name={person.name} alt="" sizes="56px" />
              </div>
              <div>
                <h3>{person.name}</h3>
                <p>{person.character || 'Role not listed'}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </DialogContent>
  </Dialog>
);
