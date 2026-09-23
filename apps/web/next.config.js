/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Image Optimization ───────────────────────────────────────────────────
  // Allow Next.js to optimize images from Cloudinary and Supabase
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
    // Cache optimized images for 60 seconds (CDN will cache longer via Cache-Control)
    minimumCacheTTL: 60,
  },

  // ─── HTTP Cache Headers ───────────────────────────────────────────────────
  // These headers tell Bunny CDN (and any other CDN/browser) how long to cache
  // each resource, reducing Fast Origin Transfer usage significantly.
  async headers() {
    return [
      // ── Next.js static chunks (JS, CSS, fonts) ──────────────────────────
      // These are content-hashed by Next.js so they are safe to cache forever.
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // ── Public folder images — cache for 7 days ──────────────────────────
      {
        source: '/:path*.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*.jpg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*.jpeg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*.gif',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*.webp',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      // ── Web fonts — cache for 7 days ─────────────────────────────────────
      {
        source: '/:path*.woff',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*.woff2',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*.ttf',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },

      // ── HTML pages ────────────────────────────────────────────────────────
      // Cache rendered pages briefly so the CDN doesn't hammer the origin on
      // every page view. stale-while-revalidate lets the CDN serve stale while
      // fetching a fresh copy in the background.
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

// Touch to reload Next.js dev server
export default nextConfig;

