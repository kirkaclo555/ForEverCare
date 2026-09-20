// src/config/api.ts
import Constants from 'expo-constants';

// Toggle this to true when deploying to production
export const IS_PRODUCTION = false;

// The URL for your production Vercel backend
export const PROD_API_URL = 'https://your-vercel-app-url.vercel.app';

// Fallback IP for standalone APK builds when running on the local Wi-Fi network
// (In APK builds, Constants.expoConfig?.hostUri is undefined, so localhost would fail)
const FALLBACK_IP = '192.168.100.16';

// The URL for your local development environment
const getLocalApiUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || '';
  const ip = hostUri.split(':')[0];
  if (ip) return `http://${ip}:3000`;
  return `http://${FALLBACK_IP}:3000`;
};

export const LOCAL_API_URL = getLocalApiUrl();

// The base API URL used throughout the app
export const API_URL = IS_PRODUCTION ? PROD_API_URL : LOCAL_API_URL;


