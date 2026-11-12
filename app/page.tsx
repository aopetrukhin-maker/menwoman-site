"use client";

import { useEffect, useRef, useState } from "react";
import HeroAnimation from "./HeroAnimation";
import FestivalVenue from "./FestivalVenue";
import FestivalAdmission from "./FestivalAdmission";
import FestivalParticipation from "./FestivalExperience";
import FestivalProgramme from "./FestivalProgramme";
import FestivalActivities from "./FestivalSections";
import { type FestivalParticipant } from "./festival-participants";
import { startFunnelTracking, trackFunnelEvent } from "./funnel-tracking";
import "./festival-conversion.css";
import "./festival-structure.css";
import { startAdmissionNavigation } from "./admission-context";
import { tickets, ticketPrices, pairPrices, formatPrice } from "./ticket-tariffs";
import { festivalEvent as event } from "./festival-event";

type ConnectionCode = "dialogue" | "support" | "spark" | "space" | "depth";
type ConnectionStatus = "search" | "relationship" | "complicated" | "self";
type ConnectionAnswer = {
  label: string;
  note: string;
  scores: Partial<Record<ConnectionCode, number>>;
};

type ConnectionQuestion = {
  eyebrow: string;
  question: string;
  answers: ConnectionAnswer[];
};

const telegramUrl = "https://t.me/redheadlitle";

const connectionStatusOptions: { value: ConnectionStatus; label: string; note: string }[] = [
  { value: "search", label: "Я сейчас в поиске", note: "Хочу понимать, с кем мне действительно по пути" },
  { value: "relationship", label: "Я в отношениях", note: "Хочу лучше понимать наш союз и друг друга" },
  { value: "complicated", label: "У меня всё сложно", note: "Хочу увидеть ситуацию яснее и без самообмана" },
  { value: "self", label: "Хочу понять себя", note: "Без привязки к текущему статусу отношений" },
];

const connectionQuestions: ConnectionQuestion[] = [
  {
    eyebrow: "Начало отношений",
    question: "Что быстрее всего создаёт у вас ощущение: «этому человеку можно открыться»?",
    answers: [
      { label: "Он говорит прямо", note: "Нет игр, догадок и двойных смыслов", scores: { dialogue: 3, depth: 1 } },
      { label: "Он остаётся рядом", note: "Я вижу заботу и последовательность в поступках", scores: { support: 3, dialogue: 1 } },
      { label: "Между нами возникает энергия", note: "Хочется смеяться, двигаться и проживать новое", scores: { spark: 3, depth: 1 } },
      { label: "Он не пытается меня присвоить", note: "Есть интерес, но остаётся воздух и свобода", scores: { space: 3, support: 1 } },
    ],
  },
  {
    eyebrow: "После конфликта",
    question: "Как вам проще всего вернуться к близости после сложного разговора?",
    answers: [
      { label: "Разобрать всё словами", note: "Понять, что произошло и о чём договорились", scores: { dialogue: 3, support: 1 } },
      { label: "Сначала выдохнуть отдельно", note: "Мне нужно пространство, чтобы услышать себя", scores: { space: 3, depth: 1 } },
      { label: "Почувствовать тепло", note: "Объятие или тихое присутствие важнее аргументов", scores: { support: 3, depth: 1 } },
      { label: "Сменить обстановку", note: "Совместное действие помогает выйти из тяжести", scores: { spark: 3, dialogue: 1 } },
    ],
  },
  {
    eyebrow: "Настоящая близость",
    question: "В какой момент вы сильнее всего чувствуете связь с человеком?",
    answers: [
      { label: "Когда говорим до ночи", note: "И можно обсуждать то, что обычно прячут", scores: { depth: 3, dialogue: 2 } },
      { label: "Когда строим общее", note: "Планы, дом, проект или понятное будущее", scores: { support: 3, dialogue: 1 } },
      { label: "Когда нас захватывает жизнь", note: "Путешествие, танец, приключение, новое впечатление", scores: { spark: 3, space: 1 } },
      { label: "Когда можем быть разными", note: "Близость не требует отказаться от самого себя", scores: { space: 3, depth: 1 } },
    ],
  },
  {
    eyebrow: "Красная линия",
    question: "Что в отношениях ранит или отталкивает вас сильнее всего?",
    answers: [
      { label: "Недосказанность", note: "Когда приходится угадывать намерения и чувства", scores: { dialogue: 3, depth: 1 } },
      { label: "Ненадёжность", note: "Когда слова и реальные поступки не совпадают", scores: { support: 3, dialogue: 1 } },
      { label: "Холод и рутина", note: "Когда отношения перестают быть живыми", scores: { spark: 3, support: 1 } },
      { label: "Контроль", note: "Когда любовь превращается в ограничения и отчёты", scores: { space: 3, spark: 1 } },
    ],
  },
  {
    eyebrow: "Идеальный день вдвоём",
    question: "Какой сценарий звучит для вас наиболее притягательно?",
    answers: [
      { label: "Разговор без телефонов", note: "Время, где мы действительно слышим друг друга", scores: { dialogue: 2, depth: 3 } },
      { label: "Совместное маленькое дело", note: "Приготовить ужин, обустроить дом, помочь друг другу", scores: { support: 3, depth: 1 } },
      { label: "Спонтанная поездка", note: "Неизвестный маршрут и общее приключение", scores: { spark: 3, space: 1 } },
      { label: "Вместе, но каждый в своём ритме", note: "Можно читать, работать или молчать рядом", scores: { space: 3, support: 1 } },
    ],
  },
  {
    eyebrow: "Ваш человек",
    question: "По какому признаку вы скорее поймёте, что встретили «своего» человека?",
    answers: [
      { label: "Мы умеем договариваться", note: "Даже сложные темы не разрушают контакт", scores: { dialogue: 3, support: 1 } },
      { label: "Рядом становится спокойнее", note: "Мне не нужно постоянно доказывать свою ценность", scores: { support: 3, depth: 1 } },
      { label: "Рядом хочется жить смелее", note: "Мы усиливаем интерес друг друга к жизни", scores: { spark: 3, space: 1 } },
      { label: "Я могу оставаться собой", note: "Меня не уменьшают ради удобства отношений", scores: { space: 3, depth: 2 } },
    ],
  },
];

