// Minimal static file server, used for the design handoff (the prototypes
// load their runtime, tokens and fonts by relative URL, which file:// refuses)
// and for previewing the production build (scripts/serve-build.mjs).

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

function resolveInsideRoot(rootDirectory, requestedPath) {
  // Directory URLs (the site's trailing-slash routes) serve their index.html.
  const filePath = requestedPath.endsWith("/") ? requestedPath + "index.html" : requestedPath;
  const absolutePath = path.normalize(path.join(rootDirectory, filePath));
  // Refuse anything that climbs out of the served folder.
  if (!absolutePath.startsWith(path.normalize(rootDirectory))) return null;
  return absolutePath;
}

const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".xml", ".txt", ".svg", ".webmanifest"]);

/**
 * Compress text the way the CDN does. Lighthouse simulates a slow mobile
 * network, so measuring an uncompressed preview inflates every timing that
 * production would never show.
 */
function encodeForClient(body, extension, acceptEncoding = "") {
  if (!COMPRESSIBLE.has(extension)) return { body, encoding: null };
  if (acceptEncoding.includes("br")) return { body: brotliCompressSync(body), encoding: "br" };
  if (acceptEncoding.includes("gzip")) return { body: gzipSync(body), encoding: "gzip" };
  return { body, encoding: null };
}

/** Vercel's rule for a trailingSlash: "always" site: /x → 308 /x/ for extensionless paths. */
function slashRedirectTarget(requestedPath) {
  if (requestedPath.endsWith("/") || path.extname(requestedPath)) return null;
  return requestedPath + "/";
}

async function respondWithFile(rootDirectory, options, request, response) {
  const url = new URL(request.url, "http://x");
  const requestedPath = decodeURIComponent(url.pathname);
  const redirect = options.trailingSlashRedirect && slashRedirectTarget(requestedPath);
  if (redirect) {
    response.writeHead(308, { Location: redirect + url.search }).end();
    return;
  }
  const absolutePath = resolveInsideRoot(rootDirectory, requestedPath);
  if (!absolutePath) {
    response.writeHead(403).end();
    return;
  }
  try {
    const extension = path.extname(absolutePath);
    const raw = await readFile(absolutePath);
    const { body, encoding } = options.compress
      ? encodeForClient(raw, extension, request.headers["accept-encoding"])
      : { body: raw, encoding: null };
    const headers = { "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream", Vary: "Accept-Encoding" };
    if (encoding) headers["Content-Encoding"] = encoding;
    response.writeHead(200, headers).end(body);
  } catch {
    response.writeHead(404).end();
  }
}

/** Serve `rootDirectory` on `port`; resolves to a close() function. */
export function startStaticServer(rootDirectory, port, options = {}) {
  const server = http.createServer((request, response) => {
    respondWithFile(rootDirectory, options, request, response);
  });
  return new Promise((resolve) => {
    server.listen(port, () => resolve(() => server.close()));
  });
}
