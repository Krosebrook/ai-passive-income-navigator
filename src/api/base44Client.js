import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// requiresAuth is enabled in production so the SDK blocks unauthenticated calls;
// disabled in development to preserve hot-reload and local testing convenience.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: import.meta.env.PROD,
  appBaseUrl
});
