/**
 * Persistent Command History Manager
 * Stores and retrieves terminal command history in localStorage
 * so that ArrowUp / ArrowDown navigation persists across page reloads.
 */

const HISTORY_STORAGE_KEY = 'CYBERDECK_PERSISTENT_CMD_HISTORY';
const MAX_HISTORY_ITEMS = 150;

export function loadPersistentCommandHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    }
  } catch {
    // Ignore error
  }
  return [];
}

export function savePersistentCommandHistory(command: string): string[] {
  if (typeof window === 'undefined') return [];
  const trimmed = command.trim();
  if (!trimmed) return loadPersistentCommandHistory();

  try {
    const current = loadPersistentCommandHistory();
    // Remove if already last entry to avoid consecutive duplicates
    const filtered = current[current.length - 1] === trimmed ? current : [...current, trimmed];
    const limited = filtered.slice(-MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limited));
    return limited;
  } catch {
    return [];
  }
}

export function clearPersistentCommandHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {}
}
