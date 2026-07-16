"use client";

import { useEffect, useRef, useState } from "react";

type Speaker = {
  name: string;
  role: string;
  topic: string;
  description?: string;
  facts: string[];
  initials: string;
  tone: string;
  image?: string;
  imagePosition?: string;
};

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

type SpeakerRoute = {
  name: string;
  reason: string;
  question: string;
};

const ticketUrl = "https://qtickets.ru/organizer/50526?base_color=ea1e63";
const telegramUrl = "https://t.me/aopetrukhin";

const speakers: Speaker[] = [
  {
    name: "Александра Кардаш",
    role: "Магистр психологии, психолог бизнесменов и предпринимателей",
    topic: "«Взаимодействие в паре»: теория и практика",
    facts: [
      "Более 3000 часов практики в психосоматике и психологии телесности",
      "Танцевально-двигательный практик - 26 лет в танцах",
      "Духовный практик в традициях Раджа-йоги Патанджали",
    ],
    initials: "АК",
    tone: "rose",
    image: "/speakers/alexandra-kardash.webp",
    imagePosition: "center 38%",
  },
  {
    name: "Анна Рацун",
    role: "Психолог-сексолог, член Ассоциации сексологов России",
    topic: "Секс становится обязанностью",
    description:
      "Почему желание в паре постепенно исчезает, а близость превращается в обязанность? Анна разберет влияние усталости, тревоги и накопленных обид и покажет, как возвращать близость без давления, вины и взаимных претензий.",
    facts: ["Психолог в сфере сексологии", "Член Ассоциации сексологов России"],
    initials: "АР",
    tone: "plum",
    image: "/speakers/anna-ratsun.webp",
    imagePosition: "center 6%",
  },
  {
    name: "Инна Мартынова",
    role: "Психолог и коуч по отношениям, женский тренер",
    topic: "Хватит быть мамой своему мужчине",
    description:
      "Инна разберет сценарий «я сама, иначе все развалится», покажет, как избыточная ответственность разрушает уважение, желание и близость, и проведет практику, помогающую увидеть, где женщина давно живет за двоих.",
    facts: [
      "Дипломированный психолог и коуч по отношениям",
      "Игропрактик и спикер мужских и женских сообществ",
      "Автор статьи в журнале Prime One",
    ],
    initials: "ИМ",
    tone: "coral",
    image: "/speakers/inna-martynova.webp",
    imagePosition: "center 14%",
  },
  {
    name: "Евгения Цапина",
    role: "Психолог, коуч, расстановщик и энерготерапевт",
    topic: "Что мы на самом деле приносим в отношения",
    description:
      "Сценарии, родовые программы, деньги, страхи и ожидания - то, что незаметно входит в союз вместе с нами и влияет на его развитие.",
    facts: ["Психолог и коуч", "Нумеролог", "Энерготерапевт и расстановщик"],
    initials: "ЕЦ",
    tone: "ruby",
    image: "/speakers/evgenia-tsapina.webp",
    imagePosition: "center 25%",
  },
  {
    name: "Дмитрий Елунин",
    role: "Интегративный психолог и исследователь жизненных сценариев",
    topic: "Почему мы снова выбираем не тех людей?",
    description:
      "Через живой диалог и практику самоисследования участники увидят привычные модели поведения, почувствуют связь с собой и поймут, почему счастливые отношения начинаются с возвращения к своим желаниям и ценностям.",
    facts: [
      "Супервизор ПСИ 2.0",
      "Телесно-ориентированный и групповой терапевт",
      "Исследователь самоидентификации личности",
    ],
    initials: "ДЕ",
    tone: "night",
    image: "/speakers/dmitry-elunin.webp",
    imagePosition: "center 30%",
  },
  {
    name: "Сергей Шиц",
    role: "Мастер дыхательных и телесных практик",
    topic: "«Взаимодействие в паре»: теория и практика",
    facts: [
      "Автор идеи MOOD_DEALER",
      "Владелец онлайн-пространства и магазина MOOD_DEALER",
      "Владелец пространства телесных практик «Грот»",
    ],
    initials: "СШ",
    tone: "violet",
  },
  {
    name: "Таня Щербакова",
    role: "Основательница «Академии замужества», эксперт по отношениям",
    topic: "Как встретить мужчину мечты в большом городе?",
    facts: [
      "Философ и автор курсов по отношениям",
      "Модель GEO FASHION WEEK",
      "Лауреат премии «Женщина года - 2026»",
    ],
    initials: "ТЩ",
    tone: "rose",
    image: "/speakers/tanya-shcherbakova.webp",
    imagePosition: "center 28%",
  },
  {
    name: "Алёна Пересада",
    role: "БаЦзы-советник с опытом более 7 лет",
    topic: "Пространство между вами: как создать союз, в котором оба расцветают",
    description:
      "Алёна покажет, что каждый партнер приносит в отношения, где пара усиливает друг друга, а где невольно гасит, и чего сейчас не хватает союзу - опоры, движения, ясности, глубины или энергии.",
    facts: [
      "Более 7 лет изучает и применяет БаЦзы",
      "Помогает видеть периоды, возможности роста и особенности отношений",
    ],
    initials: "АП",
    tone: "violet",
    image: "/speakers/alena-peresada.webp",
  },
  {
    name: "Александр Кардашов",
    role: "Доктор психологии и семейный психолог",
    topic: "Вы не несовместимы. Вы просто неправильно ссоритесь",
    description:
      "Александр разберет четыре типа поведения в конфликте. Участники определят свой сценарий ссоры, поймут реакции партнера и получат способ остановить привычный конфликт до того, как оба снова наговорят лишнего.",
    facts: ["Семейный психолог и гипнотерапевт", "Перинатальный психолог", "Акмеолог и НЛП-тренер"],
    initials: "АК",
    tone: "night",
    image: "/speakers/alexander-kardashov.webp",
    imagePosition: "center 6%",
  },
  {
    name: "Ольга Жильникова",
    role: "Психолог-сексолог и телесный терапевт с опытом более 19 лет",
    topic: "КОД сексуальности. Как женщине вернуть себя, желание и вкус к жизни",
    description:
      "Ольга разберет, как на желание и близость влияют разрушительные отношения, гиперконтроль, абьюз, газлайтинг и телесные зажимы. Участницы определят свою точку блокировки и первый шаг к возвращению контакта с телом.",
    facts: ["Психолог с опытом более 19 лет", "Сексолог и телесный терапевт", "Мета-тренер"],
    initials: "ОЖ",
    tone: "coral",
    image: "/speakers/olga-zhilnikova.webp",
    imagePosition: "center 24%",
  },
  {
    name: "Люси Беликова",
    role: "Коуч, мастер восточных практик и специалист по нейрографике",
    topic: "Сильная, удобная, уставшая. Как женщина исчезает из собственной жизни",
    description:
      "Практика для женщин, которые привыкли справляться и жить в режиме «надо». Участницы увидят, кому отдают слишком много сил, что держится только на терпении и какой первый шаг поможет снова выбирать себя.",
    facts: ["Мастер восточных практик", "Работает с тибетскими поющими чашами", "Специалист по нейрографике"],
    initials: "ЛБ",
    tone: "plum",
    image: "/speakers/lucy-belikova.webp",
    imagePosition: "center 18%",
  },
  {
    name: "Олеся Дроздова",
    role: "Аттестованный советник по личным и семейным финансам",
    topic: "Почему деньги приходят, но не остаются?",
    description:
      "Олеся поможет определить финансовый сценарий, увидеть, где теряются деньги, почему в паре сложно договориться о расходах и целях и с какого шага начать формирование капитала.",
    facts: ["Аттестованный финансовый советник", "Консультант по личным финансам", "Консультант по семейным финансам"],
    initials: "ОД",
    tone: "ruby",
    image: "/speakers/olesya-drozdova.webp",
    imagePosition: "center 24%",
  },
  {
    name: "Виктория Орженевская",
    role: "Бизнес-консультант, маркетолог и автор методики «Взлёт»",
    topic: "Мой человек или не мой? Как понять, с кем строить отношения",
    description:
      "Виктория разберет, почему люди начинают отношения с надеждой, что партнер изменится. Участники определят красные и зеленые флаги, зоны компромисса и получат модель для оценки будущего отношений.",
    facts: [
      "Бизнес-консультант и маркетолог с 2009 года",
      "Более 2500 консультаций и опыт работы в 20 странах",
      "Лауреат премии «Женщина года - 2026»",
    ],
    initials: "ВО",
    tone: "violet",
    image: "/speakers/victoria-orgenevskaya.webp",
    imagePosition: "center 18%",
  },
  {
    name: "Мария Соломатина",
    role: "Телесный терапевт, сексолог и автор метода телесного самопрограммирования",
    topic: "Классный секс начинается не в постели",
    description:
      "Мария расскажет, как женский цикл, состояние тела и понимание своей природы влияют на желание и близость, что мужчинам важно знать о женской природе и как вернуть в отношения больше чувствительности.",
    facts: ["Телесный терапевт и сексолог", "Энергопрактик и натуропат", "Автор метода телесного самопрограммирования"],
    initials: "МС",
    tone: "coral",
    image: "/speakers/maria-solomatina.webp",
    imagePosition: "center 18%",
  },
  {
    name: "Светлана Федосеева",
    role: "Кризисный психолог с опытом более 20 лет",
    topic: "Хорошая не значит удобная: как перестать платить жизнью за чужие ожидания",
    description:
      "Светлана покажет, где утекают силы, как привычка быть хорошей влияет на отношения и самоценность и что делать, чтобы вернуть себе границы и право жить в соответствии со своими желаниями.",
    facts: [
      "Волонтер фонда Константина Хабенского с 2018 года",
      "Член Общероссийской профессиональной психотерапевтической лиги",
      "Преподаватель практических семинаров МПСУ",
    ],
    initials: "СФ",
    tone: "rose",
    image: "/speakers/svetlana-fedoseeva.webp",
    imagePosition: "center 18%",
  },
  {
    name: "Лариса Соколова",
    role: "Врач-офтальмолог, реабилитолог",
    topic: "Отношения начинаются не с психологии, а с состояния организма: глюкоза, стресс, энергия и здоровье",
    facts: [
      "Врач-офтальмолог и реабилитолог",
      "Врач антивозрастной медицины",
      "D-доктор",
      "Клинический нутрициолог",
    ],
    initials: "ЛС",
    tone: "plum",
    image: "/speakers/larisa-sokolova.webp",
    imagePosition: "center 38%",
  },
];

