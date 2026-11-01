import type { MetadataRoute } from "next";
import { brand } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${brand.url}/sitemap.xml` };
}
