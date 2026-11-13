"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import FestivalApartment from "./FestivalApartment";

const directions = [
  { title: "Я и внутренняя опора", short: "Я", text: "Прислушаться к себе. Замечать свои желания, границы и то, что помогает чувствовать себя увереннее.", route: "Начать с личного разговора", href: "#consultations" },
  { title: "Любовь и близость", short: "Любовь", text: "Поговорить о доверии, близости и выборе партнёра. Услышать разные взгляды на то, что происходит между двумя людьми.", route: "Посмотреть темы выступлений", href: "#program" },
  { title: "Семья", short: "Семья", text: "Уделить внимание отношениям с самыми близкими. Прийти со своим вопросом о семейном общении.", route: "Познакомиться со специалистами", href: "#consultations" },
  { title: "Друзья и общение", short: "Общение", text: "Выйти из привычного круга и встретить людей, с которыми хочется продолжить разговор.", route: "Узнать о знакомствах", href: "#dating" },
  { title: "Тело и энергия", short: "Энергия", text: "Обратить внимание на своё состояние и познакомиться с подходами специалистов к ресурсу и заботе о себе.", route: "Исследовать практики", href: "#consultations" },
  { title: "Дело и деньги", short: "Дело", text: "Посмотреть, как желания, деньги и отношения влияют друг на друга. Найти вопрос, который хочется обсудить с экспертом.", route: "Исследовать программу", href: "#program" },
  { title: "Развитие", short: "Развитие", text: "Открыть новый для себя подход, услышать интересную мысль или попробовать практику, которая откликается.", route: "Познакомиться с участниками", href: "#expo" },
  { title: "Отдых и впечатления", short: "Впечатления", text: "Оставить место удовольствию: красивым вещам, музыке, новым знакомствам и вечеру без привычного сценария.", route: "Заглянуть на афтепати", href: "#afterparty" },
];
const point = (radius: number, angle: number) => ({ x: Math.round((220 + radius * Math.cos(angle)) * 100) / 100, y: Math.round((220 + radius * Math.sin(angle)) * 100) / 100 });
function wedge(index: number) {
  const start = index * Math.PI / 4 - Math.PI / 2, end = start + Math.PI / 4;
  const a = point(193, start), b = point(193, end), c = point(88, end), d = point(88, start);
  return `M${a.x},${a.y} A193,193 0 0,1 ${b.x},${b.y} L${c.x},${c.y} A88,88 0 0,0 ${d.x},${d.y} Z`;
}
export function FestivalReflection() {
  return <section className="section city-reflection primary-section" id="reflection"><div className="container reflection-layout"><div className="reflection-editorial"><p className="section-label">02 / Вопрос к себе</p><h2>Чего вам сейчас<br />хочется <em>больше?</em></h2><p className="reflection-lead">Близости? Свободы? Новых людей? Времени для себя?</p><p>На один вечер оставьте привычный сценарий за дверью. Выберите разговор, который откликается, и людей, с которыми захочется его продолжить.</p><a className="text-link" href="#balance">Найти свой маршрут</a></div><figure className="reflection-scene"><img src="/venue/venue-cabinet.jpeg" alt="Вечерний зал с люстрой в ресторане «Антресоль и Перец»" width="640" height="480" loading="lazy" /><figcaption>Антресоль и Перец · ул. Марата, 1/71</figcaption><span className="reflection-scene-mark" aria-hidden="true">МЖ</span></figure></div></section>;
}
export default function FestivalConcept() {
  const [selected, setSelected] = useState(0);
  const [rotation, setRotation] = useState(-22.5);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; angle: number; rotation: number; travel: number } | null>(null);
  const direction = directions[selected];
  const pointerAngle = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2) * 180 / Math.PI;
  };
  const selectDirection = (index: number) => {
    const desired = -22.5 - index * 45;
    setRotation((current) => desired + Math.round((current - desired) / 360) * 360);
    setSelected(index);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    setDragging(false);
    if (!cancelled && active.travel < 5) {
      const angle = pointerAngle(event);
      const index = Math.floor((((angle - active.rotation + 90) % 360) + 360) % 360 / 45);
      selectDirection(index);
      return;
    }
    const step = Math.round((active.rotation + 22.5) / 45);
    setRotation(-22.5 + step * 45);
    setSelected(((-step % 8) + 8) % 8);
  };
  return <section className="section city-concept primary-section" id="balance"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">03 / Свой маршрут</p><h2>С какой стороны жизни<br /><span>начнётся ваш вечер?</span></h2></div><p>Стороны нашей жизни связаны. Когда меняется одна, мы начинаем иначе чувствовать и остальные. Посмотрите на своё колесо жизненного баланса: что даёт опору, а чему хочется уделить внимание?</p></div>
    <div className="balance-layout"><div className="balance-visual"><div className="wheel-control" role="slider" tabIndex={0} aria-label="Колесо жизненного баланса. Вращайте пальцем или стрелками на клавиатуре" aria-valuemin={1} aria-valuemax={8} aria-valuenow={selected + 1} aria-valuetext={direction.title} data-dragging={dragging} onPointerDown={(event) => { if (event.button !== 0 || drag.current) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointerId: event.pointerId, angle: pointerAngle(event), rotation, travel: 0 }; setDragging(true); }} onPointerMove={(event) => { const active = drag.current; if (!active || active.pointerId !== event.pointerId) return; const angle = pointerAngle(event); const delta = ((angle - active.angle + 540) % 360) - 180; active.angle = angle; active.rotation += delta; active.travel += Math.abs(delta); setRotation(active.rotation); }} onPointerUp={(event) => endDrag(event)} onPointerCancel={(event) => endDrag(event, true)} onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => { if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); selectDirection(event.key === "Home" ? 0 : event.key === "End" ? 7 : (selected + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : 7)) % 8); } }}><span className="wheel-marker" aria-hidden="true" /><svg viewBox="0 0 440 440" aria-hidden="true"><g className="wheel-ring" style={{ transform: `rotate(${rotation}deg)` }}>{directions.map((item, index) => { const label = point(145, index * Math.PI / 4 - Math.PI / 2 + Math.PI / 8); return <g key={item.title}><path d={wedge(index)} className={selected === index ? "balance-sector selected" : "balance-sector"} /><text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className={selected === index ? "selected-label" : ""}>{String(index + 1).padStart(2, "0")}</text></g>; })}</g><circle cx="220" cy="220" r="76" /><text x="220" y="214" textAnchor="middle" className="wheel-brand">МЖ</text><text x="220" y="242" textAnchor="middle" className="wheel-caption">ВАШ МАРШРУТ</text></svg></div><span>Крутите колесо пальцем. Остановитесь там, что откликается.</span></div>
      <div className="balance-content"><div className="balance-choices" role="group" aria-label="Направления жизненного баланса">{directions.map((item, index) => <button type="button" key={item.title} aria-pressed={selected === index} aria-controls="balance-direction" onClick={() => selectDirection(index)}><small>{String(index + 1).padStart(2, "0")}</small>{item.title}</button>)}</div><div className="balance-direction" id="balance-direction" aria-live="polite" aria-atomic="true"><h3>{direction.title}</h3><p>{direction.text}</p><a className="text-link" href={direction.href}>{direction.route}</a></div></div></div>
    <div className="city-evening-plan" aria-label="Как может пройти ваш вечер"><p className="section-label">Вечер в вашем ритме</p><div>
      <article><small>01 / Услышать</small><h3>Найти свой разговор</h3><p>Выберите тему выступления, которая касается вас сейчас.</p><a href="#program">Темы и спикеры</a></article>
      <article><small>02 / Спросить</small><h3>Задать свой вопрос</h3><p>Загляните в консультационную зону и познакомьтесь со специалистами.</p><a href="#consultations">Зона консультаций</a></article>
      <article><small>03 / Встретиться</small><h3>Продолжить вечер</h3><p>Знакомьтесь в своём темпе, рассматривайте выставку и оставайтесь на бар и афтепати.</p><a href="#dating">Знакомства без давления</a></article>
    </div></div>
    <FestivalApartment />
  </div></section>;
}