const heroSlides = [
  {
    name: "Александра Кардаш и Сергей Шиц",
    topic: "Взаимодействие в паре: теория и практика",
    image: "/speakers/kardash-shits.webp",
    imagePosition: "center 28%",
  },
  ...speakers
    .filter((speaker) => speaker.image && speaker.name !== "Александра Кардаш" && speaker.name !== "Сергей Шиц")
    .map((speaker) => ({
      name: speaker.name,
      topic: speaker.topic,
      image: speaker.image as string,
      imagePosition: speaker.imagePosition ?? "center center",
    })),
];

const formats = [
  {
    number: "01",
    title: "Главная сцена",
    text: "Выступления спикеров, панельные дискуссии, батлы и открытые обсуждения. Разные точки зрения и реальные способы решать конфликты.",
    image: "https://noname-events.ru/mj/main-scene.jpg",
  },
  {
    number: "02",
    title: "Нетворкинг-пространство",
    text: "Специальные форматы общения помогут познакомиться с людьми вашего уровня мышления и ценностей - для идей, партнерств и новых отношений.",
    image: "https://noname-events.ru/mj/networking.jpg",
  },
  {
    number: "03",
    title: "Экспертная маркет-зона",
    text: "50+ экспонентов, тематические зоны и личное общение с психологами, практиками и телесными специалистами. Можно получить консультацию и разбор.",
    image: "https://noname-events.ru/mj/market.jpg",
  },
  {
    number: "04",
    title: "Система браслетов",
    text: "Цвет браслета показывает, кто открыт к знакомству. А «Код связи» и специальные вопросы помогают начать не с формальностей, а с разговора о ценностях и намерениях.",
    image: "https://images.pexels.com/photos/118033/pexels-photo-118033.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    number: "05",
    title: "Еще больше форматов",
    text: "Партнерские активности, мастер-классы, speed dating, практики и открытый нетворкинг в течение всего фестивального дня.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=86",
  },
];

