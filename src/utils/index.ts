const BRIDGE_POLL_INTERVAL_MS = 50;
const BRIDGE_MAX_WAIT_MS = 10_000;

export function getAppId(): string | null {
  const match = window.navigator.userAgent.match(/TMA\/(\S+)/);
  return match ? match[1] : null;
}

function getSdk() {
  return window.wx;
}

function isBridgeAndSdkReady(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as any).WeixinJSBridge) &&
    typeof getSdk()?.getStorage === "function"
  );
}

function onBridgeAndSdkReady(
  callback: () => void,
  onTimeout: () => void,
  maxWaitMs = BRIDGE_MAX_WAIT_MS,
): () => void {
  if (isBridgeAndSdkReady()) {
    callback();
    return () => {};
  }

  let finished = false;

  const cleanup = () => {
    document.removeEventListener("WeixinJSBridgeReady", check);
    document.removeEventListener("QQJSBridgeReady", check);
    clearInterval(pollTimer);
    clearTimeout(maxTimer);
  };

  const check = () => {
    if (finished || !isBridgeAndSdkReady()) return;
    finished = true;
    cleanup();
    callback();
  };

  const pollTimer = setInterval(check, BRIDGE_POLL_INTERVAL_MS);
  const maxTimer = setTimeout(() => {
    if (finished) return;
    finished = true;
    cleanup();
    onTimeout();
  }, maxWaitMs);

  document.addEventListener("WeixinJSBridgeReady", check);
  document.addEventListener("QQJSBridgeReady", check);

  return () => {
    if (finished) return;
    finished = true;
    cleanup();
  };
}

export function getStorage<V>(
  key: string,
  timeoutMs = 300,
  onLateValue?: (value: V) => void,
): Promise<V | null> {
  const appId = getAppId();
  const inMiniApp =
    Boolean(appId) ||
    Boolean((window as any).WeixinJSBridge) ||
    (window as any).__wxjs_environment === "miniprogram";

  if (!inMiniApp) {
    console.warn("[getStorage] skipped outside miniapp container", { key });
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let settled = false;
    let cancelBridgeWait: (() => void) | null = null;

    const settle = (value: V | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(uiTimer);
      resolve(value);
    };

    const uiTimer = setTimeout(() => {
      if (!onLateValue) {
        cancelBridgeWait?.();
      }
      settle(null);
    }, timeoutMs);

    cancelBridgeWait = onBridgeAndSdkReady(
      () => {
        if (settled && !onLateValue) return;

        const sdk = getSdk();
        try {
          sdk.getStorage({
            key,
            success: (res: any) => {
              const raw = res?.data;
              let parsed: V;
              try {
                parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
              } catch {
                parsed = raw;
              }

              if (settled) {
                onLateValue?.(parsed);
              } else {
                settle(parsed);
              }
            },
            fail: (err: unknown) => {
              console.warn("[getStorage] failed:", key, err);
              settle(null);
            },
          });
        } catch (err) {
          console.warn("[getStorage] threw:", key, err);
          settle(null);
        }
      },
      () => {
        console.warn("[getStorage] bridge/SDK not ready within max wait:", {
          key,
          hasBridge: Boolean((window as any).WeixinJSBridge),
          hasSdk: typeof getSdk()?.getStorage === "function",
        });
        settle(null);
      },
    );
  });
}

export * from "./validation";
export * from "./redirect";
export * from "./url";
export * from "./dictionary";
export * from "./payment-method";
export * from "./tracking";
