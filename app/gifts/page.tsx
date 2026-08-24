"use client";

import { FormEvent, useMemo, useState } from "react";
import access from "./access.json";
import styles from "./gifts.module.css";

type AccessRecord = { tier: "reload" | "vip"; sets: number };
type Gift = {
  id: string; partner: string; title: string; price: number | null; quantity: number | null;
  format: string; term: string; contact?: string; details: string;
};

const GIFTS: Gift[] = [
  { id:"sokolova", partner:"Лариса Соколова", title:"Чек-ап «Базовый метаболизм»", price:19900, quantity:25, format:"Онлайн", term:"До декабря 2026", details:"Мужской или женский список анализов, расшифровка результатов и персональная обратная связь. Лабораторные анализы оплачиваются отдельно." },
  { id:"ratsun", partner:"Анна Рацун", title:"Диагностическая сессия «Карта близости в паре»", price:7500, quantity:5, format:"Онлайн, 90 минут", term:"По предварительной записи", details:"Разбор причин охлаждения, сценария дистанции и следующих шагов для мужчины, женщины или пары." },
  { id:"martynova-game", partner:"Инна Мартынова", title:"Индивидуальная трансформационная игра", price:20000, quantity:1, format:"По согласованию", term:"Уточняется", details:"Индивидуальная трансформационная работа без доплаты." },
  { id:"martynova-club", partner:"Инна Мартынова", title:"Годовое участие в клубе", price:20000, quantity:1, format:"Онлайн", term:"Уточняется", details:"Одно место в клубе на год без доплаты." },
  { id:"martynova-strategy", partner:"Инна Мартынова", title:"Стратегическая сессия", price:20000, quantity:3, format:"Онлайн, 90 минут", term:"Уточняется", details:"Аудит запроса и письменный план действий." },
  { id:"tsapina", partner:"Евгения Цапина", title:"Индивидуальная встреча и план действий", price:10000, quantity:10, format:"60 минут", term:"Уточняется", details:"Аудит запроса, причины затруднений, рекомендации и план дальнейших действий." },
  { id:"elunin", partner:"Дмитрий Елунин", title:"Диагностическая консультация по модели «МОЗГ»", price:10000, quantity:5, format:"Zoom, 90 минут", term:"До 31 декабря 2026", contact:"@Elunin_Dmitry_Psy", details:"Поиск глубинной причины запроса, бессознательных стратегий и индивидуальный план изменений." },
  { id:"shcherbakova", partner:"Татьяна Щербакова", title:"Персональная стратегия знакомств", price:15000, quantity:10, format:"Онлайн", term:"По согласованию", details:"Диагностика, 30-минутная встреча, анализ сценария выбора партнёра и анкеты, письменное резюме." },
  { id:"kardashov", partner:"Александр Кардашов", title:"Две индивидуальные встречи", price:13000, quantity:3, format:"Онлайн или Москва", term:"В течение 30 дней после фестиваля", contact:"@alexkarpsy", details:"Две встречи по 60 минут: аудит запроса, рекомендации и план действий." },
  { id:"zhilnikova-session", partner:"Ольга Жильникова", title:"Индивидуальная сессия", price:7000, quantity:null, format:"Онлайн, 60 минут", term:"Уточняется", details:"Разбор запроса в отношениях, самореализации, финансах, проявленности или сексуальности." },
  { id:"zhilnikova-game", partner:"Ольга Жильникова", title:"Игра «РАППОРТ»", price:7000, quantity:null, format:"Групповая практика", term:"Уточняется", details:"Тренажёр отношений с разбором жизненных ситуаций и обратной связью психолога-сексолога." },
  { id:"belikova", partner:"Людмила Беликова", title:"Диагностическая сессия «Решение за 72 часа»", price:5000, quantity:10, format:"Онлайн", term:"Для первых 10 участниц", details:"Определение главной ситуации, страхов и первого практического шага на ближайшие 72 часа." },
  { id:"drozdova", partner:"Олеся Дроздова", title:"Диагностика финансового состояния", price:7000, quantity:2, format:"Zoom, до 60 минут", term:"По предварительной записи", details:"Разбор запроса и документ с рекомендациями и дальнейшим планом действий." },
  { id:"orgenevskaya", partner:"Виктория Оргеневская", title:"Консультация по личному бренду", price:15000, quantity:15, format:"Видеоконференция, до 50 минут", term:"До конца 2026 года", contact:"@gostinaya_optimistki", details:"Интервью и рекомендации по созданию или развитию личного бренда." },
  { id:"maria", partner:"Мария", title:"Индивидуальная встреча по любому запросу", price:15000, quantity:5, format:"Онлайн, 60 минут", term:"В течение месяца", contact:"@mariwwonder", details:"Отношения, самооценка, секс, проявленность, телесная чувственность, тревога или контроль." },
  { id:"lala", partner:"Лала Попова", title:"Разбор сценариев в отношениях", price:8000, quantity:5, format:"Онлайн, 40 минут", term:"В течение месяца после фестиваля", contact:"@Lala_Popova", details:"Причины сложностей и решения для знакомств, пары, близости, развода или страха отношений." },
  { id:"shvedova", partner:"Катия Шведова", title:"Диагностика «Голос души»", price:50000, quantity:10, format:"По фото, онлайн", term:"По предварительной записи", contact:"@Katiya_ya", details:"Индивидуальная диагностика, аудиозапись и консультация по итогам." },
  { id:"solnechnaya", partner:"Елена Солнечная", title:"Подарочный приём", price:7000, quantity:null, format:"Онлайн, 20 минут", term:"По записи", contact:"elenasun.ru", details:"Короткая консультация для знакомства со специалистом." },
  { id:"zabanova-health", partner:"Елена Забанова", title:"Программа «Навигатор по здоровью»", price:12000, quantity:null, format:"13 видеоуроков", term:"Бессрочный доступ", details:"Понятно о возрастных изменениях тела, здоровье, красоте и жизненной энергии." },
  { id:"montana", partner:"MONTANA", title:"Подарочный сертификат", price:1000, quantity:null, format:"Электронный сертификат", term:"По условиям партнёра", contact:"montanajeans.uds.app", details:"Сертификат на покупку одежды MONTANA." },
  { id:"nuzhdichki", partner:"Нуждички", title:"Сертификат на аренду", price:1000, quantity:null, format:"Электронный сертификат", term:"По условиям партнёра", contact:"nuzhdikchki.uds.app", details:"Сертификат на 1 000 рублей для аренды нужных товаров." },
  { id:"body-impulse", partner:"Боди Импульс", title:"Открытие собственной SPA-студии", price:50000, quantity:null, format:"Сертификат", term:"Уточняется", details:"Подарок номиналом 50 000 рублей на открытие собственной SPA-студии." },
  { id:"women-temple", partner:"Храм Женщин", title:"Абонемент на четыре занятия", price:null, quantity:15, format:"Офлайн и онлайн", term:"Уточняется", details:"Пробные занятия, абонементы, свечи и масло. Номинал и точные условия уточняются." },
  { id:"grelka", partner:"Грелка", title:"Посещение бани", price:null, quantity:null, format:"Физический сертификат", term:"Уточняется", details:"Бесплатное посещение бани. Номинал и количество уточняются." },
  { id:"secrets", partner:"Сикретс", title:"Посещение мастер-класса", price:null, quantity:null, format:"Физический сертификат", term:"Уточняется", details:"Бесплатное посещение мастер-класса. Номинал и количество уточняются." },
  { id:"meldey", partner:"Мелдей", title:"Сертификат на одежду", price:3000, quantity:null, format:"Электронный сертификат", term:"Уточняется", details:"Сертификат номиналом 3 000 рублей на одежду." },
];