const audience = [
  {
    number: "01",
    label: "Если вы в поиске отношений",
    title: "Новый союз без старых сценариев",
    points: [
      "Поймете, почему выбираете «не тех» и как найти партнера с похожими ценностями",
      "Узнаете, как восстановиться после расставания и снова открыться любви",
      "Научитесь замечать тревожные сигналы еще в начале отношений",
    ],
  },
  {
    number: "02",
    label: "Если вы в отношениях",
    title: "Пара как команда, а не поле борьбы",
    points: [
      "Поймете, как слышать партнера и не превращать разговор в ссору",
      "Узнаете, как перестать конкурировать и стать настоящей командой",
      "Разберете модели финансовых отношений и разговор о деньгах без конфликтов",
    ],
  },
  {
    number: "03",
    label: "Если вы давно вместе",
    title: "Близость, которая выдерживает время",
    points: [
      "Поймете, как вернуть страсть и оставаться интересными друг другу",
      "Получите новые способы проходить кризисы без разрушения семьи",
      "Разберетесь, как не потерять себя в семье, быте и родительстве",
    ],
  },
];

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
  symbol: string;
  title: string;
  summary: string;
  blindSpot: string;
  questions: string[];
  route: SpeakerRoute[];
}> = {
  dialogue: {
    label: "Диалог",
    symbol: "Д",
    title: "Вам по пути с теми, с кем можно говорить прямо",
    summary: "Вам важны ясность намерений, честные слова и ощущение, что сложную тему можно обсудить, не разрушая контакт.",
    blindSpot: "Вы можете слишком долго искать окончательную определённость и принимать чужую осторожность за отсутствие интереса.",
    questions: [
      "О чём тебе особенно трудно говорить в отношениях?",
      "По каким словам и поступкам ты понимаешь, что человеку можно доверять?",
      "Как выглядит хороший конфликт, после которого пара становится ближе?",
    ],
    route: [
      {
        name: "Александр Кардашов",
        reason: "Его тема о сценариях ссор поможет понять, как сохранить прямой разговор, когда эмоции уже мешают слышать друг друга.",
        question: "Как остановить привычный сценарий ссоры до того, как оба закроются?",
      },
      {
        name: "Виктория Орженевская",
        reason: "Её выступление поможет отделить реальные признаки совместимости от ожиданий, догадок и надежды изменить партнёра.",
        question: "Как отличить несовместимость от страха близости или завышенных ожиданий?",
      },
    ],
  },
  support: {
    label: "Опора",
    symbol: "О",
    title: "Вы выбираете любовь, которую видно в поступках",
    summary: "Вам нужны надёжность, последовательность и партнёрство, в котором двое не конкурируют, а создают устойчивую общую жизнь.",
    blindSpot: "Иногда вы можете брать на себя слишком много ответственности и незаметно превращать заботу в контроль.",
    questions: [
      "Что для тебя означает быть командой в обычной жизни?",
      "В какой момент забота начинает ощущаться как контроль?",
      "Как ты обычно показываешь человеку: на меня можно положиться?",
    ],
    route: [
      {
        name: "Инна Мартынова",
        reason: "Её тема показывает, как забота незаметно превращается в гиперответственность, спасательство и контроль.",
        question: "Как перестать быть партнёру «мамой», не становясь при этом холодным человеком?",
      },
      {
        name: "Александра Кардаш",
        reason: "Телесная практика поможет заметить момент, когда поддержка перестаёт быть партнёрством и начинает истощать вас обоих.",
        question: "Как телом почувствовать, что поддержка уже превратилась в спасательство?",
      },
    ],
  },
  spark: {
    label: "Искра",
    symbol: "И",
    title: "Вам нужна связь, в которой жизнь становится ярче",
    summary: "Вас сближают энергия, телесность, юмор и новые впечатления. В отношениях для вас важно не только спокойствие, но и живое желание.",
    blindSpot: "Сильное притяжение может казаться доказательством совместимости раньше, чем вы успеете увидеть ценности и надёжность человека.",
    questions: [
      "Что помогает тебе сохранять интерес в долгих отношениях?",
      "Какое совместное приключение ты хотел бы прожить в ближайший год?",
      "Что для тебя важнее в притяжении: телесность, юмор или восхищение человеком?",
    ],
    route: [
      {
        name: "Мария Соломатина",
        reason: "Её тема связывает желание с состоянием тела, эмоциональным контактом и тем, что происходит между партнёрами вне спальни.",
        question: "Что возвращает желание, если отношения стали слишком предсказуемыми?",
      },
      {
        name: "Ольга Жильникова",
        reason: "Её подход поможет увидеть, где именно блокируется живость: в теле, накопленной усталости или отношениях.",
        question: "Как понять, где пропало желание: в теле, отношениях или накопленной усталости?",
      },
    ],
  },
  space: {
    label: "Пространство",
    symbol: "П",
    title: "Вы ищете близость, в которой не нужно терять себя",
    summary: "Для вас любовь совместима со свободой, личным ритмом и уважением границ. Вам важно, чтобы союз расширял жизнь обоих.",
    blindSpot: "За самостоятельностью иногда может прятаться страх показать потребность в другом человеке или попросить о поддержке.",
    questions: [
      "Что для тебя означает свобода внутри отношений?",
      "Как понять, что человеку нужно пространство, а не дистанция?",
      "В какой ситуации тебе особенно сложно попросить о помощи?",
    ],
    route: [
      {
        name: "Светлана Федосеева",
        reason: "Её тема подойдёт тем, кто хочет сохранять границы и собственный голос, не разрушая близость и доверие.",
        question: "Как отстаивать свои границы и не превращать разговор в дистанцию или конфликт?",
      },
      {
        name: "Люси Беликова",
        reason: "Её практика помогает заметить, где жизнь в режиме «надо» вытеснила собственные желания и личный ритм.",
        question: "Как снова выбирать себя, если я привыкла быть сильной и удобной для всех?",
      },
    ],
  },
  depth: {
    label: "Глубина",
    symbol: "Г",
    title: "Вам важна встреча не ролей, а настоящих людей",
    summary: "Вы ищете смысл, эмоциональную честность и возможность быть увиденным целиком — не только сильным, удобным или успешным.",
    blindSpot: "Вы можете ждать мгновенной глубины и недооценивать отношения, которым нужно время, лёгкость и совместный опыт.",
    questions: [
      "Что ты хотел бы, чтобы близкий человек понимал о тебе без объяснений?",
      "Какая часть тебя редко получает место в отношениях?",
      "Что для тебя значит быть эмоционально доступным?",
    ],
    route: [
      {
        name: "Дмитрий Елунин",
        reason: "Его выступление поможет отличить настоящую эмоциональную глубину от повторения знакомого болезненного сценария.",
        question: "Как понять, что это глубокая связь, а не очередное повторение старого сценария?",
      },
      {
        name: "Алёна Пересада",
        reason: "Её тема раскрывает, чего сейчас не хватает союзу, чтобы оба партнёра могли развиваться и усиливать друг друга.",
        question: "Чего чаще всего не хватает паре, чтобы оба росли и не подавляли друг друга?",
      },
    ],
  },
};

