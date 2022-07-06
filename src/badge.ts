export function fetchBadgeURL(
  label: string,
  message: string,
  query: string,
  color = "brightgreen"
): string {
  return `https://img.shields.io/badge/${label}-${message}-${color}${query}`;
}
