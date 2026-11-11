import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { admissions } from '../server/admissions.mjs';

function environment() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../drizzle/0000_festival_admissions.sql', import.meta.url), 'utf8'));
  sqlite.exec(readFileSync(new URL('../drizzle/0001_festival_funnel.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      let values = [];
      return {
        bind(...next) { values = next; return this; },
        async first() { return sqlite.prepare(sql).get(...values) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...values) }; },
        async run() { return sqlite.prepare(sql).run(...values); },
      };
    },
    async batch(statements) { sqlite.exec('BEGIN'); try { const results = []; for (const statement of statements) results.push(await statement.run()); sqlite.exec('COMMIT'); return results; } catch (error) { sqlite.exec('ROLLBACK'); throw error; } },
  };
  return { DB, sqlite, ADMISSIONS_ADMIN_EMAILS: 'moderator@example.test' };
}
const body = (extra = {}) => ({ name: 'Тестовый гость', contact: '@guest_test', email: 'guest@example.test', format: 'pair', reason: 'Хочу познакомиться с сообществом.', consent: true, requestId: crypto.randomUUID(), ...extra });
const request = (path, data, headers = {}) => new Request(`https://review.example.test/api/admissions/${path}`, { method: data ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Origin: 'https://review.example.test', ...headers }, ...(data ? { body: JSON.stringify(data) } : {}) });
const admin = { 'oai-authenticated-user-id': 'trusted-moderator', 'oai-authenticated-user-email': 'moderator@example.test' };

test('applications are persisted as pending, retries are idempotent and altered retries do not overwrite', async () => {
  const env = environment();
  const data = body();
  const first = await admissions(request('applications', data), env);
  assert.equal(first.status, 201);
  const saved = await first.json();
  assert.equal(saved.status, 'pending');
  assert.match(saved.reference, /^MZH-[A-F0-9]{10}$/);
  const record = env.sqlite.prepare('SELECT * FROM festival_applications').get();
  assert.equal(record.status, 'pending');
  assert.equal(record.format, 'pair');
  assert.equal(record.reason, data.reason);
  assert.ok(record.consent_at);
  const retried = await admissions(request('applications', data), env);
  assert.equal((await retried.json()).reference, saved.reference);
  assert.equal((await admissions(request('applications', { ...data, name: 'Другое имя' }), env)).status, 409);
  assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM festival_applications').get().n, 1);
  env.sqlite.close();
});

test('validation requires the requested fields and consent; failed storage never acknowledges receipt', async () => {
  const env = environment();
  for (const invalid of [{ consent: false }, { contact: '' }, { email: 'bad' }, { format: 'vip' }, { reason: '' }, { website: 'bot.example.test' }]) assert.equal((await admissions(request('applications', body(invalid)), env)).status, 400);
  assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM festival_applications').get().n, 0);
  const response = await admissions(request('applications', body()), { DB: { prepare() { throw Error('storage unavailable'); } } });
  assert.equal(response.status, 503);
  assert.ok(!(await response.json()).ok);
  env.sqlite.close();
});

test('only a moderator can approve; only approved active codes unlock the configured checkout', async () => {
  const env = environment();
  env.ADMISSIONS_CHECKOUT_URL = 'https://tickets.example.test/december';
  const saved = await (await admissions(request('applications', body()), env)).json();
  assert.equal((await admissions(request('admin/applications'), env)).status, 403);
  assert.equal((await admissions(request('admin/decision', { reference: saved.reference, status: 'approved' }), env)).status, 403);
  assert.equal((await admissions(request('promo', { code: 'UNAPPROVED' }), env)).status, 400);
  const decision = await (await admissions(request('admin/decision', { reference: saved.reference, status: 'approved' }, admin), env)).json();
  assert.ok(decision.code);
  const verified = await (await admissions(request('promo', { code: decision.code.toLowerCase() }), env)).json();
  assert.equal(verified.checkoutUrl, env.ADMISSIONS_CHECKOUT_URL);
  delete env.ADMISSIONS_CHECKOUT_URL;
  const unreleased = await (await admissions(request('promo', { code: decision.code }), env)).json();
  assert.ok(!unreleased.checkoutUrl);
  await admissions(request('admin/decision', { reference: saved.reference, status: 'rejected' }, admin), env);
  assert.equal((await admissions(request('promo', { code: decision.code }), env)).status, 400);
  env.sqlite.close();
});

test('foreign origins and repeated code guessing are rejected', async () => {
  const env = environment();
  assert.equal((await admissions(request('applications', body(), { Origin: 'https://foreign.example.test' }), env)).status, 403);
  for (let i = 0; i < 30; i++) assert.equal((await admissions(request('promo', { code: 'INVALID' }), env)).status, 400);
  assert.equal((await admissions(request('promo', { code: 'INVALID' }), env)).status, 429);
  env.sqlite.close();
});

test('funnel attribution persists once and metrics separate checkout clicks from payments', async () => {
  const env = environment();
  const visitId = crypto.randomUUID();
  const attribution = { visitId, utm_source: 'anna', utm_medium: 'partner', utm_campaign: 'mzh_dec03', utm_content: 'topic' };
  const event = { eventId: crypto.randomUUID(), event: 'page_view', attribution };
  assert.equal((await admissions(request('events', event), env)).status, 200);
  assert.equal((await admissions(request('events', { ...event, eventId: crypto.randomUUID() }), env)).status, 200);
  const saved = await (await admissions(request('applications', body({ attribution })), env)).json();
  const record = env.sqlite.prepare('SELECT * FROM festival_applications').get();
  assert.equal(record.utm_source, 'anna');
  assert.equal(record.visit_id, visitId);
  await admissions(request('admin/decision', { reference: saved.reference, status: 'approved' }, admin), env);
  await admissions(request('events', { eventId: crypto.randomUUID(), event: 'purchase_clicked', attribution }), env);
  assert.equal((await admissions(request('admin/metrics'), env)).status, 403);
  const metrics = await (await admissions(request('admin/metrics', null, admin), env)).json();
  assert.equal(metrics.events.page_view, 1);
  assert.equal(metrics.applications.received, 1);
  assert.equal(metrics.applications.approved, 1);
  assert.equal(metrics.events.purchase_clicked, 1);
  assert.equal(metrics.paymentTracking, 'not_connected');
  assert.equal(metrics.sources[0].source, 'anna');
  assert.equal(metrics.sources[0].applications, 1);
  assert.equal((await admissions(request('events', { ...event, event: 'payment_completed' }), env)).status, 400);
  env.sqlite.close();
});

test('analytics discards unrestricted values and never stores form contents in the event table', async () => {
  const env = environment();
  await admissions(request('events', { eventId: crypto.randomUUID(), event: 'page_view', attribution: { visitId: crypto.randomUUID(), utm_source: 'guest@example.test', utm_campaign: 'https://private.example.test/details' }, email: 'guest@example.test', reason: 'private answer' }), env);
  const record = env.sqlite.prepare('SELECT * FROM festival_funnel_events').get();
  assert.equal(record.utm_source, null);
  assert.equal(record.utm_campaign, null);
  assert.ok(!JSON.stringify(record).includes('guest@example.test'));
  assert.ok(!JSON.stringify(record).includes('private answer'));
  env.sqlite.close();
});
