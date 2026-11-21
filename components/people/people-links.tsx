import { Fragment } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/links';

/** A comma-separated list of links to people's profiles. */
export const PeopleLinks = ({ people }: { people: { id: number; name: string }[] }) =>
  people.map((person, index) => (
    <Fragment key={person.id}>
      {index > 0 && ', '}
      <Link className="person-link" href={routes.person(person.id)}>
        {person.name}
      </Link>
    </Fragment>
  ));
