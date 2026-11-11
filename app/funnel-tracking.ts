"use client";

type FunnelEvent = "page_view" | "application_opened" | "application_success" | "promo_opened" | "promo_verified" | "purchase_clicked" | "tariffs_viewed" | "quiz_started" | "quiz_completed";
const apiBase = process.env.NEXT_PUBLIC_ADMISSIONS_API_URL?.replace(/\/$/, "") ?? "/api/admissions";
let visitId: string | undefined;
const recorded = new Set<string>();

export function attribution() {
  if (typeof window === "undefined") return {};
  visitId ??= crypto.randomUUID();
  const query = new URLSearchParams(window.location.search);
  const result: Record<string, string> = { visitId };
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = (query.get(key) ?? "").slice(0, 80);
    if (/^[\p{L}\p{N}._-]{1,80}$/u.test(value)) result[key] = value;
  }
  return result;
}

export function trackFunnelEvent(event: FunnelEvent) {
  if (typeof window === "undefined" || recorded.has(event)) return;
  recorded.add(event);
  const data = { event, attribution: attribution(), eventId: crypto.randomUUID() };
  // Analytics never blocks the application, navigation or checkout.
  void fetch(`${apiBase}/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), keepalive: true }).catch(() => {});
}

export function startFunnelTracking() {
  trackFunnelEvent("page_view");
  const click = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const target = new URL(link.href);
    if (target.origin !== window.location.origin) return;
    if (target.hash === "#application-form") trackFunnelEvent("application_opened");
    if (target.hash === "#promo-code") trackFunnelEvent("promo_opened");
  };
  document.addEventListener("click", click);
  const names: Record<string, FunnelEvent> = { pricing: "tariffs_viewed", "application-form": "application_opened", "promo-code": "promo_opened" };
  const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) {
      trackFunnelEvent(names[entry.target.id]); observer?.unobserve(entry.target);
    }
  }, { threshold: 0.15 }) : null;
  for (const id of Object.keys(names)) { const element = document.getElementById(id); if (element) observer?.observe(element); }
  return () => { document.removeEventListener("click", click); observer?.disconnect(); };
}