const connectionStatusCopy: Record<ConnectionStatus, string> = {
  search: "На фестивале цвет браслета поможет увидеть, кто открыт к знакомству. А ваш код и вопросы для разговора помогут быстрее перейти от формальностей к ценностям и намерениям.",
  relationship: "Пройдите тест вдвоём и сравните результаты. На фестивале программа даст вам общий контекст, чтобы обсудить близость, деньги, конфликты и будущее без привычного сценария.",
  complicated: "Ваш результат не принимает решение за вас, но даёт язык для честного разговора. На фестивале вы сможете посмотреть на ситуацию через разные подходы экспертов.",
  self: "Понимание своего кода помогает замечать подходящих людей и не соглашаться на связь, в которой приходится отказываться от себя.",
};

const talkTopics = [
  "Почему успешные люди разрушают отношения",
  "Деньги в паре: общий бюджет или личная территория",
  "Взрослая любовь после 35",
  "Мужская ответственность в 2026 году",
  "Женская сила без конкуренции с мужчиной",
  "Психология измен в сильных парах",
  "Как сохранить страсть после 10 лет брака",
  "Сепарация от родителей без войны",
  "Карьера и семья без взаимных жертв",
  "Брак как партнерство: модель CEO + CEO",
];

const program = [
  {
    label: "Блок 1",
    title: "Сценарии выбора",
    topics: [
      "Почему мы снова выбираем не тех людей?",
      "Что мы на самом деле приносим в отношения: сценарии, родовые программы, деньги, страхи и ожидания",
    ],
  },
  {
    label: "Блок 2",
    title: "Поиск отношений",
    topics: ["Как встретить мужчину мечты в большом городе?"],
  },
  {
    label: "Блок 3",
    title: "Когда отношения уже начались",
    topics: [
      "Взаимодействие в паре. Теория и практика",
      "Вы не несовместимы. Вы просто неправильно ссоритесь",
    ],
  },
  {
    label: "Блок 4",
    title: "Близость",
    topics: ["Классный секс начинается не в постели", "Секс становится обязанностью"],
  },
  {
    label: "Блок 5",
    title: "Деньги",
    topics: ["Почему деньги приходят, но не остаются? Пять финансовых сценариев семьи"],
  },
  {
    label: "Блок 6",
    title: "Новый взгляд",
    topics: ["Пространство между вами: как БаЦзы помогает создать союз, в котором оба расцветают"],
  },
];

const partners = [
  { name: "Только по делу", image: "/partners/tolko.jpg" },
  { name: "Дворец Кваренги", image: "/partners/quarenghi.jpg" },
  { name: "БИЗ.Дельники", image: "/partners/bizdelniki.jpg" },
  { name: "Бизнес События СПБ", image: "/partners/busines.jpg" },
  { name: "ЯПокупаю", image: "/partners/pokupau.jpg" },
  { name: "Женский клуб Петербурга", image: "/partners/women-club.png" },
  { name: "ПроЯвись", image: "/partners/proyavis.jpg" },
  { name: "Дедушка Русского Пара", image: "/partners/dedushka.png" },
  { name: "Жанна Кузнецова", image: "/partners/kuznezova.jpg" },
  { name: "Body Impulse", image: "/partners/bi.png" },
  { name: "ADORO", image: "/partners/adoro.jpg" },
  { name: "от Паунти - где звучит", image: "/partners/paunty.jpg" },
];

