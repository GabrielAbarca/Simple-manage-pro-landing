// Minimal static file server for the design handoff. The prototypes load
// their runtime, tokens and fonts by relative URL, which file:// refuses to
// fetch, so they have to be served over http to render at all.

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

function resolveInsideRoot(rootDirectory, requestUrl) {
  let requestedPath = decodeURIComponent(new URL(requestUrl, "http://x").pathname);
  // Directory URLs (the site's trailing-slash routes) serve their index.html.
  if (requestedPath.endsWith("/")) requestedPath += "index.html";
  const absolutePath = path.normalize(path.join(rootDirectory, requestedPath));
  // Refuse anything that climbs out of the served folder.
  if (!absolutePath.startsWith(path.normalize(rootDirectory))) return null;
  return absolutePath;
}

async function respondWithFile(rootDirectory, request, response) {
  const absolutePath = resolveInsideRoot(rootDirectory, request.url);
  if (!absolutePath) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(absolutePath);
    const contentType = CONTENT_TYPES[path.extname(absolutePath)] ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType }).end(body);
  } catch {
    response.writeHead(404).end();
  }
}

/** Serve `rootDirectory` on `port`; resolves to a close() function. */
export function startStaticServer(rootDirectory, port) {
  const server = http.createServer((request, response) => {
    respondWithFile(rootDirectory, request, response);
  });
  return new Promise((resolve) => {
    server.listen(port, () => resolve(() => server.close()));
  });
}
