'use strict';

const WORKER_CONNECT_CONFIG = Object.freeze({
  preview: true,
  endpoint: 'https://lmztoiikbgcaeztdweov.supabase.co/functions/v1/worker-connect-submit',
  consentVersion: '2026-08-15-v1',
});

const form = document.querySelector('#worker-form');
const statusLine = document.querySelector('#form-status');

if (WORKER_CONNECT_CONFIG.preview) {
  statusLine.textContent = 'Preview activ — nu sunt colectate sau salvate date.';
}

// The live submission path is intentionally present but unreachable while
// preview=true and the controls are disabled. Activation requires legal copy,
// privacy contact, retention policy and an Edge Function mode change.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (WORKER_CONNECT_CONFIG.preview) {
    statusLine.textContent = 'Trimiterea reală este blocată în modul preview.';
    return;
  }

  const data = new FormData(form);
  const payload = {
    submissionId: crypto.randomUUID(),
    fullName: data.get('fullName'),
    phone: data.get('phone'),
    postcode: data.get('postcode'),
    trades: data.getAll('trades'),
    otherTrade: data.get('otherTrade') || '',
    consent: data.get('consent') === 'on',
    consentVersion: WORKER_CONNECT_CONFIG.consentVersion,
    source: 'worker_connect_uk_public',
    website: data.get('website') || '',
    pageLoadedAt: window.__workerConnectLoadedAt,
    campaign: Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign'].map((key) => [key, new URLSearchParams(location.search).get(key) || ''])),
  };

  try {
    statusLine.textContent = 'Se trimite…';
    const response = await fetch(WORKER_CONNECT_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Datele nu au putut fi trimise.');
    form.reset();
    statusLine.textContent = 'Mulțumim! Datele tale au fost înregistrate sau actualizate. Te vom contacta când avem o oportunitate potrivită.';
  } catch {
    statusLine.textContent = 'Datele nu au putut fi trimise. Verifică informațiile și încearcă din nou. Dacă problema continuă, contactează-ne.';
  }
});

window.__workerConnectLoadedAt = new Date().toISOString();
