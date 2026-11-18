export function AdmissionSteps() {
  return <div className="admission-steps" aria-label="Как попасть на фестиваль">
    <article><span>01</span><strong>Выберите тариф</strong><p>Для одного человека или для двоих.</p></article>
    <article><span>02</span><strong>Перейдите в Qtickets</strong><p>Выберите там билет с тем же названием и ценой.</p></article>
    <article><span>03</span><strong>Купите билет</strong><p>Оформите заказ на защищённой странице Qtickets.</p></article>
  </div>;
}
const questions = [
  { question: "Как купить билет?", answer: "Выберите формат и тариф на сайте, затем на странице Qtickets добавьте соответствующий билет в корзину и оформите заказ." },
  { question: "Можно прийти одному или вдвоём?", answer: "Да. В Qtickets есть отдельные билеты для одного человека и для двоих. Сверьте название и цену до оплаты." },
];
export default function FestivalParticipation() {
  return <div className="city-participation" id="participation"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">Покупка билетов</p><h2>Три шага<br /><span>до встречи</span></h2></div><p>Билеты продаются на Qtickets. Выберите на билетной странице тот же формат и тариф, который увидели здесь.</p></div>
    <AdmissionSteps />
    <div className="festival-question-list" id="questions">{questions.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
    <div className="organizer-contact"><div><h3>Есть свой вопрос?</h3><p>Команда фестиваля МЖ поможет уточнить формат и условия участия.</p></div><a className="secondary-button" href="https://t.me/redheadlitle" target="_blank" rel="noreferrer">Написать организатору</a></div>
  </div></div>;
}