const connectionResults: Record<ConnectionCode, {
  label: string;
  title: string;
  summary: string;
  scenario: string;
  strength: string;
  partner: string;
  blindSpot: string;
  steps: string[];
}> = {
  dialogue: {
    label: "Диалог",
    title: "Вам по пути с теми, с кем можно говорить прямо",
    summary: "Вам важны ясность намерений, честные слова и ощущение, что сложную тему можно обсудить, не разрушая контакт.",
    scenario: "Вы сближаетесь через разговор и ясность. Если человек уходит от прямых ответов, вы быстро теряете ощущение безопасности и начинаете искать скрытый смысл.",
    strength: "Вы умеете называть сложное словами, договариваться и возвращать отношениям определённость.",
    partner: "Эмоционально доступный человек, который не играет в молчание, умеет обсуждать конфликт и подтверждает слова поступками.",
    blindSpot: "Вы можете слишком долго искать окончательную определённость и принимать чужую осторожность за отсутствие интереса.",
    steps: [
      "Не требуйте полной определённости в первые дни - оценивайте последовательность человека, а не скорость признаний.",
      "Перед сложным разговором формулируйте один конкретный запрос вместо списка накопленных претензий.",
      "Смотрите, умеет ли человек не только говорить, но и менять поведение после договорённости.",
    ],
  },
  support: {
    label: "Опора",
    title: "Вы выбираете любовь, которую видно в поступках",
    summary: "Вам нужны надёжность, последовательность и партнёрство, в котором двое не конкурируют, а создают устойчивую общую жизнь.",
    scenario: "Вы проявляете любовь через заботу и реальные действия. В отношениях легко становитесь тем, на ком держится быт, планы и эмоциональная устойчивость пары.",
    strength: "Рядом с вами спокойно: вы надёжны, внимательны и умеете создавать устойчивость без громких обещаний.",
    partner: "Самостоятельный и последовательный человек, который умеет принимать заботу, но не перекладывает на вас ответственность за свою жизнь.",
    blindSpot: "Иногда вы можете брать на себя слишком много ответственности и незаметно превращать заботу в контроль.",
    steps: [
      "Перед помощью спрашивайте: человек просит поддержки или вы спасаете его от последствий собственного выбора.",
      "Разделите постоянные обязанности пары и перестаньте молча компенсировать чужую безответственность.",
      "Оценивайте взаимность не по словам благодарности, а по регулярным действиям партнёра.",
    ],
  },
  spark: {
    label: "Искра",
    title: "Вам нужна связь, в которой жизнь становится ярче",
    summary: "Вас сближают энергия, телесность, юмор и новые впечатления. В отношениях для вас важно не только спокойствие, но и живое желание.",
    scenario: "Вы быстро чувствуете химию и оживаете рядом с человеком, который приносит движение, юмор и новые впечатления. Рутина для вас опаснее открытого конфликта.",
    strength: "Вы умеете наполнять союз энергией, проявлять желание и превращать обычную жизнь в совместное приключение.",
    partner: "Живой, инициативный и телесно открытый человек, который любит новое, но способен выдерживать обязательства и повседневность.",
    blindSpot: "Сильное притяжение может казаться доказательством совместимости раньше, чем вы успеете увидеть ценности и надёжность человека.",
    steps: [
      "Не принимайте сильную химию за готовую совместимость - проверьте ценности, границы и отношение к обязательствам.",
      "Планируйте одно новое совместное впечатление каждую неделю, не дожидаясь, пока отношения станут скучными.",
      "Говорите о желании прямо, а не проверяйте любовь партнёра через дистанцию и провокации.",
    ],
  },
  space: {
    label: "Пространство",
    title: "Вы ищете близость, в которой не нужно терять себя",
    summary: "Для вас любовь совместима со свободой, личным ритмом и уважением границ. Вам важно, чтобы союз расширял жизнь обоих.",
    scenario: "Вы цените связь, но плохо переносите контроль и слияние. Когда партнёр требует постоянного подтверждения любви, вам хочется отойти и восстановить внутреннюю свободу.",
    strength: "Вы уважаете индивидуальность, не душите близостью и умеете строить отношения двух самостоятельных людей.",
    partner: "Уверенный в себе человек с собственной жизнью, который способен быть близко без контроля, ревности и постоянной проверки чувств.",
    blindSpot: "За самостоятельностью иногда может прятаться страх показать потребность в другом человеке или попросить о поддержке.",
    steps: [
      "Заранее объясняйте, сколько личного времени вам нужно и что дистанция не означает отказ от отношений.",
      "Тренируйтесь просить о конкретной помощи до того, как усталость превратится в холодность.",
      "Отличайте нарушение границ от обычной потребности партнёра в контакте и ясности.",
    ],
  },
  depth: {
    label: "Глубина",
    title: "Вам важна встреча не ролей, а настоящих людей",
    summary: "Вы ищете смысл, эмоциональную честность и возможность быть увиденным целиком — не только сильным, удобным или успешным.",
    scenario: "Вы редко удовлетворяетесь поверхностной симпатией. Вам важно быстро почувствовать эмоциональную правду человека и понять, можно ли рядом показать уязвимую часть себя.",
    strength: "Вы способны видеть человека глубже роли, создавать доверие и выдерживать разговоры, которых другие избегают.",
    partner: "Эмоционально зрелый человек, который не боится уязвимости, но умеет сохранять лёгкость и не превращает близость в бесконечный анализ.",
    blindSpot: "Вы можете ждать мгновенной глубины и недооценивать отношения, которым нужно время, лёгкость и совместный опыт.",
    steps: [
      "Давайте отношениям время: надёжная глубина часто растёт медленнее сильного эмоционального узнавания.",
      "Добавляйте в общение действие, юмор и телесность, чтобы близость не превращалась в постоянный разбор чувств.",
      "Проверяйте, способен ли человек выдерживать вашу правду, не требуя мгновенного полного раскрытия.",
    ],
  },
};

