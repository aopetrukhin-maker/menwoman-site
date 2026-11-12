"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export default function FestivalCarousel({ label, children, className = "" }: { label: string; children: ReactNode[]; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: children.length <= 1 });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const start = element.scrollLeft < 4, end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 4;
      setEdges((current) => current.start === start && current.end === end ? current : { start, end });
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(element);
    return () => { element.removeEventListener("scroll", update); observer?.disconnect(); };
  }, [children.length]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * .9, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return <div className={`festival-carousel ${className}`} role="group" aria-label={label}>
    <div className="carousel-toolbar"><span>{String(children.length).padStart(2, "0")} / {label}</span><div><button type="button" aria-controls={id} aria-label={`Назад: ${label}`} onClick={() => move(-1)} disabled={edges.start}>←</button><button type="button" aria-controls={id} aria-label={`Дальше: ${label}`} onClick={() => move(1)} disabled={edges.end}>→</button></div></div>
    <div className="carousel-track" id={id} ref={track} role="list" tabIndex={0} aria-label={label} onKeyDown={(event) => { if (event.target === event.currentTarget && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } }}>{children.map((child, index) => <div className="carousel-slide" role="listitem" key={index}>{child}</div>)}</div>
  </div>;
}
