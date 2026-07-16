// Configuration: Allowed paths for redirect inside the mini-program
export const ALLOWED_MINI_APP_PATHS = new Set(["/pages/finance/index"]);

/**
 * Extracts the base pathname from a path string, discarding query parameters and hashes.
 * E.g., "/pages/finance/index?id=123" -> "/pages/finance/index"
 */
export function getCleanPathname(pathStr: string): string {
  const withoutQuery = pathStr.split("?")[0];
  const cleanPath = withoutQuery.split("#")[0];
  return cleanPath;
}

/**
 * Validates if the redirect pathname is allowed.
 */
export function isValidRedirectPath(pathStr: string): boolean {
  const pathname = getCleanPathname(pathStr);
  return ALLOWED_MINI_APP_PATHS.has(pathname);
}

/**
 * Builds the fallback URL to redirect back to the MyTelkomsel native app.
 */
export function buildExistingMyTelkomselUrl({
  targetPath,
  transactionId,
  refreshBalance,
  extraParams,
}: {
  targetPath: string;
  transactionId: string;
  refreshBalance: string;
  extraParams?: Record<string, string>;
}): string {
  const decodedPath = decodeURIComponent(targetPath || "");
  const hasProtocol = decodedPath.startsWith("http://") || decodedPath.startsWith("https://");
  try {
    const urlObj = new URL(hasProtocol ? decodedPath : `https://${decodedPath}`);
    if (transactionId && !urlObj.searchParams.has("transactionId")) {
      urlObj.searchParams.set("transactionId", transactionId);
    }
    if (refreshBalance && !urlObj.searchParams.has("refreshBalance")) {
      urlObj.searchParams.set("refreshBalance", refreshBalance);
    }
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        if (!urlObj.searchParams.has(key)) {
          urlObj.searchParams.set(key, value);
        }
      });
    }
    return urlObj.toString();
  } catch (e) {
    let target = hasProtocol ? decodedPath : `https://${decodedPath}`;
    if (extraParams && Object.keys(extraParams).length > 0) {
      const separator = target.includes("?") ? "&" : "?";
      const queryString = Object.entries(extraParams)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      target = `${target}${separator}${queryString}`;
    }
    return target;
  }
}