const connectionStatusCopy: Record<ConnectionStatus, string> = {
  search: "На фестивале цвет браслета поможет увидеть, кто открыт к знакомству. А ваш код и вопросы для разговора помогут быстрее перейти от формальностей к ценностям и намерениям.",
  relationship: "Пройдите тест вдвоём и сравните результаты. На фестивале программа даст вам общий контекст, чтобы обсудить близость, деньги, конфликты и будущее без привычного сценария.",
  complicated: "Ваш результат не принимает решение за вас, но даёт язык для честного разговора. На фестивале вы сможете посмотреть на ситуацию через разные подходы экспертов.",
  self: "Понимание своего кода помогает замечать подходящих людей и не соглашаться на связь, в которой приходится отказываться от себя.",
};

const partners = [
  { name: "Грелка", image: "/partners/grelka.webp" },
  { name: "Кипенский гриб", image: "/partners/kipensky-grib.webp" },
  { name: "Secret", image: "/partners/secret.webp" },
  { name: "Montana", image: "/partners/montana.webp" },
  { name: "Нуждички", image: "/partners/nuzhdichki.webp" },
  { name: "RR Corporation", image: "/partners/rr-corporation.webp" },
  { name: "SMOOTH Lifestyle Radio", image: "/partners/smooth-radio.webp" },
  { name: "Взлёт", image: "/partners/vzlet.webp" },
  { name: "Линчевская Юлиана", image: "/partners/linchevskaya.webp" },
  { name: "Только по делу", image: "/partners/tolko.jpg" },
  { name: "Body Impulse", image: "/partners/bi.png" },
  { name: "Хвойный квас", image: "/partners/hvoyny-kvas.webp" },
  { name: "Журнал SOK - Стиль. Образ. Качество жизни", image: "/partners/sok-magazine.webp" },
  { name: "Центр просвещения и досуга «СюрПриз»", image: "/partners/surpriz.webp" },
  { name: "Философия Здоровья доктора К. С. Суханова", image: "/partners/philosophy-health-sukhanov.jpg" },
  { name: "LEVEL UP - Свидание в Темноте", image: "/partners/level-up-date-in-dark.svg" },
];

