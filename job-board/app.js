'use strict';

const API_URL = 'https://lmztoiikbgcaeztdweov.supabase.co/functions/v1/job-board-api';
const PUBLISHABLE_KEY = 'sb_publishable_hNcUMCduD_AAjBTgJvjqfg_BNJOLk6Z';
const SESSION_KEY = 'recruitflow_job_board_session_v4';
const LANGUAGE_KEY = 'recruitflow_job_board_language';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  jobs: [],
  agent: '',
  email: '',
  status: 'active',
  priority: 'all',
  search: '',
  loading: false,
  lastLoaded: null,
  loadErrorShown: false,
  lang: localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'ro',
};

const I18N = {
  ro: {
    add_job: '＋ Postează job',
    hero_eyebrow: 'CENTRUL DE JOBURI AL ECHIPEI',
    hero_title: 'Postează. Claim. Găsește omul. <em>Gata.</em>',
    hero_description: 'Lipești anunțul, aplicația extrage automat informațiile, iar fiecare second/recruiter poate revendica un job fără să se calce cu altcineva.',
    stat_open: 'OPEN', stat_claimed: 'CLAIMED', stat_found: 'OM GĂSIT', stat_mine: 'ALE MELE',
    live_board: 'LIVE BOARD', team_jobs: 'Joburile echipei', not_updated: 'Neactualizat',
    search_placeholder: 'Caută meserie, locație, postcode, companie…',
    status_active: 'Active: Open + Claimed', status_all: 'Toate joburile', status_open: 'Open',
    status_claimed: 'Claimed', status_filled: 'Om găsit', status_closed: 'Închise', status_mine: 'Joburile mele',
    priority_all: 'Toate prioritățile', priority_urgent_plural: 'Urgente', priority_normal_plural: 'Normale', priority_low_plural: 'Prioritate mică',
    footer_text: 'Acces fără cod · Română / English · Actualizare automată · Mobile friendly',
    access_eyebrow: 'IDENTIFICARE AGENT', access_title: 'Spune-ne cine ești',
    access_description: 'Introdu numele și emailul folosit în Blue. Emailul leagă automat claim-urile de contul tău RecruitFlow.',
    agent_name_label: 'Numele tău / numele secondului', agent_name_placeholder: 'Ex: Andrei',
    agent_email_label: 'Emailul folosit în Blue', agent_email_placeholder: 'Ex: nume@companie.com', continue_button: 'Continuă',
    access_hint: 'Nu este necesar niciun cod. Pe un telefon comun, apasă pe numele agentului pentru a schimba utilizatorul.',
    new_job: 'JOB NOU', post_job_title: 'Postează un job', edit_job_title: 'Editează jobul',
    paste_title: '⚡ Copy–paste anunțul', paste_help: 'Extragem automat meseria, locația, postcode-ul, rata și restul datelor.',
    parse_button: 'Completează automat', source_placeholder: 'Ex: Urgently need 4 dryliners in SW1A 1AA, London. £220/day, start Monday…',
    field_trade: 'Meserie / trade', trade_placeholder: 'Ex: Electrician', field_location: 'Locație', location_placeholder: 'Ex: Central London (opțional)',
    field_postcode: 'Postcode', postcode_placeholder: 'Ex: SW1A 1AA', field_rate: 'Rate', rate_placeholder: 'Ex: £220/day',
    field_workers: 'Nr. muncitori', field_start: 'Data de start', field_priority: 'Prioritate',
    priority_normal: 'Normală', priority_urgent: 'Urgentă', priority_low: 'Mică', field_contract: 'Tip contract', contract_unspecified: 'Nespecificat',
    field_duration: 'Durată', duration_placeholder: 'Ex: 3 luni / ongoing', field_shift: 'Program / shift', shift_placeholder: 'Ex: 08:00–17:00 / nights',
    field_company: 'Companie', field_reference: 'Referință job', reference_placeholder: 'Ex: JOB-1842',
    field_contact_name: 'Nume contact', field_contact_phone: 'Telefon contact', field_details: 'Detalii / cerințe',
    details_placeholder: 'CSCS, tools, experiență, parking…', cancel: 'Renunță', publish_job: 'Publică jobul', save_changes: 'Salvează modificările',
    found_title: 'Ai găsit omul?', found_description: 'Jobul va fi mutat la <strong>OM GĂSIT</strong> și va rămâne în istoric.',
    found_note: 'Notă opțională', found_note_placeholder: 'Ex: Om confirmat, începe luni.', found_confirm: '✓ Marchează „Om găsit”',
    saving: 'Se salvează…', posting: 'Publicăm jobul…', saving_changes: 'Salvăm modificările…', claiming: 'Revendicăm jobul…',
    updated: 'Actualizat {time}',
    empty_results_title: 'Nu există rezultate pentru filtrele alese.', empty_results_text: 'Schimbă filtrul sau caută alt cuvânt.',
    empty_jobs_title: 'Nu există încă niciun job.', empty_jobs_text: 'Apasă „Postează job” și adaugă primul job al echipei.',
    load_failed_title: 'Joburile nu au putut fi încărcate.', load_failed_text: 'Folosește butonul de actualizare din partea de sus pentru a încerca din nou.',
    location_unspecified: 'Locație nespecificată', workers_one: 'om', workers_many: 'oameni',
    claimed_by_you: 'Revendicat de tine', claimed_by: 'Claimed de {name}', found_by: 'Om găsit de {name}',
    contact_company: 'Contact și companie ▾', no_contact: 'Fără contact introdus', posted_by: 'Postat de {name}', unknown: 'necunoscut',
    action_claim: 'CLAIM JOB', action_found: '✓ AM GĂSIT OM', action_release: 'Eliberează', action_edit: 'Editează', action_reopen: 'Redeschide jobul', close_title: 'Închide jobul',
    badge_open: 'OPEN', badge_claimed: 'CLAIMED', badge_filled: 'OM GĂSIT', badge_closed: 'ÎNCHIS',
    welcome: 'Bun venit, {name}.', paste_first: 'Lipește mai întâi textul anunțului.',
    parsed: 'Am completat automat {count} câmpuri.', parse_none: 'Nu am găsit suficiente date. Completează manual meseria.',
    created: 'Jobul a fost publicat și este OPEN.', edited: 'Jobul a fost actualizat.',
    claimed: 'Jobul este acum revendicat de tine.', released: 'Jobul a fost eliberat.', closed: 'Jobul a fost închis.', reopened: 'Jobul a fost redeschis.', filled: 'Perfect — jobul este marcat „Om găsit”.',
    generic_saved: 'Modificarea a fost salvată.', network_timeout: 'Conexiunea a expirat. Încearcă din nou.',
    network_error: 'Nu am putut contacta serverul. Apasă actualizare și încearcă din nou.', online: 'Conexiunea a revenit.', offline: 'Dispozitivul este offline.',
    confirm_release: 'Eliberezi acest job pentru ca alt agent să îl poată revendica?',
    confirm_close: 'Închizi jobul fără să îl marchezi „Om găsit”?', confirm_reopen: 'Redeschizi jobul și îl pui din nou la OPEN?',
    switch_language: 'Switch to English', change_agent: 'Schimbă agentul', refresh: 'Actualizează',
  },
  en: {
    add_job: '＋ Post job',
    hero_eyebrow: 'THE TEAM JOB HUB',
    hero_title: 'Post. Claim. Find the worker. <em>Done.</em>',
    hero_description: 'Paste the advert, let the app extract the details, and allow each recruiter to claim a job without overlapping with someone else.',
    stat_open: 'OPEN', stat_claimed: 'CLAIMED', stat_found: 'WORKER FOUND', stat_mine: 'MY JOBS',
    live_board: 'LIVE BOARD', team_jobs: 'Team jobs', not_updated: 'Not updated',
    search_placeholder: 'Search trade, location, postcode, company…',
    status_active: 'Active: Open + Claimed', status_all: 'All jobs', status_open: 'Open',
    status_claimed: 'Claimed', status_filled: 'Worker found', status_closed: 'Closed', status_mine: 'My jobs',
    priority_all: 'All priorities', priority_urgent_plural: 'Urgent', priority_normal_plural: 'Normal', priority_low_plural: 'Low priority',
    footer_text: 'No access code · Romanian / English · Auto refresh · Mobile friendly',
    access_eyebrow: 'AGENT IDENTIFICATION', access_title: 'Tell us who you are',
    access_description: 'Enter your name and the email used in Blue. Your email automatically links claims to your RecruitFlow account.',
    agent_name_label: 'Your name / recruiter name', agent_name_placeholder: 'e.g. Andrei',
    agent_email_label: 'Email used in Blue', agent_email_placeholder: 'e.g. name@company.com', continue_button: 'Continue',
    access_hint: 'No access code is required. On a shared phone, tap the agent name to switch users.',
    new_job: 'NEW JOB', post_job_title: 'Post a job', edit_job_title: 'Edit job',
    paste_title: '⚡ Paste the advert', paste_help: 'We automatically extract the trade, location, postcode, rate and other details.',
    parse_button: 'Fill automatically', source_placeholder: 'e.g. Urgently need 4 dryliners in SW1A 1AA, London. £220/day, start Monday…',
    field_trade: 'Trade / role', trade_placeholder: 'e.g. Electrician', field_location: 'Location', location_placeholder: 'e.g. Central London (optional)',
    field_postcode: 'Postcode', postcode_placeholder: 'e.g. SW1A 1AA', field_rate: 'Rate', rate_placeholder: 'e.g. £220/day',
    field_workers: 'Workers needed', field_start: 'Start date', field_priority: 'Priority',
    priority_normal: 'Normal', priority_urgent: 'Urgent', priority_low: 'Low', field_contract: 'Contract type', contract_unspecified: 'Not specified',
    field_duration: 'Duration', duration_placeholder: 'e.g. 3 months / ongoing', field_shift: 'Hours / shift', shift_placeholder: 'e.g. 08:00–17:00 / nights',
    field_company: 'Company', field_reference: 'Job reference', reference_placeholder: 'e.g. JOB-1842',
    field_contact_name: 'Contact name', field_contact_phone: 'Contact phone', field_details: 'Details / requirements',
    details_placeholder: 'CSCS, tools, experience, parking…', cancel: 'Cancel', publish_job: 'Post job', save_changes: 'Save changes',
    found_title: 'Have you found the worker?', found_description: 'The job will move to <strong>WORKER FOUND</strong> and remain in the history.',
    found_note: 'Optional note', found_note_placeholder: 'e.g. Worker confirmed, starts Monday.', found_confirm: '✓ Mark “Worker found”',
    saving: 'Saving…', posting: 'Posting job…', saving_changes: 'Saving changes…', claiming: 'Claiming job…',
    updated: 'Updated {time}',
    empty_results_title: 'No jobs match the selected filters.', empty_results_text: 'Change a filter or try another search.',
    empty_jobs_title: 'There are no jobs yet.', empty_jobs_text: 'Press “Post job” to add the team’s first job.',
    load_failed_title: 'Jobs could not be loaded.', load_failed_text: 'Use the refresh button at the top to try again.',
    location_unspecified: 'Location not specified', workers_one: 'worker', workers_many: 'workers',
    claimed_by_you: 'Claimed by you', claimed_by: 'Claimed by {name}', found_by: 'Worker found by {name}',
    contact_company: 'Contact and company ▾', no_contact: 'No contact added', posted_by: 'Posted by {name}', unknown: 'unknown',
    action_claim: 'CLAIM JOB', action_found: '✓ WORKER FOUND', action_release: 'Release', action_edit: 'Edit', action_reopen: 'Reopen job', close_title: 'Close job',
    badge_open: 'OPEN', badge_claimed: 'CLAIMED', badge_filled: 'WORKER FOUND', badge_closed: 'CLOSED',
    welcome: 'Welcome, {name}.', paste_first: 'Paste the job advert first.',
    parsed: 'Automatically filled {count} fields.', parse_none: 'Not enough details were found. Enter the trade manually.',
    created: 'The job was posted and is now OPEN.', edited: 'The job was updated.',
    claimed: 'The job is now claimed by you.', released: 'The job was released.', closed: 'The job was closed.', reopened: 'The job was reopened.', filled: 'Great — the job is marked “Worker found”.',
    generic_saved: 'The change was saved.', network_timeout: 'The request timed out. Please try again.',
    network_error: 'The server could not be reached. Press refresh and try again.', online: 'You are back online.', offline: 'This device is offline.',
    confirm_release: 'Release this job so another recruiter can claim it?',
    confirm_close: 'Close this job without marking a worker as found?', confirm_reopen: 'Reopen this job and return it to OPEN?',
    switch_language: 'Schimbă în Română', change_agent: 'Change agent', refresh: 'Refresh',
  },
};

