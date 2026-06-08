import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          "  <url>",
          "    <loc>/ar</loc>",
          '    <xhtml:link rel="alternate" hreflang="ar" href="/ar"/>',
          '    <xhtml:link rel="alternate" hreflang="fr" href="/fr"/>',
          "    <changefreq>weekly</changefreq>",
          "    <priority>1.0</priority>",
          "  </url>",
          "  <url>",
          "    <loc>/fr</loc>",
          '    <xhtml:link rel="alternate" hreflang="ar" href="/ar"/>',
          '    <xhtml:link rel="alternate" hreflang="fr" href="/fr"/>',
          "    <changefreq>weekly</changefreq>",
          "    <priority>1.0</priority>",
          "  </url>",
          "</urlset>",
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
