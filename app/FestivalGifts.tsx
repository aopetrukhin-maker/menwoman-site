import { formatPrice, giftNominals, ticketNames } from "./ticket-tariffs";

const previousGifts = [
  {
    title: "Посещение бани",
    partner: "Грелка",
    detail: "Сертификат на бесплатный визит.",
  },
  {
    title: "Четыре занятия",
    partner: "Храм Женщин",
    detail: "Абонементы, пробные занятия, свечи и масла.",
  },
  {
    title: "Практикум по самомассажу",
    partner: "Елена Забанова",
    detail: "Три видео с техниками самомассажа в программе «Диалог с кожей».",
  },
  {
    title: "Подарочные сертификаты на одежду",
    partner: "Мелдей и MONTANA",
    detail: `Сертификат «Мелдей» на одежду на ${formatPrice(3000)} и подарочный сертификат MONTANA.`,
  },
  {
    title: "Посещение мастер-класса",
    partner: "Сикретс",
    detail: "Сертификат на бесплатное участие.",
  },
  {
    title: "Аренда вещей и техники",
    partner: "Нуждички",
    detail: `Сертификат на аренду на ${formatPrice(1000)}.`,
  },
  {
    title: "Разбор личного бренда",
    partner: "Виктория Орженевская",
    detail: `Индивидуальная онлайн-встреча по развитию личного бренда. Номинал ${formatPrice(15000)}.`,
  },
  {
    title: "Старт своей SPA-студии",
    partner: "Боди Импульс",
    detail: `Сертификат на открытие собственной студии на ${formatPrice(50000)}.`,
  },
];

export default function FestivalGifts({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  return (
    <section className="section city-gifts primary-section" id="bonuses" aria-labelledby="gift-title">
      <div className="container">
        <div className="gift-spotlight">
          <div>
            <Heading id="gift-title">Подарки от партнёров</Heading>
            <p className="gift-spotlight-lead">Выберите подарки, которые хотите использовать. После фестиваля гости с билетами «{ticketNames.reload}» и VIP смогут собрать свою корзину из услуг и сертификатов партнёров. В каталоге будут SPA, сертификаты в рестораны, услуги для здоровья и красоты и многое другое.</p>
          </div>
          <div className="gift-spotlight-number">
            <span>Подарочная корзина VIP</span>
            <strong>до {formatPrice(giftNominals.vip)}</strong>
            <p>Сумма номиналов выбранных подарков</p>
          </div>
        </div>
        <div className="city-gift-tiers">
          <article>
            <span>Тариф «{ticketNames.reload}»</span>
            <p>Подарки от спонсоров</p>
            <strong>{formatPrice(giftNominals.reload)}</strong>
            <span>Номинал подарочной корзины</span>
          </article>
          <article>
            <span>Тариф VIP</span>
            <p>Расширенная подарочная корзина</p>
            <strong>до {formatPrice(giftNominals.vip)}</strong>
            <span>Общий номинал подарков на выбор</span>
          </article>
        </div>

        <div className="gift-selection">
          <h3>Как собрать корзину</h3>
          <ol>
            <li>После фестиваля откройте <a href="/gifts/">каталог подарков</a>.</li>
            <li>Выберите интересные вам услуги и сертификаты в пределах суммы по вашему тарифу.</li>
            <li>В карточке подарка проверьте, как его получить, срок действия и условия использования.</li>
          </ol>
          <p>В стоимость корзины засчитываются номиналы выбранных услуг и сертификатов. Сумма не выплачивается деньгами.</p>
        </div>

        <div className="gift-history">
          <h3>Примеры подарков от партнёров прошлого фестиваля</h3>
          <ul className="gift-history-grid">
            {previousGifts.map(({ title, partner, detail }) => (
              <li key={title}>
                <h4>{title}</h4>
                <p>{detail}</p>
                <p className="gift-history-partner">{partner}</p>
              </li>
            ))}
          </ul>
        </div>
        <a className="gift-pricing-link" href={standalone ? "/#pricing" : "#pricing"}>Выбрать билет с подарками</a>
      </div>
    </section>
  );
}
