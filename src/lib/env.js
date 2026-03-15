/**
 * Environment variable validation
 * ────────────────────────────────
 * Validates that all required environment variables are present at startup.
 * Call validateEnv() before mounting the React app in main.jsx.
 *
 * Week 1, Task 4 – Environment Configuration
 */

const REQUIRED_VARS = [
  'VITE_BASE44_APP_ID',
  'VITE_BASE44_APP_BASE_URL',
];

/**
 * Validates required environment variables.
 * Throws a descriptive error in development; logs a warning in production
 * so a misconfigured deployment still starts but is clearly flagged.
 *
 * @throws {Error} When required variables are missing in development.
 */
export function validateEnv() {
  const missing = REQUIRED_VARS.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length === 0) return;

  const message = [
    'Missing required environment variables:',
    ...missing.map((k) => `  • ${k}`),
    '',
    'Create a .env.local file based on .env.example and set these values.',
  ].join('\n');

  if (import.meta.env.DEV) {
    // Hard-fail in development so the issue is immediately obvious.
    throw new Error(message);
  } else {
    // Warn in production instead of crashing – avoids a blank screen for
    // users while still surfacing the misconfiguration in monitoring logs.
    console.error('[env] ' + message);
  }
}

/**
 * Returns the value of a required environment variable.
 * @param {string} key - The environment variable name (e.g. 'VITE_BASE44_APP_ID')
 * @returns {string}
 * @throws {Error} When the variable is not set.
 */
export function requireEnv(key) {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Environment variable "${key}" is required but not set. ` +
      'See .env.example for setup instructions.'
    );
  }
  return value;
}