const tickets = [
  {
    name: "Старт",
    price: "990 ₽",
    note: "Количество билетов по этой цене ограничено",
    nextPrice: "1 490 ₽",
    finalPrice: "1 990 ₽",
    description: "Для тех, кто хочет познакомиться с фестивалем, послушать экспертов и провести насыщенный день.",
    items: [
      "Вход на фестиваль на весь день",
      "Доступ ко всем выступлениям основной сцены",
      "Участие в общих практиках и интерактивах",
      "Доступ в экспертные и бренд-зоны",
      "Знакомства и открытый нетворкинг",
      "Электронная программа фестиваля",
      "Рабочая тетрадь участника фестиваля",
    ],
  },
  {
    name: "Перезагрузка",
    price: "1 990 ₽",
    note: "Самый выгодный тариф",
    nextPrice: "2 990 ₽",
    finalPrice: "3 990 ₽",
    description: "Для тех, кто хочет активно включиться, поработать со своими запросами и получить максимум пользы.",
    featured: true,
    items: [
      "Всё из тарифа «Старт»",
      "Места в приоритетной зоне перед сценой",
      "Отдельная быстрая регистрация без общей очереди",
      "Приоритетный доступ на практики с ограниченным количеством участников",
      "Возможность заранее выбрать одну экспертную мини-диагностику",
      "Рабочая тетрадь участника фестиваля",
      "Подарки и специальные предложения партнёров на сумму 50 000 рублей",
      "Доступ в закрытый Telegram-чат участников",
      "Полезные материалы от спикеров после события",
      "Видеозаписи выступлений",
    ],
  },
  {
    name: "VIP",
    price: "3 990 ₽",
    note: "Количество мест строго ограничено",
    nextPrice: "5 990 ₽",
    finalPrice: "7 990 ₽",
    description: "Максимальный уровень участия, личного общения и комфорта на фестивале.",
    items: [
      "Всё из тарифа «Перезагрузка»",
      "Лучшие места в первых рядах",
      "Отдельная VIP-регистрация",
      "Закрытая встреча и нетворкинг со спикерами, партнёрами и организаторами",
      "Приоритетная запись на экспертные разборы от спикеров",
      "Премиальный подарочный набор фестиваля",
      "Профессиональные фотографии с площадки",
      "Приглашение на закрытые встречи проекта после фестиваля",
    ],
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default function Home() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [cookieVisible, setCookieVisible] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
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
  const heroPointerStart = useRef<number | null>(null);
  const connectionQuizRef = useRef<HTMLDivElement>(null);
  const formatsRef = useRef<HTMLDivElement>(null);
  const speakersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCookieVisible(window.localStorage.getItem("mj-cookie-ok") !== "1");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedSpeaker ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedSpeaker]);

  useEffect(() => {
    if (heroPaused) return;

    const interval = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 1500);

    return () => window.clearInterval(interval);
  }, [heroPaused, heroSlideIndex]);

  const changeHeroSlide = (direction: -1 | 1) => {
    setHeroSlideIndex((current) => (current + direction + heroSlides.length) % heroSlides.length);
  };

  const startHeroSwipe = (clientX: number) => {
    heroPointerStart.current = clientX;
    setHeroPaused(true);
  };

  const finishHeroSwipe = (clientX: number) => {
    if (heroPointerStart.current !== null) {
      const distance = clientX - heroPointerStart.current;
      if (Math.abs(distance) > 34) changeHeroSlide(distance < 0 ? 1 : -1);
    }
    heroPointerStart.current = null;
    setHeroPaused(false);
  };

  const startConnectionQuiz = () => {
    setConnectionStep(0);
    setConnectionStatus(null);
    setConnectionScores({ dialogue: 0, support: 0, spark: 0, space: 0, depth: 0 });
    setConnectionResult(null);
    window.requestAnimationFrame(() => connectionQuizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const chooseConnectionStatus = (status: ConnectionStatus) => {
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

  const scrollSlider = (track: HTMLDivElement | null, direction: -1 | 1) => {
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * 0.86, 820), behavior: "smooth" });
  };

  const currentConnectionQuestion = connectionStep > 0 ? connectionQuestions[connectionStep - 1] : null;
  const primaryConnectionResult = connectionResult ? connectionResults[connectionResult.primary] : null;
  const secondaryConnectionResult = connectionResult ? connectionResults[connectionResult.secondary] : null;
  const connectionProgress = connectionResult ? 100 : Math.max(1, connectionStep + 1) / (connectionQuestions.length + 1) * 100;

  return (
    <main>
      <nav className="floating-nav" aria-label="Навигация по странице">
        <a className="nav-brand" href="#">
          <strong>Мужчина и Женщина</strong>
          <span>22 августа 2026</span>
        </a>
        <div className="nav-links">
          <a href="#connection-code"><span>●</span> Код связи</a>
          <a href="#speakers"><span>●</span> Спикеры</a>
          <a href="#program"><span>●</span> Программа</a>
          <a href="#partnership"><span>●</span> Партнерство</a>
          <a href="#pricing"><span>●</span> Тарифы</a>
          <a href="#bonuses"><span>●</span> Бонусы</a>
        </div>
        <details className="mobile-nav">
          <summary aria-label="Открыть меню">Меню</summary>
          <div>
            <a href="#connection-code">Код связи</a>
            <a href="#speakers">Спикеры</a>
            <a href="#program">Программа</a>
            <a href="#partnership">Партнерство</a>
            <a href="#pricing">Тарифы</a>
            <a href="#bonuses">Бонусы</a>
          </div>
        </details>
      </nav>

      <section className="hero">
        <div className="hero-overlay" />
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="container hero-inner reveal">
          <div className="eyebrow-row">
            <div className="eyebrow-item"><strong>Где</strong><span>Санкт-Петербург<br />Дворец Кваренги, Казанская 7</span></div>
            <div className="eyebrow-item"><strong>Когда</strong><span>22 августа 2026<br />Начало в 12:00</span></div>
          </div>
          <div className="hero-grid">
            <div>
              <p className="kicker">Фестиваль отношений нового времени</p>
              <h1>Мужчина и Женщина.<br /><em>Перезагрузка</em></h1>
              <p className="hero-lead">О любви, власти, деньгах и партнерстве в современном мире</p>
              <p className="hero-copy">За один день вы поймете, как выстроить взрослый союз, где карьера, деньги и амбиции не мешают близости с любимым человеком.</p>
              <div className="hero-actions">
                <a className="primary-button hero-button" href="#pricing"><span>Стать участником</span><i className="button-icon"><ArrowIcon /></i></a>
                <a className="hero-quiz-link" href="#connection-code"><b>90 секунд</b><span>Узнать свой код связи</span></a>
              </div>
            </div>
            <div className="hero-slider-column">
              <div
                className={`hero-date-card ${heroPaused ? "is-paused" : ""}`}
                aria-label="Спикеры фестиваля. Удерживайте, чтобы остановить, и листайте свайпом"
                onPointerDown={(event) => {
                  if (event.pointerType !== "mouse") return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  startHeroSwipe(event.clientX);
                }}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") finishHeroSwipe(event.clientX);
                }}
                onPointerCancel={() => {
                  heroPointerStart.current = null;
                  setHeroPaused(false);
                }}
                onTouchStart={(event) => startHeroSwipe(event.touches[0].clientX)}
                onTouchEnd={(event) => finishHeroSwipe(event.changedTouches[0].clientX)}
                onTouchCancel={() => {
                  heroPointerStart.current = null;
                  setHeroPaused(false);
                }}
              >
                <div className="hero-speaker-slides">
                  {heroSlides.map((slide, index) => (
                    <article
                      className={`hero-speaker-slide ${index === heroSlideIndex ? "is-active" : ""}`}
                      key={`${slide.name}-${index}`}
                      aria-hidden={index !== heroSlideIndex}
                    >
                      <img
                        src={slide.image}
                        alt={index === heroSlideIndex ? slide.name : ""}
                        style={{ objectPosition: slide.imagePosition }}
                        draggable={false}
                      />
                      <div className="hero-magazine-shade" />
                      <div className="hero-magazine-cover">
                        <div className="hero-magazine-copy">
                          <span>Спикер фестиваля</span>
                          <h2>{slide.name}</h2>
                          <p>{slide.topic}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div className="hero-slider-footer">
                <a className="hero-speaker-hint" href="#speakers">Подробнее смотрите в разделе «Спикеры»</a>
                <div className="hero-slider-controls" aria-label="Ручное переключение спикеров">
                  <button type="button" onClick={() => changeHeroSlide(-1)} aria-label="Предыдущий спикер"><ChevronIcon direction="left" /></button>
                  <button type="button" onClick={() => changeHeroSlide(1)} aria-label="Следующий спикер"><ChevronIcon direction="right" /></button>
                </div>
              </div>
            </div>
          </div>
          <div className="stats-bar">
            <div><strong>8 часов</strong><span>погружения</span></div>
            <div><strong>500+</strong><span>участников</span></div>
            <div><strong>16+</strong><span>спикеров</span></div>
            <div><strong>10+</strong><span>форматов</span></div>
          </div>
        </div>
      </section>

      <section className="section intro-section">
        <div className="container intro-grid">
          <div>
            <p className="section-label">Добро пожаловать на фестиваль</p>
            <h2>Не слушать про отношения.<br /><span>Начать понимать свои.</span></h2>
          </div>
          <div className="intro-copy">
            <p>Здесь не будет скучных лекций и универсальных советов про «идеальные отношения».</p>
            <p>Это пространство для честного разговора о том, как совмещать семью и личную реализацию в мире быстрых изменений.</p>
          </div>
        </div>
        <div className="container topic-marquee" aria-label="Темы фестиваля">
          <span>деньги и власть в паре</span>
          <span>близость после успеха</span>
          <span>кризисы длительных отношений</span>
          <span>измены и разводы</span>
        </div>
      </section>

      <section className="section connection-section" id="connection-code">
        <div className="container connection-shell">
          <div className="connection-pitch">
            <p className="section-label">Интерактив фестиваля · 90 секунд</p>
            <h2>С кем вам <span>действительно</span> по пути?</h2>
            <p className="connection-lead">Узнайте свой код связи — без гороскопов, банальных типологий и оценки «правильно» или «неправильно». Пройдите короткий тест.</p>
            <div className="connection-promises" aria-label="Что вы получите">
              <span>Ваш способ строить близость</span>
              <span>Возможная слепая зона</span>
              <span>3 вопроса для живого разговора</span>
              <span>Маршрут по спикерам фестиваля</span>
            </div>
            <button className="connection-flow-cue" type="button" onClick={() => connectionQuizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              <span>Начните здесь — пройдите короткий тест</span>
              <i><ArrowIcon /></i>
            </button>
          </div>

          <div className="connection-experience" id="connection-quiz" ref={connectionQuizRef}>
            {!connectionResult && (
              <div className="connection-question-card" aria-live="polite">
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
                  <p>Ваш код связи</p>
                  <div className="connection-code-lockup">
                    <span>{primaryConnectionResult.symbol}</span>
                    <i>×</i>
                    <span>{secondaryConnectionResult.symbol}</span>
                  </div>
                  <h3>{primaryConnectionResult.label} <em>×</em> {secondaryConnectionResult.label}</h3>
                  <strong>{primaryConnectionResult.title}</strong>
                  <p>{primaryConnectionResult.summary}</p>
                </div>

                <div className="connection-result-grid">
                  <article className="connection-blind-spot">
                    <span>Возможная слепая зона</span>
                    <p>{primaryConnectionResult.blindSpot}</p>
                  </article>
                  <article className="connection-secondary-code">
                    <span>Ваш второй код</span>
                    <strong>{secondaryConnectionResult.label}</strong>
                    <p>{secondaryConnectionResult.summary}</p>
                  </article>
                </div>

                <div className="connection-conversations">
                  <span>Три вопроса для настоящего разговора</span>
                  <ol>
                    {primaryConnectionResult.questions.map((question) => <li key={question}>{question}</li>)}
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
                    <span>Ваш маршрут по спикерам</span>
                    <h4>К кому подойти и о чём спросить</h4>
                    <p>Мы сопоставили ваш код с темами фестиваля. Эти выступления помогут разобрать именно те вопросы, которые сильнее всего влияют на ваш способ строить отношения.</p>
                  </div>
                  <div className="connection-speaker-route-list">
                    {primaryConnectionResult.route.map((speaker) => (
                      <article key={speaker.name}>
                        <a href="#speakers">{speaker.name}</a>
                        <p>{speaker.reason}</p>
                        <div><span>Спросите:</span> «{speaker.question}»</div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="connection-screenshot-tip">
                  <span>Сохраните результат</span>
                  <p>Сделайте скриншот этой карточки и отправьте партнёру или другу — так результат сохранится вместе с пояснениями и вопросами.</p>
                </div>

                <div className="connection-result-actions">
                  <a className="primary-button" href="#pricing"><span>Выбрать билет</span><i className="button-icon"><ArrowIcon /></i></a>
                  <button type="button" onClick={startConnectionQuiz}>Пройти ещё раз</button>
                </div>
                <small className="connection-disclaimer">Результат предназначен для саморефлексии и не является психологической диагностикой.</small>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section dark-section" id="audience">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="section-label">У каждого своя история</p>
              <h2><span>На любом этапе</span> - свой разговор и ответ</h2>
            </div>
            <p>Кто-то ищет любовь, кто-то возвращает близость, а кто-то хочет сделать хорошие отношения еще сильнее. Всех объединяет желание любить и быть любимым.</p>
          </div>
          <div className="audience-grid">
            {audience.map((item) => (
              <article className="audience-card" key={item.number}>
                <div className="card-top"><span>Сценарий</span><strong>{item.number}</strong></div>
                <p className="card-label">{item.label}</p>
                <h3>{item.title}</h3>
                <ul>
                  {item.points.map((point) => <li key={point}><b aria-hidden="true">•</b>{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section formats-section" id="festival-formats">
        <div className="container">
          <div className="section-heading center-heading">
            <p className="section-label">Вас ждет</p>
            <h2>Пять форматов <span>одного сильного дня</span></h2>
            <p>От общего опыта на главной сцене до точечных знакомств и личных разборов.</p>
          </div>
          <div className="formats-track" ref={formatsRef}>
            {formats.map((format) => (
              <article className="format-card" key={format.number}>
                {format.image ? (
                  <div className="format-image" style={{ backgroundImage: `url(${format.image})` }}>
                    <span>{format.number}</span>
                  </div>
                ) : (
                  <div className="format-graphic"><span>{format.number}</span><strong>МЖ</strong></div>
                )}
                <div className="format-content">
                  <h3>{format.title}</h3>
                  <p>{format.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="slider-footer">
            <div className="scroll-hint">Листайте карточки</div>
            <div className="slider-controls" aria-label="Навигация по форматам">
              <button type="button" onClick={() => scrollSlider(formatsRef.current, -1)} aria-label="Предыдущие форматы"><ChevronIcon direction="left" /></button>
              <button type="button" onClick={() => scrollSlider(formatsRef.current, 1)} aria-label="Следующие форматы"><ChevronIcon direction="right" /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="section why-section">
        <div className="container why-grid">
          <div className="why-number">70<span>%</span></div>
          <div>
            <p className="section-label">Почему так происходит</p>
            <h2>Проблемы часто начинаются, когда <span>карьера и самореализация идут в гору</span></h2>
            <p className="why-copy">Навыки, которые помогают зарабатывать и развиваться, могут убивать близость: привычка контролировать, нежелание быть уязвимым, вечная занятость и усталость.</p>
            <p className="date-accent">22 августа вы посмотрите на свои отношения по-новому и найдете работающую модель взрослого партнерства.</p>
          </div>
        </div>
      </section>

      <section className="section themes-section">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="section-label">Разберем честно</p>
              <h2>Реальные конфликты <span>современных пар</span></h2>
            </div>
            <p>Не абстрактная теория, а вопросы, которые влияют на выбор партнера, деньги, секс, доверие и будущее семьи.</p>
          </div>
          <div className="theme-list">
            {talkTopics.map((topic, index) => (
              <div key={topic}><span>{String(index + 1).padStart(2, "0")}</span><p>{topic}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section speakers-section" id="speakers">
        <div className="container">
          <div className="section-heading center-heading">
            <p className="section-label">Психологи · сексологи · коучи · терапевты</p>
            <h2>Спикеры <span>фестиваля</span></h2>
            <p>Каждое выступление - не просто лекция, а практика, которую можно применить в жизни.</p>
          </div>
          <div className="speakers-track" ref={speakersRef}>
            {speakers.map((speaker, index) => (
              <button className="speaker-card" key={speaker.name} onClick={() => setSelectedSpeaker(speaker)}>
                <div className={`speaker-visual ${speaker.tone}${speaker.image ? " has-photo" : ""}`}>
                  {speaker.image && (
                    <img src={speaker.image} alt={speaker.name} loading="lazy" style={{ objectPosition: speaker.imagePosition }} />
                  )}
                  <span className="speaker-index">{String(index + 1).padStart(2, "0")}</span>
                  {!speaker.image && <strong>{speaker.initials}</strong>}
                  <span className="speaker-open"><ArrowIcon /></span>
                  <span className="speaker-action">Нажмите - подробнее</span>
                </div>
                <div className="speaker-card-copy">
                  <h3>{speaker.name}</h3>
                  <p>{speaker.role}</p>
                  <span>Тема: {speaker.topic}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="slider-footer">
            <div className="scroll-hint">Нажмите на карточку, чтобы узнать подробнее</div>
            <div className="slider-controls" aria-label="Навигация по спикерам">
              <button type="button" onClick={() => scrollSlider(speakersRef.current, -1)} aria-label="Предыдущие спикеры"><ChevronIcon direction="left" /></button>
              <button type="button" onClick={() => scrollSlider(speakersRef.current, 1)} aria-label="Следующие спикеры"><ChevronIcon direction="right" /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta-card">
          <div>
            <p className="section-label">Открыт набор экспертов</p>
            <h2>Хотите стать <span>спикером фестиваля?</span></h2>
            <p>Если у вас есть уникальный опыт, исследования или практические кейсы в теме отношений, психологии, семьи или партнерства - оставляйте заявку.</p>
          </div>
          <a className="secondary-button" href={`${telegramUrl}?text=${encodeURIComponent("Хочу стать спикером фестиваля МЖ")}`} target="_blank" rel="noreferrer">Стать спикером <i className="button-icon"><ArrowIcon /></i></a>
        </div>
      </section>

      <section className="section program-section" id="program">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="section-label">22 августа · начало в 12:00</p>
              <h2>Программа <span>фестиваля</span></h2>
            </div>
            <p>Шесть смысловых блоков проведут вас от понимания собственных сценариев к новому взгляду на союз, близость и деньги.</p>
          </div>
          <div className="program-list">
            {program.map((block, index) => (
              <article className="program-card" key={block.label}>
                <div className="program-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="program-copy">
                  <span>{block.label}</span>
                  <h3>{block.title}</h3>
                  <ul>{block.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
          <p className="program-note">Программа может быть дополнена. Точный тайминг выступлений будет опубликован ближе к фестивалю.</p>
        </div>
      </section>

      <section className="section partners-section">
        <div className="container">
          <div className="section-heading center-heading">
            <p className="section-label">Сильные проекты рядом</p>
            <h2>Партнеры</h2>
          </div>
          <div className="partner-grid">
            {partners.map((partner) => (
              <div className="partner-card" key={partner.name}>
                <img src={partner.image} alt={partner.name} loading="lazy" />
                <strong>{partner.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section partnership-section" id="partnership">
        <div className="container partnership-card">
          <div className="partnership-copy">
            <p className="section-label">Для брендов и сообществ</p>
            <h2>Хотите стать <span>партнером фестиваля?</span></h2>
            <p>Заявите о своем бренде аудитории 500+ гостей, повысьте доверие и получите медийный охват. Обсудим формат, который решит именно вашу задачу.</p>
            <a className="primary-button" href={`${telegramUrl}?text=${encodeURIComponent("Хочу стать партнером фестиваля МЖ")}`} target="_blank" rel="noreferrer"><span>Стать партнером</span><i className="button-icon"><ArrowIcon /></i></a>
          </div>
          <div className="partnership-graphic"><span>500+</span><p>гостей фестиваля</p><b>Партнерство<br />с результатом</b></div>
        </div>
      </section>

      <section className="section pricing-section" id="pricing">
        <div className="container">
          <div className="section-heading center-heading">
            <p className="section-label">Выбирайте глубину участия</p>
            <h2>Билеты на <span>фестиваль</span></h2>
            <p>Один день, три формата. Чем выше тариф, тем больше личной работы, комфорта и доступа к экспертам.</p>
          </div>
          <div className="pricing-grid">
            {tickets.map((ticket) => (
              <article className={`price-card ${ticket.featured ? "featured" : ""}`} key={ticket.name}>
                  {ticket.featured && <div className="popular">Самый выгодный</div>}
                <div className="price-head"><h3>{ticket.name}</h3><strong>{ticket.price}</strong><span>{ticket.note}</span></div>
                <ul>{ticket.items.map((item) => <li className={item.includes("50 000") ? "gift-highlight" : ""} key={item}><b>✓</b>{item}</li>)}</ul>
                <p>{ticket.description}</p>
                <div className="price-timeline"><span>Следующая цена <b>{ticket.nextPrice}</b></span><span>Финальная цена <b>{ticket.finalPrice}</b></span></div>
                <a href={ticketUrl} target="_blank" rel="noreferrer">Купить билет <i className="button-icon"><ArrowIcon /></i></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bonus-section" id="bonuses">
        <div className="container">
          <div className="section-heading split-heading">
            <div><p className="section-label">Больше ценности</p><h2>Бонусы тарифа <span>«Перезагрузка»</span></h2></div>
            <p>Подарки и материалы будут пополняться по мере подтверждения партнёров и спикеров.</p>
          </div>
          <div className="bonus-grid">
            <article><span>01</span><h3>Подарки партнёров</h3><p>Специальные предложения и подарки общей ценностью до 50 000 рублей.</p></article>
            <article><span>02</span><h3>Материалы спикеров</h3><p>Практики, чек-листы и полезные материалы после фестиваля.</p></article>
            <article><span>03</span><h3>Закрытый чат</h3><p>Общение с участниками фестиваля и важная организационная информация.</p></article>
            <article><span>04</span><h3>Видеозаписи</h3><p>Доступ к записям выступлений, чтобы вернуться к главным идеям позже.</p></article>
          </div>
        </div>
      </section>

      <section className="section final-cta-section">
        <div className="container final-cta">
          <p>22 августа · Санкт-Петербург</p>
          <h2>Перезагрузите отношения.<br /><span>Не откладывайте жизнь на потом.</span></h2>
          <div>
            <a className="primary-button" href="#pricing"><span>Выбрать билет</span><i className="button-icon"><ArrowIcon /></i></a>
            <a className="text-button" href={`${telegramUrl}?text=${encodeURIComponent("Хочу стать спикером или партнером фестиваля МЖ")}`} target="_blank" rel="noreferrer">Стать спикером или партнером</a>
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container faq-grid">
          <div><p className="section-label">FAQ и логистика</p><h2>Перед тем как <span>приехать</span></h2><p>Ключевая информация о фестивале, площадке и формате участия.</p></div>
          <div className="faq-list">
            <details open>
              <summary>Что входит в билет на фестиваль?</summary>
              <p>Билет дает доступ к программе, выступлениям, интерактивным форматам, тематическим зонам и нетворкингу. Наполнение зависит от выбранного тарифа.</p>
            </details>
            <details>
              <summary>Где пройдет фестиваль и во сколько приезжать?</summary>
              <p>Санкт-Петербург, Дворец Кваренги, Казанская улица, 7. Начало в 12:00. Сбор гостей начинается заранее.</p>
            </details>
            <details>
              <summary>Можно ли прийти вдвоем?</summary>
              <p>Да. Фестиваль подходит и отдельным участникам, и парам. Для знакомства и общения предусмотрены специальные форматы.</p>
            </details>
            <details>
              <summary>Будут ли знакомства и общение?</summary>
              <p>Да. В программе есть speed dating, открытый нетворкинг, экспертная зона и дополнительные активности для знакомства.</p>
            </details>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-grid">
          <div><strong>МЖ</strong><p>Мужчина и Женщина.<br />Перезагрузка</p></div>
          <div><span>Контакты</span><a href="mailto:noname.eventspb@gmail.com">noname.eventspb@gmail.com</a><a href={telegramUrl} target="_blank" rel="noreferrer">Telegram: @aopetrukhin</a></div>
          <div><span>Адрес</span><p>Санкт-Петербург<br />Дворец Кваренги, Казанская 7</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Фестиваль «Мужчина и Женщина»</span><a href="#">Вернуться к началу</a></div>
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
              <p className="section-label">Спикер фестиваля</p>
              <h2 id="speaker-modal-title">{selectedSpeaker.name}</h2>
              <p className="modal-role">{selectedSpeaker.role}</p>
              <div className="modal-topic"><span>Тема выступления</span><strong>{selectedSpeaker.topic}</strong></div>
              {selectedSpeaker.description && <p className="modal-description">{selectedSpeaker.description}</p>}
              <ul>{selectedSpeaker.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
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
