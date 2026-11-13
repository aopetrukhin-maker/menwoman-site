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
  const fields = {
    name: String(data.name ?? ""),
    message: `Почему хотите прийти: ${String(data.reason ?? "")}`,
    "Телефон": String(data.phone ?? ""),
    "Telegram": String(data.telegram ?? ""),
    "Телефон или Telegram": [data.phone, data.telegram].map((value) => String(value ?? "")).filter(Boolean).join(" · "),
    "Формат участия": selection.format === "pair" ? "Вдвоём" : "Один",
    "Интересующий тариф": selection.tier ?? "Пока не выбрал",
    "Согласие на обработку персональных данных": data.consent === "on" ? "Да" : "Нет",
    _hp_a0d70926f3: "",
    _request_id: requestId,
    _submit_time: String(shownAt),
  };
  const response = await fetch(tuqoFormEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
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
    const phone = String(data.phone ?? "").trim();
    const telegram = String(data.telegram ?? "").trim();
    const contactError = (field: "phone" | "telegram", message: string) => { setFieldError({ field, message }); const input = form.elements.namedItem(field); if (input instanceof HTMLElement) input.focus(); };
    if (!phone && !telegram) { contactError("phone", "Укажите телефон или Telegram — достаточно одного контакта."); return; }
    if (phone && (!/^[+\d\s()\-]+$/.test(phone) || !/^\d{10,15}$/.test(phone.replace(/\D/g, "")))) { contactError("phone", "Укажите телефон с кодом страны."); return; }
    if (telegram && !/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(telegram.replace(/^(?:https?:\/\/)?t\.me\//i, "").replace(/\/$/, "").replace(/^@/, ""))) { contactError("telegram", "Укажите @username или t.me/username."); return; }
    setSending(true); setError(""); setFieldError(null);
    requestId.current ??= crypto.randomUUID();
    try {
      if (tuqoFormEndpoint) {
        if (data.website) throw new SubmissionError("Не удалось отправить заявку. Проверьте поля и повторите попытку.", undefined, "honeypot");
        await submitTuqoForm(data, selection, requestId.current, shownAt.current);
        setSubmitted(true);
      } else {
        const result = await post("/applications", { name: data.name, phone, telegram, format: selection.format, selectedTier: selection.tier, reason: data.reason, consent: data.consent === "on", website: data.website, requestId: requestId.current, attribution: attribution() });
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
  return <section className="section admission-section primary-section" id="admission"><div className="container">
    <div className="section-heading center-heading"><p className="section-label">15 / Ваш следующий шаг</p><h2>Какой вопрос вы<br /><span>принесёте в МЖ?</span></h2><p>Желание познакомиться. Разговор, который давно откладывали. Интерес к определённой теме. Или просто любопытство — каким может получиться этот вечер. Расскажите немного о себе и о том, почему хотите прийти.</p></div>
    <div className="admission-grid">
      <div className="admission-panel" id="application-form">
        {submitted ? <div className="admission-success" role="status" aria-live="polite"><p className="section-label">Спасибо за интерес к фестивалю</p><h3>Заявка получена</h3>{reference && <p>Номер заявки: <strong>{reference}</strong></p>}<p>Модератор рассмотрит заявку и свяжется с вами по указанному контакту. Решение об участии ещё не принято.</p></div> : <form method="post" onSubmit={apply} onInput={clearFieldError} onInvalidCapture={() => trackFunnelEvent("application_error", { errorCode: "browser_validation" })} aria-busy={sending}>
          <h3>Подать заявку</h3>
          <div className="admission-selection"><label htmlFor="admission-tier">Интересующий тариф <small className="admission-field-note">Можно выбрать сейчас или обсудить с модератором.</small><select id="admission-tier" name="selectedTier" value={selection.tier ?? ""} onChange={(event) => setSelection({ ...selection, tier: (event.target.value || undefined) as TicketTier | undefined })}><option value="">Пока не выбрал</option>{tickets.map((ticket) => <option key={ticket.tier} value={ticket.tier}>{ticket.name} · {formatPrice((selection.format === "pair" ? pairPrices : ticketPrices)[ticket.tier])}{selection.format === "pair" ? " за двоих" : " за одного"}</option>)}</select></label><p>Выбор тарифа в заявке не обязывает к оплате.</p></div>
          <div className="admission-fields">
            <label htmlFor="admission-name">Имя<input id="admission-name" name="name" autoComplete="name" required maxLength={100} {...errorProps("name")} />{inlineError("name")}</label>
            <label htmlFor="admission-phone">Телефон<input id="admission-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7 999 123-45-67" maxLength={100} {...errorProps("phone")} />{inlineError("phone")}</label>
            <label htmlFor="admission-telegram">Telegram<input id="admission-telegram" name="telegram" autoComplete="off" placeholder="@username" maxLength={100} {...errorProps("telegram")} />{inlineError("telegram")}</label>
            <p className="admission-wide admission-contact-note">Оставьте телефон или Telegram. Можно указать оба.</p>
            <fieldset className="admission-wide"><legend>Формат участия</legend><div className="admission-radio"><label><input name="format" type="radio" value="single" checked={selection.format === "single"} onChange={() => setSelection({ ...selection, format: "single" })} required />Один</label><label><input name="format" type="radio" value="pair" checked={selection.format === "pair"} onChange={() => setSelection({ ...selection, format: "pair" })} required />Вдвоём</label></div>{inlineError("format")}</fieldset>
            <label className="admission-wide" htmlFor="admission-reason">Почему хотите прийти?<textarea id="admission-reason" name="reason" required maxLength={2000} rows={3} placeholder="Что вам интересно: новые знакомства, время вдвоём, определённая тема или практика?" {...errorProps("reason")} />{inlineError("reason")}<small className="admission-field-note">Достаточно 1–2 предложений.</small></label>
          </div>
          <div className="admission-trap" aria-hidden="true"><label>Ваш сайт<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="admission-consent"><input name="consent" type="checkbox" required {...errorProps("consent")} /><span>Согласен на обработку персональных данных для рассмотрения заявки и связи со мной.</span></label>{inlineError("consent")}
          <details className="admission-consent-details"><summary>О согласии на обработку данных</summary><p>Даю организатору фестиваля МЖ согласие на обработку имени, телефона и/или Telegram, выбранных тарифа и формата участия и ответа в заявке для рассмотрения участия и связи по его результатам. Согласие можно отозвать, обратившись к организатору по контактам внизу сайта.</p></details>
          {error && <p className="admission-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={sending}>{sending ? "Отправляем…" : "Отправить заявку"}</button>
          <p className="admission-small">Отправка заявки не гарантирует одобрение участия.</p>
        </form>}
      </div>
    </div>
  </div></section>;
}
