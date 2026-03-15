/** @type {import('next').NextConfig} */
// Brecha 7 — Modo offline: pre-cache de contenido. En WiFi el cliente pre-descarga los 3 módulos
// siguientes (lib/offline/prefetch.ts). En datos móviles (navigator.connection.saveData o cellular)
// solo se carga lo necesario. Runtime caching de APIs de curso para uso offline.
const withSentryConfig = require("@sentry/nextjs").withSentryConfig;
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || process.env.DISABLE_PWA === "1",
  register: true,
  skipWaiting: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: "CacheFirst",
        options: { cacheName: "google-fonts", expiration: { maxEntries: 10 } },
      },
      {
        urlPattern: /\/_next\/static\//,
        handler: "CacheFirst",
        options: { cacheName: "static-assets" },
      },
      {
        urlPattern: /^https?:\/\/[^/]+\/api\/curso(\/|$)/,
        handler: "NetworkFirst",
        options: {
          cacheName: "politica-digital-curso-api",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^https?:\/\/[^/]+\/api\/curso\/lecciones\/[^/]+/,
        handler: "NetworkFirst",
        options: {
          cacheName: "politica-digital-lessons-api",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

const nextConfig = {
  // Minificación con SWC (evita error "terser" en build/Vercel)
  swcMinify: true,
  async rewrites() {
    return [
      // Si algo pide /next/static/* (sin _), servir desde /_next/static/* para evitar 404 y MIME type HTML
      { source: "/next/static/:path*", destination: "/_next/static/:path*" },
    ];
  },
  async redirects() {
    return [
      { source: "/admin/curso", destination: "/admin/cursos", permanent: true },
      { source: "/admin/course", destination: "/admin/cursos", permanent: true },
      { source: "/cursos", destination: "/curso", permanent: true },
    ];
  },
  // En desarrollo desactivar caché de webpack para evitar "Unable to snapshot resolve dependencies"
  webpack: (config, { dev }) => {
    if (dev) config.cache = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.anthropic.com https://o*.ingest.sentry.io",
              "frame-src 'self' https://www.youtube.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

let config = process.env.DISABLE_PWA === "1" ? nextConfig : withPWA(nextConfig);
config = withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
module.exports = config;
