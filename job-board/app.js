'use strict';

const API_URL = 'https://lmztoiikbgcaeztdweov.supabase.co/functions/v1/job-board-api';
const PUBLISHABLE_KEY = 'sb_publishable_hNcUMCduD_AAjBTgJvjqfg_BNJOLk6Z';
const SESSION_KEY = 'recruitflow_job_board_session_v2';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  jobs: [],
  agent: '',
  boardKey: '',
  status: 'active',
  priority: 'all',
  search: '',
  loading: false,
  lastLoaded: null,
};

const statusLabels = {
  open: 'OPEN',
  claimed: 'CLAIMED',
  filled: 'OM GĂSIT',
  closed: 'ÎNCHIS',
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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function normalizeName(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

function isSameAgent(value) {
  return normalizeName(value) === normalizeName(state.agent);
}

function formatDate(value, options = { day: '2-digit', month: 'short' }) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ro-RO', options).format(date);
}

function relativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat('ro', { numeric: 'auto' });
  if (abs < 60) return formatter.format(seconds, 'second');
  if (abs < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  return formatter.format(Math.round(seconds / 86400), 'day');
}

function cleanPhoneForLink(value) {
  return String(value || '').replace(/[^+\d]/g, '');
}

function toast(message, type = 'info', duration = 3600) {
  const region = $('#toastRegion');
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}</span><span>${escapeHtml(message)}</span>`;
  region.append(item);
  window.setTimeout(() => item.remove(), duration);
}

function setBusy(busy, label = 'Se salvează…') {
  state.loading = busy;
  $('#loadingOverlay strong').textContent = label;
  $('#loadingOverlay').hidden = !busy;
}

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ agent: state.agent, boardKey: state.boardKey }));
}

function clearSession() {
  state.agent = '';
  state.boardKey = '';
  localStorage.removeItem(SESSION_KEY);
}

async function api(action, payload = {}, { timeout = 20000 } = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: PUBLISHABLE_KEY,
        'x-board-key': state.boardKey,
      },
      body: JSON.stringify({ action, ...payload }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      const error = new Error(data.error || `Eroare ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Conexiunea a expirat. Încearcă din nou.');
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function showAccessDialog(prefillAgent = '') {
  const dialog = $('#accessDialog');
  $('#accessAgent').value = prefillAgent || state.agent || '';
  $('#accessCode').value = '';
  $('#accessError').hidden = true;
  if (!dialog.open) dialog.showModal();
  window.setTimeout(() => (prefillAgent ? $('#accessCode') : $('#accessAgent')).focus(), 80);
}

async function establishSession(agent, boardKey) {
  state.agent = agent.trim();
  state.boardKey = boardKey.trim();
  await api('session');
  saveSession();
  $('#agentName').textContent = state.agent;
  $('#agentButton').hidden = false;
  if ($('#accessDialog').open) $('#accessDialog').close();
  await loadJobs({ silent: false });
}

async function loadJobs({ silent = true } = {}) {
  if (!state.boardKey) return;
  if (!silent) {
    $('#jobsGrid').setAttribute('aria-busy', 'true');
    renderLoading();
  }
  try {
    const result = await api('list', {}, { timeout: 25000 });
    state.jobs = Array.isArray(result.jobs) ? result.jobs : [];
    state.lastLoaded = new Date();
    $('#connectionBanner').hidden = true;
    render();
  } catch (error) {
    if (error.status === 401) {
      const agent = state.agent;
      clearSession();
      showAccessDialog(agent);
      $('#accessError').textContent = 'Codul salvat nu mai este valid. Introdu codul echipei.';
      $('#accessError').hidden = false;
      return;
    }
    $('#connectionText').textContent = error.message;
    $('#connectionBanner').hidden = false;
    if (!silent && state.jobs.length === 0) renderEmpty('Nu am putut încărca joburile.', 'Verifică internetul și apasă Reîncearcă.');
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
    const haystack = [job.trade, job.location, job.postcode, job.rate, job.company_name, job.description, job.created_by, job.claimed_by, job.job_reference]
      .filter(Boolean).join(' ').toLocaleLowerCase();
    return haystack.includes(query);
  }).sort((a, b) => {
    const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    if (statusDiff) return statusDiff;
    const priorityDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    if (priorityDiff) return priorityDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

function render() {
  const open = state.jobs.filter((job) => job.status === 'open').length;
  const claimed = state.jobs.filter((job) => job.status === 'claimed').length;
  const filled = state.jobs.filter((job) => job.status === 'filled').length;
  const mine = state.jobs.filter((job) => isSameAgent(job.claimed_by) && job.status === 'claimed').length;
  $('#openCount').textContent = open;
  $('#claimedCount').textContent = claimed;
  $('#filledCount').textContent = filled;
  $('#mineCount').textContent = mine;
  $('#lastUpdated').textContent = state.lastLoaded ? `Actualizat ${relativeTime(state.lastLoaded)}` : 'Neactualizat';

  const jobs = filteredJobs();
  if (!jobs.length) {
    renderEmpty(
      state.jobs.length ? 'Nu există rezultate pentru filtrele alese.' : 'Nu există încă niciun job.',
      state.jobs.length ? 'Schimbă filtrul sau caută alt cuvânt.' : 'Apasă „Postează job” și adaugă primul job al echipei.',
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
  const facts = [
    job.workers_needed ? `👷 ${job.workers_needed} ${Number(job.workers_needed) === 1 ? 'om' : 'oameni'}` : '',
    job.start_date ? `📅 ${formatDate(job.start_date, { day: '2-digit', month: 'short', year: 'numeric' })}` : '',
    job.duration ? `⏳ ${job.duration}` : '',
    job.contract_type ? `📄 ${job.contract_type}` : '',
    job.shift ? `◷ ${job.shift}` : '',
  ].filter(Boolean);

  const ownerBlock = job.status === 'claimed'
    ? `<div class="claim-owner ${mine ? 'mine' : ''}"><span>${mine ? '★' : '↗'}</span><span>${mine ? 'Revendicat de tine' : `Claimed de ${escapeHtml(job.claimed_by || 'alt agent')}`}${job.claimed_at ? ` · ${relativeTime(job.claimed_at)}` : ''}</span></div>`
    : job.status === 'filled'
      ? `<div class="claim-owner mine"><span>✓</span><span>Om găsit${job.filled_by ? ` de ${escapeHtml(job.filled_by)}` : ''}${job.filled_at ? ` · ${relativeTime(job.filled_at)}` : ''}</span></div>`
      : '';

  let actions = '';
  if (job.status === 'open') {
    actions += `<button class="card-action action-claim" data-action="claim" data-id="${job.id}">CLAIM JOB</button>`;
  }
  if (job.status === 'claimed' && mine) {
    actions += `<button class="card-action action-found" data-action="found" data-id="${job.id}">✓ AM GĂSIT OM</button>`;
    actions += `<button class="card-action action-release" data-action="release" data-id="${job.id}">Eliberează</button>`;
  }
  if (canEdit) actions += `<button class="card-action action-edit" data-action="edit" data-id="${job.id}">Editează</button>`;
  if ((creator || mine) && ['open', 'claimed'].includes(job.status)) actions += `<button class="card-action action-close" data-action="close" data-id="${job.id}" title="Închide jobul">×</button>`;
  if (canReopen) actions += `<button class="card-action action-reopen" data-action="reopen" data-id="${job.id}">Redeschide jobul</button>`;

  const contact = [job.company_name, job.contact_name, job.contact_phone].some(Boolean)
    ? `<details class="contact-details"><summary>Contact și companie ▾</summary><div class="contact-body">
        ${job.company_name ? `<span>🏢 ${escapeHtml(job.company_name)}</span>` : ''}
        ${job.contact_name ? `<span>👤 ${escapeHtml(job.contact_name)}</span>` : ''}
        ${job.contact_phone ? `<a href="tel:${escapeHtml(cleanPhoneForLink(job.contact_phone))}">☎ ${escapeHtml(job.contact_phone)}</a>` : ''}
      </div></details>` : '<div class="contact-details"><span style="font-size:11px;color:#94a0af">Fără contact introdus</span></div>';

  return `<article class="job-card status-${escapeHtml(job.status)} priority-${escapeHtml(priority)}">
    <div class="card-head">
      <div class="badges">
        <span class="badge badge-${escapeHtml(job.status)}">${escapeHtml(statusLabels[job.status] || job.status)}</span>
        ${priority === 'urgent' ? '<span class="badge badge-urgent">URGENT</span>' : ''}
        ${priority === 'low' ? '<span class="badge badge-low">LOW</span>' : ''}
      </div>
      <span class="card-date" title="${escapeHtml(formatDate(job.created_at, { dateStyle: 'full', timeStyle: 'short' }))}">${relativeTime(job.created_at)}</span>
    </div>
    <h3>${escapeHtml(job.trade)}</h3>
    <div class="location"><span>⌖</span><span>${escapeHtml(job.location)}${job.postcode ? `<span class="postcode">${escapeHtml(job.postcode)}</span>` : ''}</span></div>
    ${job.rate ? `<div class="rate">${escapeHtml(job.rate)}</div>` : ''}
    <div class="facts">${facts.map((fact) => `<span class="fact">${escapeHtml(fact)}</span>`).join('')}</div>
    ${job.description ? `<p class="description">${escapeHtml(job.description)}</p>` : ''}
    ${ownerBlock}
    ${contact}
    <div class="card-footer-meta"><span>Postat de ${escapeHtml(job.created_by || 'necunoscut')}</span><span>${job.job_reference ? `#${escapeHtml(job.job_reference)}` : `ID ${job.id}`}</span></div>
    ${actions ? `<div class="card-actions">${actions}</div>` : ''}
  </article>`;
}

function openCreateDialog() {
  const form = $('#jobForm');
  form.reset();
  $('#workersInput').value = '1';
  $('#priorityInput').value = 'normal';
  $('#editingJobId').value = '';
  $('#jobDialogTitle').textContent = 'Postează un job';
  $('#formModeBadge').textContent = 'CREATE';
  $('#saveJobButton').textContent = 'Publică jobul';
  $('#jobDialog').showModal();
  window.setTimeout(() => $('#sourceText').focus(), 80);
}

function openEditDialog(id) {
  const job = state.jobs.find((item) => item.id === Number(id));
  if (!job) return;
  $('#jobForm').reset();
  $('#editingJobId').value = String(job.id);
  $('#jobDialogTitle').textContent = 'Editează jobul';
  $('#formModeBadge').textContent = 'EDIT';
  $('#saveJobButton').textContent = 'Salvează modificările';
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
  if (/\btomorrow\b/i.test(cleaned)) {
    const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10);
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
    || compact.match(/\b(?:start(?:ing)?\s*(?:date)?\s*[:\-]?\s*)(tomorrow|asap|20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[/.\-]\d{1,2}[/.\-]20\d{2})\b/i)?.[1]
    || '';
  const duration = lineValue(compact, ['duration', 'length', 'contract length'])
    || compact.match(/\b(?:for\s+)?(\d+\s*(?:days?|weeks?|months?|years?)|ongoing|long[-\s]?term)\b/i)?.[1] || '';
  const shift = lineValue(compact, ['shift', 'hours', 'working hours'])
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
  toast(filled ? `Am completat automat ${filled} câmpuri.` : 'Nu am găsit suficiente date. Completează manual câmpurile obligatorii.', filled ? 'success' : 'info');
}

function jobPayloadFromForm() {
  const values = Object.fromEntries(new FormData($('#jobForm')).entries());
  values.workers_needed = Number(values.workers_needed) || 1;
  values.source_kind = values.source_text?.trim() ? 'paste' : 'manual';
  for (const key of Object.keys(values)) if (typeof values[key] === 'string') values[key] = values[key].trim();
  return values;
}

async function performAction(action, id, extra = {}) {
  setBusy(true, action === 'claim' ? 'Revendicăm jobul…' : 'Se salvează…');
  try {
    await api(action, { id: Number(id), agent: state.agent, ...extra });
    const messages = {
      claim: 'Jobul este acum revendicat de tine.', release: 'Jobul a fost eliberat.',
      close: 'Jobul a fost închis.', reopen: 'Jobul a fost redeschis.', fill: 'Perfect — jobul este marcat „Om găsit”.',
    };
    toast(messages[action] || 'Modificarea a fost salvată.', 'success');
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
  const code = $('#accessCode').value.trim();
  $('#accessError').hidden = true;
  const submit = event.submitter || $('button[type="submit"]', event.currentTarget);
  if (submit) submit.disabled = true;
  try {
    await establishSession(agent, code);
    toast(`Bun venit, ${agent}.`, 'success');
  } catch (error) {
    clearSession();
    $('#accessError').textContent = error.message;
    $('#accessError').hidden = false;
  } finally {
    if (submit) submit.disabled = false;
  }
});

$('#addButton').addEventListener('click', openCreateDialog);
$('#refreshButton').addEventListener('click', () => loadJobs({ silent: false }));
$('#retryButton').addEventListener('click', () => loadJobs({ silent: false }));
$('#agentButton').addEventListener('click', () => {
  const previous = state.agent;
  clearSession();
  $('#agentButton').hidden = true;
  showAccessDialog(previous);
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
  if (!text) return toast('Lipește mai întâi textul anunțului.', 'error');
  applyParsedData(parseJobText(text));
});

$('#sourceText').addEventListener('paste', () => {
  window.setTimeout(() => {
    const formIsMostlyEmpty = !$('#tradeInput').value && !$('#locationInput').value;
    if (formIsMostlyEmpty && $('#sourceText').value.trim().length > 20) applyParsedData(parseJobText($('#sourceText').value));
  }, 80);
});

$('#jobForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = $('#editingJobId').value;
  const action = id ? 'edit' : 'create';
  setBusy(true, id ? 'Salvăm modificările…' : 'Publicăm jobul…');
  try {
    await api(action, { id: id ? Number(id) : undefined, agent: state.agent, job: jobPayloadFromForm() });
    $('#jobDialog').close();
    toast(id ? 'Jobul a fost actualizat.' : 'Jobul a fost publicat și este OPEN.', 'success');
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
  if (action === 'release' && window.confirm('Eliberezi acest job pentru ca alt agent să îl poată revendica?')) return performAction('release', id);
  if (action === 'close' && window.confirm('Închizi jobul fără să îl marchezi „Om găsit”?')) return performAction('close', id);
  if (action === 'reopen' && window.confirm('Redeschizi jobul și îl pui din nou la OPEN?')) return performAction('reopen', id);
});

$$('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => {
  const dialog = document.getElementById(button.dataset.closeDialog);
  if (dialog?.open) dialog.close();
}));

$('#accessDialog').addEventListener('cancel', (event) => event.preventDefault());

$$('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
  if (event.target === dialog && dialog.id !== 'accessDialog') dialog.close();
}));

window.addEventListener('online', () => { toast('Conexiunea a revenit.', 'success'); loadJobs({ silent: true }); });
window.addEventListener('offline', () => { $('#connectionText').textContent = 'Telefonul sau calculatorul este offline.'; $('#connectionBanner').hidden = false; });
document.addEventListener('visibilitychange', () => { if (!document.hidden && state.boardKey) loadJobs({ silent: true }); });
window.setInterval(() => { if (!document.hidden && state.boardKey && !state.loading) loadJobs({ silent: true }); }, 30000);
window.setInterval(() => { if (state.lastLoaded) $('#lastUpdated').textContent = `Actualizat ${relativeTime(state.lastLoaded)}`; }, 15000);

(async function init() {
  renderLoading();
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (saved?.agent && saved?.boardKey) {
      await establishSession(saved.agent, saved.boardKey);
      return;
    }
  } catch {
    clearSession();
  }
  showAccessDialog();
})();
