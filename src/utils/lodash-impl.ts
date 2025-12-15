// Dirty re-implementation of lodash-functions because I do not want to rely on too many external dependencies and blow up output.

export function escape(input: unknown): string {
  if (typeof input !== 'string') return '';

  const s = String(input ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
