const consentVersion = 'mzh-2026-12-03-v2';
const clean = (value) => typeof value === 'string' ? value.trim() : '';
const digest = async (value) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const funnelNames = new Set(['page_view', 'application_opened', 'application_clicked', 'application_viewed', 'application_success', 'application_error', 'promo_opened', 'promo_clicked', 'promo_viewed', 'promo_error', 'purchase_clicked', 'tariffs_viewed', 'quiz_started', 'quiz_completed']);
const tiers = new Set(['start', 'reload', 'vip']);
const placements = new Set(['header', 'hero', 'mobile', 'mobile-menu', 'community', 'pricing', 'participation', 'tariff-start', 'tariff-reload', 'tariff-vip', 'connection-code', 'consultations', 'balance', 'reflection', 'dating', 'bonuses', 'bar', 'afterparty']);
const errorCodes = new Set(['name', 'contact', 'phone', 'telegram', 'email', 'format', 'reason', 'consent', 'selectedTier', 'request', 'conflict', 'promo', 'browser_validation', 'network', 'server']);

function cleanContext(input) {
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return { placement: placements.has(value.placement) ? value.placement : null, tier: tiers.has(value.tier) ? value.tier : null, format: ['single', 'pair'].includes(value.format) ? value.format : null, errorCode: errorCodes.has(value.errorCode) ? value.errorCode : null };
}
async function recordEvent(env, id, name, source, context = {}, reference = null) {
  if (!source.visitId) return;
  await env.DB.prepare('INSERT INTO festival_funnel_events (id, visit_id, event_name, utm_source, utm_medium, utm_campaign, utm_content, created_at, placement, selected_tier, participation_format, error_code, application_reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING').bind(id, source.visitId, name, source.utm_source, source.utm_medium, source.utm_campaign, source.utm_content, new Date().toISOString(), context.placement ?? null, context.tier ?? null, context.format ?? null, context.errorCode ?? null, reference).run();
}

function cleanAttribution(value) {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const result = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const text = clean(input[key]);
    result[key] = /^[\p{L}\p{N}._-]{1,80}$/u.test(text) ? text : null;
  }
  result.visitId = /^[a-f0-9-]{36}$/i.test(clean(input.visitId)) ? input.visitId : null;
  return result;
}

async function funnelMetrics(env) {
  const events = (await env.DB.prepare('SELECT event_name, COUNT(*) AS n FROM festival_funnel_events GROUP BY event_name').all()).results;
  const applications = await env.DB.prepare("SELECT COUNT(*) AS received, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved, SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END) AS rejected, ROUND(AVG(CASE WHEN reviewed_at IS NOT NULL THEN (julianday(reviewed_at)-julianday(created_at))*1440 END), 1) AS review_minutes FROM festival_applications WHERE visit_id IS NOT NULL").first();
  const traffic = (await env.DB.prepare("SELECT COALESCE(utm_source, 'direct') AS source, COALESCE(utm_campaign, '') AS campaign, COUNT(*) AS views FROM festival_funnel_events WHERE event_name='page_view' GROUP BY source, campaign").all()).results;
  const leads = (await env.DB.prepare("SELECT COALESCE(utm_source, 'direct') AS source, COALESCE(utm_campaign, '') AS campaign, COUNT(*) AS applications, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved FROM festival_applications WHERE visit_id IS NOT NULL GROUP BY source, campaign").all()).results;
  const sources = new Map();
  const empty = { views: 0, applications: 0, approved: 0, verified: 0, checkout: 0 };
  for (const row of traffic) sources.set(JSON.stringify([row.source, row.campaign]), { ...empty, ...row });
  for (const row of leads) { const key = JSON.stringify([row.source, row.campaign]); sources.set(key, { ...empty, ...sources.get(key), ...row }); }
  const returns = (await env.DB.prepare("SELECT COALESCE(utm_source, 'direct') AS source, COALESCE(utm_campaign, '') AS campaign, SUM(CASE WHEN event_name='promo_verified' THEN 1 ELSE 0 END) AS verified, SUM(CASE WHEN event_name='purchase_clicked' THEN 1 ELSE 0 END) AS checkout FROM festival_funnel_events WHERE event_name IN ('promo_verified', 'purchase_clicked') GROUP BY source, campaign").all()).results;
  for (const row of returns) { const key = JSON.stringify([row.source, row.campaign]); sources.set(key, { ...empty, ...sources.get(key), ...row }); }
  const contexts = (await env.DB.prepare("SELECT event_name, placement, selected_tier, participation_format, error_code, COUNT(*) AS n FROM festival_funnel_events WHERE event_name IN ('application_clicked', 'application_error', 'promo_error') GROUP BY event_name, placement, selected_tier, participation_format, error_code").all()).results;
  return { events: Object.fromEntries(events.map((row) => [row.event_name, row.n])), applications, sources: [...sources.values()], contexts, paymentTracking: 'not_connected' };
}

