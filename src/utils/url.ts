/**
 * Resolves absolute URLs to relative paths during local development (DEV mode)
 * so that Vite dev server proxy can intercept requests and bypass CORS/localhost restrictions.
 */
export function resolveProxyUrl(url: string): string {
  if (!url) return url;
  if (import.meta.env.DEV) {
    return url
      .replace("https://tdwstcontent.telkomsel.com", "")
      .replace("https://tdwcontent.telkomsel.com", "");
  }
  return url;
}
