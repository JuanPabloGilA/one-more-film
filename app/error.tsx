'use client';
import Link from 'next/link';
import { Film } from 'lucide-react';
const ErrorPage = ({ reset }: { reset: () => void }) => (
  <main id="main-content" className="section-shell empty-state error-page">
    <Film size={24} strokeWidth={1.5} />
    <h1>A brief intermission</h1>
    <p>We couldn’t reach the movie service. Please try again in a moment.</p>
    <div className="hero-actions">
      <button onClick={reset} className="button button-primary">
        Try again
      </button>
      <Link href="/watchlist" className="button button-secondary">
        Open watchlist
      </Link>
    </div>
  </main>
);
export default ErrorPage;
