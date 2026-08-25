"use client";

import { FormEvent, useMemo, useState } from "react";
import access from "./access.json";
import styles from "./gifts.module.css";

type AccessRecord = { tier: "reload" | "vip"; sets: number };

// Общие тестовые адреса не привязаны к заказу и могут одновременно
// использоваться на любом количестве устройств.
const SHARED_TEST_ACCESS: Record<string, AccessRecord> = {
  "test@menwoman.ru": { tier: "vip", sets: 1 },
  "test2@menwoman.ru": { tier: "vip", sets: 2 },
};
type Gift = {
  id: string; partner: string; title: string; price: number | null; quantity: number | null;
  format: string; term: string; contact?: string; details: string;
};

type ProviderInfo = {
  bio: string;
  publicHref?: string;
  publicLabel?: string;
  redeemHref?: string;
  redeemLabel?: string;
};
type GiftValue = { forWhom: string; includes: string[]; result: string };

const PROVIDERS: Record<string, ProviderInfo> = {
  "Лариса Соколова": { bio:"Врач-офтальмолог и реабилитолог, врач антивозрастной медицины, D-доктор и клинический нутрициолог." },
  "Анна Рацун": { bio:"Психолог-сексолог, член Ассоциации сексологов России." },
  "Инна Мартынова": { bio:"Дипломированный психолог и коуч по отношениям, игропрактик, женский тренер и спикер мужских и женских сообществ." },
  "Евгения Цапина": { bio:"Психолог, коуч, расстановщик и энерготерапевт. Работает с повторяющимися жизненными сценариями и внутренними ограничениями." },
  "Дмитрий Елунин": { bio:"Интегративный психолог, супервизор ПСИ 2.0, телесно-ориентированный и групповой терапевт.", publicHref:"https://www.instagram.com/elunin_dmitry_psy", publicLabel:"Социальная сеть эксперта" },
  "Татьяна Щербакова": { bio:"Эксперт по знакомствам и замужеству, основательница «Академии замужества», лауреат премии «Женщина года - 2026»." },
  "Александр Кардашов": { bio:"Доктор психологии, семейный и перинатальный психолог, гипнотерапевт, акмеолог и НЛП-тренер.", publicHref:"https://www.instagram.com/alexkarpsy", publicLabel:"Социальная сеть эксперта" },
  "Ольга Жильникова": { bio:"Психолог-сексолог и телесный терапевт с опытом более 19 лет, мета-тренер." },
  "Людмила Беликова": { bio:"Коуч, мастер восточных практик, специалист по нейрографике и работе с тибетскими поющими чашами." },
  "Олеся Дроздова": { bio:"Аттестованный советник по личным и семейным финансам." },
  "Виктория Оргеневская": { bio:"Бизнес-консультант и маркетолог с 2009 года, более 2500 консультаций, автор методики «Взлёт».", publicHref:"https://t.me/VZLET_probusiness", publicLabel:"Telegram-канал «Взлёт»" },
  "Мария": { bio:"Телесный терапевт, сексолог, энергопрактик и автор метода телесного самопрограммирования." },
  "Лала Попова": { bio:"Психолог по отношениям, реализации и психическому здоровью. Более 7500 часов индивидуальной практики.", publicHref:"https://t.me/Psycho_LalaPopova", publicLabel:"Telegram-канал психолога" },
  "Катия Шведова": { bio:"Мотивационный спикер, основательница клуба «Код Многомерности», спикер Синергии с 2018 года.", publicHref:"https://t.me/kod_mnogo", publicLabel:"Telegram-канал эксперта" },
  "Елена Солнечная": { bio:"Нейрокинезиолог, нейробиохакер, эксперт по эмоциональной устойчивости и постоянный эксперт федеральных телеканалов.", publicHref:"https://elenasun.ru/", publicLabel:"Сайт эксперта" },
  "Елена Забанова": { bio:"Врач и учёный, кандидат медицинских наук по двум специальностям, 47 лет профессионального стажа." },
  "MONTANA": { bio:"Магазин одежды культового джинсового бренда MONTANA.", publicHref:"https://montanajeans.ru/", publicLabel:"Сайт компании", redeemHref:"https://montanajeans.uds.app/c/certificates/receive?token=04c7dd44982d37430e3cb1b1c3e2944e1593bb7d3bc500fa7a7e638c9d7923d4", redeemLabel:"Получить сертификат MONTANA" },
  "Нуждички": { bio:"Сервис аренды вещей: техника, оборудование для мероприятий, товары для дома, отдыха, спорта и реабилитации - когда вещь нужна временно, а покупать её невыгодно.", publicHref:"https://nuzhdichki.ru/", publicLabel:"Каталог компании", redeemHref:"https://nuzhdikchki.uds.app/c/certificates/receive?token=ee4b0df8ad8fc61f2ee993a42b27906afcb352b8e7a9c0bbbcacbbafcd5a9ad0", redeemLabel:"Получить сертификат «Нуждички»" },
  "Боди Импульс": { bio:"Проект для запуска собственной SPA-студии. Сертификат уменьшает первоначальные затраты на открытие." },
};

