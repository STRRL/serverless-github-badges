export function fetchBadgeURL(
  label: string,
  message: string,
  query: string,
  color = "brightgreen"
): string {
  const replacedLabel = encodeURIComponent(label.replaceAll("-", "--"))
  const replacedMessage = encodeURIComponent(message.replaceAll("-", "--"))
  return `https://img.shields.io/badge/${replacedLabel}-${replacedMessage}-${color}${query}`;
}
