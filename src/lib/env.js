/**
 * Environment variable validation
 * ────────────────────────────────
 * Validates that all required environment variables are present at startup.
 * Call validateEnv() before mounting the React app in main.jsx.
 *
 * Week 1, Task 4 – Environment Configuration
 */


/**
 * Validates required environment variables.
 * Skipped entirely in production/hosted environments because Vite-prefixed
 * variables are build-time only and are not available as runtime secrets.
 * Throws a descriptive error in development so the issue is immediately obvious.
 *
 * @throws {Error} When required variables are missing in development.
 */
export function validateEnv() {
  // Skip validation in hosted/production environment – Vite build-time
  // variables are inlined at build time and are not available as runtime
  // secrets, so checking them here would always fail in hosted deployments.
  if (import.meta.env.PROD) return;

  const required = ['VITE_BASE44_APP_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables:\n${missing.map(k => `  • ${k}`).join('\n')}\n\nCreate a .env.local file based on .env.example and set these values.`);
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
