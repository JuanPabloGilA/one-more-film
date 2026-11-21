import Image from 'next/image';
import Link from 'next/link';
import { Brand } from '@/components/brand';
import { ExternalLink } from '@/components/external-link';
import { routes, tmdbUrl } from '@/lib/links';

export const SiteFooter = () => (
  <footer className="site-footer section-shell">
    <div className="footer-top">
      <Brand />
      <p>Find something worth watching</p>
      <ExternalLink href={tmdbUrl.home} className="tmdb-link" showArrow={false}>
        Film data & artwork by <Image src="/tmdb.svg" alt="TMDB" width={76} height={10} />
      </ExternalLink>
    </div>
    <div className="footer-bottom">
      <span>A film for tonight. A few for later.</span>
      <Link href={routes.mediaKit} className="underline underline-offset-4">
        Media kit
      </Link>
      {/* Attribution wording required by the TMDB API terms. */}
      <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
    </div>
  </footer>
);
