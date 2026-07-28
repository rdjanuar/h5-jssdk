export function getAppId(): string | null {
  const match = window.navigator.userAgent.match(/TMA\/(\S+)/);
  return match ? match[1] : null;
}

export * from "./validation";
export * from "./redirect";
export * from "./url";
export * from "./dictionary";
