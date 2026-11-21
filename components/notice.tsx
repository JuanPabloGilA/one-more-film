import type { ReactNode } from 'react';

/** A banner for sample data or degraded features, such as storage being unavailable. */
export const Notice = ({ children }: { children: ReactNode }) => (
  <div className="demo-notice" role="note">
    {children}
  </div>
);
