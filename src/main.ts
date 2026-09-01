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

    if (window.wx?.miniProgram?.onWebviewEvent) {
      window.wx.miniProgram.onWebviewEvent(this.onWebViewEventEmit);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (window.wx?.miniProgram?.offWebviewEvent) {
      window.wx.miniProgram.offWebviewEvent(this.onWebViewEventEmit);
    }
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

  private onWebViewEventEmit = async (e: { message: string }) => {
    try {
      const parsedMessage = typeof e.message === "string" ? JSON.parse(e.message) : e.message;
      if (parsedMessage.scope === "second_binding" && parsedMessage.action === "status") {
        const { status, payment } = parsedMessage.data || {};

        this.urlParams.set("status", status);
        this.urlParams.set("layout", "binding");
        if (payment) {
          this.urlParams.set("payment", payment);
        }

        const newUrl = `${window.location.pathname}?${this.urlParams.toString()}`;
        window.history.replaceState(null, "", newUrl);

        if (status === "success") {
          this.layout = "binding_success";
        } else if (status === "error") {
          this.layout = "binding_failed";
        }
      }
    } catch (err) {
      console.error("Failed to parse webview event:", err);
    }
  };

  private initApp() {
    this.urlParams = new URLSearchParams(window.location.search);
    const root = this.urlParams.get("root");
    const path = this.urlParams.get("path") || "";
    const type = this.urlParams.get("type") || "";
    const payment = this.urlParams.get("payment") || "";
    const status = this.urlParams.get("status") || "";
    const redirectPage = this.urlParams.get("redirectPage") || "";
    const layoutParam = this.urlParams.get("layout") || "success-transaction";
    let transactionId = this.urlParams.get("transactionId") || "";
    let refreshBalance = this.urlParams.get("refreshBalance") || "";
    const authCode = this.urlParams.get(payment === "dana" ? "auth_code" : "authCode") || "";
    const state = this.urlParams.get("state");

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

    if (!appId && payment === "mandiri") {
      window.history.replaceState(
        null,
        "",
        `/mandiri/${status}?layout=binding&status=${status}&payment=${payment}`,
      );
    }

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

    // Handle Dana 2nd bind
    if (payment === "dana" && this.layout === "none") {
      if (window.wx?.miniProgram) {
        window.wx.miniProgram.sendWebviewEvent({
          scope: "binding",
          action: "binding_auth_code",
          payload: {
            authCode: `${authCode}-${state}`,
          },
        });
      }
    } else {
      // Set layout state
      if (isBindingSuccess) {
        this.layout = "binding_success";
      } else if (isBindingFailed) {
        this.layout = "binding_failed";
      } else {
        this.layout = "success-transaction";
      }
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
      // let targetUrl = this.redirectPath;
      const [basePath, searchStr] = this.redirectPath.split("?");
      const finalParams = new URLSearchParams(searchStr || "");
      this.urlParams.forEach((value, key) => {
        if (key !== "root" && key !== "path") {
          finalParams.set(key, value); // Menggunakan .set mencegah duplikasi
        }
      });

      // Forward query params if extraParams is explicitly provided
      if (extraParams) {
        Object.entries(extraParams).forEach(([key, value]) => {
          finalParams.set(key, value);
        });
      }

        // const mergedParams = { ...forwardParams, ...extraParams };

        // if (Object.keys(mergedParams).length > 0) {
        //   const separator = targetUrl.includes("?") ? "&" : "?";
        //   const queryString = Object.entries(mergedParams)
        //     .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        //     .join("&");
        //   targetUrl = `${targetUrl}${separator}${queryString}`;
        // }
      // }
      
      const queryString = finalParams.toString();
      console.log('queryString: ', queryString)
      const targetUrl = queryString ? `${basePath}?${queryString}` : basePath;
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
    if (!this.assetsLoaded) {
      return html``;
    }

    if (this.layout === "none") {
      return html``;
    } else if (this.layout === "binding_success") {
      return html`
        <success-binding-layout @attempt-redirect=${this._handleRedirect}></success-binding-layout>
      `;
    } else if (this.layout === "binding_failed") {
      return html`
        <failed-binding-layout @attempt-redirect=${this._handleRedirect}></failed-binding-layout>
      `;
    } else if (this.layout === "success-transaction") {
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