const GIFT_VALUES: Record<string, GiftValue> = {
  sokolova:{forWhom:"Для тех, кто хочет увидеть связь энергии, стресса и самочувствия с показателями организма.",includes:["Мужской или женский список анализов в приложении Hello, Doc","Расшифровка полученных результатов","Персональная обратная связь врача"],result:"Понятная картина базового метаболического здоровья и рекомендации, на что обратить внимание дальше."},
  ratsun:{forWhom:"Для мужчин, женщин и пар при снижении желания, отказах, напряжении и конфликтах вокруг близости.",includes:["90-минутная диагностическая встреча","Определение причины охлаждения","Разбор сценария, который поддерживает дистанцию","Персональные следующие шаги"],result:"Карта причин потери близости и конкретный маршрут восстановления контакта без давления и обвинений."},
  "martynova-game":{forWhom:"Для тех, кто застрял в повторяющемся сценарии и хочет не разговор, а глубокую практическую работу с запросом.",includes:["Предварительное уточнение запроса","Индивидуальная трансформационная игра","Разбор решений и внутренних ограничений","Фиксация следующих действий"],result:"Новый взгляд на ситуацию, обнаружение скрытой точки выбора и понятные действия после игры."},
  "martynova-club":{forWhom:"Для тех, кому важны регулярная поддержка, среда и системное движение в течение года.",includes:["Год участия в закрытом клубе","Регулярные материалы и практики","Поддерживающая среда участников","Участие без доплаты"],result:"Не разовая консультация, а длительное сопровождение и пространство для устойчивых изменений."},
  "martynova-strategy":{forWhom:"Для человека с конкретной целью в отношениях, реализации или личном развитии, которому нужен план вместо хаотичных попыток.",includes:["90 минут индивидуальной работы","Аудит текущей точки и запроса","Выявление главных препятствий","Письменный план действий"],result:"Чёткая стратегия: что прекратить, на чём сфокусироваться и какие шаги делать в первую очередь."},
  tsapina:{forWhom:"Для тех, кто снова оказывается в похожей тупиковой ситуации и не понимает, что именно мешает двигаться.",includes:["60 минут индивидуальной работы","Аудит запроса и причин затруднений","Персональные рекомендации","Пошаговый план действий"],result:"Понимание механизма проблемы и первый рабочий маршрут выхода из замкнутого круга."},
  elunin:{forWhom:"Для повторяющихся сложностей в отношениях, выгорания, психосоматических проявлений и внутренних конфликтов.",includes:["90 минут в Zoom","Диагностика глубинной причины запроса","Выявление бессознательных стратегий","Индивидуальный план изменений"],result:"Понимание истинной причины ситуации и рекомендации по дальнейшей работе без дополнительной оплаты."},
  shcherbakova:{forWhom:"Для женщины, которая хочет знакомиться осознанно и перестать повторять неработающий сценарий выбора партнёра.",includes:["Предварительная диагностика истории отношений и цели","30-минутная личная встреча","Разбор сценария выбора мужчин","Экспресс-аудит анкеты и фотографий","Письменное резюме и три персональные точки роста"],result:"Готовая стратегия знакомств и конкретные правки, которые меняют позиционирование и качество выбора."},
  kardashov:{forWhom:"Для тех, кто хочет решить конкретную проблему в отношениях и получить не одну, а две последовательные встречи.",includes:["Две встречи по 60 минут","Глубокий аудит запроса","Рекомендации между встречами","План решения проблемы"],result:"Понимание причин, персональная стратегия и возможность начать решение уже в рамках пакета."},
  "zhilnikova-session":{forWhom:"Для запроса об отношениях, самооценке, финансах, проявленности, сексуальности или контакте с телом.",includes:["60 минут индивидуальной работы","Разбор телесных и эмоциональных реакций","Поиск точки блокировки","Практические рекомендации"],result:"Понимание, что влияет на состояние и какой шаг приблизит к желаемому результату."},
  "zhilnikova-game":{forWhom:"Для тех, кто хочет увидеть свои отношения в действии и безопасно потренировать новые способы контакта.",includes:["Участие в игре-тренажёре «РАППОРТ»","Разбор реальных жизненных ситуаций","Обратная связь психолога-сексолога","Взгляд участников противоположного пола"],result:"Наглядное понимание своего поведения в отношениях и новые способы выходить из конфликтов."},
  belikova:{forWhom:"Для женщины, которой важно перестать откладывать решение и вернуть себе ощущение опоры.",includes:["Диагностика главной ситуации","Определение страхов и ограничений","Выбор первого шага","План на ближайшие 72 часа"],result:"Не общие советы, а одно ясное решение, которое можно начать реализовывать сразу."},
  drozdova:{forWhom:"Для личного или семейного запроса, когда деньги приходят, но не остаются, а цели постоянно откладываются.",includes:["До 60 минут в Zoom","Диагностика финансового сценария","Разбор уязвимых мест бюджета","Документ с рекомендациями"],result:"Понимание, где теряются деньги, и конкретный план укрепления финансовой системы."},
  orgenevskaya:{forWhom:"Для эксперта или предпринимателя, который строит личный бренд с нуля либо хочет усилить существующий.",includes:["Интервью до 50 минут","Аудит позиционирования","Оценка перспективных направлений","Персональные рекомендации по развитию"],result:"Ясность, куда вкладывать силы в продвижении и какие направления нецелесообразны для вашей ниши."},
  maria:{forWhom:"Для запросов об отношениях, самооценке, сексе, проявленности, тревоге, напряжении и контроле.",includes:["60 минут индивидуальной онлайн-работы","Разбор ситуации через ум и тело","Выявление ключевого напряжения","Чёткие рекомендации"],result:"Больше лёгкости и ясности, снижение напряжения и понятные ответы по волнующей ситуации."},
  lala:{forWhom:"Для тех, кто не может встретить партнёра, переживает развод, потерю близости или страх новых отношений.",includes:["40 минут онлайн","Определение сценария отношений","Разбор причин проблемы","Персональные варианты решения"],result:"Понимание, что именно разрушает контакт, и первые шаги к более здоровому сценарию."},
  shvedova:{forWhom:"Для человека, который застрял, долго не может принять решение или чувствует, что привычная логика больше не помогает.",includes:["Диагностика по фотографии","Персональная аудиозапись","Консультация по итогам","Созвон в Zoom при необходимости"],result:"Ясность по запросу, следующий шаг, новый взгляд на ситуацию и ощущение внутренней опоры."},
  solnechnaya:{forWhom:"Для первого знакомства с методом и короткого разбора состояния или повторяющегося сценария.",includes:["20-минутный онлайн-приём","Экспресс-диагностика запроса","Рекомендация следующего шага"],result:"Быстрое понимание, с чем связана ситуация и подходит ли вам дальнейшая работа со специалистом."},
  "zabanova-health":{forWhom:"Для тех, кто хочет понимать возрастные изменения и поддерживать здоровье, красоту и энергию осознанно.",includes:["13 видеоуроков по 20 минут","Объяснение процессов старения простым языком","Конкретные советы по поддержке организма","Бессрочный доступ"],result:"Личная шпаргалка по здоровью, к которой можно возвращаться в любое время."},
  montana:{forWhom:"Для покупки одежды MONTANA через сервис партнёра.",includes:["Электронный сертификат номиналом 1000 ₽","Прямая ссылка на получение","Применение по правилам сервиса UDS"],result:"Экономия 1000 ₽ на покупке одежды бренда."},
  nuzhdichki:{forWhom:"Для тех, кому временно нужны проектор, колонка, бытовая техника, товары для отдыха, спорта, мероприятий или реабилитации.",includes:["Электронный сертификат на 1000 ₽","Доступ к каталогу аренды сервиса","Применение сертификата при оформлении аренды"],result:"Можно взять нужную вещь на время и не тратить полную стоимость на покупку."},
  "body-impulse":{forWhom:"Для специалиста или предпринимателя, который рассматривает запуск собственной SPA-студии.",includes:["Сертификат номиналом 50 000 ₽","Зачёт суммы в стоимость открытия студии","Знакомство с моделью запуска партнёра"],result:"Снижение первоначальных вложений в запуск SPA-студии на 50 000 ₽."},
};

