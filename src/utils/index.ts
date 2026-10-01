export function getAppId(): string | null {
  const match = window.navigator.userAgent.match(/TMA\/(\S+)/);
  return match ? match[1] : null;
}

function waitForBridge(timeoutMs = 500): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).WeixinJSBridge) {
      return resolve();
    }

    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    const timer = setTimeout(done, timeoutMs);

    document.addEventListener(
      "WeixinJSBridgeReady",
      () => {
        clearTimeout(timer);
        done();
      },
      { once: true },
    );

    document.addEventListener(
      "QQJSBridgeReady",
      () => {
        clearTimeout(timer);
        done();
      },
      { once: true },
    );
  });
}

export async function getStorage<V>(key: string, timeoutMs = 20): Promise<V | null> {
  const appId = getAppId();

  if (!appId) {
    return null;
  }

  await waitForBridge(timeoutMs);

  const sdk = window.wx;
  if (!sdk?.getStorage) {
    return null;
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(null);
    }, timeoutMs);

    try {
      sdk.getStorage({
        key,
        success: (res: any) => {
          clearTimeout(timer);
          try {
            const parsed = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
            resolve(parsed);
          } catch {
            resolve(res.data);
          }
        },
        fail: () => {
          clearTimeout(timer);
          resolve(null);
        },
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

export * from "./validation";
export * from "./redirect";
export * from "./url";
export * from "./dictionary";
