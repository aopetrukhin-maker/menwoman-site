"use client";

import { useState } from "react";
import { formatPrice, giftNominals, pairPrices, ticketNames, ticketPrices, type TicketTier } from "./ticket-tariffs";

const comparison = [
  {
    tier: "start",
    caption: "Включено в тариф",
    items: [
      "Вход на весь фестиваль и все выступления основной сцены",
      "Общие практики и интерактивы, экспертная зона и выставка",
      "Открытый нетворкинг и электронная программа",
    ],
  },
  {
    tier: "reload",
    caption: "Всё из «Старта», плюс",
    items: [
      "Места в приоритетной зоне перед сценой и отдельная быстрая регистрация",
      "Приоритетный доступ на практики с ограниченным числом мест",
      "Одна экспертная мини-диагностика и рабочая тетрадь",
      "Закрытый Telegram-чат и материалы от спикеров после фестиваля",
    ],
  },
  {
    tier: "vip",
    caption: `Всё из тарифа «${ticketNames.reload}», плюс`,
    items: [
      "Первые ряды и отдельная VIP-регистрация",
      "Приоритетная запись на экспертные разборы и практики",
      "Закрытая встреча со спикерами, партнёрами и организаторами",
      "Специальный кофе-брейк и премиальный подарочный набор",
      "Профессиональные фотографии и сопровождение координатора",
    ],
  },
] satisfies { tier: TicketTier; caption: string; items: string[] }[];

export default function FestivalPricing() {
  const [purchaseFormat, setPurchaseFormat] = useState<"single" | "pair">("single");
  const isPair = purchaseFormat === "pair";

  return (
    <section className="section pricing-section primary-section" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className="section-heading center-heading">
          <h2 id="pricing-title">Билеты</h2>
          <p>Выберите тариф и количество гостей.</p>
        </div>
        <div className="ticket-format-choice" role="group" aria-label="Количество участников в билете">
          <button type="button" aria-pressed={!isPair} onClick={() => setPurchaseFormat("single")}>Один</button>
          <button type="button" aria-pressed={isPair} onClick={() => setPurchaseFormat("pair")}>Вдвоём</button>
        </div>
        {isPair && <div className="ticket-pair-note">
          <strong>Два места по выбранному тарифу</strong>
          <p>Qtickets не уточняет, положены ли мини-диагностика, тетрадь и подарочный набор каждому гостю или на пару.</p>
        </div>}
        <div className="pricing-grid">
          {comparison.map(({ tier, caption, items }) => (
            <article className={`price-card price-card-${tier}${tier === "reload" ? " featured" : ""}`} key={tier}>
              <div className="price-head">
                <h3>{ticketNames[tier]}</h3>
                <dl className="ticket-price-lines">
                  <div>
                    <dt>{isPair ? "Общая цена за двоих" : "Цена за одного гостя"}</dt>
                    <dd className="ticket-total">{formatPrice((isPair ? pairPrices : ticketPrices)[tier])}</dd>
                  </div>
                  {isPair && <div className="ticket-per-person">
                    <dt>На человека</dt>
                    <dd>{formatPrice(pairPrices[tier] / 2)}</dd>
                  </div>}
                </dl>
              </div>
              {tier === "reload" && <div className="ticket-gift-feature">
                <p>Бонус тарифа: подарки от спонсоров</p>
                <strong>{formatPrice(giftNominals.reload)}</strong>
                <p>Номинал корзины. После фестиваля выберите для неё услуги и сертификаты.</p>
                <a href="#bonuses">Посмотреть подарки</a>
              </div>}
              <div className="ticket-comparison">
                <p>{caption}</p>
                <ul>{items.map(item => <li key={item}>{item}</li>)}
                  {tier === "vip" && <li><a href="#bonuses">Подарочная корзина до {formatPrice(giftNominals.vip)}</a></li>}
                </ul>
              </div>
              <p className="ticket-purchase-note" id={`qtickets-${tier}`}>Покупка откроется на Qtickets. Выберите там тот же тариф и вариант «Один» или «Для двоих».
                {tier === "reload" && <> Если в Qtickets указано прежнее название «Перезагрузка», выберите его.</>}
              </p>
              <a href="https://qtickets.ru/event/275542" target="_blank" rel="noreferrer" aria-describedby={`qtickets-${tier}`} data-tier={tier} data-format={purchaseFormat} data-cta-location={`tariff-${tier}`}>Купить билет</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
