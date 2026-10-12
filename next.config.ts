import type { NextConfig } from 'next'

// STATIC_EXPORT=1 builds a plain static site (used for GitHub Pages, see .github/workflows/pages.yml).
// BASE_PATH is the sub-path the site is served from, e.g. '/rarityscope'.
const basePath = process.env.BASE_PATH || ''

const nextConfig: NextConfig = {
  // Art thumbnails are served as plain <img> through images.weserv.nl (SVG->webp),
  // so we don't use next/image and need no remotePatterns / image optimization.
  reactStrictMode: true,
  ...(process.env.STATIC_EXPORT ? { output: 'export' as const, trailingSlash: true, images: { unoptimized: true } } : {}),
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default nextConfig
