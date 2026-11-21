import type { ReactNode } from 'react';

/** Opens off-site in a new tab. The arrow signals that the link leaves the app. */
export const ExternalLink = ({
  href,
  children,
  className = 'detail-text-link',
  showArrow = true,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
}) => (
  <a href={href} target="_blank" rel="noreferrer" className={className}>
    {children}
    {showArrow && ' ↗'}
  </a>
);
