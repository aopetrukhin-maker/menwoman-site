export function FestivalDating() {
  return <section className="section city-dating primary-section" id="dating">
    <div className="container dating-introduction">
      <div>
        <h2>Знакомства по желанию</h2>
        <p className="city-lead">Приходите самостоятельно или вдвоём. Система браслетов помогает понять, кто открыт к разговору, дружеским, романтическим или деловым знакомствам.</p>
        <div className="bracelet-meaning">
          <article><span className="bracelet-dot green" aria-hidden="true" /><div><h3>Зелёный</h3><p>Я открыт к общению. Можно подойти и познакомиться.</p></div></article>
          <article><span className="bracelet-dot red" aria-hidden="true" /><div><h3>Красный</h3><p>Сегодня хочу провести вечер без новых знакомств.</p></div></article>
        </div>
        <p className="city-fine-print">Выбирайте цвет по настроению. С любым браслетом можно слушать выступления и проводить вечер в своём кругу.</p>
      </div>
      <figure><img src="/visuals/bracelets-red-green.webp" alt="Зелёный и красный браслеты фестиваля" width="1200" height="900" loading="lazy" /></figure>
    </div>
  </section>;
}
export function FestivalBar() {
  return <section className="section city-bar primary-section" id="bar"><div className="container atmosphere-layout"><div className="bar-mark" aria-hidden="true"><svg viewBox="0 0 200 220"><path d="M30 35h140L100 115 30 35Zm70 80v70m-40 0h80M140 25l15-20"/><circle cx="123" cy="56" r="11"/></svg><span>МЖ · БАР</span></div><div><p className="section-label">Бар</p><h2>Разговоры<br /><span>продолжаются у бара</span></h2><p className="city-lead">Сделайте паузу между выступлениями, выберите напиток и продолжите разговор. На площадке работает бар с барменом.</p></div></div></section>;
}
export function FestivalAfterparty() {
  return <section className="section city-afterparty primary-section" id="afterparty"><div className="party-orbits" aria-hidden="true"><i/><i/><i/></div><div className="container"><p className="section-label">Афтепати</p><h2>Ближе к ночи<br /><em>меняем ритм.</em></h2><div className="party-description"><p>После программы — музыка, танцы и свободное общение. Оставайтесь до полуночи.</p><span>Фестиваль до 00:00</span></div></div></section>;
}
export function FestivalPartners({ partners }: { partners: { name: string; image: string }[] }) {
  return (
    <section className="section city-partners primary-section" id="partners">
      <div className="container">
        <h2>Партнёры МЖ</h2>
        <details className="review-partners">
          <summary>Все партнёры</summary>
          <div className="partner-grid festival-partner-grid">
            {partners.map(partner => (
              <div className="partner-card" key={partner.name}>
                <img src={partner.image} alt="" loading="lazy" />
                <strong>{partner.name}</strong>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
