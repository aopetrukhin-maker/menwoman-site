"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type RouteStop = { label: string; title: string; detail: string; href: `#${string}` };
type Direction = { title: string; text: string; stops: RouteStop[] };
const directions: Direction[] = [
  { title: "Я и внутренняя опора", text: "Побудьте на своей стороне: услышьте важную мысль, задайте личный вопрос и найдите место для нового решения.", stops: [
    { label: "На сцене", title: "Евгения Цапина", detail: "О любви к себе и готовности к близости.", href: "#program" },
    { label: "Личный вопрос", title: "Татьяна Пронина", detail: "Разбор личных границ и внутренней опоры; условия уточняются.", href: "#consultations" },
    { label: "В экспозоне", title: "Мария Рубинская", detail: "Познакомьтесь с проектами «Девичий Свет» и «Клубный особняк Лемана».", href: "#expo" },
    { label: "После программы", title: "Разговор у бара", detail: "Продолжите тему в спокойной обстановке.", href: "#bar" },
  ] },
  { title: "Любовь и близость", text: "Выберите разговор о желании и отношениях, затем обсудите свой вопрос лично.", stops: [
    { label: "На сцене", title: "Ольга Жильникова", detail: "О женской силе, желании и свободе в отношениях.", href: "#program" },
    { label: "Личный вопрос", title: "Анна Рацун", detail: "Вопросы близости и сексуальности; встреча при наличии мест.", href: "#consultations" },
    { label: "В экспозоне", title: "Ольга Цвик", detail: "Подберите аромат, который подходит вашему настроению.", href: "#expo" },
    { label: "После программы", title: "Знакомства", detail: "Если хочется общения, выбирайте зелёный браслет.", href: "#dating" },
  ] },
  { title: "Семья", text: "Узнайте, как говорить о близости, и найдите специалиста для личного вопроса.", stops: [
    { label: "На сцене", title: "Ольга Васильева", detail: "Как сохранить страсть в отношениях.", href: "#program" },
    { label: "Личный вопрос", title: "Валерия Мирсалимова", detail: "Семейный психолог; консультация при наличии мест.", href: "#consultations" },
    { label: "В экспозоне", title: "Татьяна Щербакова", detail: "Экспресс-разбор вопросов отношений; формат уточняется.", href: "#expo" },
    { label: "После программы", title: "Разговор у бара", detail: "Обсудите услышанное с тем, с кем пришли.", href: "#bar" },
  ] },
  { title: "Друзья и общение", text: "Найдите людей, с которыми захочется продолжить знакомство и после фестиваля.", stops: [
    { label: "На сцене", title: "Екатерина Тистол", detail: "Как путешествия меняют окружение и открывают возможности.", href: "#program" },
    { label: "В экспозоне", title: "Travel-сообщество Екатерины", detail: "Спросите о встречах и поездках сообщества.", href: "#expo" },
    { label: "После программы", title: "Знакомства", detail: "Зелёный браслет покажет, что вы открыты к разговору.", href: "#dating" },
    { label: "К ночи", title: "Афтепати", detail: "Оставайтесь на музыку и свободное общение.", href: "#afterparty" },
  ] },
  { title: "Тело и энергия", text: "Уделите внимание себе: разговор, короткая практика и приятные впечатления.", stops: [
    { label: "На сцене", title: "Светлана Лапухина", detail: "«Сначала Я. Потом МЫ» — о себе и отношениях после 40.", href: "#program" },
    { label: "Личный вопрос", title: "Мечислав Жильцов", detail: "Короткая диагностика ресурсного состояния; условия уточняются.", href: "#consultations" },
    { label: "В экспозоне", title: "Ольга Цвик", detail: "Ароматестирование и индивидуальный подбор.", href: "#expo" },
    { label: "К ночи", title: "Афтепати", detail: "Музыка и танцы, если захочется движения.", href: "#afterparty" },
  ] },
  { title: "Дело и деньги", text: "Посмотрите на новые возможности для дела и познакомьтесь с людьми, которые развивают свои проекты.", stops: [
    { label: "На сцене", title: "Екатерина Тистол", detail: "О путешествиях, окружении и новых возможностях.", href: "#program" },
    { label: "В экспозоне", title: "Виктория Орженевская", detail: "Познакомьтесь с её предпринимательскими проектами.", href: "#expo" },
    { label: "После программы", title: "Бар и общение", detail: "Обсудите идею с новыми знакомыми.", href: "#bar" },
    { label: "К ночи", title: "Афтепати", detail: "Останьтесь на свободное общение после программы.", href: "#afterparty" },
  ] },
  { title: "Развитие", text: "Услышьте новую идею, познакомьтесь с авторским проектом и выберите следующий шаг.", stops: [
    { label: "На сцене", title: "Светлана Лапухина", detail: "О любви, самореализации и новых начинаниях после 40.", href: "#program" },
    { label: "Личный вопрос", title: "Татьяна Пронина", detail: "Личный разбор: границы и внутренняя опора; условия уточняются.", href: "#consultations" },
    { label: "В экспозоне", title: "Мария Рубинская", detail: "Узнайте о программах «Девичьего Света».", href: "#expo" },
    { label: "После программы", title: "Знакомства", detail: "Продолжите разговор с теми, кто разделяет ваши интересы.", href: "#dating" },
  ] },
  { title: "Отдых и впечатления", text: "Пусть вечер будет красивым: новые вещи, хорошие разговоры, музыка и танцы.", stops: [
    { label: "На сцене", title: "Екатерина Тистол", detail: "Истории о путешествиях и новых впечатлениях.", href: "#program" },
    { label: "В экспозоне", title: "Яна Якушева", detail: "Примерьте украшения ручной работы.", href: "#expo" },
    { label: "После программы", title: "Бар", detail: "Выберите напиток и задержитесь на разговор.", href: "#bar" },
    { label: "К ночи", title: "Афтепати", detail: "Музыка, танцы и общение до полуночи.", href: "#afterparty" },
  ] },
];
const point = (radius: number, angle: number) => ({ x: Math.round((220 + radius * Math.cos(angle)) * 100) / 100, y: Math.round((220 + radius * Math.sin(angle)) * 100) / 100 });
function wedge(index: number) {
  const start = index * Math.PI / 4 - Math.PI / 2, end = start + Math.PI / 4;
  const a = point(193, start), b = point(193, end), c = point(88, end), d = point(88, start);
  return `M${a.x},${a.y} A193,193 0 0,1 ${b.x},${b.y} L${c.x},${c.y} A88,88 0 0,0 ${d.x},${d.y} Z`;
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
    <div className="section-heading split-heading conversion-section-heading"><div><p className="section-label">06 / Ваш маршрут по фестивалю</p><h2>Выберите сферу жизни,<br /><span>которую хотите развивать</span></h2></div><p>Крутите колесо. Мы подскажем, кого послушать, к кому подойти в экспозоне и где продолжить вечер.</p></div>
    <div className="balance-layout"><div className="balance-visual"><div className="wheel-control" role="slider" tabIndex={0} aria-label="Колесо жизненного баланса. Вращайте пальцем или стрелками на клавиатуре" aria-valuemin={1} aria-valuemax={8} aria-valuenow={selected + 1} aria-valuetext={direction.title} data-dragging={dragging} onPointerDown={(event) => { if (event.button !== 0 || drag.current) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointerId: event.pointerId, angle: pointerAngle(event), rotation, travel: 0 }; setDragging(true); }} onPointerMove={(event) => { const active = drag.current; if (!active || active.pointerId !== event.pointerId) return; const angle = pointerAngle(event); const delta = ((angle - active.angle + 540) % 360) - 180; active.angle = angle; active.rotation += delta; active.travel += Math.abs(delta); setRotation(active.rotation); }} onPointerUp={(event) => endDrag(event)} onPointerCancel={(event) => endDrag(event, true)} onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => { if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); selectDirection(event.key === "Home" ? 0 : event.key === "End" ? 7 : (selected + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : 7)) % 8); } }}><span className="wheel-marker" aria-hidden="true" /><svg viewBox="0 0 440 440" aria-hidden="true"><g className="wheel-ring" style={{ transform: `rotate(${rotation}deg)` }}>{directions.map((item, index) => { const label = point(145, index * Math.PI / 4 - Math.PI / 2 + Math.PI / 8); return <g key={item.title}><path d={wedge(index)} className={selected === index ? "balance-sector selected" : "balance-sector"} /><text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className={selected === index ? "selected-label" : ""}>{String(index + 1).padStart(2, "0")}</text></g>; })}</g><circle cx="220" cy="220" r="76" /><text x="220" y="214" textAnchor="middle" className="wheel-brand">МЖ</text><text x="220" y="242" textAnchor="middle" className="wheel-caption">ВАШ МАРШРУТ</text></svg></div><span>Крутите колесо пальцем. Остановитесь там, что откликается.</span></div>
      <div className="balance-content"><div className="balance-direction" id="balance-direction" aria-live="polite" aria-atomic="true"><p className="route-kicker">Ваш маршрут · {String(selected + 1).padStart(2, "0")}</p><h3>{direction.title}</h3><p>{direction.text}</p><ol className="route-stops">{direction.stops.map((stop, index) => <li key={`${direction.title}-${stop.label}`}><span className="route-stop-number">{String(index + 1).padStart(2, "0")}</span><div><small>{stop.label}</small><a href={stop.href}>{stop.title}</a><p>{stop.detail}</p></div></li>)}</ol><p className="route-note">Это идеи для вечера. Время выступлений и доступность консультаций уточняются.</p></div></div></div>
    <div className="balance-choices route-choice-grid" role="group" aria-label="Другие сферы жизни">{directions.map((item, index) => <button type="button" key={item.title} aria-pressed={selected === index} aria-controls="balance-direction" onClick={() => selectDirection(index)}><small>{String(index + 1).padStart(2, "0")}</small>{item.title}</button>)}</div>
  </div></section>;
}
