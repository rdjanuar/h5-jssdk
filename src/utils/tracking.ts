const FIREBASE_PLUGIN = "firebaseLogEvent";

export type TrackingEvent = {
  event: "screen_view" | "button_click";
  event_category: string;
  screen_name: string;
  button_name?: string;
};

export function sendTrackingEvent(event: TrackingEvent): void {
  try {
    const sdk = window.wx || window.tcsas;
    if (typeof sdk?.invokeNativePlugin !== "function") return;

    sdk.invokeNativePlugin({
      api_name: FIREBASE_PLUGIN,
      data: {
        eventName: event.event,
        params: {
          event_category: event.event_category,
          screen_name: event.screen_name,
          ...(event.button_name ? { button_name: event.button_name } : {}),
        },
      },
      fail: (err: unknown) => console.warn("[tracking] firebaseLogEvent failed", event.event, err),
    });
  } catch (e) {
    console.warn("[tracking] firebaseLogEvent threw", event.event, e);
  }
}
