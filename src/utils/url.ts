export function resolveProxyUrl(url: string): string {
  if (!url) return url;
  if (import.meta.env.DEV) {
    return url
      .replace("https://tdwstcontent.telkomsel.com", "")
      .replace("https://tdwcontent.telkomsel.com", "");
  }
  return url;
}
