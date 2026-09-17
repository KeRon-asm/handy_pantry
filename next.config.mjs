/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: `next build` no longer runs ESLint as of Next.js 16, so the former
  // `eslint.ignoreDuringBuilds` option has been removed (it is now an
  // unrecognized config key). Linting is run separately via `pnpm lint`.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
