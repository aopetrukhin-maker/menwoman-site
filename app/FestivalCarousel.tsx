"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./festival-carousel.module.css";

type View = { first: number; last: number; atStart: boolean; atEnd: boolean };

export default function FestivalCarousel({ label, children, className = "" }: { label: string; children: ReactNode[]; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [view, setView] = useState<View>({ first: 1, last: 1, atStart: true, atEnd: children.length <= 1 });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const left = element.scrollLeft;
      const right = left + element.clientWidth;
      const slides = Array.from(element.children) as HTMLElement[];
      // A peek of the next card is a navigation cue, not another displayed card.
      const visible = slides.flatMap((slide, index) => {
        const intersection = Math.min(right, slide.offsetLeft + slide.offsetWidth) - Math.max(left, slide.offsetLeft);
        return intersection >= slide.offsetWidth * .5 ? [index + 1] : [];
      });
      const next = {
        first: visible[0] ?? 1,
        last: visible[visible.length - 1] ?? 1,
        atStart: left <= 2,
        atEnd: right >= element.scrollWidth - 2,
      };
      setView((current) => current.first === next.first && current.last === next.last && current.atStart === next.atStart && current.atEnd === next.atEnd ? current : next);
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(element);
    for (const slide of element.children) observer?.observe(slide);
    return () => {
      element.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [children.length]);
  const move = (direction: -1 | 1 | "start" | "end") => {
    const element = track.current;
    if (!element) return;
    const maximum = Math.max(0, element.scrollWidth - element.clientWidth);
    const stops = [...new Set([0, ...Array.from(element.children, (child) => Math.min((child as HTMLElement).offsetLeft, maximum)), maximum])];
    const left = direction === "start" ? 0 : direction === "end" ? maximum : direction === 1
      ? stops.find((stop) => stop > element.scrollLeft + 2) ?? maximum
      : [...stops].reverse().find((stop) => stop < element.scrollLeft - 2) ?? 0;
    element.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  if (children.length === 0) return null;

  return <div className={`${styles.carousel} ${className}`} role="region" aria-roledescription="карусель" aria-label={label}>
    <div className={styles.toolbar}>
      <div className={styles.caption}>
        <span className={styles.label}>{label}</span>
        <span className={styles.counter} aria-live="polite" aria-atomic="true">
          <span className={styles.srOnly}>Показаны карточки </span>
          {String(view.first).padStart(2, "0")}{view.last !== view.first && <>—{String(view.last).padStart(2, "0")}</>}
          <span className={styles.counterDivider}> / </span>{String(children.length).padStart(2, "0")}
        </span>
      </div>
      <div className={styles.controls}>
        {([-1, 1] as const).map((direction) => <button
          className={styles.arrow}
          key={direction}
          type="button"
          aria-controls={id}
          aria-label={`${direction === -1 ? "Предыдущая карточка" : "Следующая карточка"}: ${label}`}
          onClick={() => move(direction)}
          disabled={direction === -1 ? view.atStart : view.atEnd}
        >
          <svg width="25" height="18" viewBox="0 0 25 18" fill="none" aria-hidden="true" style={{ transform: direction === -1 ? "rotate(180deg)" : undefined }}>
            <path d="M1 9H23M16 2L23 9L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>)}
      </div>
    </div>
    <div
      className={styles.viewport}
      id={id}
      ref={track}
      role="list"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        const direction = ({ ArrowLeft: -1, ArrowRight: 1, Home: "start", End: "end" } as const)[event.key as "ArrowLeft" | "ArrowRight" | "Home" | "End"];
        if (direction !== undefined) { event.preventDefault(); move(direction); }
      }}
    >
      {children.map((child, index) => <div className={styles.slide} role="listitem" key={index}>{child}</div>)}
    </div>
    <span className={styles.swipeHint} aria-hidden="true">Листайте карточки</span>
  </div>;
}
