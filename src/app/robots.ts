import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:17000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/chat",
        "/client",
        "/contracts",
        "/forbidden",
        "/freelancer",
        "/login",
        "/matchings",
        "/notifications",
        "/oauth",
        "/reset-password",
        "/signup",
        "/support/chatbot",
        "/support/inquiries",
      ],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
