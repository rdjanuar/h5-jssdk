import "@fontsource/poppins/index.css";

const urlParams = new URLSearchParams(window.location.search);
const root = urlParams.get("root");
const path = urlParams.get("path");

declare global {
  interface Window {
    wx: any;
    tcsas: any;
  }
}

if (root && root === "miniapp" && path) {
  console.log("Loading TCMPP JSSDK...");

  let redirectPath = decodeURIComponent(path);
  if (redirectPath.startsWith('"') && redirectPath.endsWith('"')) {
    redirectPath = redirectPath.slice(1, -1);
  }

  const attemptRedirect = (extraParams?: Record<string, string>) => {
    const sdk = window.wx || window.tcsas;
    if (sdk && sdk.miniProgram) {
      let targetUrl = redirectPath;

      // Only forward/modify query params if extraParams is explicitly provided
      if (extraParams) {
        // 1. Collect query parameters from the current H5 URL (except root and path)
        const forwardParams: Record<string, string> = {};
        urlParams.forEach((value, key) => {
          if (key !== "root" && key !== "path") {
            forwardParams[key] = value;
          }
        });

        // 2. Merge with any extra parameters passed for this redirect
        const mergedParams = { ...forwardParams, ...extraParams };

        // 3. Append parameters to redirectPath
        if (Object.keys(mergedParams).length > 0) {
          const separator = targetUrl.includes("?") ? "&" : "?";
          const queryString = Object.entries(mergedParams)
            .map(
              ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
            )
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
            fail: (err: any) =>
              alert("All redirects failed: " + JSON.stringify(err)),
          });
        },
      });
    } else {
      alert("SDK (wx/tcsas) .miniProgram is not available on window");
    }
  };

  const script = document.createElement("script");
  script.src =
    "https://tcmpp-team.github.io/mini-programs/jssdk/tcsas-jssdk-1.0.1.js";
  script.async = true;

  script.onload = () => {
    console.log("TCMPP JSSDK loaded successfully.");
  };

  script.onerror = () => {
    alert("Failed to load TCMPP JSSDK script from network.");
  };

  document.head.appendChild(script);

  const btnFinance = document.getElementById("btn-finance");
  if (btnFinance) {
    btnFinance.addEventListener("click", () => {
      attemptRedirect();
    });
  }

  const btnHistory = document.getElementById("btn-history");
  if (btnHistory) {
    btnHistory.addEventListener("click", () => {
      // Look for the payment method in the H5 URL parameters (generic variants)
      const paymentMethod =
        urlParams.get("payment_method") ||
        urlParams.get("paymentMethod") ||
        urlParams.get("method") ||
        "";

      attemptRedirect({
        action: "history_page",
        payment_method: paymentMethod,
      });
    });
  }
}
