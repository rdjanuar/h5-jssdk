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
}: {
  targetPath: string;
  transactionId: string;
  refreshBalance: string;
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
    return urlObj.toString();
  } catch (e) {
    return hasProtocol ? decodedPath : `https://${decodedPath}`;
  }
}
