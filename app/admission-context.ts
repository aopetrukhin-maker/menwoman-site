"use client";

import type { TicketTier } from "./ticket-tariffs";
export type AdmissionContext = { tier?: TicketTier; format: "single" | "pair" };
export const selectionEvent = "mzh-admission-selection";

export function startAdmissionNavigation() {
  const click = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !url.hash) return;
    const menu = link.closest("details.mobile-nav");
    if (menu instanceof HTMLDetailsElement) menu.open = false;
    if (!["#application-form", "#promo-code"].includes(url.hash)) return;
    const tier = link.dataset.tier;
    if (tier && ["start", "reload", "vip"].includes(tier)) {
      const detail: AdmissionContext = { tier: tier as TicketTier, format: link.dataset.format === "pair" ? "pair" : "single" };
      window.dispatchEvent(new CustomEvent(selectionEvent, { detail }));
    }
    if (url.hash === "#promo-code") requestAnimationFrame(() => document.getElementById("admission-code")?.focus({ preventScroll: true }));
    if (url.hash === "#application-form") requestAnimationFrame(() => document.getElementById("admission-name")?.focus({ preventScroll: true }));
  };
  document.addEventListener("click", click);
  return () => document.removeEventListener("click", click);
}
