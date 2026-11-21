import Link from 'next/link';
import { cn } from '@/lib/utils';
import { routes } from '@/lib/links';
import type { CastMember } from '@/lib/types';
import { PersonPortrait } from './person-portrait';

/** Used by the cast grid on the movie page and the full-cast dialog. */
export const CastCard = ({
  person,
  sizes,
  className,
}: {
  person: CastMember;
  sizes: string;
  className: string;
}) => (
  <Link href={routes.person(person.id)} className={cn('cast-person-link', className)}>
    <div className="cast-photo">
      <PersonPortrait path={person.profile_path} name={person.name} alt="" sizes={sizes} />
    </div>
    <div>
      <h3>{person.name}</h3>
      <p>{person.character || 'Role not listed'}</p>
    </div>
  </Link>
);