const GIFTS: Gift[] = [
  { id:"sokolova", partner:"Лариса Соколова", title:"Чек-ап «Базовый метаболизм»", price:19900, quantity:25, format:"Онлайн", term:"До декабря 2026", contact:"https://vk.ru/upravlayglucozoy", details:"Мужской или женский список анализов, расшифровка результатов и персональная обратная связь. Лабораторные анализы оплачиваются отдельно." },
  { id:"ratsun", partner:"Анна Рацун", title:"Диагностическая сессия «Карта близости в паре»", price:7500, quantity:5, format:"Онлайн, 90 минут", term:"По предварительной записи", contact:"@annaratsun", details:"Разбор причин охлаждения, сценария дистанции и следующих шагов для мужчины, женщины или пары." },
  { id:"martynova-game", partner:"Инна Мартынова", title:"Индивидуальная трансформационная игра", price:20000, quantity:1, format:"По согласованию", term:"Уточняется", contact:"https://innamartynova.com/#rec643822789", details:"Индивидуальная трансформационная работа без доплаты." },
  { id:"martynova-club", partner:"Инна Мартынова", title:"Годовое участие в клубе", price:20000, quantity:1, format:"Онлайн", term:"Уточняется", contact:"https://innamartynova.com/#rec643822789", details:"Одно место в клубе на год без доплаты." },
  { id:"martynova-strategy", partner:"Инна Мартынова", title:"Стратегическая сессия", price:20000, quantity:3, format:"Онлайн, 90 минут", term:"Уточняется", contact:"https://innamartynova.com/#rec643822789", details:"Аудит запроса и письменный план действий." },
  { id:"tsapina", partner:"Евгения Цапина", title:"Индивидуальная встреча и план действий", price:10000, quantity:10, format:"60 минут", term:"Уточняется", contact:"@PozvoniteJeny", details:"Аудит запроса, причины затруднений, рекомендации и план дальнейших действий." },
  { id:"elunin", partner:"Дмитрий Елунин", title:"Диагностическая консультация по модели «МОЗГ»", price:10000, quantity:5, format:"Zoom, 90 минут", term:"До 31 декабря 2026", contact:"@Elunin_Dmitry_Psy", details:"Поиск глубинной причины запроса, бессознательных стратегий и индивидуальный план изменений." },
  { id:"shcherbakova", partner:"Татьяна Щербакова", title:"Персональная стратегия знакомств", price:15000, quantity:10, format:"Онлайн", term:"По согласованию", contact:"@sherbakova_sekret", details:"Диагностика, 30-минутная встреча, анализ сценария выбора партнёра и анкеты, письменное резюме." },
  { id:"kardashov", partner:"Александр Кардашов", title:"Две индивидуальные встречи", price:13000, quantity:3, format:"Онлайн или Москва", term:"В течение 30 дней после фестиваля", contact:"@alexkarpsy", details:"Две встречи по 60 минут: аудит запроса, рекомендации и план действий." },
  { id:"zhilnikova-session", partner:"Ольга Жильникова", title:"Индивидуальная сессия", price:7000, quantity:null, format:"Онлайн, 60 минут", term:"Уточняется", contact:"https://www.instagram.com/zhilnikova_olga", details:"Разбор запроса в отношениях, самореализации, финансах, проявленности или сексуальности." },
  { id:"zhilnikova-game", partner:"Ольга Жильникова", title:"Игра «РАППОРТ»", price:3000, quantity:null, format:"Групповая практика", term:"До 30 сентября 2026", contact:"https://www.instagram.com/zhilnikova_olga", details:"Тренажёр отношений с разбором жизненных ситуаций и обратной связью психолога-сексолога." },
  { id:"belikova", partner:"Людмила Беликова", title:"Диагностическая сессия «Решение за 72 часа»", price:5000, quantity:10, format:"Онлайн", term:"Для первых 10 участниц", contact:"https://vk.ru/lusibelikova", details:"Определение главной ситуации, страхов и первого практического шага на ближайшие 72 часа." },
  { id:"drozdova", partner:"Олеся Дроздова", title:"Диагностика финансового состояния", price:7000, quantity:2, format:"Zoom, до 60 минут", term:"По предварительной записи", contact:"@DrozdovaOlesya", details:"Разбор запроса и документ с рекомендациями и дальнейшим планом действий." },
  { id:"orgenevskaya", partner:"Виктория Оргеневская", title:"Консультация по личному бренду", price:15000, quantity:15, format:"Видеоконференция, до 50 минут", term:"До конца 2026 года", contact:"@gostinaya_optimistki", details:"Интервью и рекомендации по созданию или развитию личного бренда." },
  { id:"maria", partner:"Мария", title:"Индивидуальная встреча по любому запросу", price:15000, quantity:5, format:"Онлайн, 60 минут", term:"В течение месяца", contact:"@mariwwonder", details:"Отношения, самооценка, секс, проявленность, телесная чувственность, тревога или контроль." },
  { id:"lala", partner:"Лала Попова", title:"Разбор сценариев в отношениях", price:8000, quantity:5, format:"Онлайн, 40 минут", term:"В течение месяца после фестиваля", contact:"@Lala_Popova", details:"Причины сложностей и решения для знакомств, пары, близости, развода или страха отношений." },
  { id:"shvedova", partner:"Катия Шведова", title:"Диагностика «Голос души»", price:50000, quantity:10, format:"По фото, онлайн", term:"По предварительной записи", contact:"@Katiya_ya", details:"Индивидуальная диагностика, аудиозапись и консультация по итогам." },
  { id:"solnechnaya", partner:"Елена Солнечная", title:"Подарочный приём", price:7000, quantity:null, format:"Онлайн, 20 минут", term:"По записи", contact:"elenasun.ru", details:"Короткая консультация для знакомства со специалистом." },
  { id:"zabanova-health", partner:"Елена Забанова", title:"Программа «Навигатор по здоровью»", price:12000, quantity:null, format:"13 видеоуроков", term:"Бессрочный доступ", contact:"@elena_zabanova", details:"Понятно о возрастных изменениях тела, здоровье, красоте и жизненной энергии." },
  { id:"montana", partner:"MONTANA", title:"Подарочный сертификат", price:1000, quantity:null, format:"Электронный сертификат", term:"По условиям партнёра", contact:"montanajeans.uds.app", details:"Сертификат на покупку одежды MONTANA." },
  { id:"nuzhdichki", partner:"Нуждички", title:"Сертификат на аренду", price:1000, quantity:null, format:"Электронный сертификат", term:"По условиям партнёра", contact:"nuzhdikchki.uds.app", details:"Сертификат на 1 000 рублей для аренды нужных товаров." },
  { id:"body-impulse", partner:"Боди Импульс", title:"Открытие собственной SPA-студии", price:50000, quantity:null, format:"Сертификат", term:"Уточняется", details:"Подарок номиналом 50 000 рублей на открытие собственной SPA-студии." },
  { id:"women-temple", partner:"Храм Женщин", title:"Абонемент на четыре занятия", price:null, quantity:15, format:"Офлайн и онлайн", term:"Уточняется", contact:"@kristinaLaLuna", details:"Пробные занятия, абонементы, свечи и масло. Номинал и точные условия уточняются." },
  { id:"grelka", partner:"Грелка", title:"Посещение бани", price:null, quantity:null, format:"Физический сертификат", term:"Уточняется", contact:"https://vk.ru/grelka.club", details:"Бесплатное посещение бани. Номинал и количество уточняются." },
  { id:"secrets", partner:"Сикретс", title:"Посещение мастер-класса", price:null, quantity:null, format:"Физический сертификат", term:"Уточняется", details:"Бесплатное посещение мастер-класса. Номинал и количество уточняются." },
  { id:"meldey", partner:"Мелдей", title:"Сертификат на одежду", price:3000, quantity:null, format:"Электронный сертификат", term:"Уточняется", contact:"@MELDEY_CHAYANA", details:"Сертификат номиналом 3 000 рублей на одежду." },
];

