import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(p) {
  if (!fs.existsSync(p)) { console.log("?? ??:", p); return; }
  console.log("?? ??:", p);
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^[\x27"]|[\x27"]$/g, "");
    if (k && process.env[k] == null) process.env[k] = v;
  }
}

loadEnv(path.join(__dirname, ".env"));

console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "??");
console.log("KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "?? (" + process.env.SUPABASE_SERVICE_ROLE_KEY.length + "?)" : "??");
