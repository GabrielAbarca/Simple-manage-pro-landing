// `npm run preview`: serve the production build's static output.
//
// The Vercel adapter does not support `astro preview`. Every page prerenders,
// so .vercel/output/static is byte for byte what Vercel serves, and that is
// all the harnesses need. The one on-demand route (/api/postular/) and the
// /portales/ redirect are not served here: use `npm run dev` for those.
//
//   npm run build && npm run preview          (port 4321, or PORT=4325)

import path from "node:path";
import { existsSync } from "node:fs";
import { startStaticServer } from "./lib/static-server.mjs";

const OUTPUT = path.resolve(".vercel/output/static");
const PORT = Number(process.env.PORT || 4321);

if (!existsSync(OUTPUT)) {
  console.error("No build found at .vercel/output/static. Run `npm run build` first.");
  process.exit(1);
}

await startStaticServer(OUTPUT, PORT, { trailingSlashRedirect: true, compress: true });
console.log(`Serving the static build on http://localhost:${PORT}/`);