function hashEmail(email: string) {
  const bytes = Array.from(new TextEncoder().encode(email.trim().toLowerCase()));
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  for (let shift = 24; shift >= 0; shift -= 8) bytes.push((high >>> shift) & 0xff);
  for (let shift = 24; shift >= 0; shift -= 8) bytes.push((low >>> shift) & 0xff);

  const state = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const constants = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ];
  const rotateRight = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Array<number>(64).fill(0);
    for (let index = 0; index < 16; index += 1) {
      const start = offset + index * 4;
      words[index] = ((bytes[start] << 24) | (bytes[start + 1] << 16) | (bytes[start + 2] << 8) | bytes[start + 3]) >>> 0;
    }
    for (let index = 16; index < 64; index += 1) {
      const s0 = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ (words[index - 15] >>> 3);
      const s1 = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ (words[index - 2] >>> 10);
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = state;
    for (let index = 0; index < 64; index += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + choice + constants[index] + words[index]) >>> 0;
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    state[0] = (state[0] + a) >>> 0; state[1] = (state[1] + b) >>> 0;
    state[2] = (state[2] + c) >>> 0; state[3] = (state[3] + d) >>> 0;
    state[4] = (state[4] + e) >>> 0; state[5] = (state[5] + f) >>> 0;
    state[6] = (state[6] + g) >>> 0; state[7] = (state[7] + h) >>> 0;
  }

  return state.map((word) => word.toString(16).padStart(8, "0")).join("");
}

