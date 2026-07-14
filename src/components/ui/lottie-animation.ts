import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import lottie from "lottie-web/build/player/lottie_light.js";

@customElement("lottie-animation")
export class LottieAnimation extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 300px;
      height: 300px;
    }
    #lottie-container {
      width: 100%;
      height: 100%;
    }
  `;

  @property({ type: String })
  src = "";

  @property({ type: Object })
  animationData?: any;

  @property({ type: String })
  width = "";

  @property({ type: String })
  height = "";

  containerRef = createRef<HTMLDivElement>();
  animationInstance: any = null;

  willUpdate(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has("width")) {
      this.style.width = this.width || "";
    }
    if (changedProperties.has("height")) {
      this.style.height = this.height || "";
    }
  }

  async firstUpdated() {
    if (!this.containerRef.value) return;

    const config: any = {
      container: this.containerRef.value,
      renderer: "svg",
      loop: true,
      autoplay: true,
    };

    if (this.animationData) {
      config.animationData = this.animationData;
      this.animationInstance = lottie.loadAnimation(config);
    } else if (this.src) {
      try {
        const response = await fetch(this.src);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        config.animationData = data;
        this.animationInstance = lottie.loadAnimation(config);
      } catch (err) {
        console.error("Failed to load lottie animation from", this.src, err);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationInstance) {
      this.animationInstance.destroy();
    }
  }

  render() {
    return html`<div ${ref(this.containerRef)} id="lottie-container"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lottie-animation": LottieAnimation;
  }
}
