// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  images: {
    unoptimized: true,
  },
};

// `setupDevPlatform()` simulates Cloudflare bindings (D1, R2) during local dev.
// It must be called before the dev server handles requests.
if (process.env.NODE_ENV === 'development') {
  const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
  await setupDevPlatform();
}

export default nextConfig;
