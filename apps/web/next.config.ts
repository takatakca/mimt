import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes plain files to out/ (MochaHost public_html or Coolify static).
  output: "export",
  // /forfaits/ -> forfaits/index.html, which every plain web server serves without rewrites.
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  transpilePackages: ["@mimt/shared"],
  // Bilingual 404 page (app/global-not-found.tsx) for a site with two root layouts (fr / en).
  experimental: { globalNotFound: true },
};

export default nextConfig;
