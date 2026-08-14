import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:17000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/support", changeFrequency: "monthly", priority: 0.7 },
    { path: "/grade", changeFrequency: "monthly", priority: 0.6 },
    { path: "/terms/client", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms/freelancer", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  ] satisfies Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }>;

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency,
    priority,
  }));
}
