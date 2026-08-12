// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('node:fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

const files = ['.env.local', '.env'];
const requiredProduction = [
  ['NEXT_PUBLIC_SUPABASE_URL', 1],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 1],
  ['SUPABASE_SERVICE_ROLE_KEY', 32],
  ['ADMIN_USERNAME', 4],
  ['ADMIN_PASSWORD', 14],
  ['ADMIN_AUTH_SECRET', 32],
  ['ADMIN_API_KEY', 32],
];
const secretPattern = /(SECRET|PASSWORD|SERVICE_ROLE|PRIVATE|TOKEN|API_KEY)/i;

function parseEnv(content) {
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    result[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return result;
}

const loaded = {};
for (const filename of files) {
  const fullPath = path.resolve(filename);
  if (!fs.existsSync(fullPath)) continue;
  Object.assign(loaded, parseEnv(fs.readFileSync(fullPath, 'utf8')));
  console.log(`${filename}: loaded (values hidden)`);
}

const issues = [];
for (const [name, minimumLength] of requiredProduction) {
  const value = loaded[name] ?? process.env[name];
  const present = typeof value === 'string' && value.trim().length > 0;
  const length = present ? value.trim().length : 0;
  const valid = present && length >= minimumLength;
  console.log(`${name}: ${present ? `present, length=${length}` : 'missing'}${valid ? '' : ' [ACTION REQUIRED]'}`);
  if (!valid) issues.push(`${name} must be present and at least ${minimumLength} characters`);
}

for (const name of Object.keys({ ...process.env, ...loaded })) {
  if (name.startsWith('NEXT_PUBLIC_') && secretPattern.test(name)) {
    issues.push(`${name} looks secret but is exposed to the browser`);
  }
}

const password = loaded.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
const authSecret = loaded.ADMIN_AUTH_SECRET ?? process.env.ADMIN_AUTH_SECRET;
if (password && authSecret && password === authSecret) {
  issues.push('ADMIN_AUTH_SECRET must differ from ADMIN_PASSWORD');
}

if (issues.length) {
  console.error('\nSecurity configuration issues:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
} else {
  console.log('\nSecurity environment configuration passed.');
}
