/**
 * Detects the operating system platform
 */
export function isMac(): boolean {
  if (typeof window === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
         /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * Returns the appropriate modifier key symbol based on OS
 */
export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

/**
 * Returns the appropriate modifier key name for display
 */
export function getModifierKeyName(): string {
  return isMac() ? 'Cmd' : 'Ctrl';
}
