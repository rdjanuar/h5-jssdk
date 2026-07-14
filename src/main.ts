import "@fontsource/poppins/index.css";
import successTransactionHtml from "../layouts/success-transaction/index.html?raw";
import successBindingHtml from "../layouts/success-binding/index.html?raw";
import { initSuccessTransaction } from "../layouts/success-transaction";
import { initSuccessBinding } from "../layouts/success-binding";
import { getAppId } from './utils';

// Global types for TCMPP JSSDK
declare global {
  interface Window {
    wx: any;
    tcsas: any;
  }
}

// Configuration: Allowed paths for redirect inside the mini-program
export const ALLOWED_MINI_APP_PATHS = new Set([
  "/pages/finance/index"
]);

/**
 * Extracts the base pathname from a path string, discarding query parameters and hashes.
 * E.g., "/pages/finance/index?id=123" -> "/pages/finance/index"
 */
function getCleanPathname(pathStr: string): string {
  const withoutQuery = pathStr.split("?")[0];
  const cleanPath = withoutQuery.split("#")[0];
  return cleanPath;
}

/**
 * Validates if the redirect pathname is allowed.
 */
function isValidRedirectPath(pathStr: string): boolean {
  const pathname = getCleanPathname(pathStr);
  return ALLOWED_MINI_APP_PATHS.has(pathname);
}


/**
 * Builds the fallback URL to redirect back to the MyTelkomsel native app.
 */
function buildExistingMyTelkomselUrl({
  targetPath,
  transactionId,
  refreshBalance
}: {
  targetPath: string
  transactionId: string
  refreshBalance: string
}) {

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


function isValidTransactionId(value: string) {
  if (typeof value !== "string") {
    return false;
  }
  return /^[A-Za-z0-9_-]{1,100}$/.test(value);
}
function isValidRefreshBalance(value: string) {
  return value === "true" || value === "false";
}

/**
 * Main application initialization
 */
function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const root = urlParams.get("root");
  const path = urlParams.get("path");
  const layoutParam = urlParams.get("layout") || "success-transaction";
  let transactionId = urlParams.get("transactionId") || "";
  let refreshBalance = urlParams.get("refreshBalance") || "";

  if (!transactionId || !refreshBalance) {
    if (path) {
      try {
        const decodedPath = decodeURIComponent(path);
        const pathUrl = new URL(decodedPath.includes("://") ? decodedPath : `https://${decodedPath}`);
        if (!transactionId) {
          transactionId = pathUrl.searchParams.get("transactionId") || "";
        }
        if (!refreshBalance) {
          refreshBalance = pathUrl.searchParams.get("refreshBalance") || "";
        }
      } catch (e) {
        // ignore
      }
    }
  }

  const hasValidContext =
    isValidTransactionId(transactionId) &&
    isValidRefreshBalance(refreshBalance);

  const appId = getAppId();
  const sdkLoadFailure = !window.wx && !window.tcsas;
  const isBindingSuccess = layoutParam === "binding_success" || layoutParam === "success-binding";

  const shouldRedirect = sdkLoadFailure || hasValidContext;

  const app = document.getElementById("app");
  if (app) {
    if (shouldRedirect) {
      app.innerHTML = '';
    } else if (isBindingSuccess) {
      app.innerHTML = successBindingHtml;
    } else {
      app.innerHTML = successTransactionHtml;
    }
  }

  if (shouldRedirect) {
    if (appId) {
      window.wx.miniProgram.reLaunch({
        url: '/pages/finance/index'
      })
    } else {
      const targetUrl = buildExistingMyTelkomselUrl({
        targetPath: path,
        transactionId,
        refreshBalance
      });
      window.location.href = targetUrl;
    }

    return;
  }

  // 3. Mini-program configuration & redirection handling
  if (root === "miniapp" && path) {
    console.log("Loading TCMPP JSSDK...");

    let redirectPath = decodeURIComponent(path);
    if (redirectPath.startsWith('"') && redirectPath.endsWith('"')) {
      redirectPath = redirectPath.slice(1, -1);
    }

    const attemptRedirect = (extraParams?: Record<string, string>) => {
      // Path validation check
      if (!isValidRedirectPath(redirectPath)) {
        const pathname = getCleanPathname(redirectPath);
        console.error(`Redirect blocked. Path "${pathname}" is not in the allowed list.`);
        alert(`Security Error: The redirect path is not allowed.`);
        return;
      }

      const sdk = window.wx || window.tcsas;
      if (sdk && sdk.miniProgram) {
        let targetUrl = redirectPath;

        // Forward query params if extraParams is explicitly provided
        if (extraParams) {
          const forwardParams: Record<string, string> = {};
          urlParams.forEach((value, key) => {
            if (key !== "root" && key !== "path") {
              forwardParams[key] = value;
            }
          });

          const mergedParams = { ...forwardParams, ...extraParams };

          if (Object.keys(mergedParams).length > 0) {
            const separator = targetUrl.includes("?") ? "&" : "?";
            const queryString = Object.entries(mergedParams)
              .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
              .join("&");
            targetUrl = `${targetUrl}${separator}${queryString}`;
          }
        }

        console.log("Redirecting to mini-program URL:", targetUrl);

        sdk.miniProgram.reLaunch({
          url: targetUrl,
          success: () => console.log("reLaunch success to", targetUrl),
          fail: () => {
            sdk.miniProgram.navigateTo({
              url: targetUrl,
              success: () => console.log("navigateTo success to", targetUrl),
              fail: (err: any) => alert("All redirects failed: " + JSON.stringify(err)),
            });
          },
        });
      } else {
        alert("SDK (wx/tcsas) .miniProgram is not available on window");
      }
    };

    // Initialize layout-specific click events
    if (isBindingSuccess) {
      initSuccessBinding(attemptRedirect);
    } else {
      initSuccessTransaction(attemptRedirect, urlParams);
    }
  }
}

// Start H5 page logic
init();
