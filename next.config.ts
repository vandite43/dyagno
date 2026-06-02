import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude .ts so middleware.ts isn't picked up — route protection is in proxy.tsx
  // All route handlers use .tsx extension instead
  pageExtensions: ["tsx", "jsx", "js"],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
