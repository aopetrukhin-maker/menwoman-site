import { formatPrice, giftNominals, ticketNames } from "./ticket-tariffs";

const giftCategories = [
  { title: "SPA и отдых", detail: "Баня, массаж и спа-процедуры." },
  { title: "Рестораны", detail: "Сертификаты в рестораны." },
  { title: "Здоровье и красота", detail: "Услуги по уходу за собой и программы о здоровье." },
  { title: "Одежда и стиль", detail: "Подарочные сертификаты на одежду." },
  { title: "Занятия и мастер-классы", detail: "Пробные занятия, абонементы и практикумы." },
  { title: "Подарки для дома", detail: "Свечи, масла и сертификаты на аренду вещей и техники." },
];

const previousGifts = [
  {
    title: "Посещение бани",
    partner: "Грелка",
    detail: "Сертификат на бесплатный визит.",
  },
  {
    title: "Абонемент на четыре занятия",
    partner: "Храм Женщин",
    detail: "Четыре посещения по одному абонементу.",
  },
  {
    title: "Пробное занятие и онлайн-платформа",
    partner: "Храм Женщин",
    detail: "Разовое занятие и доступ к онлайн-платформе.",
  },
  {
    title: "Практикум по самомассажу",
    partner: "Елена Забанова",
    detail: "Три видео с техниками самомассажа в программе «Диалог с кожей».",
  },
  {
    title: "Видеокурс «Навигатор по здоровью»",
    partner: "Елена Забанова",
    detail: "13 видеоуроков о том, как меняется тело с возрастом.",
  },
  {
    title: "Сертификат на одежду",
    partner: "Мелдей",
    detail: `Подарочный сертификат на ${formatPrice(3000)}.`,
  },
  {
    title: "Сертификат MONTANA",
    partner: "MONTANA",
    detail: "Электронный подарочный сертификат.",
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
    title: "Индивидуальная игра",
    partner: "Инна Мартынова",
    detail: `Сертификат на трансформационную игру на ${formatPrice(20000)}.`,
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
            <p className="gift-spotlight-lead">После фестиваля соберите свою корзину подарков. Гости с билетами «{ticketNames.reload}» и VIP смогут выбрать услуги и сертификаты партнёров в пределах номинала своего тарифа.</p>
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

        <details className="gift-box-panel">
          <summary>
            <span className="gift-box-visual" aria-hidden="true">
              <span className="gift-box-shadow" />
              <span className="gift-box-base" />
              <span className="gift-box-lid"><span className="gift-box-bow" /></span>
            </span>
            <span className="gift-box-copy">
              <span className="gift-box-kicker">Бонус к билету</span>
              <strong>Что в подарочной коробке?</strong>
              <span className="gift-box-action"><span className="gift-box-open">Открыть коробку</span><span className="gift-box-close">Закрыть коробку</span><span aria-hidden="true">↓</span></span>
            </span>
          </summary>
          <ul className="gift-category-grid">
            {giftCategories.map(({ title, detail }) => <li key={title}><strong>{title}</strong><p>{detail}</p></li>)}
          </ul>
        </details>

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
