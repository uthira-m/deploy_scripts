/**
 * Persists personnel list filter state when navigating to view details.
 * State is saved to sessionStorage when user clicks "View Details" and
 * restored when returning via Back link (with ?restore=1).
 */

const STORAGE_KEYS = {
  personnel: "personnel-list-state",
  "personnel-jco": "personnel-jco-list-state",
  officers: "officers-list-state",
  "all-personnel": "all-personnel-list-state",
  admins: "admins-list-state",
} as const;

export type ListType = keyof typeof STORAGE_KEYS;

export function savePersonnelListState(listType: ListType, state: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEYS[listType], JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function loadPersonnelListState(listType: ListType): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS[listType]);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    sessionStorage.removeItem(STORAGE_KEYS[listType]);
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function buildReturnUrl(listType: ListType): string {
  const basePaths: Record<ListType, string> = {
    personnel: "/dashboard/personnel",
    "personnel-jco": "/dashboard/personnel-jco",
    officers: "/dashboard/officers",
    "all-personnel": "/dashboard/all-personnel",
    admins: "/dashboard/admins",
  };
  return `${basePaths[listType]}?restore=1`;
}
