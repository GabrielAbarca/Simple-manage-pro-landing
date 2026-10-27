import type { APIRoute } from "astro";

// Not an Astro redirects entry: on Vercel it lands as ^/portales$ after the trailing-slash rule has
// already bounced the request to /portales/, so it never matched. This route does.
export const prerender = false;

export const GET: APIRoute = () =>
  new Response(null, { status: 301, headers: { Location: "/producto/", "Cache-Control": "public, max-age=86400" } });
