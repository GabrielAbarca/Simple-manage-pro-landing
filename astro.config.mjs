// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://simplemanagepro.com",
  trailingSlash: "always",
  compressHTML: true,
  adapter: vercel(),

  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
});
