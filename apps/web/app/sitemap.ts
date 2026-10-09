import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(ROUTES).flatMap((r) =>
    (["fr", "en"] as const).map((lang) => ({
      url: SITE_URL + r[lang],
      changeFrequency: "monthly" as const,
      priority: r.fr === "/" ? 1 : 0.6,
      alternates: { languages: { "fr-CA": SITE_URL + r.fr, "en-CA": SITE_URL + r.en } },
    })),
  );
}
