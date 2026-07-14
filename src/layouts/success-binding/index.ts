import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { TW } from "../../mixins/tailwind-integration";
import "../../components/ui/button";
import "../../components/ui/lottie-animation";

const TwLitElement = TW(LitElement);

@customElement("success-binding-layout")
export class SuccessBindingLayout extends TwLitElement {
  connectedCallback() {
    super.connectedCallback();
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("authCode");

    if (window.wx?.miniProgram) {
      window.wx.miniProgram.sendWebviewEvent({
        scope: "success_binding",
        action: "binding_auth_code",
        payload: {
          authCode,
        },
      });
    }
  }

  private _handleFinanceClick() {
    this.dispatchEvent(
      new CustomEvent("attempt-redirect", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawPayment = urlParams.get("payment") || "";
    const paymentName =
      rawPayment.toLowerCase() === "dana"
        ? "DANA"
        : rawPayment.charAt(0).toUpperCase() + rawPayment.slice(1);

    const isDev = import.meta.env.DEV;
    const lottieUrl = isDev
      ? "/s3fs-public/2026-07/connected-success.json"
      : "https://tdwstcontent.telkomsel.com/s3fs-public/2026-07/connected-success.json";

    return html`
      <div class="flex flex-col h-screen text-center max-w-[768px] mx-auto bg-white">
        <div class="flex-1 flex flex-col justify-center items-center px-4">
          <div class="mb-4 w-[350px] h-[350px] flex justify-center items-center">
            <lottie-animation src=${lottieUrl} width="350px" height="350px"></lottie-animation>
          </div>
          <h1 class="text-primary text-base font-semibold mb-2">${paymentName} telah terhubung</h1>
          <p class="text-[#757f90] text-sm leading-relaxed font-normal">
            Sekarang pembayaran jadi lebih mudah di
            <br />
            transaksi berikutnya
          </p>
        </div>

        <div
          class="px-[16px] pt-[12px] pb-[16px] pb-[max(16px,env(safe-area-inset-bottom))] flex flex-col gap-[0.8rem]"
        >
          <ui-button
            variant="solid"
            color="primary"
            size="lg"
            block
            @click=${this._handleFinanceClick}
          >
            Kembali ke Keuangan
          </ui-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "success-binding-layout": SuccessBindingLayout;
  }
}