const tradePatterns = [
  ['Shuttering Carpenter', /\b(shuttering\s+carpenter|formwork\s+carpenter)\b/i],
  ['Electrician Mate', /\b(electrician(?:'s)?\s+mate|electrical\s+mate)\b/i],
  ['Painter & Decorator', /\b(painter(?:s)?(?:\s*(?:&|and)\s*decorator(?:s)?)?|decorator(?:s)?)\b/i],
  ['Telehandler Driver', /\b(telehandler(?:\s+driver|\s+operator)?|telescopic\s+handler)\b/i],
  ['Forklift Driver', /\b(forklift(?:\s+driver|\s+operator)?|flt\s+driver)\b/i],
  ['Ceiling Fixer', /\b(ceiling\s+fixer|suspended\s+ceiling)\b/i],
  ['Fire Stopper', /\b(fire\s*stopper|firestopping|fire\s+stopping)\b/i],
  ['Steel Fixer', /\b(steel\s+fixer|steelfixer|rebar\s+worker)\b/i],
  ['Site Manager', /\b(site\s+manager|construction\s+manager)\b/i],
  ['HVAC Engineer', /\b(hvac|air\s+conditioning\s+engineer|ac\s+engineer)\b/i],
  ['Multi Trader', /\b(multi[-\s]?(?:trader|trade|skilled)|multi\s+skilled)\b/i],
  ['Groundworker', /\b(groundworker|ground\s+worker|groundworks)\b/i],
  ['Bricklayer', /\b(bricklayer|brickie|brick\s+layer)\b/i],
  ['Scaffolder', /\b(scaffolder|scaffolding)\b/i],
  ['Dryliner', /\b(dryliner|dry\s+liner|drylining|dry\s+lining)\b/i],
  ['Carpenter / Joiner', /\b(carpenter|joiner|carpentry)\b/i],
  ['Electrician', /\b(electrician|electrical\s+engineer|sparky)\b/i],
  ['Pipefitter', /\b(pipefitter|pipe\s+fitter)\b/i],
  ['Plumber', /\b(plumber|plumbing)\b/i],
  ['Plasterer', /\b(plasterer|plastering)\b/i],
  ['Labourer', /\b(labourer|laborer|general\s+operative|site\s+operative)\b/i],
  ['Supervisor', /\b(supervisor|foreman)\b/i],
  ['Handyman', /\b(handyman|handy\s+man)\b/i],
  ['Roofer', /\b(roofer|roofing)\b/i],
  ['Welder', /\b(welder|welding)\b/i],
  ['Tiler', /\b(tiler|tiling)\b/i],
  ['Cleaner', /\b(cleaner|cleaning\s+operative)\b/i],
];

const postcodeRegex = /\b(?:GIR\s?0AA|(?:(?:[A-PR-UWYZ][0-9][0-9A-HJKSTUW]?|[A-PR-UWYZ][A-HK-Y][0-9][0-9ABEHMNPRVWXY]?))\s?[0-9][ABD-HJLNP-UW-Z]{2})\b/i;
const phoneRegex = /(?:\+44\s?\(?0?\)?\s?|0)(?:7\d{3}|1\d{2,4}|2\d{1,3})[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;

function t(key, variables = {}) {
  let value = I18N[state.lang]?.[key] ?? I18N.ro[key] ?? key;
  for (const [name, replacement] of Object.entries(variables)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function normalizeName(value) { return String(value || '').trim().toLocaleLowerCase(); }
function isSameAgent(value) { return Boolean(state.agent) && normalizeName(value) === normalizeName(state.agent); }
function locale() { return state.lang === 'en' ? 'en-GB' : 'ro-RO'; }

function asDate(value) {
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value, options = { day: '2-digit', month: 'short' }) {
  const date = asDate(value);
  return date ? new Intl.DateTimeFormat(locale(), options).format(date) : String(value || '');
}

function relativeTime(value) {
  const date = asDate(value);
  if (!date) return '';
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
  if (abs < 60) return formatter.format(seconds, 'second');
  if (abs < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  return formatter.format(Math.round(seconds / 86400), 'day');
}

function cleanPhoneForLink(value) { return String(value || '').replace(/[^+\d]/g, ''); }

function toast(message, type = 'info', duration = 3600) {
  const region = $('#toastRegion');
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}</span><span>${escapeHtml(message)}</span>`;
  region.append(item);
  window.setTimeout(() => item.remove(), duration);
}

function setBusy(busy, label = t('saving')) {
  state.loading = busy;
  $('#loadingOverlay strong').textContent = label;
  $('#loadingOverlay').hidden = !busy;
}

function saveSession() { localStorage.setItem(SESSION_KEY, JSON.stringify({ agent: state.agent, email: state.email })); }
function clearSession() { state.agent = ''; state.email = ''; localStorage.removeItem(SESSION_KEY); }

async function api(action, payload = {}, { timeout = 20000 } = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: PUBLISHABLE_KEY },
      body: JSON.stringify({ action, lang: state.lang, agent_email: state.email, ...payload }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      const error = new Error(data.error || `Error ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(t('network_timeout'));
    if (!error.status && !navigator.onLine) throw new Error(t('offline'));
    if (!error.status && error instanceof TypeError) throw new Error(t('network_error'));
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  $$('[data-i18n-html]').forEach((element) => { element.innerHTML = t(element.dataset.i18nHtml); });
  $$('[data-i18n-placeholder]').forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  $('#languageButton').textContent = state.lang === 'ro' ? 'EN' : 'RO';
  $('#languageButton').title = t('switch_language');
  $('#agentButton').title = t('change_agent');
  $('#refreshButton').title = t('refresh');
  $('#refreshButton').setAttribute('aria-label', t('refresh'));
  syncDialogLanguage();
  if (state.jobs.length || state.lastLoaded) render();
  else updateLastUpdated();
}

function syncDialogLanguage() {
  const editing = Boolean($('#editingJobId').value);
  $('#jobDialogTitle').textContent = t(editing ? 'edit_job_title' : 'post_job_title');
  $('#saveJobButton').textContent = t(editing ? 'save_changes' : 'publish_job');
}

function updateLastUpdated() {
  $('#lastUpdated').textContent = state.lastLoaded ? t('updated', { time: relativeTime(state.lastLoaded) }) : t('not_updated');
}

function showAccessDialog(prefillAgent = '', prefillEmail = '') {
  const dialog = $('#accessDialog');
  $('#accessAgent').value = prefillAgent || state.agent || '';
  $('#accessEmail').value = prefillEmail || state.email || '';
  $('#accessError').hidden = true;
  if (!dialog.open) dialog.showModal();
  window.setTimeout(() => $('#accessAgent').focus(), 80);
}

async function establishSession(agent, email) {
  state.agent = agent.trim();
  state.email = email.trim().toLocaleLowerCase();
  await api('session');
  saveSession();
  $('#agentName').textContent = state.agent;
  $('#agentButton').hidden = false;
  if ($('#accessDialog').open) $('#accessDialog').close();
  await loadJobs({ silent: false });
}

async function loadJobs({ silent = true } = {}) {
  if (!silent) {
    $('#jobsGrid').setAttribute('aria-busy', 'true');
    renderLoading();
  }
  try {
    const result = await api('list', {}, { timeout: 25000 });
    state.jobs = Array.isArray(result.jobs) ? result.jobs : [];
    state.lastLoaded = new Date();
    state.loadErrorShown = false;
    render();
  } catch (error) {
    if (!silent || state.jobs.length === 0) renderEmpty(t('load_failed_title'), t('load_failed_text'));
    if (!state.loadErrorShown) {
      toast(error.message || t('network_error'), 'error', 5000);
      state.loadErrorShown = true;
    }
  } finally {
    $('#jobsGrid').setAttribute('aria-busy', 'false');
  }
}

function renderLoading() {
  $('#jobsGrid').innerHTML = Array.from({ length: 3 }, () => `
    <article class="job-card" aria-hidden="true">
      <div class="skeleton" style="height:24px;width:42%"></div>
      <div class="skeleton" style="height:28px;width:70%;margin-top:22px"></div>
      <div class="skeleton" style="height:17px;width:56%;margin-top:10px"></div>
      <div class="skeleton" style="height:24px;width:35%;margin-top:25px"></div>
      <div class="skeleton" style="height:60px;width:100%;margin-top:18px"></div>
    </article>`).join('');
}

function filteredJobs() {
  const query = state.search.trim().toLocaleLowerCase();
  const statusOrder = { open: 0, claimed: 1, filled: 2, closed: 3 };
  const priorityOrder = { urgent: 0, normal: 1, low: 2 };
  return state.jobs.filter((job) => {
    const statusMatch = state.status === 'all'
      || (state.status === 'active' && ['open', 'claimed'].includes(job.status))
      || (state.status === 'mine' && [job.claimed_by, job.created_by, job.filled_by].some(isSameAgent))
      || job.status === state.status;
    const priorityMatch = state.priority === 'all' || job.priority === state.priority;
    if (!statusMatch || !priorityMatch) return false;
    if (!query) return true;
    return [job.trade, job.location, job.postcode, job.rate, job.company_name, job.description, job.created_by, job.claimed_by, job.job_reference]
      .filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
  }).sort((a, b) => {
    const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    if (statusDiff) return statusDiff;
    const priorityDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    if (priorityDiff) return priorityDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

function render() {
  $('#openCount').textContent = state.jobs.filter((job) => job.status === 'open').length;
  $('#claimedCount').textContent = state.jobs.filter((job) => job.status === 'claimed').length;
  $('#filledCount').textContent = state.jobs.filter((job) => job.status === 'filled').length;
  $('#mineCount').textContent = state.jobs.filter((job) => isSameAgent(job.claimed_by) && job.status === 'claimed').length;
  updateLastUpdated();
  const jobs = filteredJobs();
  if (!jobs.length) {
    renderEmpty(
      state.jobs.length ? t('empty_results_title') : t('empty_jobs_title'),
      state.jobs.length ? t('empty_results_text') : t('empty_jobs_text'),
    );
    return;
  }
  $('#jobsGrid').innerHTML = jobs.map(jobCardHtml).join('');
}

function renderEmpty(title, text) {
  $('#jobsGrid').innerHTML = `<div class="empty-state"><div><div class="empty-icon">⌁</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div></div>`;
}

function jobCardHtml(job) {
  const mine = isSameAgent(job.claimed_by);
  const creator = isSameAgent(job.created_by);
  const canEdit = ['open', 'claimed'].includes(job.status) && (creator || mine);
  const canReopen = ['filled', 'closed'].includes(job.status)
    && [job.created_by, job.claimed_by, job.filled_by, job.closed_by].some(isSameAgent);
  const priority = job.priority || 'normal';
  const workers = Number(job.workers_needed) || 1;
  const facts = [
    `👷 ${workers} ${t(workers === 1 ? 'workers_one' : 'workers_many')}`,
    job.start_date ? `📅 ${formatDate(job.start_date, { day: '2-digit', month: 'short', year: 'numeric' })}` : '',
    job.duration ? `⏳ ${job.duration}` : '',
    job.contract_type ? `📄 ${job.contract_type}` : '',
    job.shift ? `◷ ${job.shift}` : '',
  ].filter(Boolean);

  let ownerBlock = '';
  if (job.status === 'claimed') {
    const text = mine ? t('claimed_by_you') : t('claimed_by', { name: job.claimed_by || t('unknown') });
    ownerBlock = `<div class="claim-owner ${mine ? 'mine' : ''}"><span>${mine ? '★' : '↗'}</span><span>${escapeHtml(text)}${job.claimed_at ? ` · ${relativeTime(job.claimed_at)}` : ''}</span></div>`;
  } else if (job.status === 'filled') {
    const text = t('found_by', { name: job.filled_by || job.claimed_by || t('unknown') });
    ownerBlock = `<div class="claim-owner mine"><span>✓</span><span>${escapeHtml(text)}${job.filled_at ? ` · ${relativeTime(job.filled_at)}` : ''}</span></div>`;
  }

  let actions = '';
  if (job.status === 'open') actions += `<button class="card-action action-claim" data-action="claim" data-id="${job.id}">${escapeHtml(t('action_claim'))}</button>`;
  if (job.status === 'claimed' && mine) {
    actions += `<button class="card-action action-found" data-action="found" data-id="${job.id}">${escapeHtml(t('action_found'))}</button>`;
    actions += `<button class="card-action action-release" data-action="release" data-id="${job.id}">${escapeHtml(t('action_release'))}</button>`;
  }
  if (canEdit) actions += `<button class="card-action action-edit" data-action="edit" data-id="${job.id}">${escapeHtml(t('action_edit'))}</button>`;
  if ((creator || mine) && ['open', 'claimed'].includes(job.status)) actions += `<button class="card-action action-close" data-action="close" data-id="${job.id}" title="${escapeHtml(t('close_title'))}">×</button>`;
  if (canReopen) actions += `<button class="card-action action-reopen" data-action="reopen" data-id="${job.id}">${escapeHtml(t('action_reopen'))}</button>`;

  const contact = [job.company_name, job.contact_name, job.contact_phone].some(Boolean)
    ? `<details class="contact-details"><summary>${escapeHtml(t('contact_company'))}</summary><div class="contact-body">
        ${job.company_name ? `<span>🏢 ${escapeHtml(job.company_name)}</span>` : ''}
        ${job.contact_name ? `<span>👤 ${escapeHtml(job.contact_name)}</span>` : ''}
        ${job.contact_phone ? `<a href="tel:${escapeHtml(cleanPhoneForLink(job.contact_phone))}">☎ ${escapeHtml(job.contact_phone)}</a>` : ''}
      </div></details>`
    : `<div class="contact-details"><span style="font-size:11px;color:#94a0af">${escapeHtml(t('no_contact'))}</span></div>`;

  const locationText = job.location || t('location_unspecified');
  const badgeKey = `badge_${job.status}`;
  return `<article class="job-card status-${escapeHtml(job.status)} priority-${escapeHtml(priority)}">
    <div class="card-head">
      <div class="badges">
        <span class="badge badge-${escapeHtml(job.status)}">${escapeHtml(t(badgeKey))}</span>
        ${priority === 'urgent' ? '<span class="badge badge-urgent">URGENT</span>' : ''}
        ${priority === 'low' ? '<span class="badge badge-low">LOW</span>' : ''}
      </div>
      <span class="card-date" title="${escapeHtml(formatDate(job.created_at, { dateStyle: 'full', timeStyle: 'short' }))}">${relativeTime(job.created_at)}</span>
    </div>
    <h3>${escapeHtml(job.trade)}</h3>
    <div class="location"><span>⌖</span><span>${escapeHtml(locationText)}${job.postcode ? `<span class="postcode">${escapeHtml(job.postcode)}</span>` : ''}</span></div>
    ${job.rate ? `<div class="rate">${escapeHtml(job.rate)}</div>` : ''}
    <div class="facts">${facts.map((fact) => `<span class="fact">${escapeHtml(fact)}</span>`).join('')}</div>
    ${job.description ? `<p class="description">${escapeHtml(job.description)}</p>` : ''}
    ${ownerBlock}
    ${contact}
    <div class="card-footer-meta"><span>${escapeHtml(t('posted_by', { name: job.created_by || t('unknown') }))}</span><span>${job.job_reference ? `#${escapeHtml(job.job_reference)}` : `ID ${job.id}`}</span></div>
    ${actions ? `<div class="card-actions">${actions}</div>` : ''}
  </article>`;
}

function openCreateDialog() {
  $('#jobForm').reset();
  $('#workersInput').value = '1';
  $('#priorityInput').value = 'normal';
  $('#editingJobId').value = '';
  $('#formModeBadge').textContent = 'CREATE';
  syncDialogLanguage();
  $('#jobDialog').showModal();
  window.setTimeout(() => $('#sourceText').focus(), 80);
}

function openEditDialog(id) {
  const job = state.jobs.find((item) => item.id === Number(id));
  if (!job) return;
  $('#jobForm').reset();
  $('#editingJobId').value = String(job.id);
  $('#formModeBadge').textContent = 'EDIT';
  const values = {
    source_text: job.source_text, trade: job.trade, location: job.location, postcode: job.postcode,
    rate: job.rate, workers_needed: job.workers_needed, start_date: job.start_date,
    priority: job.priority || 'normal', contract_type: job.contract_type, duration: job.duration,
    shift: job.shift, company_name: job.company_name, job_reference: job.job_reference,
    contact_name: job.contact_name, contact_phone: job.contact_phone, description: job.description,
  };
  for (const [name, value] of Object.entries(values)) {
    const field = $(`[name="${name}"]`, $('#jobForm'));
    if (field) field.value = value ?? '';
  }
  syncDialogLanguage();
  $('#jobDialog').showModal();
}

function lineValue(text, labels) {
  const labelGroup = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const match = text.match(new RegExp(`(?:^|\\n)\\s*(?:${labelGroup})\\s*[:\\-]\\s*([^\\n]{2,160})`, 'i'));
  return match?.[1]?.trim() || '';
}

function toIsoDate(value) {
  if (!value) return '';
  const cleaned = value.trim();
  const iso = cleaned.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const uk = cleaned.match(/\b(\d{1,2})[/.\-](\d{1,2})[/.\-](20\d{2})\b/);
  if (uk) return `${uk[3]}-${uk[2].padStart(2, '0')}-${uk[1].padStart(2, '0')}`;
  if (/\b(tomorrow|mâine|maine)\b/i.test(cleaned)) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }
  return '';
}

function inferLocation(text, postcode) {
  const labelled = lineValue(text, ['location', 'site', 'area', 'locație', 'locatie']);
  if (labelled) return labelled.replace(postcode || '', '').replace(/^[,\s-]+|[,\s-]+$/g, '');
  if (postcode) {
    const line = text.split(/\r?\n/).find((item) => item.toUpperCase().includes(postcode.toUpperCase()));
    if (line) {
      const without = line.replace(postcodeRegex, '').replace(/\b(location|site|area|postcode|post code)\b\s*[:\-]?/ig, '').trim();
      const candidate = without.split(/[|;]/)[0].replace(/^[,\s-]+|[,\s-]+$/g, '');
      if (candidate.length >= 2 && candidate.length <= 80) return candidate;
    }
  }
  const london = text.match(/\b((?:central|north|south|east|west)?\s*london)\b/i);
  return london?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

function parseJobText(text) {
  const compact = text.replace(/\r/g, '').trim();
  const postcodeMatch = compact.match(postcodeRegex);
  const postcode = postcodeMatch ? postcodeMatch[0].toUpperCase().replace(/\s+/g, ' ').replace(/^(\S+)(\d[A-Z]{2})$/, '$1 $2') : '';
  const tradeLabel = lineValue(compact, ['trade', 'job', 'role', 'position', 'meserie']);
  const trade = tradeLabel || tradePatterns.find(([, pattern]) => pattern.test(compact))?.[0] || '';
  const phone = compact.match(phoneRegex)?.[0]?.replace(/\s+/g, ' ').trim() || '';
  const rate = compact.match(/£\s?\d{2,4}(?:[.,]\d{1,2})?\s*(?:(?:\/|per\s*)(?:hour|hr|day|shift|week)|(?:p\/?h|ph|pd))?/i)?.[0]
    || compact.match(/\b\d{2,4}(?:[.,]\d{1,2})?\s*(?:p\/?h|ph|per\s+hour|per\s+day)\b/i)?.[0]
    || (/\b(rate\s+negotiable|negotiable\s+rate)\b/i.test(compact) ? 'Negotiable' : '');
  const workerMatch = compact.match(/\b(?:need(?:ed|ing)?|require(?:d|ment)?|looking\s+for|seeking)?\s*(\d{1,2})\s*(?:x\s*)?(?:workers?|men|people|operatives?|labourers?|electricians?|carpenters?|dryliners?|painters?|plumbers?|bricklayers?|groundworkers?|trades?)/i)
    || compact.match(/\b(\d{1,2})\s*x\s*[a-z]/i);
  const workers = workerMatch ? Math.min(100, Math.max(1, Number(workerMatch[1]))) : 1;
  const startRaw = lineValue(compact, ['start', 'start date', 'starting', 'data start'])
    || compact.match(/\b(?:start(?:ing)?\s*(?:date)?\s*[:\-]?\s*)(tomorrow|mâine|maine|asap|20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[/.\-]\d{1,2}[/.\-]20\d{2})\b/i)?.[1]
    || '';
  const duration = lineValue(compact, ['duration', 'length', 'contract length', 'durată', 'durata'])
    || compact.match(/\b(?:for\s+)?(\d+\s*(?:days?|weeks?|months?|years?)|ongoing|long[-\s]?term)\b/i)?.[1] || '';
  const shift = lineValue(compact, ['shift', 'hours', 'working hours', 'program'])
    || compact.match(/\b(night\s*shift|day\s*shift|nights?|days?|\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*[-–]\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i)?.[1] || '';
  const contract = compact.match(/\b(permanent|temporary|temp|self[-\s]?employed|subcontract(?:or)?)\b/i)?.[1] || '';
  const contractType = /permanent/i.test(contract) ? 'Permanent'
    : /self/i.test(contract) ? 'Self-employed'
      : /subcontract/i.test(contract) ? 'Subcontract'
        : /temp/i.test(contract) ? 'Temporary' : '';
  const company = lineValue(compact, ['company', 'client', 'contractor', 'firmă', 'firma']);
  const contactName = lineValue(compact, ['contact', 'contact name', 'ask for', 'nume contact']).replace(phoneRegex, '').trim();
  const reference = lineValue(compact, ['reference', 'ref', 'job ref', 'job reference']);
  const location = inferLocation(compact, postcode);
  const description = compact.length <= 900 ? compact : `${compact.slice(0, 897)}…`;
  const urgent = /\b(urgent|urgently|immediate start|asap)\b/i.test(compact);
  return {
    trade, location, postcode, rate, workers_needed: workers, start_date: toIsoDate(startRaw),
    priority: urgent ? 'urgent' : 'normal', contract_type: contractType, duration, shift,
    company_name: company, contact_name: contactName, contact_phone: phone,
    job_reference: reference, description,
  };
}

function applyParsedData(data) {
  const mapping = {
    trade: '#tradeInput', location: '#locationInput', postcode: '#postcodeInput', rate: '#rateInput',
    workers_needed: '#workersInput', start_date: '#startDateInput', priority: '#priorityInput',
    contract_type: '#contractTypeInput', duration: '#durationInput', shift: '#shiftInput',
    company_name: '#companyInput', contact_name: '#contactNameInput', contact_phone: '#contactPhoneInput',
    job_reference: '#referenceInput', description: '#descriptionInput',
  };
  let filled = 0;
  for (const [key, selector] of Object.entries(mapping)) {
    const field = $(selector);
    const value = data[key];
    if (field && value !== '' && value !== null && value !== undefined) {
      field.value = value;
      field.classList.remove('auto-filled');
      void field.offsetWidth;
      field.classList.add('auto-filled');
      filled += 1;
    }
  }
  toast(filled ? t('parsed', { count: filled }) : t('parse_none'), filled ? 'success' : 'info');
}

function jobPayloadFromForm() {
  const values = Object.fromEntries(new FormData($('#jobForm')).entries());
  values.workers_needed = Number(values.workers_needed) || 1;
  values.source_kind = values.source_text?.trim() ? 'paste' : 'manual';
  for (const key of Object.keys(values)) if (typeof values[key] === 'string') values[key] = values[key].trim();
  return values;
}

async function performAction(action, id, extra = {}) {
  setBusy(true, action === 'claim' ? t('claiming') : t('saving'));
  try {
    await api(action, { id: Number(id), agent: state.agent, ...extra });
    const messageKey = { claim: 'claimed', release: 'released', close: 'closed', reopen: 'reopened', fill: 'filled' }[action];
    toast(t(messageKey || 'generic_saved'), 'success');
    await loadJobs({ silent: true });
  } catch (error) {
    toast(error.message, 'error', 5000);
    if (error.status === 409) await loadJobs({ silent: true });
  } finally {
    setBusy(false);
  }
}

$('#accessForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const agent = $('#accessAgent').value.trim();
  const email = $('#accessEmail').value.trim().toLocaleLowerCase();
  $('#accessError').hidden = true;
  const submit = event.submitter || $('button[type="submit"]', event.currentTarget);
  if (submit) submit.disabled = true;
  try {
    await establishSession(agent, email);
    toast(t('welcome', { name: agent }), 'success');
  } catch (error) {
    clearSession();
    $('#accessError').textContent = error.message;
    $('#accessError').hidden = false;
  } finally {
    if (submit) submit.disabled = false;
  }
});

$('#languageButton').addEventListener('click', () => {
  state.lang = state.lang === 'ro' ? 'en' : 'ro';
  localStorage.setItem(LANGUAGE_KEY, state.lang);
  applyLanguage();
});
$('#addButton').addEventListener('click', openCreateDialog);
$('#refreshButton').addEventListener('click', () => { state.loadErrorShown = false; loadJobs({ silent: false }); });
$('#agentButton').addEventListener('click', () => {
  const previous = state.agent;
  const previousEmail = state.email;
  clearSession();
  $('#agentButton').hidden = true;
  showAccessDialog(previous, previousEmail);
});

$('#searchInput').addEventListener('input', (event) => { state.search = event.target.value; render(); });
$('#statusFilter').addEventListener('change', (event) => { state.status = event.target.value; render(); });
$('#priorityFilter').addEventListener('change', (event) => { state.priority = event.target.value; render(); });
$$('[data-stat-filter]').forEach((button) => button.addEventListener('click', () => {
  state.status = button.dataset.statFilter;
  $('#statusFilter').value = state.status;
  render();
  $('.workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

$('#parseButton').addEventListener('click', () => {
  const text = $('#sourceText').value.trim();
  if (!text) return toast(t('paste_first'), 'error');
  applyParsedData(parseJobText(text));
});

$('#sourceText').addEventListener('paste', () => {
  window.setTimeout(() => {
    if (!$('#tradeInput').value && $('#sourceText').value.trim().length > 20) applyParsedData(parseJobText($('#sourceText').value));
  }, 80);
});

$('#jobForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = $('#editingJobId').value;
  const action = id ? 'edit' : 'create';
  setBusy(true, id ? t('saving_changes') : t('posting'));
  try {
    await api(action, { id: id ? Number(id) : undefined, agent: state.agent, job: jobPayloadFromForm() });
    $('#jobDialog').close();
    toast(t(id ? 'edited' : 'created'), 'success');
    await loadJobs({ silent: true });
  } catch (error) {
    toast(error.message, 'error', 5000);
  } finally {
    setBusy(false);
  }
});

$('#foundForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = $('#foundJobId').value;
  const note = $('#foundNote').value.trim();
  $('#foundDialog').close();
  await performAction('fill', id, { note });
});

$('#jobsGrid').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'edit') return openEditDialog(id);
  if (action === 'found') {
    $('#foundJobId').value = id;
    $('#foundNote').value = '';
    $('#foundDialog').showModal();
    return;
  }
  if (action === 'claim') return performAction('claim', id);
  if (action === 'release' && window.confirm(t('confirm_release'))) return performAction('release', id);
  if (action === 'close' && window.confirm(t('confirm_close'))) return performAction('close', id);
  if (action === 'reopen' && window.confirm(t('confirm_reopen'))) return performAction('reopen', id);
});

$$('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => {
  const dialog = document.getElementById(button.dataset.closeDialog);
  if (dialog?.open) dialog.close();
}));
$('#accessDialog').addEventListener('cancel', (event) => event.preventDefault());
$$('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
  if (event.target === dialog && dialog.id !== 'accessDialog') dialog.close();
}));

window.addEventListener('online', () => { toast(t('online'), 'success'); state.loadErrorShown = false; loadJobs({ silent: true }); });
window.addEventListener('offline', () => toast(t('offline'), 'error'));
document.addEventListener('visibilitychange', () => { if (!document.hidden && state.agent) loadJobs({ silent: true }); });
window.setInterval(() => { if (!document.hidden && state.agent && !state.loading) loadJobs({ silent: true }); }, 30000);
window.setInterval(updateLastUpdated, 15000);

(async function init() {
  applyLanguage();
  renderLoading();
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (saved?.agent && saved?.email) {
      await establishSession(saved.agent, saved.email);
      return;
    }
  } catch {
    clearSession();
  }
  showAccessDialog();
})();
