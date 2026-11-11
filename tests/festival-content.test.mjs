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
  const speakers = section("speakers");
  assert.equal((speakers.match(/class="speaker-card"/g) ?? []).length, 12);
  assert.equal((speakers.match(/Тема требует согласования/g) ?? []).length, 9);
  for (const name of ["Анна Рацун", "Елена Гусева", "Светлана Лапухина", "Мария Рубинская", "Евгения Цапина"]) assert.ok(speakers.includes(name));
  const program = section("program");
  assert.equal((program.match(/class="program-confirmed-talk"/g) ?? []).length, 3);
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
  for (const topic of ["Что мы на самом деле приносим в отношения", "Секс становится обязанностью", "Парадоксы взаимоотношений"]) assert.ok(!html.includes(topic));
});

test("expo and consultations retain pending conditions beside the offers", () => {
  const expo = section("expo");
  assert.equal((expo.match(/class="festival-info-card"/g) ?? []).length, 18);
  assert.equal((expo.match(/class="festival-group"/g) ?? []).length, 4);
  assert.ok(expo.includes("Возможный показ мод требует отдельного согласования"));
  const consultations = section("consultations");
  assert.equal((consultations.match(/class="festival-info-card"/g) ?? []).length, 12);
  for (const phrase of ["Условия получения необходимо подтвердить", "Возможность индивидуального разбора уточняется", "пока не являются подтверждёнными условиями участия", "способ записи"]) assert.ok(consultations.includes(phrase));
});

test("responsive intro assets and all rendered local images are available", async () => {
  assert.ok(html.includes('media="(max-width: 760px)"'));
  assert.ok(html.includes("secret-room-mobile-dark-room.webp"));
  assert.ok(html.includes("secret-room-mobile-stage-room.webp"));
  const paths = new Set([...html.matchAll(/(?:src|srcSet|srcset)="(\/[^"?]+)"/g)].map((match) => match[1]));
  for (const path of paths) await access(new URL(`../out${path}`, import.meta.url));
});
