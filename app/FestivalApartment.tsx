"use client";

import { useState } from "react";
import FestivalCarousel from "./FestivalCarousel";
import styles from "./festival-apartment.module.css";

const rooms = [
  { id: "talks", name: "Гостиная разговоров", label: "Выступления", image: "/venue/venue-stage.jpeg", alt: "Камерная сцена и кресла в ресторане «Антресоль и Перец»", title: "Разговоры, которые остаются с вами", text: "Близость, отношения, выбор себя и новые возможности. Найдите выступление, которое отвечает на ваш вопрос.", href: "#program", action: "Темы и спикеры" },
  { id: "personal", name: "Время для себя", label: "Консультации", image: "/venue/venue-cabinet.jpeg", alt: "Интерьер кабинета с деревянным столом, креслами и люстрой", title: "Ваш вопрос — личный разговор", text: "Поговорите со специалистом об отношениях, близости или внутренней опоре. Количество мест ограничено.", href: "#consultations", action: "Выбрать специалиста" },
  { id: "practice", name: "Новый взгляд", label: "Практики и игры", image: "/venue/venue-main.jpeg", alt: "Свет люстр, старинная мебель и большие окна ресторана", title: "Попробуйте новый подход", text: "Игры, практики и личные разборы. Выберите интересный формат и узнайте условия участия.", href: "#program", action: "Посмотреть программу" },
  { id: "meeting", name: "Место притяжения", label: "Знакомства", image: "/venue/venue-tea.jpeg", alt: "Вечерний зал с мягкими креслами и тёплым освещением", title: "Знакомьтесь в своём темпе", text: "Зелёный браслет — открыты к знакомствам. Красный — сегодня без них. Выбор всегда за вами.", href: "#dating", action: "Как знакомиться" },
  { id: "style", name: "Предметы желания", label: "Выставка и стиль", image: "/venue/venue-main.jpeg", alt: "Детали интерьера ресторана «Антресоль и Перец»", title: "Вещи, которые хочется примерить", text: "Украшения, одежда и ароматы. Рассмотрите вблизи и познакомьтесь с авторами.", href: "#expo", action: "Участники выставки" },
  { id: "evening", name: "Остаться до полуночи", label: "Бар и афтепати", image: "/venue/venue-tea.jpeg", alt: "Камерный вечерний интерьер с креслами и небольшими столами", title: "Оставайтесь до полуночи", text: "После выступлений — бар, музыка, танцы и свободное общение.", href: "#afterparty", action: "Музыка и бар" },
];

function Door({ room, index }: { room: typeof rooms[number]; index: number }) {
  const [open, setOpen] = useState(false);
  const id = `apartment-${room.id}`;
  return <article className={styles.room} data-open={open}>
    <div className={styles.frame}>
      <img src={room.image} alt={room.alt} width="1280" height="853" loading="lazy" className={styles.photo} />
      <button type="button" className={styles.door} aria-expanded={open} aria-controls={id} aria-label={`${open ? "Закрыть" : "Открыть"} дверь: ${room.label}`} onClick={() => setOpen(!open)}>
        <span className={styles.leftLeaf} aria-hidden="true"><i /><b /></span>
        <span className={styles.rightLeaf} aria-hidden="true"><i /><b /></span>
        <span className={styles.plaque}><small>МЖ · Дверь {String(index + 1).padStart(2, "0")}</small><strong>{room.name}</strong><span className={styles.lock} aria-hidden="true"><i /><b /></span><span className={styles.invitation}>Прикоснитесь, чтобы открыть</span></span>
        <span className={styles.closeLabel}>Закрыть дверь <b aria-hidden="true">×</b></span>
      </button>
      <span className={styles.photoCaption} aria-hidden={!open}>«Антресоль и Перец»</span>
    </div>
    <div className={styles.description} id={id}>
      <span className={styles.label}>{room.label}</span>
      <h4>{open ? room.title : room.name}</h4>
      <p>{room.text}</p>
      <a href={room.href}>{room.action}</a>
    </div>
  </article>;
}

export default function FestivalApartment() {
  return <section className={`${styles.apartment} section primary-section`} id="apartment"><div className="container">
    <div className={styles.intro}><h2>Шесть дверей Тайной резиденции</h2><p>Откройте любую, чтобы заглянуть внутрь фестиваля.</p></div>
    <FestivalCarousel label="Откройте двери фестиваля" className="apartment-carousel">{rooms.map((room, index) => <Door room={room} index={index} key={room.id} />)}</FestivalCarousel>
    <p className={styles.note}>На фотографиях — интерьеры ресторана «Антресоль и Перец».</p>
  </div></section>;
}
