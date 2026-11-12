"use client";

import { useState } from "react";
import FestivalCarousel from "./FestivalCarousel";
import styles from "./festival-apartment.module.css";

const rooms = [
  { id: "talks", name: "Гостиная разговоров", label: "Выступления", image: "/venue/venue-stage.jpeg", alt: "Камерная сцена и кресла в ресторане «Антресоль и Перец»", title: "Мысли, которые хочется обсудить", text: "Секс, деньги, близость и отношения после 40. Выберите выступление, которое отвечает на ваш вопрос, — и продолжите разговор с гостями фестиваля.", href: "#program", action: "Темы и спикеры" },
  { id: "personal", name: "Время для себя", label: "Консультации", image: "/venue/venue-cabinet.jpeg", alt: "Интерьер кабинета с деревянным столом, креслами и люстрой", title: "Ваш вопрос. Внимание специалиста.", text: "Здесь можно поговорить о том, что касается лично вас: отношениях, самооценке, близости и внутренней опоре. Формат встреч и запись уточняются.", href: "#consultations", action: "Выбрать специалиста" },
  { id: "practice", name: "Новый взгляд", label: "Практики и игры", image: "/venue/venue-main.jpeg", alt: "Свет люстр, старинная мебель и большие окна ресторана", title: "Попробовать, чтобы почувствовать", text: "Трансформационные игры, личные разборы и знакомство с подходами экспертов. Найдите формат, который вам интересен, и узнайте условия участия.", href: "#consultation-workshops", action: "Посмотреть практики" },
  { id: "meeting", name: "Место притяжения", label: "Знакомства", image: "/venue/venue-tea.jpeg", alt: "Вечерний зал с мягкими креслами и тёплым освещением", title: "Один взгляд может стать разговором", text: "Зелёный браслет — вы открыты к знакомствам. Красный — сегодня вы здесь для себя. Присоединяйтесь к общению в своём темпе и с уважением к чужим границам.", href: "#dating", action: "Как знакомиться" },
  { id: "style", name: "Предметы желания", label: "Выставка и стиль", image: "/venue/venue-main.jpeg", alt: "Детали интерьера ресторана «Антресоль и Перец»", title: "Красивые вещи с личной историей", text: "Украшения ручной работы, одежда, ароматы и знакомство с их авторами. Рассмотреть поближе, задать вопрос, найти то, что откликается именно вам.", href: "#expo", action: "Участники выставки" },
  { id: "evening", name: "Остаться до полуночи", label: "Бар и афтепати", image: "/venue/venue-tea.jpeg", alt: "Камерный вечерний интерьер с креслами и небольшими столами", title: "У вечера есть продолжение", text: "Бар, музыка и разговоры, которым больше не нужно расписание. После содержательной программы — время выдохнуть и просто насладиться вечером.", href: "#bar", action: "Бар и вечерняя программа" },
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
  return <div className={styles.apartment} id="apartment">
    <div className={styles.intro}><p className="section-label">МЖ Сити · Тайная квартира</p><h3>С Невского —<br /><em>в другой вечер.</em></h3><p>За дверью остаётся городская спешка. Внутри — тёмное дерево, хрусталь, мягкий свет и люди, с которыми хочется задержаться. В этот вечер у каждого будет свой повод открыть новую дверь.</p></div>
    <FestivalCarousel label="Откройте двери фестиваля" className="apartment-carousel">{rooms.map((room, index) => <Door room={room} index={index} key={room.id} />)}</FestivalCarousel>
    <p className={styles.note}>Открывайте двери и выбирайте свой маршрут. На фотографиях — реальные интерьеры площадки; распределение программы по залам уточняется.</p>
  </div>;
}
