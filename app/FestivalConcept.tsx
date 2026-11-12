"use client";

import { useState } from "react";
import FestivalCarousel from "./FestivalCarousel";

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
const streets = [
  { name: "Площадь встреч", text: "Выступления и идеи, с которых начинаются разговоры.", href: "#program", number: "01" },
  { name: "Улица диалога", text: "Личный вопрос и внимание специалиста.", href: "#consultations", number: "02" },
  { name: "Квартал ресурса", text: "Практики, новые подходы и время для себя.", href: "#consultations", number: "03" },
  { name: "Бульвар знакомств", text: "Новые лица, первые слова и общение в своём ритме.", href: "#dating", number: "04" },
  { name: "Улица красоты и стиля", text: "Одежда, украшения, ароматы и знакомство с авторами.", href: "#expo", number: "05" },
  { name: "Переулок впечатлений", text: "Разговоры у бара, музыка и вечерняя атмосфера.", href: "#bar", number: "06" },
];
const point = (radius: number, angle: number) => ({ x: Math.round((220 + radius * Math.cos(angle)) * 100) / 100, y: Math.round((220 + radius * Math.sin(angle)) * 100) / 100 });
function wedge(index: number) {
  const start = index * Math.PI / 4 - Math.PI / 2, end = start + Math.PI / 4;
  const a = point(193, start), b = point(193, end), c = point(88, end), d = point(88, start);
  return `M${a.x},${a.y} A193,193 0 0,1 ${b.x},${b.y} L${c.x},${c.y} A88,88 0 0,0 ${d.x},${d.y} Z`;
}
export function FestivalReflection() {
  return <section className="section city-reflection primary-section" id="reflection"><div className="container reflection-layout"><p className="section-label">02 / Вопрос к себе</p><div><h2>А вам хорошо<br />в той жизни,<br /><em>которую вы живёте?</em></h2><p className="reflection-lead">Есть ли в ней близость, которой хочется? Люди, рядом с которыми легко? Дело, которое увлекает? Силы на себя — и время просто получать удовольствие?</p><p>Иногда одна сторона жизни занимает всё пространство. А остальные ждут, когда до них наконец дойдут руки.</p><p>МЖ — повод остановиться, посмотреть на свою жизнь целиком и прислушаться: <strong>чего сейчас хочется именно вам?</strong></p></div></div></section>;
}
export default function FestivalConcept() {
  const [selected, setSelected] = useState(0);
  const direction = directions[selected];
  return <section className="section city-concept primary-section" id="balance"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">03 / Свой маршрут</p><h2>С какой стороны жизни<br /><span>начнётся ваш вечер?</span></h2></div><p>Стороны нашей жизни связаны. Когда меняется одна, мы начинаем иначе чувствовать и остальные. Посмотрите на своё колесо жизненного баланса: что даёт опору, а чему хочется уделить внимание?</p></div>
    <div className="balance-layout"><div className="balance-visual"><svg viewBox="0 0 440 440" aria-hidden="true">{directions.map((item, index) => { const label = point(145, index * Math.PI / 4 - Math.PI / 2 + Math.PI / 8); return <g key={item.title}><path d={wedge(index)} className={selected === index ? "balance-sector selected" : "balance-sector"} /><text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className={selected === index ? "selected-label" : ""}>{String(index + 1).padStart(2, "0")}</text></g>; })}<circle cx="220" cy="220" r="76" /><text x="220" y="214" textAnchor="middle" className="wheel-brand">МЖ</text><text x="220" y="242" textAnchor="middle" className="wheel-caption">ВАШ МАРШРУТ</text></svg><span>Выберите сферу, которая откликается сейчас →</span></div>
      <div className="balance-content"><div className="balance-choices" role="group" aria-label="Направления жизненного баланса">{directions.map((item, index) => <button type="button" key={item.title} aria-pressed={selected === index} aria-controls="balance-direction" onClick={() => setSelected(index)}><small>{String(index + 1).padStart(2, "0")}</small>{item.title}</button>)}</div><div className="balance-direction" id="balance-direction" aria-live="polite" aria-atomic="true"><h3>{direction.title}</h3><p>{direction.text}</p><a className="text-link" href={direction.href}>{direction.route} ↗</a></div></div></div>
    <div className="city-introduction"><p className="section-label">МЖ Сити · Тайная квартира</p><h3>Внутри одной квартиры —<br /><em>целый город отношений.</em></h3><p>Выберите выступление. Загляните в консультационную зону. Найдите вещь, которая вам понравится. Останьтесь на разговор у бара. У каждого гостя будет свой маршрут.</p></div>
    <FestivalCarousel label="Пространства МЖ Сити" className="street-carousel">{streets.map((street) => <a className="city-street" href={street.href} key={street.name}><span>{street.number} / МЖ Сити</span><h4>{street.name}</h4><p>{street.text}</p><b aria-hidden="true">↗</b></a>)}</FestivalCarousel>
  </div></section>;
}
