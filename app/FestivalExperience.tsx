export function AdmissionSteps() {
  return <div className="admission-steps" aria-label="Как попасть на фестиваль">
    <article><span>01</span><strong>Оставьте заявку</strong><p>Имя, контакты и пара предложений о том, почему хотите прийти.</p></article>
    <article><span>02</span><strong>Получите решение</strong><p>Модератор свяжется по указанному телефону или в Telegram.</p></article>
    <article><span>03</span><strong>Используйте код</strong><p>После одобрения персональный промокод открывает переход к покупке билета.</p></article>
  </div>;
}
const questions = [
  { question: "Зачем нужна заявка?", answer: "Мы формируем состав гостей фестиваля. Расскажите, что вам интересно: новые знакомства, время с партнёром, определённая тема или практика. Модератор рассмотрит заявку и сообщит решение. Отправка заявки не означает одобрение." },
  { question: "Когда и куда придёт ответ?", answer: "Решение сообщат по указанному телефону или в Telegram. Фиксированный срок рассмотрения пока не объявлен. Если хотите уточнить статус, напишите организатору и назовите номер заявки." },
  { question: "Можно прийти одному или вдвоём?", answer: "Да. Выберите соответствующий формат в заявке. Если идёте вдвоём, оставьте контакт человека, с которым удобно связаться. Детали совместного участия модератор уточнит при общении. Цены парных билетов показаны в тарифах." },
  { question: "Что даёт промокод?", answer: "Это персональный код от модератора после одобрения заявки. Введите его в блоке «У меня есть промокод», чтобы перейти к покупке. Код подтверждает одобрение; возможная скидка должна быть отдельно указана в условиях покупки." },
];
export default function FestivalParticipation() {
  return <section className="section festival-questions primary-section" id="participation"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">07 / Как попасть</p><h2>Заявка. Решение. <span>Персональный код.</span></h2></div><p>Участие по заявке. Мы формируем состав гостей фестиваля. Оставьте заявку - модератор свяжется с вами и сообщит решение. После одобрения вы получите персональный промокод для покупки билета.</p></div>
    <AdmissionSteps />
    <div className="festival-question-list" id="questions">{questions.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
    <div className="organizer-contact"><div><h3>Есть свой вопрос?</h3><p>Команда фестиваля МЖ поможет уточнить формат и условия участия.</p></div><a className="secondary-button" href="https://t.me/redheadlitle" target="_blank" rel="noreferrer">Написать организатору ↗</a></div>
  </div></section>;
}
