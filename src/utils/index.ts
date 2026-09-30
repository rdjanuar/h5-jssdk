export function getAppId(): string | null {
  const match = window.navigator.userAgent.match(/TMA\/(\S+)/);
  return match ? match[1] : null;
}

export function getStorage<V>(key: string): Promise<V> {
  const appId = getAppId();
  return new Promise((resolve, reject) => {
    if (appId) {
      window.wx?.getStorage({
        key,
        success: (res: any) => {
          try {
            const parsed = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
            resolve(parsed);
          } catch {
            resolve(res.data);
          }
        },
        fail: (err: any) => {
          reject(err);
        },
      });
    } else {
      reject(new Error("Can not use getStorage outside miniapp Container"));
    }
  });
}

export * from "./validation";
export * from "./redirect";
export * from "./url";
export * from "./dictionary";
