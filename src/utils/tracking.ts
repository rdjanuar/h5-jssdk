type TrackingParams = Record<string, unknown>;

export function trackingEvent(eventName: string, params: TrackingParams = {}) {
  try {
    const wx = window.wx;
    if (!wx) return;

    const data = { eventName, params };

    if (typeof wx.reportEvent === "function") {
      const device = wx.getDeviceInfo?.() ?? {};
      const system = wx.getSystemInfoSync?.() ?? {};

      wx.reportEvent("trpy", {
        ...data,
        information_device: { ...device, ...system },
      });
    }

    if (typeof wx.invokeNativePlugin !== "function") return;

    wx.invokeNativePlugin({
      api_name: "firebaseLogEvent",
      data,
      success: () => {
        try {
          console.log("INFO", `Success firebaseLogEvent: ${eventName}`);
        } catch {
          // Ignore diagnostic logger failures.
        }
      },
      fail: (err: unknown) => console.log("firebaseLogEvent failed", err),
    });
  } catch (err) {
    console.log("Tracking exception", err);
  }
}