const attendees = [
  { name: "Юлия", age: 27, reason: "Иду за новыми знаниями в психологии отношений и эмоциями.", image: "/attendees/yulia-27.webp" },
  { name: "Анастасия", age: 20, reason: "Прихожу за вдохновением, интересна психология личного развития.", image: "/attendees/anastasia-20.webp" },
  { name: "Савва", age: 24, reason: "Иду в надежде обрести чудесные знакомства и близких единомышленников.", image: "/attendees/savva-24.webp" },
  { name: "Полина", age: 24, reason: "Хочу добавить в свои отношения гармонии, а также найти новые способы саморазвития.", image: "/attendees/polina-24.webp" },
  { name: "Алексей", age: 34, reason: "Мне интересна тема личного развития и внутренней трансформации. Такие события помогают понять, что моя работа необходима людям.", image: "/attendees/alexey-34.webp" },
  { name: "Соня", age: 26, reason: "Хочу обрести стабильность и гармонию в отношениях.", image: "/attendees/sonya-26.webp" },
  { name: "Максим", age: 27, reason: "Хочу найти точку роста и научиться сохранять стабильность во всех сферах жизни.", image: "/attendees/maxim-27.webp" },
  { name: "Алина", age: 36, reason: "Мне интересно всё, что связано с личным развитием. Люблю слушать разных психологов и находить новые инсайты.", image: "/attendees/alina-36.webp" },
  { name: "Анна", age: 26, reason: "Иду за эмоциями, а эмоции - это для меня счастье.", image: "/attendees/anna-26.webp" },
  { name: "Диана", age: 27, reason: "Иду весело провести оставшиеся дни лета, обзавестись новыми знакомствами и узнать что-то новое.", image: "/attendees/diana-27.webp" },
  { name: "Юлия", age: 27, reason: "Наступает новый период жизни, поэтому я открыта новым знакомствам и полезной информации по психологии.", image: "/attendees/yulia2-27.webp" },
  { name: "Маргарита", age: 23, reason: "Надоело тратить время на сайтах знакомств - хочется живого общения.", image: "/attendees/margarita-23.webp" },
  { name: "Вадим", age: 29, reason: "Иду за новыми знакомствами.", image: "/attendees/vadim-29.webp" },
  { name: "Вероника", age: 23, reason: "Иду за вдохновением, новыми знакомствами и яркими впечатлениями!", image: "/attendees/veronika-23.webp" },
  { name: "Александр", age: 27, reason: "Хочу разнообразить свою рутину.", image: "/attendees/alexander-27.webp" },
  { name: "Ксения", age: 23, reason: "Хочу добавить в жизнь красок.", image: "/attendees/ksenia-23.webp" },
  { name: "Елена", age: 38, reason: "Мне интересна тема взаимоотношений. Предпочитаю общение вживую и стараюсь постоянно развиваться.", image: "/attendees/elena-38.webp" },
  { name: "Евгения", age: 45, reason: "Мне интересна психология отношений и живые знакомства.", image: "/attendees/evgenia-45.webp" },
  { name: "Глеб", age: 27, reason: "Хочу стать ещё более привлекательным для своей партнёрши и увидеть свои ошибки в стратегии заработка.", image: "/attendees/gleb-27.webp" },
  { name: "Кристина", age: 25, reason: "Хочу пойти на фестиваль, прихожу за вдохновением и новыми знакомствами.", image: "/attendees/kristina-25.svg" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function BonusSection() {
  return (
    <div className="tariff-bonus" id="bonuses">
      <div>
        <div className="bonus-hero">
          <div className="bonus-copy">
            <p className="section-label">Подарки партнёров</p>
            <h3>Подарки <span>по тарифам</span></h3>
            <p className="bonus-lead">В тарифах «Перезагрузка» и VIP предусмотрены лимиты выбора подарков и сертификатов. Состав и условия предложений на 3 декабря уточняются.</p>
          </div>
          <div className="bonus-tiers" aria-label="Подарки по тарифам">
            <article><span>Перезагрузка</span><h3>Индивидуальный набор</h3><strong>до 50 000 ₽</strong><p>подарков и сертификатов</p></article>
            <article className="bonus-tier-vip"><span>VIP</span><h3>Максимальный набор</h3><strong>до 100 000 ₽</strong><p>подарков и сертификатов</p></article>
          </div>
        </div>

        <div className="bonus-grid bonus-grid-compact" aria-label="Категории подарков">
          <article><span>01</span><h3>SPA</h3></article>
          <article><span>02</span><h3>Здоровье</h3></article>
          <article><span>03</span><h3>Рестораны</h3></article>
          <article><span>04</span><h3>Консультации</h3></article>
          <article><span>05</span><h3>Обучение</h3></article>
          <article><span>06</span><h3>Товары брендов</h3></article>
        </div>
        <p className="bonus-footnote">Суммы обозначают лимит номинальной стоимости сертификатов, а не денежную выплату. У каждого предложения свои сроки и ограничения; отдельные расходы могут оплачиваться дополнительно. Доступ уже купивших билеты к действующему каталогу сохранён.</p>
        <a className="gift-archive-link" href="/gifts/">Открыть подарки для купивших билеты ↗</a>
      </div>
    </div>
  );
}

function AttendeeSection() {
  return <section className="section festival-history primary-section" id="community"><div className="container">
    <div className="history-layout"><figure><img src="/history/festival-guests.jpg" alt="Гости и команда предыдущего фестиваля МЖ" width="2048" height="1365" loading="lazy" /><figcaption>Предыдущая встреча сообщества МЖ</figcaption></figure><div><p className="section-label">04 / Предыдущий фестиваль</p><h2>У МЖ уже <span>есть своя история</span></h2><div className="history-number"><strong>550</strong><span>гостей на прошлом событии</span></div><p>На фестиваль приходят за новым кругом общения, интересными разговорами и знакомством с подходами экспертов. 3 декабря встречаемся в «Антресоли и Перце».</p><a className="text-link" href="#application-form">Присоединиться к новой встрече ↗</a></div></div>
    <details className="history-guests"><summary>С какими запросами приходили гости прошлой встречи <span aria-hidden="true">+</span></summary><div className="history-guest-grid">{attendees.map((attendee) => <article key={attendee.image}><img src={attendee.image} alt="" width="64" height="64" loading="lazy" /><div><strong>{attendee.name}, {attendee.age}</strong><p>«{attendee.reason}»</p></div></article>)}</div><p className="history-note">Это слова гостей перед прошлой встречей, а не обещания результатов участия 3 декабря.</p></details>
  </div></section>;
}

function PricingSection() {
  const [purchaseFormat, setPurchaseFormat] = useState<"single" | "pair">("single");
  return (
    <section className="section pricing-section primary-section" id="pricing">
      <div className="container">
        <div className="section-heading center-heading">
          <p className="section-label">06 / Билеты и состав тарифов</p>
          <h2>Выберите <span>формат участия</span></h2>
          <p>Участие по заявке. После одобрения модератором вы получите персональный промокод для покупки билета.</p>
        </div>
        <div className="admission-actions">
          <a className="primary-button" href="#application-form">Подать заявку</a>
          <a className="secondary-button" href="#promo-code">У меня есть промокод</a>
        </div>
        <div className="ticket-format-choice" role="group" aria-label="Количество участников в билете"><button type="button" aria-pressed={purchaseFormat === "single"} onClick={() => setPurchaseFormat("single")}>Один</button><button type="button" aria-pressed={purchaseFormat === "pair"} onClick={() => setPurchaseFormat("pair")}>Вдвоём</button></div>
        <div className="pricing-grid">
          {tickets.map((ticket) => (
            <article className={`price-card price-card-${ticket.tier} ${ticket.featured ? "featured" : ""}`} key={ticket.name}>
              {ticket.featured && <div className="popular">Больше возможностей</div>}
              <div className="price-head"><h3>{ticket.name}</h3><strong>{formatPrice((purchaseFormat === "pair" ? pairPrices : ticketPrices)[ticket.tier])}</strong><span>{purchaseFormat === "pair" ? "Цена за двоих" : "Цена за 1 билет"}</span></div>
              <div className="ticket-highlight-list">{ticket.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}</div>
              <p>{ticket.description}</p>
              <details className="ticket-details"><summary>Полный состав тарифа <b>+</b></summary><ul>{ticket.items.map((item) => <li key={item}><b>✓</b>{item}</li>)}</ul></details>
              <a href="#application-form" data-tier={ticket.tier} data-format={purchaseFormat} data-cta-location={`tariff-${ticket.tier}`}>Подать заявку <i className="button-icon"><ArrowIcon /></i></a>
              <a className="admission-promo-link" href="#promo-code" data-cta-location={`tariff-${ticket.tier}`}>У меня есть промокод</a>
            </article>
          ))}
        </div>
        <BonusSection />
      </div>
    </section>
  );
}

export default function Home() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<FestivalParticipant | null>(null);
  const [cookieVisible, setCookieVisible] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [connectionScores, setConnectionScores] = useState<Record<ConnectionCode, number>>({
    dialogue: 0,
    support: 0,
    spark: 0,
    space: 0,
    depth: 0,
  });
  const [connectionResult, setConnectionResult] = useState<{ primary: ConnectionCode; secondary: ConnectionCode } | null>(null);
  const connectionQuizRef = useRef<HTMLDivElement>(null);

  useEffect(() => startFunnelTracking(), []);
  useEffect(() => startAdmissionNavigation(), []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCookieVisible(window.localStorage.getItem("mj-cookie-ok") !== "1");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!selectedSpeaker) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.querySelector<HTMLElement>(".speaker-modal");
    const controls = () => [...(dialog?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]') ?? [])];
    controls()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSpeaker(null);
      if (event.key !== "Tab") return;
      const focusable = controls();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.body.style.overflow = selectedSpeaker ? "hidden" : "";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [selectedSpeaker]);

  const startConnectionQuiz = () => {
    trackFunnelEvent("quiz_started");
    setConnectionStep(0);
    setConnectionStatus(null);
    setConnectionScores({ dialogue: 0, support: 0, spark: 0, space: 0, depth: 0 });
    setConnectionResult(null);
    window.requestAnimationFrame(() => connectionQuizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const chooseConnectionStatus = (status: ConnectionStatus) => {
    trackFunnelEvent("quiz_started");
    setConnectionStatus(status);
    setConnectionStep(1);
  };

  const chooseConnectionAnswer = (answer: ConnectionAnswer) => {
    const nextScores = { ...connectionScores };
    (Object.keys(answer.scores) as ConnectionCode[]).forEach((code) => {
      nextScores[code] += answer.scores[code] ?? 0;
    });
    setConnectionScores(nextScores);

    if (connectionStep === connectionQuestions.length) {
      const ranked = (Object.entries(nextScores) as [ConnectionCode, number][]).sort((a, b) => b[1] - a[1]);
      trackFunnelEvent("quiz_completed");
      setConnectionResult({ primary: ranked[0][0], secondary: ranked[1][0] });
      window.requestAnimationFrame(() => connectionQuizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }

    setConnectionStep((current) => current + 1);
  };

  const acceptCookies = () => {
    window.localStorage.setItem("mj-cookie-ok", "1");
    setCookieVisible(false);
  };

  const currentConnectionQuestion = connectionStep > 0 ? connectionQuestions[connectionStep - 1] : null;
  const primaryConnectionResult = connectionResult ? connectionResults[connectionResult.primary] : null;
  const secondaryConnectionResult = connectionResult ? connectionResults[connectionResult.secondary] : null;
  const connectionProgress = connectionResult ? 100 : Math.max(1, connectionStep + 1) / (connectionQuestions.length + 1) * 100;

  return (
    <main className="page-restructured">
      <nav className="floating-nav" aria-label="Навигация по странице">
        <a className="nav-brand" href="#">
          <strong>Мужчина и Женщина</strong>
          <span>{event.dateLabel}</span>
        </a>
        <div className="nav-links"><a href="#program">Программа</a><a href="#logistics">Площадка</a><a href="#pricing">Билеты</a><a href="#participation">Как попасть</a><a href="/gifts/">Подарки для купивших</a></div>
        <a className="nav-bonus-cta" href="#application-form" data-cta-location="header"><span className="nav-bonus-full">Подать заявку</span><span className="nav-bonus-short">Заявка</span></a>
        <details className="mobile-nav">
          <summary aria-label="Открыть меню">Меню</summary>
          <div><a href="#program">Программа и спикеры</a><a href="#expo">Экспозона и практики</a><a href="#logistics">Площадка</a><a href="#pricing">Билеты</a><a href="#participation">Как попасть</a><a href="#application-form" data-cta-location="mobile-menu">Подать заявку</a><a href="#promo-code" data-cta-location="mobile-menu">У меня есть промокод</a><a href="/gifts/">Подарки для купивших</a></div>
        </details>
      </nav>

      <section className="hero has-intro conversion-hero primary-section" id="festival-introduction">
        <HeroAnimation />
        <div className="conversion-hero-shade" aria-hidden="true" />
        <div className="container conversion-hero-copy">
          <p className="conversion-brand">МЖ · Мужчина и Женщина</p>
          <div className="conversion-date">3 декабря 2026 · четверг · {event.timeLabel}</div>
          <h1>Вечер новых знакомств<br /><em>и разговоров об отношениях</em></h1>
          <p className="conversion-lead">Познакомьтесь с людьми и экспертами, обсудите важное и проведите вечер в «Антресоли и Перце». Можно прийти одному или вдвоём.</p>
          <p className="conversion-place">«{event.venue}» · {event.city}<br />{event.address} · метро «{event.metro}»</p>
          <div className="hero-actions"><a className="primary-button" href="#application-form" data-cta-location="hero">Подать заявку <span aria-hidden="true">↗</span></a><a className="conversion-promo" href="#promo-code" data-cta-location="hero">У меня есть промокод</a></div>
          <p className="conversion-admission-note">Билеты от {formatPrice(ticketPrices.start)} · Покупка после одобрения заявки</p>
        </div>
      </section>

      <FestivalProgramme onSelect={setSelectedSpeaker} />
      <FestivalActivities onSelect={setSelectedSpeaker} />
      <AttendeeSection />
      <FestivalVenue />
      <PricingSection />
      <FestivalParticipation />
      <FestivalAdmission />

      <aside className="festival-extras" aria-label="Дополнительные материалы"><details className="container"><summary>Дополнительно: тест, проекты и участие брендов <span aria-hidden="true">+</span></summary>
      <section className="section connection-section" id="connection-code">
        <div className="container">
          <details className="connection-compact">
            <summary>
              <span><small>Интерактив · 90 секунд</small><strong>Узнайте свой код связи</strong><em>Как вы строите близость, кто вам подходит и что мешает отношениям</em></span>              <b>Пройти тест <i><ArrowIcon /></i></b>
            </summary>          <div className="connection-experience" id="connection-quiz" ref={connectionQuizRef}>
            {!connectionResult && (              <div className="connection-question-card" aria-live="polite">
                <div className="connection-progress-head">
                  <span>Код связи</span>
                  <strong>{String(connectionStep + 1).padStart(2, "0")} / 07</strong>
                </div>
                <div className="connection-progress" aria-hidden="true"><i style={{ width: `${connectionProgress}%` }} /></div>

                {connectionStep === 0 ? (
                  <div className="connection-question-copy">
                    <p>Сначала о вас</p>
                    <h3>Какое описание подходит вам сейчас?</h3>
                    <div className="connection-answers">
                      {connectionStatusOptions.map((option) => (
                        <button type="button" key={option.value} onClick={() => chooseConnectionStatus(option.value)}>
                          <span><b>{option.label}</b><small>{option.note}</small></span><i><ArrowIcon /></i>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : currentConnectionQuestion ? (
                  <div className="connection-question-copy">
                    <p>{currentConnectionQuestion.eyebrow}</p>
                    <h3>{currentConnectionQuestion.question}</h3>
                    <div className="connection-answers">
                      {currentConnectionQuestion.answers.map((answer) => (
                        <button type="button" key={answer.label} onClick={() => chooseConnectionAnswer(answer)}>
                          <span><b>{answer.label}</b><small>{answer.note}</small></span><i><ArrowIcon /></i>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <button className="connection-restart-link" type="button" onClick={startConnectionQuiz}>Начать заново</button>
              </div>
            )}

            {connectionResult && primaryConnectionResult && secondaryConnectionResult && connectionStatus && (
              <div className="connection-result-card" aria-live="polite">
                <div className="connection-result-head">
                  <p>Ваш сценарий связи</p>
                  <h3>{primaryConnectionResult.label}</h3>
                  <strong>{primaryConnectionResult.title}</strong>
                  <p>{primaryConnectionResult.summary}</p>
                </div>

                <div className="connection-result-grid">
                  <article className="connection-scenario">
                    <span>Как это выглядит в жизни</span>
                    <p>{primaryConnectionResult.scenario}</p>
                  </article>
                  <article className="connection-strength">
                    <span>Ваша сильная сторона</span>
                    <p>{primaryConnectionResult.strength}</p>
                  </article>
                  <article className="connection-blind-spot">
                    <span>Главная слепая зона</span>
                    <p>{primaryConnectionResult.blindSpot}</p>
                  </article>
                  <article className="connection-partner-fit">
                    <span>Какой партнёр вам подходит</span>
                    <p>{primaryConnectionResult.partner}</p>
                  </article>
                </div>

                <div className="connection-conversations">
                  <span>Три конкретных шага</span>
                  <ol>
                    {primaryConnectionResult.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                </div>

                <div className="connection-festival-bridge">
                  <div>
                    <span>Продолжение — вживую</span>
                    <p>{connectionStatusCopy[connectionStatus]}</p>
                  </div>
                </div>

                <div className="connection-speaker-route">
                  <div className="connection-speaker-route-head">
                    <span>Продолжить на фестивале</span>
                    <h4>Познакомиться с подходами экспертов</h4>
                    <p>Выберите интересующее направление. Темы выступлений, форматы и доступность встреч уточняются в карточках.</p>
                  </div>
                  <div className="connection-speaker-route-list">
                    <article><a href="#speakers">Спикеры и темы</a><p>Согласованные темы и информация об экспертах.</p></article>
                    <article><a href="#consultations">Консультации и практики</a><p>Возможные форматы личного знакомства и разбора ситуации.</p></article>
                  </div>
                </div>

                <div className="connection-screenshot-tip">
                  <span>Сохраните результат</span>
                  <p>Сделайте скриншот этой карточки и отправьте партнёру или другу — так результат сохранится вместе с пояснениями и вопросами.</p>
                </div>

                <div className="connection-result-actions">
                  <a className="primary-button" href="#application-form"><span>Подать заявку</span><i className="button-icon"><ArrowIcon /></i></a>
                  <button type="button" onClick={startConnectionQuiz}>Пройти ещё раз</button>
                </div>
                <small className="connection-disclaimer">Результат предназначен для саморефлексии и не является психологической диагностикой.</small>
              </div>
            )}
          </div>
          </details>
        </div>
      </section>



      <section className="section secondary-projects" id="partnership"><div className="container"><details><summary>Проектам, брендам и экспертам <span aria-hidden="true">+</span></summary><div className="secondary-projects-copy"><div><h3>Стать частью фестиваля</h3><p>Обсудите с командой спикерство, экспозону или партнёрский формат. Состав и условия участия согласуются отдельно.</p><a className="secondary-button" href={`${telegramUrl}?text=${encodeURIComponent("Хочу обсудить участие в фестивале МЖ")}`} target="_blank" rel="noreferrer">Обсудить участие ↗</a></div><div><h3>Проекты прошлых встреч</h3><p>История сообщества. Состав партнёров 3 декабря уточняется.</p><div className="partner-grid">{partners.map((partner) => <div className="partner-card" key={partner.name}><img src={partner.image} alt={partner.name} loading="lazy" /><strong>{partner.name}</strong></div>)}</div></div></div></details></div></section>

      </details></aside>

      <footer>
        <div className="container footer-grid">
          <div><strong>МЖ</strong><p>Мужчина и Женщина.<br />Фестиваль 3 декабря</p></div>
          <div><span>Задать вопрос</span><a href="tel:+79625759813">8 962 575-98-13</a><a href={telegramUrl} target="_blank" rel="noreferrer">Telegram: @redheadlitle</a><a href="mailto:noname.eventspb@gmail.com">noname.eventspb@gmail.com</a></div>
          <div><span>Адрес фестиваля МЖ</span><p>«{event.venue}»<br />{event.city}, {event.address}<br />Метро «{event.metro}»<br />{event.dateLabel} · {event.timeLabel}</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Фестиваль «Мужчина и Женщина»</span><a href="/gifts/">Подарки для купивших билеты</a><a href="#">Вернуться к началу</a></div>
      </footer>

      {selectedSpeaker && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedSpeaker(null)}>
          <article className="speaker-modal" role="dialog" aria-modal="true" aria-labelledby="speaker-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSpeaker(null)} aria-label="Закрыть">×</button>
            <div className={`modal-visual ${selectedSpeaker.tone}${selectedSpeaker.image ? " has-photo" : ""}`}>
              {selectedSpeaker.image ? (
                <img src={selectedSpeaker.image} alt={selectedSpeaker.name} style={{ objectPosition: selectedSpeaker.imagePosition }} />
              ) : (
                <span>{selectedSpeaker.initials}</span>
              )}
            </div>
            <div className="modal-copy">
              <p className="section-label">Участник фестиваля</p>
              <h2 id="speaker-modal-title">{selectedSpeaker.name}</h2>
              <p className="modal-role">{selectedSpeaker.role}</p>
              {selectedSpeaker.stage && <div className="modal-topic"><span>Тема выступления</span><strong>{selectedSpeaker.topic ?? "Тема требует согласования"}</strong></div>}
              {selectedSpeaker.note && <p className="festival-pending">{selectedSpeaker.note}</p>}
              {selectedSpeaker.description && <p className="modal-description">{selectedSpeaker.description}</p>}
              {selectedSpeaker.facts.length > 0 && <ul>{selectedSpeaker.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}
              <div className="participant-formats">{selectedSpeaker.appearances.map((appearance) => <article key={appearance.label}><h4>{appearance.label}</h4><p>{appearance.text}</p>{appearance.note && <p className="festival-pending">{appearance.note}</p>}</article>)}</div>
              <div className="speaker-project-links">{selectedSpeaker.links?.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
            </div>
          </article>
        </div>
      )}

      {cookieVisible && (
        <div className="cookie-banner">
          <p>Мы используем только необходимые cookie для корректной работы сайта.</p>
          <button onClick={acceptCookies}>Понятно</button>
        </div>
      )}
    </main>
  );
}
