import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
const section = (id) => {
  const match = html.match(new RegExp(`<section[^>]*id="${id}"[^>]*>([\\s\\S]*?)</section>`));
  assert.ok(match, `Missing section: ${id}`);
  return match[1];
};

test("only the supplied speakers and agreed topics are shown", () => {
  const speakers = section("program");
  assert.equal((speakers.match(/class="city-speaker topic-confirmed"/g) ?? []).length, 3);
  assert.equal((speakers.match(/class="city-speaker topic-pending"/g) ?? []).length, 8);
  assert.equal((speakers.match(/Тема требует согласования/g) ?? []).length, 8);
  for (const name of ["Анна Рацун", "Елена Гусева", "Светлана Лапухина", "Мария Рубинская", "Евгения Цапина"]) assert.ok(speakers.includes(name));
  const program = section("program");
  assert.equal((program.match(/Секс, деньги и отношения/g) ?? []).length, 1);
  assert.ok(program.includes("Секс, деньги и отношения"));
  assert.ok(program.includes("Сначала Я. Потом МЫ. Любовь и отношения после 40"));
  assert.ok(program.includes("к безопасному выходу"));
});

test("withheld participants and obsolete topics are absent from both routes", async () => {
  const gifts = await readFile(new URL("../out/gifts/index.html", import.meta.url), "utf8");
  for (const name of ["Елена Забанова", "Арина Казанских"]) {
    assert.ok(!html.includes(name), `Unexpected participant: ${name}`);
    assert.ok(!gifts.includes(name), `Unexpected gift provider: ${name}`);
  }
  assert.ok(!html.includes("Елена Солнечная"), "Elena Solnechnaya must not appear in the current festival");
  for (const topic of ["Что мы на самом деле приносим в отношения", "Секс становится обязанностью", "Парадоксы взаимоотношений"]) assert.ok(!html.includes(topic));
});

test("expo and consultations retain pending conditions beside the offers", () => {
  const expo = section("expo");
  assert.equal((expo.match(/class="city-exhibitor festival-info-card"/g) ?? []).length, 17);
  for (const name of ["Яна Якушева", "Ольга Цвик", "Юлия Кропивницкая"]) assert.ok(expo.includes(name));
  assert.ok(expo.includes("Выставка внутри фестиваля"));
  for (const category of ["Психология и отношения", "Игры, практики и личное развитие", "Товары, стиль и творчество", "Сообщества и проекты"]) assert.ok(expo.includes(category));
  assert.ok(expo.includes("Возможный показ мод требует отдельного согласования"));
  const consultations = section("consultations");
  assert.equal((consultations.match(/class="[^"]*\bfestival-info-card\b[^"]*"/g) ?? []).length, 11);
  assert.ok(consultations.includes("Бесплатные консультации для гостей фестиваля"));
  for (const phrase of ["Условия получения необходимо подтвердить", "Возможность индивидуального разбора уточняется", "пока не являются подтверждёнными условиями участия", "способ записи"]) assert.ok(consultations.includes(phrase));
});

test("responsive intro assets and all rendered local images are available", async () => {
  assert.ok(html.includes('media="(max-width: 760px)"'));
  assert.ok(html.includes("secret-room-mobile-dark-room.webp"));
  assert.ok(html.includes("secret-room-mobile-stage-room.webp"));
  assert.ok(html.includes("/speakers/mechislav-zhiltsov.webp"));
  assert.ok(html.includes("/speakers/ekaterina-tistol.webp"));
  const paths = new Set([...html.matchAll(/(?:src|srcSet|srcset)="(\/[^"?]+)"/g)].map((match) => match[1]));
  for (const path of paths) await access(new URL(`../out${path}`, import.meta.url));
});

test("December event details replace the old venue and expired checkout", () => {
  for (const value of ["3 декабря 2026", "16:00–00:00", "Антресоль и Перец", "ул. Марата, 1/71", "Маяковская", "В ночь на 4 декабря"]) assert.ok(html.includes(value), value);
  for (const value of ["22 августа", "2026-08", "22.08.2026", "Кваренги", "Казанская", "qtickets.ru/event/246143", "Выбрать билет от 990", "Регистрация с 12:00", "Программа с 13:00"]) assert.ok(!html.includes(value), `Obsolete event data: ${value}`);
  const logistics = section("logistics");
  assert.equal((logistics.match(/<figure>/g) ?? []).length, 4);
  const map = logistics.match(/href="(https:\/\/yandex.ru\/maps\/[^\"]+)"/);
  assert.ok(map);
  assert.ok(decodeURIComponent(map[1]).includes("Марата, 1/71"));
  const pricing = section("pricing");
  assert.equal((pricing.match(/class="price-head"/g) ?? []).length, 3);
  for (const price of [1490, 2990, 5900]) assert.ok(pricing.includes(new Intl.NumberFormat("ru-RU").format(price)));
  assert.ok(pricing.includes("Подать заявку"));
  assert.ok(pricing.includes("У меня есть промокод"));
});

test("event metadata ends at midnight the next day and gift access keeps its original flow", async () => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match);
  const event = JSON.parse(match[1]);
  assert.equal(event.startDate, "2026-12-03T16:00:00+03:00");
  assert.equal(event.endDate, "2026-12-04T00:00:00+03:00");
  assert.equal(Date.parse(event.endDate) - Date.parse(event.startDate), 8 * 60 * 60 * 1000);
  assert.equal(event.location.name, "Антресоль и Перец");
  assert.equal(event.location.address.streetAddress, "ул. Марата, 1/71");
  assert.ok(!event.offers);
  const gifts = await readFile(new URL("../out/gifts/index.html", import.meta.url), "utf8");
  assert.ok(gifts.includes("Соберите свой набор подарков"));
  assert.ok(gifts.includes("Каталог открыт владельцам билетов"));
  assert.ok(!gifts.includes("Каталог прошлой встречи МЖ"));
});


