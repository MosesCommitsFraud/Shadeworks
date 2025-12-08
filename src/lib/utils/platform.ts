/**
 * Detect the user's operating system
 */
export function detectOS(): 'mac' | 'windows' | 'linux' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  }

  if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows';
  }

  if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
}

/**
 * Check if the current OS is macOS
 */
export function isMac(): boolean {
  return detectOS() === 'mac';
}

/**
 * Get the modifier key name for the current OS
 */
export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

/**
 * Get the shift key symbol for the current OS
 */
export function getShiftKey(): string {
  return isMac() ? '⇧' : 'Shift';
}

/**
 * Get the alt/option key symbol for the current OS
 */
export function getAltKey(): string {
  return isMac() ? '⌥' : 'Alt';
}

/**
 * Get the control key symbol for the current OS
 */
export function getControlKey(): string {
  return isMac() ? '⌃' : 'Ctrl';
}
