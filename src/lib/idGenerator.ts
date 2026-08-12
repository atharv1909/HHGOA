// ═══════════════════════════════════════════════════════
// HH GOA 2026 — ID GENERATOR
// Short, human-readable builder IDs
// ═══════════════════════════════════════════════════════

// Base32-ish alphabet excluding ambiguous characters (0/O, 1/I/L)
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateBuilderId(): string {
  let id = '';
  const array = new Uint8Array(5);
  crypto.getRandomValues(array);
  for (let i = 0; i < 5; i++) {
    id += ALPHABET[array[i] % ALPHABET.length];
  }
  return id;
}

export function formatBuilderId(id: string): string {
  return `HHG-${id}`;
}