test("admission form contains the requested fields and explains moderation without promising approval", () => {
  const admission = section("admission");
  for (const name of ["name", "contact", "email", "format", "reason", "consent"]) assert.ok(admission.includes(`name="${name}"`));
  assert.ok(admission.includes("Почему хотите прийти?"));
  assert.ok(section("pricing").includes("модератор свяжется с вами и сообщит решение"));
  assert.ok(admission.includes('name="selectedTier"'));
  assert.ok(admission.includes('method="post"'));
  assert.ok(admission.includes("Отправка заявки не гарантирует одобрение участия"));
  assert.ok(admission.includes('id="promo-code"'));
  assert.ok(!admission.includes("qtickets.ru"));
});

test("the approved city narrative runs from a personal question to participation", () => {
  const opening = section("festival-introduction");
  for (const value of ["МЖ Сити.", "Тайная квартира", "Фестиваль отношений с собой, с людьми и с жизнью", "3 декабря 2026", "Марата, 1/71", "Подать заявку", "У меня есть промокод"]) assert.ok(opening.includes(value));
  const order = [...html.matchAll(/<section class="[^"]*primary-section[^"]*" id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(order, ["festival-introduction", "reflection", "balance", "program", "consultations", "expo", "dating", "bonuses", "bar", "afterparty", "community", "partners", "logistics", "pricing", "admission"]);
  assert.ok(!html.includes('id="connection-code"'));
  assert.ok(!html.includes("Код связи"));
  assert.ok(html.includes('id="questions"'));
  assert.ok(html.includes("Возможность позднего входа"));
  assert.ok(html.includes("Фиксированный срок рассмотрения пока не объявлен"));
  assert.ok(!html.includes("Можно снова отложить отношения"));
  assert.ok(!html.includes("Архив подарков"));
  for (const tier of ["start", "reload", "vip"]) assert.ok(section("pricing").includes(`data-tier="${tier}" data-format="single"`));
  assert.ok(!html.includes('class="ticket-product-scene'));
});

test("the concept offers eight accessible directions and links to real festival sections", () => {
  const balance = section("balance");
  assert.equal((balance.match(/aria-controls="balance-direction"/g) ?? []).length, 8);
  assert.ok(balance.includes('aria-live="polite"'));
  for (const value of ["Я и внутренняя опора", "Любовь и близость", "Семья", "Друзья и общение", "Тело и энергия", "Дело и деньги", "Развитие", "Отдых и впечатления"]) assert.ok(balance.includes(value));
  for (const value of ["Выступления", "Консультации", "Практики и игры", "Знакомства"]) assert.ok(balance.includes(value));
  assert.ok(!balance.includes("Семь пространств"));
  assert.ok(!balance.includes("психологическая диагностика"));
});

test("new experience blocks explain boundaries and gifts without inventing a video or partners", () => {
  const dating = section("dating");
  for (const value of ["Зелёный", "Открыт к знакомствам", "Красный", "Сегодня без знакомств", "Продолжать ли разговор — всегда решаете вы"]) assert.ok(dating.includes(value));
  const gifts = section("bonuses");
  for (const value of ["50 000", "100 000", "по номинальной стоимости", "не денежная выплата", "/gifts/"]) assert.ok(gifts.includes(value));
  assert.ok(section("bar").includes("бар с барменом"));
  assert.ok(!section("bar").includes("включены в билет"));
  assert.ok(section("afterparty").includes("Фестиваль до 00:00"));
  assert.ok(!section("afterparty").includes("22:00"));
  assert.ok(!section("community").includes("Смотреть видео"));
  for (const value of ["Партнёры фестиваля", "Информационные партнёры", "не подтверждает участие проектов 3 декабря"]) assert.ok(section("partners").includes(value));
});


test("apartment doors, guest archive and cinematic offer remain discoverable", () => {
  assert.equal((html.match(/aria-label="Открыть дверь:/g) ?? []).length, 6);
  assert.ok(html.includes("распределение программы по залам уточняется"));
  assert.ok(html.includes('id="consultation-workshops"'));
  assert.ok(html.includes("Голоса гостей прошлой встречи"));
  assert.ok(html.includes("Остановить ленту"));
  assert.ok(html.includes('data-phase="pending"'));
  assert.ok(html.includes("Смотреть фестиваль"));
  assert.ok(!html.includes("Приостановить анимацию"));
  assert.ok(!html.includes("Пауза"));
  assert.ok(!/[↗→↔]/.test(html));
  assert.ok(html.includes("<noscript>"));
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), `Missing anchor: ${match[1]}`);
});
