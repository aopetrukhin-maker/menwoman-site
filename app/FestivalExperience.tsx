export function AdmissionSteps() {
  return <div className="admission-steps" aria-label="Как попасть на фестиваль">
    <article><span>01</span><strong>Оставьте заявку</strong><p>Имя, контакты и пара предложений о том, почему хотите прийти.</p></article>
    <article><span>02</span><strong>Получите ответ</strong><p>Модератор свяжется по указанному телефону или в Telegram.</p></article>
    <article><span>03</span><strong>Купите билет</strong><p>После одобрения модератор расскажет, как оплатить выбранный тариф.</p></article>
  </div>;
}
const questions = [
  { question: "Зачем нужна заявка?", answer: "Мы формируем состав гостей фестиваля. Расскажите, что вам интересно: новые знакомства, время с партнёром, определённая тема или практика. Модератор рассмотрит заявку и сообщит решение. Отправка заявки не означает одобрение." },
  { question: "Когда и куда придёт ответ?", answer: "Решение сообщат по указанному телефону или в Telegram. Фиксированный срок рассмотрения пока не объявлен. Если хотите уточнить статус, напишите организатору и укажите имя и контакт из заявки." },
  { question: "Можно прийти одному или вдвоём?", answer: "Да. Выберите соответствующий формат в заявке. Если идёте вдвоём, оставьте контакт человека, с которым удобно связаться. Детали совместного участия модератор уточнит при общении. Цены парных билетов показаны в тарифах." },
  { question: "Как купить билет после одобрения?", answer: "Модератор свяжется с вами по телефону или в Telegram и сообщит актуальный способ покупки выбранного тарифа. Заявка сама по себе не обязывает к оплате." },
];
export default function FestivalParticipation() {
  return <div className="city-participation" id="participation"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">Участие по заявке</p><h2>Три шага<br /><span>до встречи</span></h2></div><p>Мы формируем состав гостей фестиваля. Расскажите, почему хотите прийти: модератор рассмотрит заявку и сообщит решение. После одобрения он поможет с покупкой билета.</p></div>
    <AdmissionSteps />
    <div className="festival-question-list" id="questions">{questions.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
    <div className="organizer-contact"><div><h3>Есть свой вопрос?</h3><p>Команда фестиваля МЖ поможет уточнить формат и условия участия.</p></div><a className="secondary-button" href="https://t.me/redheadlitle" target="_blank" rel="noreferrer">Написать организатору</a></div>
  </div></div>;
}
