'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, UserRound, X } from 'lucide-react';
import { imageUrl, type MovieDetails } from '@/lib/types';
import { MovieImage } from '@/components/movies/movie-image';

export const FullCast = ({
  cast,
  title,
}: {
  cast: MovieDetails['credits']['cast'];
  title: string;
}) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <button type="button" className="button button-secondary">
        See full cast <span className="cast-count">{cast.length}</span> <ArrowRight size={16} />
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className="dialog-content full-cast-dialog">
        <header className="full-cast-header">
          <Dialog.Title className="dialog-title">Full cast</Dialog.Title>
          <Dialog.Description>
            {title} · {cast.length} cast members
          </Dialog.Description>
          <Dialog.Close className="dialog-close" aria-label="Close full cast">
            <X size={20} />
          </Dialog.Close>
        </header>
        <ul className="full-cast-list" aria-label="Full cast">
          {cast.map((person, index) => (
            <li key={`${person.id}-${index}`} className="full-cast-person">
              <div className="cast-photo">
                {person.profile_path ? (
                  <MovieImage
                    src={imageUrl(person.profile_path, 'w185')}
                    alt={person.name}
                    sizes="56px"
                  />
                ) : (
                  <UserRound size={24} aria-hidden="true" />
                )}
              </div>
              <div>
                <h3>{person.name}</h3>
                <p>{person.character || 'Role not listed'}</p>
              </div>
            </li>
          ))}
        </ul>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
