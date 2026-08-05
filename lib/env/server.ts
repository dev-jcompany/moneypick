import 'server-only';

const SECRET_NAME_PATTERN = /(SECRET|PASSWORD|SERVICE_ROLE|PRIVATE|TOKEN|API_KEY)/i;

function clean(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function optionalServerEnv(name: string) {
  if (name.startsWith('NEXT_PUBLIC_') && SECRET_NAME_PATTERN.test(name)) {
    throw new Error(`[security] Secret-like environment variable must not be public: ${name}`);
  }
  return clean(process.env[name]);
}

export function requiredServerEnv(name: string, minimumLength = 1) {
  const value = optionalServerEnv(name);
  if (!value) throw new Error(`[security] Required server environment variable is missing: ${name}`);
  if (value.length < minimumLength) {
    throw new Error(`[security] ${name} must be at least ${minimumLength} characters.`);
  }
  return value;
}

export function publicEnv(name: `NEXT_PUBLIC_${string}`) {
  const value = clean(process.env[name]);
  if (!value) throw new Error(`[config] Required public environment variable is missing: ${name}`);
  return value;
}

export function adminSecurityConfig() {
  const production = process.env.NODE_ENV === 'production';
  const username = clean(process.env.ADMIN_USERNAME) ?? (production ? null : 'admin');
  const password = clean(process.env.ADMIN_PASSWORD) ?? (production ? null : 'moneypick-admin');
  const signingSecret = clean(process.env.ADMIN_AUTH_SECRET) ?? (production ? null : password);

  if (!username) throw new Error('[security] ADMIN_USERNAME is required in production.');
  if (!password) throw new Error('[security] ADMIN_PASSWORD is required in production.');
  if (!signingSecret) throw new Error('[security] ADMIN_AUTH_SECRET is required in production.');

  if (production && username.toLowerCase() === 'admin') {
    throw new Error('[security] ADMIN_USERNAME must not use the default "admin" value in production.');
  }
  if (production && password.length < 16) {
    throw new Error('[security] ADMIN_PASSWORD must be at least 16 characters in production.');
  }
  if (production && signingSecret.length < 32) {
    throw new Error('[security] ADMIN_AUTH_SECRET must be at least 32 characters in production.');
  }
  if (production && password === signingSecret) {
    throw new Error('[security] ADMIN_AUTH_SECRET must be different from ADMIN_PASSWORD.');
  }

  return { username, password, signingSecret };
}