export function validateApplication(body) {
  const rawPhone = clean(body.phone);
  const rawTelegram = clean(body.telegram);
  const legacyContact = clean(body.contact);
  const splitContacts = body.phone !== undefined || body.telegram !== undefined;
  const data = {
    name: clean(body.name), contact: legacyContact, email: clean(body.email).toLowerCase(),
    format: body.format, reason: clean(body.reason), requestId: clean(body.requestId), consent: body.consent,
  };
  const invalid = (field, error) => ({ error, field, code: field });
  if (body.website) return { error: 'Не удалось принять заявку. Проверьте заполнение формы.', code: 'request' };
  if (data.name.length < 1 || data.name.length > 100) return invalid('name', 'Укажите имя длиной до 100 символов.');
  const normalizeTelegram = (value) => value.replace(/^(?:https?:\/\/)?t\.me\//i, '').replace(/\/$/, '').replace(/^@/, '');
  const validTelegram = (value) => /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(normalizeTelegram(value));
  const validPhone = (value) => /^[+\d\s()\-]+$/.test(value) && /^\d{10,15}$/.test(value.replace(/\D/g, ''));
  let normalizedContact;
  if (splitContacts) {
    if (!rawPhone && !rawTelegram) return invalid('phone', 'Укажите телефон или Telegram.');
    if (rawPhone && (rawPhone.length > 100 || !validPhone(rawPhone))) return invalid('phone', 'Укажите телефон с кодом страны.');
    if (rawTelegram && (rawTelegram.length > 100 || !validTelegram(rawTelegram))) return invalid('telegram', 'Укажите @username или t.me/username.');
    normalizedContact = [rawPhone && `${rawPhone.startsWith('+') ? '+' : ''}${rawPhone.replace(/\D/g, '')}`, rawTelegram && `@${normalizeTelegram(rawTelegram)}`].filter(Boolean).join(' · ');
  } else {
    if (legacyContact.length > 100 || (!validTelegram(legacyContact) && !validPhone(legacyContact))) return invalid('contact', 'Укажите телефон с кодом страны, @username или ссылку t.me/username.');
    normalizedContact = validTelegram(legacyContact) ? `@${normalizeTelegram(legacyContact)}` : `${legacyContact.startsWith('+') ? '+' : ''}${legacyContact.replace(/\D/g, '')}`;
  }
  if (splitContacts) data.contact = normalizedContact;
  if (data.email && (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) return invalid('email', 'Проверьте e-mail.');
  if (!['single', 'pair'].includes(data.format)) return invalid('format', 'Выберите формат участия: один или вдвоём.');
  if (!data.reason || data.reason.length > 2000) return invalid('reason', 'Ответьте, почему хотите прийти. Не более 2000 символов.');
  if (data.consent !== true) return invalid('consent', 'Для отправки нужно согласие на обработку персональных данных.');
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(data.requestId)) return { error: 'Не удалось подготовить отправку. Повторите попытку.', code: 'request' };
  if (body.selectedTier != null && body.selectedTier !== '' && !tiers.has(body.selectedTier)) return invalid('selectedTier', 'Выберите тариф из списка.');
  // Keep the legacy fingerprint stable for existing applications without a selected tariff.
  if (tiers.has(body.selectedTier)) data.selectedTier = body.selectedTier;
  return { data, normalizedContact };
}

function isAdmin(request, env) {
  const allowed = (env.ADMISSIONS_ADMIN_EMAILS || '').toLowerCase().split(',').map((value) => value.trim()).filter(Boolean);
  const email = (request.headers.get('oai-authenticated-user-email') || '').toLowerCase();
  return Boolean(request.headers.get('oai-authenticated-user-id')) && allowed.includes(email);
}

async function rateLimit(request, env, category, limit) {
  const bucket = Math.floor(Date.now() / 3600000);
  const identity = request.headers.get('cf-connecting-ip') || request.headers.get('oai-authenticated-user-id') || 'anonymous';
  const key = `${category}:${bucket}:${await digest(identity)}`;
  const row = await env.DB.prepare('INSERT INTO admission_rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key, (bucket + 1) * 3600000).first();
  return row.count <= limit;
}

async function handle(request, env, path) {
  if (!env.DB) return json({ error: 'Приём заявок временно недоступен. Попробуйте позже.' }, 503);
  const admin = path.startsWith('/api/admissions/admin/');
  if (admin && !isAdmin(request, env)) return json({ error: 'Доступ только у модератора.' }, 403);
  if (path === '/api/admissions/admin/applications' && request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT reference, name, contact, email, format, selected_tier, reason, status, created_at, reviewed_at, utm_source, utm_campaign FROM festival_applications ORDER BY created_at DESC LIMIT 200').all();
    return json({ ok: true, applications: rows.results });
  }
  if (path === '/api/admissions/admin/metrics' && request.method === 'GET') return json({ ok: true, ...await funnelMetrics(env) });
  if (request.method !== 'POST') return json({ error: 'Метод не поддерживается.' }, 405);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Ожидается JSON.' }, 415);
  if (Number(request.headers.get('content-length') || 0) > 16000) return json({ error: 'Слишком большой запрос.' }, 413);
  let body;
  try { const raw = await request.text(); if (raw.length > 16000) return json({ error: 'Слишком большой запрос.' }, 413); body = JSON.parse(raw); }
  catch { return json({ error: 'Не удалось прочитать данные формы.' }, 400); }
  if (!body || Array.isArray(body) || typeof body !== 'object') return json({ error: 'Некорректные данные формы.' }, 400);

  if (path === '/api/admissions/events') {
    if (!funnelNames.has(body.event) || body.event === 'promo_verified' || !/^[a-f0-9-]{36}$/i.test(clean(body.eventId))) return json({ error: 'Некорректное событие.' }, 400);
    let source = cleanAttribution(body.attribution);
    if (!source.visitId) return json({ error: 'Некорректный идентификатор просмотра.' }, 400);
    if (!await rateLimit(request, env, 'events', 300)) return json({ error: 'Слишком много событий.' }, 429);
    let reference = null;
    if (body.event === 'purchase_clicked' && /^MZH-[A-F0-9]{10}$/.test(clean(body.context?.applicationReference))) {
      const application = await env.DB.prepare("SELECT reference, utm_source, utm_medium, utm_campaign, utm_content FROM festival_applications WHERE reference=? AND status='approved'").bind(body.context.applicationReference).first();
      if (application) { reference = application.reference; source = { ...source, utm_source: application.utm_source, utm_medium: application.utm_medium, utm_campaign: application.utm_campaign, utm_content: application.utm_content }; }
    }
    await recordEvent(env, body.eventId, body.event, source, cleanContext(body.context), reference);
    return json({ ok: true });
  }

  if (path === '/api/admissions/applications') {
    const validation = validateApplication(body);
    if (validation.error) return json(validation, 400);
    if (!await rateLimit(request, env, 'application', 12)) return json({ error: 'Слишком много отправок. Повторите позже.' }, 429);
    const data = validation.data;
    const source = cleanAttribution(body.attribution);
    const payloadHash = await digest(JSON.stringify(data));
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const reference = `MZH-${id.replaceAll('-', '').slice(0, 10).toUpperCase()}`;
    await env.DB.prepare('INSERT INTO festival_applications (id, request_id, payload_hash, reference, name, contact, email, format, reason, status, consent_version, consent_at, created_at, utm_source, utm_medium, utm_campaign, utm_content, visit_id, selected_tier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(request_id) DO NOTHING').bind(id, data.requestId, payloadHash, reference, data.name, validation.normalizedContact, data.email, data.format, data.reason, 'pending', consentVersion, now, now, source.utm_source, source.utm_medium, source.utm_campaign, source.utm_content, source.visitId, data.selectedTier ?? null).run();
    const stored = await env.DB.prepare('SELECT reference, payload_hash FROM festival_applications WHERE request_id=?').bind(data.requestId).first();
    if (!stored || stored.payload_hash !== payloadHash) return json({ error: stored ? `Заявка ${stored.reference} уже получена с данными предыдущей отправки. Изменения пока не сохранены. Сообщите их организатору и назовите номер заявки.` : 'Не удалось проверить предыдущую отправку. Повторите попытку.', code: 'conflict' }, 409);
    // Acknowledgement confirms durable receipt only; moderation is a separate action.
    return json({ ok: true, status: 'pending', reference: stored.reference }, 201);
  }

  if (path === '/api/admissions/promo') {
    if (!await rateLimit(request, env, 'promo', 30)) return json({ error: 'Слишком много проверок. Повторите позже.' }, 429);
    const code = clean(body.code).normalize('NFKC').toUpperCase();
    if (!/^[\p{L}\p{N}_-]{4,100}$/u.test(code)) return json({ error: 'Проверьте промокод.', code: 'promo' }, 400);
    const promo = await env.DB.prepare('SELECT a.reference, a.utm_source, a.utm_medium, a.utm_campaign, a.utm_content FROM admission_promos p JOIN festival_applications a ON a.id=p.application_id WHERE p.code_hash=? AND p.active=1 AND a.status=?').bind(await digest(code), 'approved').first();
    if (!promo) return json({ error: 'Промокод не найден или больше не действует. Проверьте его или свяжитесь с модератором.', code: 'promo' }, 400);
    const visit = cleanAttribution(body.attribution);
    // Analytics failures must not prevent an approved guest from checking their code.
    try { await recordEvent(env, crypto.randomUUID(), 'promo_verified', { ...promo, visitId: visit.visitId }, {}, promo.reference); } catch { /* Best-effort measurement. */ }
    let checkoutUrl;
    try { const target = new URL(env.ADMISSIONS_CHECKOUT_URL); if (target.protocol === 'https:') checkoutUrl = target.href; } catch { /* Checkout is not released until the organizer supplies its URL. */ }
    return json({ ok: true, reference: promo.reference, ...(checkoutUrl ? { checkoutUrl } : {}), message: checkoutUrl ? 'Промокод подтверждён. Теперь можно перейти к покупке билета.' : 'Промокод подтверждён. Ссылка на покупку пока уточняется. Модератор сообщит, когда она будет доступна.' });
  }

  if (path === '/api/admissions/admin/decision') {
    if (!['approved', 'rejected'].includes(body.status)) return json({ error: 'Укажите решение.' }, 400);
    const application = await env.DB.prepare('SELECT id FROM festival_applications WHERE reference=?').bind(clean(body.reference)).first();
    if (!application) return json({ error: 'Заявка не найдена.' }, 404);
    const now = new Date().toISOString();
    const statements = [env.DB.prepare('UPDATE festival_applications SET status=?, reviewed_at=COALESCE(reviewed_at, ?) WHERE id=?').bind(body.status, now, application.id), env.DB.prepare('UPDATE admission_promos SET active=0 WHERE application_id=?').bind(application.id)];
    const code = body.status === 'approved' ? `MZH-${crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}` : null;
    if (code) statements.push(env.DB.prepare('INSERT INTO admission_promos (code_hash, application_id, active, created_at) VALUES (?, ?, 1, ?)').bind(await digest(code), application.id, now));
    await env.DB.batch(statements);
    return json({ ok: true, status: body.status, ...(code ? { code } : {}) });
  }
  return json({ error: 'Не найдено.' }, 404);
}

export async function admissions(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const allowed = !origin || origin === url.origin || origin === env.ADMISSIONS_ALLOWED_ORIGIN;
  if (!allowed) return json({ error: 'Недопустимый источник запроса.' }, 403);
  const cors = origin && origin !== url.origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' } : {};
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  let response;
  try { response = await handle(request, env, url.pathname.replace(/\/$/, '')); }
  catch { response = json({ error: 'Не удалось сохранить данные. Попробуйте ещё раз.' }, 503); }
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(cors)) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

export { isAdmin };
