import type { NextConfig } from "next";

const invoiceSecurityHeaders = [
  { key: "Cache-Control", value: "no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/invoice/:id*",
        headers: invoiceSecurityHeaders,
      },
      {
        source: "/api/invoice/:id/pdf",
        headers: invoiceSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