async function hashEmail(email: string) {
  const data = new TextEncoder().encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const money = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";

export default function GiftsPage() {
  const [email, setEmail] = useState("");
  const [person, setPerson] = useState<AccessRecord | null>(null);
  const [error, setError] = useState("");
  const [activeSet, setActiveSet] = useState(0);
  const [carts, setCarts] = useState<Record<string, number>[]>([{}]);
  const [filter, setFilter] = useState("");
  const [finished, setFinished] = useState(false);
  const budget = person ? (person.tier === "vip" ? 100000 : 50000) : 0;
  const cart = carts[activeSet] || {};
  const total = useMemo(() => GIFTS.reduce((sum, gift) => sum + (gift.price || 0) * (cart[gift.id] || 0), 0), [cart]);
  const selected = GIFTS.filter((gift) => cart[gift.id]);
  const setTotal = (setCart: Record<string, number>) => GIFTS.reduce((sum, gift) => sum + (gift.price || 0) * (setCart[gift.id] || 0), 0);
  const allReady = person ? Array.from({length: person.sets}).every((_, index) => Object.keys(carts[index] || {}).length > 0) : false;
  const allTotal = carts.reduce((sum, setCart) => sum + setTotal(setCart), 0);
  const visible = GIFTS.filter((gift) => `${gift.partner} ${gift.title}`.toLowerCase().includes(filter.toLowerCase()));

  async function login(event: FormEvent) {
    event.preventDefault(); setError("");
    const key = await hashEmail(email);
    const record = (access as Record<string, AccessRecord>)[key];
    if (!record) { setError("Эта почта не найдена среди билетов «Перезагрузка» и VIP. Проверьте адрес или напишите организатору."); return; }
    setPerson(record); setCarts(Array.from({length: record.sets}, () => ({}))); setActiveSet(0);
  }

  function add(gift: Gift) {
    if (gift.price === null) return;
    const next = total + gift.price;
    if (next > budget) { setError(`Лимит превышен на ${money(next - budget)}.`); return; }
    const count = cart[gift.id] || 0;
    if (gift.quantity !== null && count >= gift.quantity) return;
    setError(""); setCarts((current) => current.map((item, index) => index === activeSet ? { ...item, [gift.id]: count + 1 } : item));
  }

  function remove(gift: Gift) {
    const count = cart[gift.id] || 0;
    setCarts((current) => current.map((item, index) => {
      if (index !== activeSet) return item;
      if (count <= 1) { const copy = { ...item }; delete copy[gift.id]; return copy; }
      return { ...item, [gift.id]: count - 1 };
    }));
  }

  function finishSelection() {
    window.localStorage.setItem("mj-gift-selection", JSON.stringify({ emailHash: "verified", carts, total: allTotal, createdAt: new Date().toISOString() }));
    setFinished(true);
  }

  if (!person) return <main className={styles.page}><section className={styles.login}>
    <a className={styles.back} href="/">← Вернуться на сайт</a>
    <p className={styles.eyebrow}>ПОДАРОЧНЫЙ ФОНД ФЕСТИВАЛЯ</p>
    <h1>Соберите свой набор подарков</h1>
    <p className={styles.lead}>Каталог открыт владельцам билетов «Перезагрузка» и VIP. Тариф и доступный лимит определятся автоматически по почте из заказа.</p>
    <div className={styles.limits}><span>Перезагрузка <b>до 50 000 ₽</b></span><span>VIP <b>до 100 000 ₽</b></span></div>
    <form onSubmit={login} className={styles.form}><label>Почта, указанная при покупке билета</label><div><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@example.com"/><button>Открыть каталог</button></div></form>
    {error && <p className={styles.error}>{error}</p>}
    <p className={styles.note}>Если билет был «для двоих», откроются два отдельных набора с полным лимитом для каждого участника. По вопросам доступа: <a href="https://t.me/redheadlitle">@redheadlitle</a>.</p>
  </section></main>;

  if (finished) return <main className={styles.page}><section className={styles.finish}>
    <p className={styles.eyebrow}>НАБОР СФОРМИРОВАН</p><h1>Выбор сохранён</h1>
    <p className={styles.lead}>Сделайте скриншот этой страницы. Для получения подарков отправьте организатору почту из заказа и список ниже.</p>
    <div className={styles.receipt}>{carts.map((setCart, index)=><section className={styles.receiptGroup} key={index}><h2>Участник {index + 1}</h2>{GIFTS.filter(g=>setCart[g.id]).map(g=><div key={g.id}><b>{g.title}</b><span>{g.partner} · {setCart[g.id]} шт. · {g.price ? money(g.price * setCart[g.id]) : "номинал уточняется"}</span>{g.contact && <small>Контакт: {g.contact}</small>}</div>)}<strong>Итого: {money(setTotal(setCart))}</strong></section>)}</div>
    <div className={styles.summary}><span>Всего по всем наборам</span><b>{money(allTotal)}</b></div>
    <a className={styles.telegram} href={`https://t.me/redheadlitle`}>Написать организатору</a>
  </section></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><p className={styles.eyebrow}>ВАШ ПОДАРОЧНЫЙ ФОНД</p><h1>Каталог подарков</h1><p>{person.tier === "vip" ? "Тариф VIP" : "Тариф «Перезагрузка»"}{person.sets > 1 ? ` · ${person.sets} набора` : ""}</p></div><a href="/">На главную</a></header>
    {person.sets > 1 && <div className={styles.setTabs}>{carts.map((setCart,index)=><button key={index} className={index === activeSet ? styles.setTabActive : styles.setTab} onClick={()=>{setActiveSet(index);setError("");}}><span>Участник {index + 1}</span><b>{money(setTotal(setCart))} из {money(budget)}</b></button>)}</div>}
    <div className={styles.budget}><div><span>Выбрано</span><b>{money(total)}</b></div><div><span>Доступно</span><b>{money(budget - total)}</b></div><div className={styles.bar}><i style={{width:`${Math.min(100,total/budget*100)}%`}}/></div></div>
    <div className={styles.tools}><input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Найти подарок или партнёра"/><span>{visible.length} подарков</span></div>
    {error && <p className={styles.error}>{error}</p>}
    <section className={styles.grid}>{visible.map(gift=><article className={styles.card} key={gift.id}>
      <div className={styles.cardTop}><span>{gift.partner}</span>{gift.quantity !== null && <small>{gift.quantity} шт.</small>}</div>
      <h2>{gift.title}</h2><p>{gift.details}</p>
      <dl><div><dt>Формат</dt><dd>{gift.format}</dd></div><div><dt>Срок</dt><dd>{gift.term}</dd></div></dl>
      <div className={styles.cardBottom}><b>{gift.price === null ? "Номинал уточняется" : money(gift.price)}</b>{gift.price === null ? <button disabled>Скоро</button> : <div className={styles.counter}>{cart[gift.id] ? <button onClick={()=>remove(gift)}>−</button> : null}<span>{cart[gift.id] || ""}</span><button onClick={()=>add(gift)}>+</button></div>}</div>
    </article>)}</section>
    <aside className={styles.cart}><div><span>{person.sets > 1 ? `Участник ${activeSet + 1}: ` : ""}{selected.length ? `${selected.length} позиций` : "корзина пуста"}</span><b>{money(total)} из {money(budget)}</b></div><button disabled={!allReady} onClick={finishSelection}>{person.sets > 1 ? "Сформировать 2 набора" : "Сформировать набор"}</button></aside>
  </main>;
}
