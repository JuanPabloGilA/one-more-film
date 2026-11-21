import type { ReactNode } from 'react';

export const SectionHeading = ({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  id?: string;
  children?: ReactNode;
}) => (
  <div className="section-heading">
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id}>{title}</h2>
    </div>
    {children}
  </div>
);
