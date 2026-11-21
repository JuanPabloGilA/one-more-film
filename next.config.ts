import type { NextConfig } from 'next';
import { TMDB_IMAGE_HOST, YOUTUBE_EMBED_ORIGIN } from './lib/links';

const isDev = process.env.NODE_ENV === 'development';

// Inline scripts are allowed because Next.js and next-themes inject them; a nonce would
// make every page dynamically rendered. The YouTube origins serve the trailer player.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.youtube.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${TMDB_IMAGE_HOST} https://i.ytimg.com`,
  "font-src 'self'",
  `frame-src ${YOUTUBE_EMBED_ORIGIN} https://www.youtube.com`,
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75],
    deviceSizes: [384, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [32, 48, 64, 96, 128, 192, 256, 320],
    remotePatterns: [{ protocol: 'https', hostname: TMDB_IMAGE_HOST, pathname: '/t/p/**' }],
  },
  poweredByHeader: false,
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
};

export default nextConfig;
