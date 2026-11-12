"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { selectionEvent, type AdmissionContext } from "./admission-context";
import { tickets, ticketPrices, pairPrices, formatPrice, type TicketTier } from "./ticket-tariffs";
import { attribution, trackFunnelEvent } from "./funnel-tracking";
import "./festival-admission.css";

const apiBase = process.env.NEXT_PUBLIC_ADMISSIONS_API_URL?.replace(/\/$/, "") ?? "/api/admissions";
const tuqoFormEndpoint = process.env.NEXT_PUBLIC_TUQO_FORM_ENDPOINT?.trim();
class SubmissionError extends Error {
  constructor(message: string, readonly field?: string, readonly code = "network") { super(message); }
}
async function post(path: string, data: object) {
  const response = await fetch(`${apiBase}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) throw new SubmissionError(result?.error || "Не удалось отправить данные. Попробуйте ещё раз.", result?.field, result?.code || "server");
  return result;
}

async function submitTuqoForm(data: Record<string, FormDataEntryValue>, selection: AdmissionContext, requestId: string, shownAt: number) {
  if (!tuqoFormEndpoint || !/^https:\/\/api\.tuqo\.ru\/f\/[a-zA-Z0-9_-]+\/?$/.test(tuqoFormEndpoint)) {
    throw new SubmissionError("Приём заявок ещё не подключён. Пожалуйста, свяжитесь с организатором.", undefined, "configuration");
  }
  const fields = new URLSearchParams({
    "Имя": String(data.name ?? ""),
    "Телефон или Telegram": String(data.contact ?? ""),
    "E-mail": String(data.email ?? ""),
    "Формат участия": selection.format === "pair" ? "Вдвоём" : "Один",
    "Интересующий тариф": selection.tier ?? "Пока не выбрал",
    "Почему хотите прийти": String(data.reason ?? ""),
    "Согласие на обработку персональных данных": data.consent === "on" ? "Да" : "Нет",
    _request_id: requestId,
    _submit_time: String(shownAt),
  });
  const response = await fetch(tuqoFormEndpoint, { method: "POST", body: fields });
  if (response.ok) return;
  const messages: Record<number, string> = {
    400: "Проверьте заполнение полей и попробуйте ещё раз.",
    402: "Приём заявок временно недоступен. Пожалуйста, свяжитесь с организатором.",
    403: "Отправка с этого адреса сайта пока не разрешена. Пожалуйста, свяжитесь с организатором.",
    429: "Слишком много попыток. Подождите немного и отправьте заявку снова.",
  };
  throw new SubmissionError(messages[response.status] ?? "Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.", undefined, `tuqo_${response.status}`);
}

export default function FestivalAdmission() {
  const requestId = useRef<string | null>(null);
  const shownAt = useRef(Date.now());
  const [selection, setSelection] = useState<AdmissionContext>({ format: "single" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoResult, setPromoResult] = useState<{ checkoutUrl?: string; message: string; reference?: string } | null>(null);
  useEffect(() => {
    const select = (event: Event) => { if (event instanceof CustomEvent) setSelection(event.detail as AdmissionContext); };
    window.addEventListener(selectionEvent, select);
    return () => window.removeEventListener(selectionEvent, select);
  }, []);
  const clearFieldError = () => { if (fieldError) setFieldError(null); };
  const errorProps = (field: string) => ({ "aria-invalid": fieldError?.field === field || undefined, "aria-describedby": fieldError?.field === field ? `error-${field}` : undefined });
  const inlineError = (field: string) => fieldError?.field === field && <small className="admission-inline-error" id={`error-${field}`}>{fieldError.message}</small>;

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setSending(true); setError(""); setFieldError(null);
    requestId.current ??= crypto.randomUUID();
    try {
      if (tuqoFormEndpoint) {
        if (data.website) throw new SubmissionError("Не удалось отправить заявку. Проверьте поля и повторите попытку.", undefined, "honeypot");
        await submitTuqoForm(data, selection, requestId.current, shownAt.current);
        setSubmitted(true);
      } else {
        const result = await post("/applications", { name: data.name, contact: data.contact, email: data.email, format: selection.format, selectedTier: selection.tier, reason: data.reason, consent: data.consent === "on", website: data.website, requestId: requestId.current, attribution: attribution() });
        if (result.status !== "pending" || typeof result.reference !== "string") throw new Error("Не удалось подтвердить получение заявки. Попробуйте ещё раз.");
        setReference(result.reference);
        setSubmitted(true);
      }
      trackFunnelEvent("application_success", { tier: selection.tier, format: selection.format });
    } catch (failure) {
      const message = failure instanceof SubmissionError ? failure.message : "Не удалось подтвердить отправку заявки. Проверьте соединение и повторите попытку — повторная отправка не создаст дубликат.";
      setError(message);
      if (failure instanceof SubmissionError && failure.field) {
        setFieldError({ field: failure.field, message });
        const input = form.elements.namedItem(failure.field);
        if (input instanceof HTMLElement) input.focus();
      }
      trackFunnelEvent("application_error", { errorCode: failure instanceof SubmissionError ? failure.code : "network", tier: selection.tier, format: selection.format });
    } finally { setSending(false); }
  }
  async function checkPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking) return;
    setChecking(true); setPromoError(""); setPromoResult(null);
    const data = new FormData(event.currentTarget);
    try {
      const result = await post("/promo", { code: data.get("code"), attribution: attribution() });
      let checkoutUrl: string | undefined;
      if (result.checkoutUrl) {
        const target = new URL(result.checkoutUrl);
        if (target.protocol !== "https:") throw new Error("Ссылка на покупку временно недоступна.");
        checkoutUrl = target.href;
      }
      setPromoResult({ checkoutUrl, reference: result.reference, message: result.message || "Промокод подтверждён." });
    } catch (failure) {
      setPromoError(failure instanceof SubmissionError ? failure.message : "Не удалось проверить промокод. Проверьте соединение и повторите попытку.");
      trackFunnelEvent("promo_error", { errorCode: failure instanceof SubmissionError ? failure.code : "network" });
    } finally { setChecking(false); }
  }
  return <section className="section admission-section primary-section" id="admission"><div className="container">
    <div className="section-heading center-heading"><p className="section-label">15 / Ваш следующий шаг</p><h2>Какой вопрос вы<br /><span>принесёте в МЖ?</span></h2><p>Желание познакомиться. Разговор, который давно откладывали. Интерес к определённой теме. Или просто любопытство — каким может получиться этот вечер. Расскажите немного о себе и о том, почему хотите прийти.</p></div>
    <div className="admission-grid">
      <div className="admission-panel" id="application-form">
        {submitted ? <div className="admission-success" role="status" aria-live="polite"><p className="section-label">Спасибо за интерес к фестивалю</p><h3>Заявка получена</h3>{reference && <p>Номер заявки: <strong>{reference}</strong></p>}<p>Модератор рассмотрит заявку и свяжется с вами по указанному контакту. Решение об участии ещё не принято.</p></div> : <form method="post" onSubmit={apply} onInput={clearFieldError} onInvalidCapture={() => trackFunnelEvent("application_error", { errorCode: "browser_validation" })} aria-busy={sending}>
          <h3>Подать заявку</h3>
          <div className="admission-selection"><label htmlFor="admission-tier">Интересующий тариф <small className="admission-field-note">Можно выбрать сейчас или обсудить с модератором.</small><select id="admission-tier" name="selectedTier" value={selection.tier ?? ""} onChange={(event) => setSelection({ ...selection, tier: (event.target.value || undefined) as TicketTier | undefined })}><option value="">Пока не выбрал</option>{tickets.map((ticket) => <option key={ticket.tier} value={ticket.tier}>{ticket.name} · {formatPrice((selection.format === "pair" ? pairPrices : ticketPrices)[ticket.tier])}{selection.format === "pair" ? " за двоих" : " за одного"}</option>)}</select></label><p>Выбор тарифа в заявке не обязывает к оплате.</p></div>
          <div className="admission-fields">
            <label htmlFor="admission-name">Имя<input id="admission-name" name="name" autoComplete="name" required maxLength={100} {...errorProps("name")} />{inlineError("name")}</label>
            <label htmlFor="admission-contact">Телефон или Telegram<input id="admission-contact" name="contact" autoComplete="tel" placeholder="+7… / @username / t.me/username" required maxLength={100} {...errorProps("contact")} />{inlineError("contact")}</label>
            <label className="admission-wide" htmlFor="admission-email">E-mail<input id="admission-email" name="email" type="email" autoComplete="email" required maxLength={254} {...errorProps("email")} />{inlineError("email")}<small className="admission-field-note">Контакт для информации о вашем участии.</small></label>
            <fieldset className="admission-wide"><legend>Формат участия</legend><div className="admission-radio"><label><input name="format" type="radio" value="single" checked={selection.format === "single"} onChange={() => setSelection({ ...selection, format: "single" })} required />Один</label><label><input name="format" type="radio" value="pair" checked={selection.format === "pair"} onChange={() => setSelection({ ...selection, format: "pair" })} required />Вдвоём</label></div>{inlineError("format")}</fieldset>
            <label className="admission-wide" htmlFor="admission-reason">Почему хотите прийти?<textarea id="admission-reason" name="reason" required maxLength={2000} rows={3} placeholder="Что вам интересно: новые знакомства, время вдвоём, определённая тема или практика?" {...errorProps("reason")} />{inlineError("reason")}<small className="admission-field-note">Достаточно 1–2 предложений.</small></label>
          </div>
          <div className="admission-trap" aria-hidden="true"><label>Ваш сайт<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="admission-consent"><input name="consent" type="checkbox" required {...errorProps("consent")} /><span>Согласен на обработку персональных данных для рассмотрения заявки и связи со мной.</span></label>{inlineError("consent")}
          <details className="admission-consent-details"><summary>О согласии на обработку данных</summary><p>Даю организатору фестиваля МЖ согласие на обработку имени, контактных данных, e-mail, выбранных тарифа и формата участия и ответа в заявке для рассмотрения участия и связи по его результатам. Согласие можно отозвать, обратившись к организатору по контактам внизу сайта.</p></details>
          {error && <p className="admission-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={sending}>{sending ? "Отправляем…" : "Отправить заявку"}</button>
          <p className="admission-small">Отправка заявки не гарантирует одобрение участия.</p>
        </form>}
      </div>
      <div className="admission-panel admission-promo" id="promo-code"><p className="section-label">После одобрения</p><h3>У меня есть промокод</h3>{tuqoFormEndpoint ? <><p>Получили персональный промокод? Напишите организатору, чтобы уточнить покупку билета.</p><a className="secondary-button" href="mailto:aopetrukhin@gmail.com?subject=%D0%9C%D0%96%20%D0%A1%D0%B8%D1%82%D0%B8%20%E2%80%94%20%D0%BC%D0%BE%D0%B9%20%D0%BF%D1%80%D0%BE%D0%BC%D0%BE%D0%BA%D0%BE%D0%B4">Написать с промокодом</a></> : <><p>Введите персональный промокод, который вы получили от модератора.</p><form method="post" onSubmit={checkPromo} aria-busy={checking}><label htmlFor="admission-code">Промокод<input id="admission-code" name="code" autoComplete="off" autoCapitalize="characters" spellCheck={false} required maxLength={100} aria-invalid={Boolean(promoError) || undefined} aria-describedby={promoError ? "promo-error" : undefined} /></label>{promoError && <p className="admission-error" id="promo-error" role="alert">{promoError}</p>}<button className="secondary-button" type="submit" disabled={checking}>{checking ? "Проверяем…" : "Проверить промокод"}</button></form></>}
        {promoResult && <div className="admission-promo-result" role="status"><p>{promoResult.message}</p>{promoResult.checkoutUrl && <a className="primary-button" href={promoResult.checkoutUrl} target="_blank" rel="noreferrer" onClick={() => trackFunnelEvent("purchase_clicked", { applicationReference: promoResult.reference })}>Перейти к покупке билета</a>}</div>}
      </div>
    </div>
  </div></section>;
}
