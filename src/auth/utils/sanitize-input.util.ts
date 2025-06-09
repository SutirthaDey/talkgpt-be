export function strictSanitize(input: string): string {
  return input
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '') // MySQL special chars
    .replace(/<[^>]*>?/gm, '') // Strip HTML
    .trim();
}
