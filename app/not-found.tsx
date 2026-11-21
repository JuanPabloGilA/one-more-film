import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
const NotFound = () => (
  <main id="main-content" className="section-shell empty-state error-page">
    <span className="eyebrow">404 · Film not found</span>
    <h1>This one’s out of frame</h1>
    <p>We couldn’t find that movie or page. There are plenty more to discover.</p>
    <Link href="/" className={buttonVariants({ variant: 'default', className: 'button' })}>
      Back to discover
    </Link>
  </main>
);
export default NotFound;
