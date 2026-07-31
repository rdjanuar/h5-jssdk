import "./styles/main.css";
import { LitElement, html, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { TW } from "./mixins/tailwind-integration";
import "./layouts/success-transaction";
import "./layouts/success-binding";
import "./layouts/failed-binding";
import {
  getAppId,
  isValidTransactionId,
  isValidRefreshBalance,
  buildExistingMyTelkomselUrl,
  isValidRedirectPath,
  getCleanPathname,
  resolveProxyUrl,
  loadAssets,
} from "./utils";

// Global types for TCMPP JSSDK
declare global {
  interface Window {
    wx: any;
    tcsas: any;
  }
}

const TwLitElement = TW(LitElement);

@customElement("app-root")
export class AppRoot extends TwLitElement {
  @state() private layout: "binding_success" | "success-transaction" | "binding_failed" | "none" =
    "none";

  private redirectPath = "";
  private urlParams!: URLSearchParams;

  @state() private assetsLoaded = false;

  async connectedCallback() {
    super.connectedCallback();
    this.initApp();
  }

  protected async firstUpdated(_changedProperties: PropertyValues) {
    try {
      const res = await fetch(resolveProxyUrl("https://tdwstcontent.telkomsel.com/v2/images/app"));
      const data = await res.json();
      loadAssets(data?.data || data);
      this.assetsLoaded = true;
    } catch (e) {
      console.error("Failed to load assets:", e);
    }
  }

  private initApp() {
    this.urlParams = new URLSearchParams(window.location.search);
    const root = this.urlParams.get("root");
    const path = this.urlParams.get("path") || "";
    const type = this.urlParams.get("type") || "";
    const redirectPage = this.urlParams.get("redirectPage") || "";
    const layoutParam = this.urlParams.get("layout") || "success-transaction";
    let transactionId = this.urlParams.get("transactionId") || "";
    let refreshBalance = this.urlParams.get("refreshBalance") || "";

    if (!transactionId || !refreshBalance) {
      if (path) {
        try {
          const decodedPath = decodeURIComponent(path);
          const pathUrl = new URL(
            decodedPath.includes("://") ? decodedPath : `https://${decodedPath}`,
          );
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
      isValidTransactionId(transactionId) && isValidRefreshBalance(refreshBalance);

    const appId = getAppId();
    const sdkLoadFailure = !window.wx && !window.tcsas;
    const isBindingFlow = layoutParam === "binding";

    const statusParam = this.urlParams.get("status") || "success";

    const isBindingSuccess = isBindingFlow && statusParam === "success";
    const isBindingFailed = isBindingFlow && statusParam === "error";

    const shouldRedirect = sdkLoadFailure || hasValidContext;

    if (shouldRedirect) {
      if (appId && type !== "binding") {
        window.wx.miniProgram.reLaunch({
          url: "/pages/finance/index",
        });
      } else {
        const extraParams: Record<string, string> = {};
        this.urlParams.forEach((value, key) => {
          const coreParams = [
            "root",
            "path",
            "type",
            "redirectPage",
            "layout",
            "transactionId",
            "refreshBalance",
          ];
          if (!coreParams.includes(key)) {
            extraParams[key] = value;
          }
        });

        const targetUrl = buildExistingMyTelkomselUrl({
          targetPath: type === "binding" ? redirectPage : path,
          transactionId,
          refreshBalance,
          extraParams,
        });
        window.location.href = targetUrl;
      }
      return;
    }

    // Set layout state
    if (isBindingSuccess) {
      this.layout = "binding_success";
    } else if (isBindingFailed) {
      this.layout = "binding_failed";
    } else {
      this.layout = "success-transaction";
    }

    // 3. Mini-program configuration & redirection handling
    if (root === "miniapp" && path) {
      console.log("Loading TCMPP JSSDK...");

      let decoded = decodeURIComponent(path);
      if (decoded.startsWith('"') && decoded.endsWith('"')) {
        decoded = decoded.slice(1, -1);
      }
      this.redirectPath = decoded;
    }
  }

  private _handleRedirect(e: CustomEvent<Record<string, string> | undefined>) {
    const extraParams = e.detail;
    if (!this.redirectPath) return;

    const isFullUrl =
      this.redirectPath.startsWith("http://") || this.redirectPath.startsWith("https://");

    if (isFullUrl) {
      window.location.href = this.redirectPath;
      return;
    }

    // Path validation check
    if (!isValidRedirectPath(this.redirectPath)) {
      const pathname = getCleanPathname(this.redirectPath);
      console.error(`Redirect blocked. Path "${pathname}" is not in the allowed list.`);
      alert(`Security Error: The redirect path is not allowed.`);
      return;
    }

    const sdk = window.wx || window.tcsas;
    if (sdk && sdk.miniProgram) {
      let targetUrl = this.redirectPath;

      // Forward query params if extraParams is explicitly provided
      if (extraParams) {
        const forwardParams: Record<string, string> = {};
        this.urlParams.forEach((value, key) => {
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
  }

  protected render() {
    // Re-render layout when assets are loaded
    if (!this.assetsLoaded && this.layout === "none") {
      return html``;
    }
    if (this.layout === "binding_success") {
      return html`
        <success-binding-layout @attempt-redirect=${this._handleRedirect}></success-binding-layout>
      `;
    }
    if (this.layout === "binding_failed") {
      return html`
        <failed-binding-layout @attempt-redirect=${this._handleRedirect}></failed-binding-layout>
      `;
    }
    if (this.layout === "success-transaction") {
      return html`
        <success-transaction-layout
          @attempt-redirect=${this._handleRedirect}
        ></success-transaction-layout>
      `;
    }
    return html;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-root": AppRoot;
  }
}
