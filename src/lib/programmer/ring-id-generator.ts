const HEX_CHARS = "0123456789ABCDEF";

/**
 * Generates a random 4-character hex ring ID.
 * Uses cryptographically secure random when available, falls back to Math.random for SSR.
 */
export function generateRingId(): string {
  let result = "";
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(4);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 4; i++) {
      result += HEX_CHARS[array[i] % 16];
    }
  } else {
    for (let i = 0; i < 4; i++) {
      result += HEX_CHARS[Math.floor(Math.random() * 16)];
    }
  }
  return result;
}

/** Validates that a string is a valid 4-char hex ring ID (0-9, A-F, case-insensitive). */
export function isValidRingId(value: string): boolean {
  return /^[0-9A-F]{4}$/i.test(value);
}

/** Normalizes a ring ID to uppercase. */
export function normalizeRingId(value: string): string {
  return value.trim().toUpperCase();
}
