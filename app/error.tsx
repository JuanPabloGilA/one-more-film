'use client';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { routes } from '@/lib/links';

const ErrorPage = ({ reset }: { reset: () => void }) => (
  <main id="main-content" className="section-shell empty-state error-page">
    <Film size={24} strokeWidth={1.5} />
    <h1>A brief intermission</h1>
    <p>We couldn’t reach the movie service. Please try again in a moment.</p>
    <div className="hero-actions">
      <Button onClick={reset}>Try again</Button>
      {/* The watchlist lives in the browser, so it still works while TMDB is down. */}
      <Link href={routes.watchlist} className={buttonVariants({ variant: 'outline' })}>
        Open watchlist
      </Link>
    </div>
  </main>
);
export default ErrorPage;
