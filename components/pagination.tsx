import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Previous / "Page n of m" / next links. Renders nothing for a single page. */
export const Pagination = ({
  page,
  totalPages,
  hrefForPage,
  label,
  className,
  linkClassName,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  label: string;
  className?: string;
  linkClassName?: string;
}) => {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={label} className={cn('pagination', className)}>
      {page > 1 ? (
        <Link className={linkClassName} href={hrefForPage(page - 1)}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link className={linkClassName} href={hrefForPage(page + 1)}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
};
