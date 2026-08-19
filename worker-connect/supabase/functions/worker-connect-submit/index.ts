const PREVIEW_MODE = true;
const CONSENT_VERSION = '2026-08-15-v1';
const ALLOWED_ORIGINS = new Set(['https://andreialexandru4554xx.github.io']);
const TRADES = [
  'Labourer', 'Carpenter', 'Shuttering Carpenter', 'Dryliner', 'Painter & Decorator',
  'Electrician', 'Plumber', 'Bricklayer', 'Groundworker', 'Multi Trader',
  'Multi Skilled Worker', 'Fire Stopper', 'Telehandler', 'Forklift', 'Welfare / Cleaner',
  'Handyman', 'Site Manager / Supervisor', 'Steel Fixer', 'Traffic Marshal', 'Tiler',
  'Plasterer', 'Roofer', 'Dumper Driver', '360 Operator / Excavator Driver',
  'Tape & Jointer', 'Cladder', 'Scaffolder', 'Welder', 'Slinger / Signaller',
  'Duct Fitter', 'Hoist Operator', 'Banksman', 'Hod Carrier', 'Joiner',
  'Ceiling Fixer', 'Curtain Wall Fixer', 'Steel Erector', 'Pipe Fitter', 'Driver',
  'Altă meserie',
] as const;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const secretMap = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
const SERVICE_KEY = secretMap.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

function json(origin: string, body: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': origin,
      'Vary': 'Origin',
      ...extra,
    },
  });
}

function safe(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function normalizeName(value: unknown) {
  const name = safe(value, 80).replace(/\s+/g, ' ');
  const letters = [...name].filter((char) => /\p{L}/u.test(char));
  if (name.length < 2 || letters.length < 2 || !/^[\p{L}\p{M}'’ -]+$/u.test(name)) return null;
  if (new Set(letters.map((char) => char.toLocaleLowerCase('ro'))).size < 2) return null;
  return { raw: name, normalized: name.normalize('NFKC').toLocaleLowerCase('ro') };
}

function normalizePhone(value: unknown) {
  let digits = safe(value, 32).replace(/\D/g, '');
  if (digits.startsWith('0044')) digits = digits.slice(4);
  else if (digits.startsWith('44')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  if (!/^7\d{9}$/.test(digits)) return null;
  return { raw: safe(value, 32), e164: `+44${digits}`, key: digits };
}

function normalizePostcode(value: unknown) {
  const compact = safe(value, 12).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (compact.length < 5 || compact.length > 7) return null;
  const normalized = `${compact.slice(0, -3)} ${compact.slice(-3)}`;
  const pattern = /^(GIR 0AA|(?:(?:[A-PR-UWYZ][0-9]{1,2}|[A-PR-UWYZ][A-HK-Y][0-9]{1,2}|[A-PR-UWYZ][0-9][A-HJKPSTUW]|[A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRV-Y]) [0-9][ABD-HJLNP-UW-Z]{2}))$/;
  if (!pattern.test(normalized)) return null;
  return { raw: safe(value, 12), normalized, outward: normalized.split(' ')[0] };
}

function cleanCampaign(value: unknown) {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign'].map((key) => [key, safe(source[key], 80)]).filter(([, val]) => val));
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function rpc(name: string, body: Record<string, unknown>) {
  return fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') || '';
  if (!ALLOWED_ORIGINS.has(origin)) return json('null', { error: 'Origin not allowed' }, 403);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } });
  }
  if (request.method === 'GET') return json(origin, { preview: PREVIEW_MODE, consentVersion: CONSENT_VERSION, trades: TRADES });
  if (request.method !== 'POST') return json(origin, { error: 'Method not allowed' }, 405);
  if (Number(request.headers.get('content-length') || 0) > 12_000) return json(origin, { error: 'Request too large' }, 413);

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json(origin, { error: 'Invalid request' }, 400);
  if (safe(body.website, 10)) return json(origin, { ok: true });

  const name = normalizeName(body.fullName);
  const phone = normalizePhone(body.phone);
  const postcode = normalizePostcode(body.postcode);
  const trades = Array.isArray(body.trades) ? [...new Set(body.trades.map((trade) => safe(trade, 50)))].filter((trade) => TRADES.includes(trade as typeof TRADES[number])) : [];
  const otherTrade = safe(body.otherTrade, 50);
  const loadedAt = Date.parse(safe(body.pageLoadedAt, 40));
  const submissionId = safe(body.submissionId, 40);
  const validUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId);
  const errors: Record<string, string> = {};
  if (!name) errors.fullName = 'Introdu numele tău complet.';
  if (!phone) errors.phone = 'Introdu un număr mobil UK valid.';
  if (!postcode) errors.postcode = 'Introdu un postcode UK complet și valid.';
  if (trades.length < 1 || trades.length > 5) errors.trades = 'Alege între una și cinci meserii.';
  if (trades.includes('Altă meserie') && (otherTrade.length < 2 || otherTrade.length > 50)) errors.otherTrade = 'Descrie cealaltă meserie.';
  if (body.consent !== true || safe(body.consentVersion, 40) !== CONSENT_VERSION) errors.consent = 'Consimțământul pentru contact este obligatoriu.';
  if (!validUuid) errors.submissionId = 'Cererea nu este validă.';
  if (!Number.isFinite(loadedAt) || Date.now() - loadedAt < 2_000 || Date.now() - loadedAt > 7_200_000) errors.request = 'Reîncarcă pagina și încearcă din nou.';
  if (Object.keys(errors).length) return json(origin, { error: 'Verifică informațiile introduse.', fields: errors }, 400);

  if (PREVIEW_MODE) return json(origin, { error: 'Trimiterea reală este blocată în modul preview.', preview: true }, 423);
  const pepper = Deno.env.get('WORKER_CONNECT_HASH_PEPPER') || '';
  if (!SUPABASE_URL || !SERVICE_KEY || pepper.length < 24) return json(origin, { error: 'Serviciul nu este activat.' }, 503);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const fingerprint = await sha256(`${pepper}|${ip}|${request.headers.get('user-agent') || ''}`);
  const rateResponse = await rpc('worker_connect_rate_limit', { p_key_hash: fingerprint, p_limit: 5 });
  const allowed = rateResponse.ok && await rateResponse.json().catch(() => false) === true;
  if (!allowed) return json(origin, { error: 'Prea multe încercări. Încearcă mai târziu.' }, 429, { 'Retry-After': '600' });

  const response = await rpc('worker_connect_upsert', {
    p_submission_id: submissionId,
    p_full_name: name!.raw,
    p_full_name_normalized: name!.normalized,
    p_phone_raw: phone!.raw,
    p_phone_normalized: phone!.e164,
    p_phone_key: phone!.key,
    p_postcode_raw: postcode!.raw,
    p_postcode_normalized: postcode!.normalized,
    p_postcode_outward: postcode!.outward,
    p_trades: trades,
    p_other_trade: otherTrade,
    p_source: 'worker_connect_uk_public',
    p_campaign: cleanCampaign(body.campaign),
    p_consent: true,
    p_consent_version: CONSENT_VERSION,
    p_consent_timestamp: new Date().toISOString(),
    p_request_fingerprint: fingerprint,
  });
  if (!response.ok) return json(origin, { error: 'Datele nu au putut fi trimise.' }, 502);
  return json(origin, { ok: true });
});

