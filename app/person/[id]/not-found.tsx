import Link from 'next/link';
import { routes } from '@/lib/links';
const PersonNotFound = () => (
  <main id="main-content" className="section-shell empty-state">
    <span className="eyebrow">404 · Profile not found</span>
    <h1>This profile is out of frame</h1>
    <p>We couldn’t find that person. Explore another film to meet its cast and crew.</p>
    <Link href={routes.home} className="detail-text-link">
      Discover films →
    </Link>
  </main>
);
export default PersonNotFound;
