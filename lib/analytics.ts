/**
 * Analytics mínimo para eventos de la app.
 * Registrar eventos para futuro envío a plataforma (GA, Mixpanel, etc.).
 */

export type AnalyticsEventName = "view_home" | "click_continue";

export function track(event: AnalyticsEventName, payload?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, payload ?? {});
    }
    // Futuro: window.gtag?.("event", event, payload) o cliente de Mixpanel/PostHog
  } catch {
    // no-op
  }
}
