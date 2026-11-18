"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const endpoint = process.env.NEXT_PUBLIC_ADMISSIONS_API_URL?.replace(/\/$/, "");

export default function SpeakerConsultationForm({ speaker, onClose }: { speaker: string; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const requestId = useRef<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("input[name=name]")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab") return;
      const elements = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]') ?? [])];
      if (!elements.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const phone = String(fields.phone ?? "").trim();
    const telegram = String(fields.telegram ?? "").trim();
    if (!phone && !telegram) { setError("Оставьте телефон или Telegram, чтобы мы могли ответить."); return; }
    if (phone && (!/^[+\d\s()\-]+$/.test(phone) || !/^\d{10,15}$/.test(phone.replace(/\D/g, "")))) { setError("Проверьте номер телефона с кодом страны."); return; }
    if (telegram && !/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(telegram.replace(/^(?:https?:\/\/)?t\.me\//i, "").replace(/\/$/, "").replace(/^@/, ""))) { setError("Укажите @username или ссылку t.me/username."); return; }
    if (fields.website) { setError("Не удалось отправить запрос. Попробуйте ещё раз."); return; }
    if (!endpoint || !endpoint.startsWith("https://")) { setError("Форма временно недоступна. Напишите организатору: noname.eventspb@gmail.com."); return; }
    requestId.current ??= crypto.randomUUID();
    setSending(true); setError("");
    try {
      const response = await fetch(`${endpoint}/applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: String(fields.name ?? "").trim(), phone, telegram, format: "single",
        reason: `Запрос на консультацию у ${speaker}. Вопрос: ${String(fields.question ?? "").trim()}`,
        consent: fields.consent === "on", website: fields.website,
        requestId: requestId.current,
      }) });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.status !== "pending" || typeof result?.reference !== "string") throw new Error(response.status === 429 ? "Слишком много попыток. Повторите позже." : result?.error || "Не удалось отправить запрос. Попробуйте ещё раз или напишите организатору.");
      setReference(result.reference);
      setSent(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Не удалось отправить запрос. Попробуйте ещё раз."); }
    finally { setSending(false); }
  }

  return <div className="consultation-modal-backdrop" role="presentation" onMouseDown={onClose}><div ref={dialog} className="consultation-modal" role="dialog" aria-modal="true" aria-labelledby="consultation-modal-title" onMouseDown={(event) => event.stopPropagation()}><button className="consultation-modal-close" type="button" onClick={onClose} aria-label="Закрыть форму">×</button>
    {sent ? <div className="consultation-success" role="status"><small>Запрос сохранён</small><h2 id="consultation-modal-title">Спасибо</h2><p>Получили ваш вопрос для {speaker}. Номер запроса: <strong>{reference}</strong>. Команда фестиваля свяжется с вами по указанному контакту. Запись зависит от расписания и свободных мест.</p><button className="recruitment-button" type="button" onClick={onClose}>Закрыть</button></div> : <><small>Экспертная зона МЖ</small><h2 id="consultation-modal-title">Запрос на консультацию</h2><p>Спикер: <strong>{speaker}</strong>. Оставьте вопрос заранее - мы свяжемся с вами и уточним возможность встречи.</p><form onSubmit={submit} aria-busy={sending}>
      <label>Ваше имя<input name="name" autoComplete="name" required maxLength={100} /></label>
      <div className="consultation-form-contacts"><label>Телефон<input name="phone" type="tel" autoComplete="tel" maxLength={100} placeholder="+7 999 123-45-67" /></label><label>Telegram<input name="telegram" maxLength={100} placeholder="@username" /></label></div>
      <span className="consultation-field-note">Достаточно одного контакта - телефона или Telegram.</span>
      <label>Ваш вопрос<textarea name="question" required maxLength={2000} rows={3} placeholder="Что хотите обсудить со спикером?" /></label>
      <label className="consultation-consent"><input name="consent" type="checkbox" required /><span>Согласен на обработку имени, контакта и вопроса для ответа на запрос о консультации.</span></label>
      <div className="consultation-honeypot" aria-hidden="true"><label>Ваш сайт<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p className="consultation-form-error" role="alert">{error}</p>}
      <button className="recruitment-button" type="submit" disabled={sending}>{sending ? "Отправляем..." : "Отправить запрос"}</button>
      <p className="consultation-field-note">Отправка запроса не гарантирует время консультации. Команда уточнит доступность спикера.</p>
    </form></>}
  </div></div>;
}
