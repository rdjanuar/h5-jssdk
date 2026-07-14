import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { TW } from "../../mixins/tailwind-integration";
import "../../components/ui/button";

const TwLitElement = TW(LitElement);

@customElement("success-transaction-layout")
export class SuccessTransactionLayout extends TwLitElement {
  private _handleFinanceClick() {
    this.dispatchEvent(
      new CustomEvent("attempt-redirect", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleHistoryClick() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentMethod =
      urlParams.get("payment_method") ||
      urlParams.get("paymentMethod") ||
      urlParams.get("method") ||
      "";

    this.dispatchEvent(
      new CustomEvent("attempt-redirect", {
        detail: {
          action: "history_page",
          payment_method: paymentMethod,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render() {
    return html`
      <div class="flex flex-col min-h-screen text-center relative max-w-[768px] mx-auto bg-white">
        <div class="mt-[20px] p-[16px] flex flex-col items-center">
          <img
            class="mb-[12px] object-contain"
            src="https://tdwcontent.telkomsel.com/minifnp/status-icon.svg"
            alt="Success Icon"
          />
          <h1 class="text-secondary text-[1rem] font-semibold mb-[1rem]">Transaksi Selesai</h1>
          <p class="text-primary text-sm font-normal">
            Status pembayaran dapat dicek
            <br />
            melalui riwayat transaksi pada
            <br />
            layanan pembayaran yang dipilih
          </p>
        </div>

        <div class="px-[16px] pt-[16px] flex items-end justify-center flex-1">
          <div class="w-full flex justify-center items-end mx-auto">
            <img
              src="https://tdwcontent.telkomsel.com/minifnp/illustration.svg"
              alt="Success Illustration"
              class="max-w-full h-auto max-h-[380px] object-contain"
            />
          </div>
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

          <!-- Optional history button if needed in future:
          <ui-button variant="outline" color="primary" size="lg" block @click=${this
            ._handleHistoryClick}>
            Lihat Riwayat Transaksi
          </ui-button>
          -->
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "success-transaction-layout": SuccessTransactionLayout;
  }
}
