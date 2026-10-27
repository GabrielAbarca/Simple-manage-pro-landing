// V1's /portales became /producto. This is an on-demand endpoint rather than
// an Astro `redirects` entry or a vercel.json rule: the adapter routes a
// prebuilt deploy by .vercel/output/config.json, where Astro's redirect lands
// as ^/portales$ AFTER the trailing-slash rule has already bounced the request
// to /portales/, so it never matched. A route at /portales/ is reached either way.

import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(null, { status: 301, headers: { Location: "/producto/", "Cache-Control": "public, max-age=86400" } });
