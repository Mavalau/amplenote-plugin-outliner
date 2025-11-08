// Dirty re-implementation of lodash-functions I need to not rely on too many external dependencies and blow up output.

export function escape(input: unknown): string {
  const s = String(JSON.stringify(input) ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