const money = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";

function giftContact(gift: Gift) {
  const provider = PROVIDERS[gift.partner];
  if (provider?.redeemHref) return { href: provider.redeemHref, label: provider.redeemLabel || "Получить подарок" };
  const contact = gift.contact?.trim();
  if (!contact) return null;
  if (contact.startsWith("@")) return { href: `https://t.me/${contact.slice(1)}`, label: `Написать ${contact}` };
  if (contact.startsWith("http://") || contact.startsWith("https://")) return { href: contact, label: "Открыть контакт" };
  return { href: `https://${contact}`, label: `Открыть ${contact}` };
}

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
  const normalizedEmail = email.trim().toLowerCase();
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  async function login(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!emailReady) { setError("Введите почту полностью, например name@example.com."); return; }
    const testRecord = SHARED_TEST_ACCESS[normalizedEmail];
    const key = testRecord ? "" : await hashEmail(normalizedEmail);
    const record = testRecord || (access as Record<string, AccessRecord>)[key];
    if (!record) { setError("Эта почта не найдена среди билетов «Перезагрузка» и VIP. Проверьте адрес, указанный при покупке."); return; }
    setPerson(record); setCarts(Array.from({length: record.sets}, () => ({}))); setActiveSet(0);
  }

  function add(gift: Gift) {
    if (gift.price === null) return;
    if (cart[gift.id]) { setError("Каждый подарок можно выбрать только один раз на одного участника."); return; }
    const next = total + gift.price;
    if (next > budget) { setError(`Лимит превышен на ${money(next - budget)}.`); return; }
    setError(""); setCarts((current) => current.map((item, index) => index === activeSet ? { ...item, [gift.id]: 1 } : item));
  }

  function remove(gift: Gift) {
    setCarts((current) => current.map((item, index) => {
      if (index !== activeSet) return item;
      const copy = { ...item }; delete copy[gift.id]; return copy;
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
    <form onSubmit={login} className={styles.form} noValidate><label htmlFor="gift-email">Почта, указанная при покупке билета</label><div><input id="gift-email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} required value={email} onChange={(e)=>{setEmail(e.target.value);setError("");}} placeholder="name@example.com"/><button type="submit" disabled={!emailReady} style={emailReady ? undefined : {background:"#d9cec7",color:"#776c66",cursor:"not-allowed",opacity:.78}}>Открыть каталог</button></div></form>
    {error && <p className={styles.error}>{error}</p>}
    <p className={styles.note}>Если билет был «для двоих», откроются два отдельных набора с полным лимитом для каждого участника. По вопросам доступа: <a href="https://t.me/redheadlitle">@redheadlitle</a>.</p>
  </section></main>;

  if (finished) return <main className={styles.page}><section className={styles.finish}>
    <p className={styles.eyebrow}>НАБОР СФОРМИРОВАН</p><h1>Подарки и контакты</h1>
    <p className={styles.lead}>Всё готово: ниже открыты прямые контакты выбранных экспертов и компаний. Нажмите кнопку нужного подарка и договоритесь о получении напрямую. При обращении назовите почту из заказа и сохраните скриншот этой страницы.</p>
    <div className={styles.receipt}>{carts.map((setCart, index)=><section className={styles.receiptGroup} key={index}><h2>Участник {index + 1}</h2>{GIFTS.filter(g=>setCart[g.id]).map(g=>{const contact=giftContact(g);return <div className={styles.receiptItem} key={g.id}><b>{g.title}</b><span>{g.partner} · {setCart[g.id]} шт. · {g.price ? money(g.price * setCart[g.id]) : "номинал уточняется"}</span><small>{g.format} · {g.term}</small>{contact ? <a className={styles.contactButton} href={contact.href} target="_blank" rel="noreferrer">{contact.label} →</a> : <p className={styles.contactPending}>Контакт партнёра уточняется. Этот подарок пока нельзя оформить автоматически.</p>}</div>})}<strong>Итого: {money(setTotal(setCart))}</strong></section>)}</div>
    <div className={styles.summary}><span>Всего по всем наборам</span><b>{money(allTotal)}</b></div>
    <button className={styles.saveButton} onClick={()=>window.print()}>Сохранить контакты в PDF / распечатать</button>
    <p className={styles.savedNote}>Сделайте скриншот этого экрана, чтобы список подарков и активные контакты всегда были под рукой.</p>
  </section></main>;

  return <main className={styles.page}>
    <header className={styles.header}><div><p className={styles.eyebrow}>ВАШ ПОДАРОЧНЫЙ ФОНД</p><h1>Каталог подарков</h1><p>{person.tier === "vip" ? "Тариф VIP" : "Тариф «Перезагрузка»"}{person.sets > 1 ? ` · ${person.sets} набора` : ""}</p></div><a href="/">На главную</a></header>
    {person.sets > 1 && <div className={styles.setTabs}>{carts.map((setCart,index)=><button key={index} className={index === activeSet ? styles.setTabActive : styles.setTab} onClick={()=>{setActiveSet(index);setError("");}}><span>Участник {index + 1}</span><b>{money(setTotal(setCart))} из {money(budget)}</b></button>)}</div>}
    <div className={styles.budget}><div><span>Выбрано</span><b>{money(total)}</b></div><div><span>Доступно</span><b>{money(budget - total)}</b></div><div className={styles.bar}><i style={{width:`${Math.min(100,total/budget*100)}%`}}/></div></div>
    <div className={styles.tools}><input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Найти подарок или партнёра"/><span>{visible.length} подарков</span></div>
    {error && <p className={styles.error}>{error}</p>}
    <section className={styles.grid}>{visible.map(gift=>{const value=GIFT_VALUES[gift.id];const provider=PROVIDERS[gift.partner];return <article className={styles.card} key={gift.id}>
      <div className={styles.cardTop}><span>{gift.partner}</span>{gift.quantity !== null && <small>{gift.quantity} шт.</small>}</div>
      <h2>{gift.title}</h2>{provider && <p className={styles.bio}><b>Кто дарит</b>{provider.bio}</p>}
      {value ? <div className={styles.value}><p><b>Для кого</b>{value.forWhom}</p><div><b>Что входит</b><ul>{value.includes.map(item=><li key={item}>{item}</li>)}</ul></div><p className={styles.result}><b>Что получите</b>{value.result}</p></div> : <p>{gift.details}</p>}
      <dl><div><dt>Формат</dt><dd>{gift.format}</dd></div><div><dt>Срок</dt><dd>{gift.term}</dd></div></dl>
      {provider?.publicHref && <a className={styles.providerLink} href={provider.publicHref} target="_blank" rel="noreferrer">{provider.publicLabel || "Подробнее о партнёре"} ↗</a>}
      <div className={styles.cardBottom}><b>{gift.price === null ? "Номинал уточняется" : money(gift.price)}</b>{gift.price === null ? <button disabled>Скоро</button> : cart[gift.id] ? <button className={styles.chosen} onClick={()=>remove(gift)}>✓ Выбрано</button> : <button className={styles.choose} onClick={()=>add(gift)}>Выбрать</button>}</div>
    </article>})}</section>
    <aside className={styles.cart}><div><span>{person.sets > 1 ? `Участник ${activeSet + 1}: ` : ""}{selected.length ? `${selected.length} позиций` : "корзина пуста"}</span><b>{money(total)} из {money(budget)}</b></div><button disabled={!allReady} onClick={finishSelection}>{person.sets > 1 ? "Сформировать 2 набора" : "Сформировать набор"}</button></aside>
  </main>;
}
