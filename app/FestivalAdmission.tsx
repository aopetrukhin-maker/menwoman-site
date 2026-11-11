"use client";

import { useRef, useState, type FormEvent } from "react";
import "./festival-admission.css";

const apiBase = process.env.NEXT_PUBLIC_ADMISSIONS_API_URL?.replace(/\/$/, "") ?? "/api/admissions";

async function post(path: string, data: object) {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) throw new Error(result?.error || "Не удалось отправить данные. Попробуйте ещё раз.");
  return result;
}

export default function FestivalAdmission() {
  const requestId = useRef<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [checking, setChecking] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoResult, setPromoResult] = useState<{ checkoutUrl?: string; message: string } | null>(null);

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setSending(true); setError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const result = await post("/applications", {
        name: data.name, contact: data.contact, email: data.email, format: data.format,
        reason: data.reason, consent: data.consent === "on", website: data.website,
        requestId: requestId.current,
      });
      if (result.status !== "pending" || typeof result.reference !== "string") throw new Error("Не удалось подтвердить получение заявки. Попробуйте ещё раз.");
      setReference(result.reference);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Не удалось отправить заявку.");
    } finally { setSending(false); }
  }

  async function checkPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking) return;
    setChecking(true); setPromoError(""); setPromoResult(null);
    const data = new FormData(event.currentTarget);
    try {
      const result = await post("/promo", { code: data.get("code") });
      let checkoutUrl: string | undefined;
      if (result.checkoutUrl) {
        const target = new URL(result.checkoutUrl);
        if (target.protocol !== "https:") throw new Error("Ссылка на покупку временно недоступна.");
        checkoutUrl = target.href;
      }
      setPromoResult({ checkoutUrl, message: result.message || "Промокод подтверждён." });
    } catch (failure) {
      setPromoError(failure instanceof Error ? failure.message : "Не удалось проверить промокод.");
    } finally { setChecking(false); }
  }

  return <section className="section admission-section" id="admission">
    <div className="container">
      <div className="section-heading center-heading">
        <p className="section-label">Участие по заявке</p>
        <h2>Сначала <span>познакомимся</span></h2>
        <p>Участие по заявке. Мы формируем состав гостей фестиваля. Оставьте заявку - модератор свяжется с вами и сообщит решение. После одобрения вы получите персональный промокод для покупки билета.</p>
      </div>
      <div className="admission-grid">
        <div className="admission-panel" id="application-form">
          {reference ? <div className="admission-success" role="status" aria-live="polite">
            <p className="section-label">Спасибо за интерес к фестивалю</p>
            <h3>Заявка получена</h3>
            <p>Номер заявки: <strong>{reference}</strong></p>
            <p>Модератор рассмотрит заявку и свяжется с вами по указанному контакту. Решение об участии ещё не принято.</p>
          </div> : <form onSubmit={apply} aria-busy={sending}>
            <h3>Подать заявку</h3>
            <div className="admission-fields">
              <label htmlFor="admission-name">Имя<input id="admission-name" name="name" autoComplete="name" required maxLength={100} /></label>
              <label htmlFor="admission-contact">Телефон или Telegram<input id="admission-contact" name="contact" autoComplete="tel" placeholder="+7… или @username" required maxLength={100} /></label>
              <label className="admission-wide" htmlFor="admission-email">E-mail<input id="admission-email" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
              <fieldset className="admission-wide"><legend>Формат участия</legend><div className="admission-radio"><label><input name="format" type="radio" value="single" defaultChecked required />Один</label><label><input name="format" type="radio" value="pair" required />Вдвоём</label></div></fieldset>
              <label className="admission-wide" htmlFor="admission-reason">Почему хотите прийти?<textarea id="admission-reason" name="reason" required maxLength={2000} rows={5} /></label>
            </div>
            <div className="admission-trap" aria-hidden="true"><label>Ваш сайт<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            <label className="admission-consent"><input name="consent" type="checkbox" required /><span>Согласен на обработку персональных данных для рассмотрения заявки и связи со мной.</span></label>
            <details className="admission-consent-details"><summary>О согласии на обработку данных</summary><p>Даю организатору фестиваля МЖ согласие на обработку имени, контактных данных, e-mail, выбранного формата участия и ответа в заявке для рассмотрения участия и связи по его результатам. Согласие можно отозвать, обратившись к организатору по контактам внизу сайта.</p></details>
            {error && <p className="admission-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={sending}>{sending ? "Отправляем…" : "Отправить заявку"}</button>
            <p className="admission-small">Отправка заявки не гарантирует одобрение участия.</p>
          </form>}
        </div>
        <div className="admission-panel admission-promo" id="promo-code">
          <p className="section-label">После одобрения</p>
          <h3>У меня есть промокод</h3>
          <p>Введите персональный промокод, который вы получили от модератора.</p>
          <form onSubmit={checkPromo} aria-busy={checking}>
            <label htmlFor="admission-code">Промокод<input id="admission-code" name="code" autoComplete="off" autoCapitalize="characters" spellCheck={false} required maxLength={100} /></label>
            {promoError && <p className="admission-error" role="alert">{promoError}</p>}
            <button className="secondary-button" type="submit" disabled={checking}>{checking ? "Проверяем…" : "Проверить промокод"}</button>
          </form>
          {promoResult && <div className="admission-promo-result" role="status"><p>{promoResult.message}</p>{promoResult.checkoutUrl && <a className="primary-button" href={promoResult.checkoutUrl} target="_blank" rel="noreferrer">Перейти к покупке билета</a>}</div>}
        </div>
      </div>
    </div>
  </section>;
}
