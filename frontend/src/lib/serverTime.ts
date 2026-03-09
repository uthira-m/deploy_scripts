/**
 * Server time module - use server date/time for year calculations.
 * Fetches from GET /api/server-time and caches the result.
 */

import { getServerTime } from './api';

let cachedServerDate: Date | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 1000; // Refresh every 1 minute

/**
 * Fetch server time from API and cache it.
 * Call this early (e.g. in AppSettingsProvider) so year calculations use server time.
 */
export async function fetchAndCacheServerTime(): Promise<void> {
  try {
    const result = await getServerTime();
    if (result.success && result.serverTime) {
      cachedServerDate = new Date(result.serverTime);
      lastFetchTime = Date.now();
    }
  } catch {
    // Silently fail - getServerDate() will fall back to local time
  }
}

/**
 * Get the server's current date for year calculations.
 * Returns cached server date if available and fresh, otherwise falls back to local Date().
 * Always returns a NEW Date instance so callers can safely mutate it without affecting the cache.
 */
export function getServerDate(): Date {
  const now = Date.now();
  if (cachedServerDate && now - lastFetchTime >= CACHE_TTL_MS) {
    fetchAndCacheServerTime(); // Refresh when cache is stale
  }
  return cachedServerDate ? new Date(cachedServerDate.getTime()) : new Date();
}
