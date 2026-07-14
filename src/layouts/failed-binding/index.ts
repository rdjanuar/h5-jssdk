import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { TW } from "../../mixins/tailwind-integration";
import "../../components/ui/button";

const TwLitElement = TW(LitElement);

@customElement("failed-binding-layout")
export class FailedBindingLayout extends TwLitElement {
  private _handleFinanceClick() {
    this.dispatchEvent(
      new CustomEvent("attempt-redirect", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render() {
    return html`
      <div class="flex flex-col h-screen text-center max-w-[768px] mx-auto bg-white">
        <div class="flex-1 flex flex-col justify-center items-center px-6">
          <div class="mb-4 w-[240px] h-[240px] flex justify-center items-center">
            <img
              src="https://tdwstcontent.telkomsel.com/s3fs-public/2026-05/something-went-wrong.svg"
              alt="Failed Illustration"
              width=${240}
              height=${240}
              class="max-w-full h-auto max-h-[240px] object-contain"
            />
          </div>
          <h1 class="text-primary text-base font-semibold mb-2">
            Gagal menghubungkan metode pembayaran
          </h1>
          <p class="text-[#757f90] text-sm leading-relaxed font-normal">
            Maaf, terjadi kesalahan saat menghubungkan metode pembayaran. Silakan coba lagi dalam
            beberapa saat.
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
    "failed-binding-layout": FailedBindingLayout;
  }
}
