export function resolveProxyUrl(url: string): string {
  if (!url) return url;

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (import.meta.env.DEV || isLocalhost || import.meta.env.VITE_APP_ENV === "production") {
    const contentUrl = (import.meta.env.VITE_API_URL_CONTENT_URL || "").replace(/\/+$/, "");
    let resolved = url;
    if (contentUrl && resolved.startsWith(contentUrl)) {
      resolved = resolved.slice(contentUrl.length);
    }
    return resolved
      .replace("https://tdwstcontent.telkomsel.com", "")
      .replace("https://tdwcontent.telkomsel.com", "");
  }

  return url;
}
