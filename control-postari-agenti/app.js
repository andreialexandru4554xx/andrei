(() => {
  'use strict';

  const SUPABASE_URL = 'https://lmztoiikbgcaeztdweov.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hNcUMCduD_AAjBTgJvjqfg_BNJOLk6Z';
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
  });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = {
    auth: $('#authView'), access: $('#accessView'), app: $('#appView'), content: $('#pageContent'),
    title: $('#pageTitle'), eyebrow: $('#pageEyebrow'), badge: $('#approvalBadge'), add: $('#addPostBtn'),
    userName: $('#userName'), userRole: $('#userRole'), initials: $('#userInitials'), modal: $('#modalBackdrop'),
    form: $('#postForm'), toast: $('#toast'), sidebar: $('.sidebar'),
  };
  const state = {
    session: null, user: null, profile: null, agents: [], channels: [], posts: [], profiles: [], audit: [],
    page: 'dashboard', postId: null, postPage: 1, pageSize: 30, charts: [], realtime: null,
    filters: { search: '', agent: 'all', platform: 'all', status: 'all', verification: 'all' },
    routing: false, imported: false,
  };
  const PAGE = {
    dashboard: ['Dashboard', 'VEDERE GENERALĂ'], posts: ['Postări', 'EVIDENȚĂ COMPLETĂ'],
    approvals: ['Aprobări', 'CONTROL ȘI VERIFICARE'], agents: ['Agenți', 'ECHIPĂ ȘI PERFORMANȚĂ'],
    channels: ['Canale', 'UNDE PUBLICĂM'], team: ['Echipă', 'ACCES ȘI ROLURI'], audit: ['Audit', 'ISTORIC ADMINISTRATIV'],
  };
  const STATUS = { published: 'Publicată', pending: 'În așteptare', removed: 'Eliminată' };
  const VERIFY = { verified: 'Aprobată', unverified: 'Neverificată', rejected: 'Respinsă' };
  const ROLES = { admin: 'Administrator', agent: 'Agent', viewer: 'Vizualizare' };
  const PLATFORMS = { youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', website: 'Website', whatsapp: 'WhatsApp', viber: 'Viber', linkedin: 'LinkedIn', telegram: 'Telegram', other: 'Altele' };

  const esc = (v = '') => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const norm = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const initials = (v = '') => String(v).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]?.toUpperCase()).join('') || '?';
  const clip = (v = '', n = 100) => String(v || '').length > n ? `${String(v).slice(0, n - 1)}…` : String(v || '');
  const day = (v = new Date()) => { const d = v instanceof Date ? v : new Date(v); return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const fmt = (v, time = false) => { if (!v) return '—'; const d = new Date(v); if (Number.isNaN(d.getTime())) return '—'; return new Intl.DateTimeFormat('ro-RO', time ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short', year: 'numeric' }).format(d); };
  const safeUrl = (v = '') => { try { const u = new URL(String(v).trim()); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const relative = (v) => { if (!v) return '—'; const delta = new Date(v).getTime() - Date.now(), abs = Math.abs(delta), f = new Intl.RelativeTimeFormat('ro', { numeric: 'auto' }); if (abs < 60000) return 'acum'; if (abs < 3600000) return f.format(Math.round(delta / 60000), 'minute'); if (abs < 86400000) return f.format(Math.round(delta / 3600000), 'hour'); if (abs < 2592000000) return f.format(Math.round(delta / 86400000), 'day'); return fmt(v); };
  const isAdmin = () => state.profile?.role === 'admin' && state.profile?.active === true;
  const myAgent = () => state.agents.find(a => a.user_id === state.user?.id) || null;
  const canCreate = () => isAdmin() || (state.profile?.role === 'agent' && !!myAgent());
  const canEdit = (p) => isAdmin() || (state.profile?.role === 'agent' && myAgent()?.id === p?.agent_id);
  const platform = (c) => { const p = norm(c?.platform), n = norm(c?.name); if (n.includes('youtube')) return 'youtube'; for (const k of Object.keys(PLATFORMS)) if (p === k || n.includes(k)) return k; return 'other'; };
  const platformPill = (c) => { const p = platform(c); return `<span class="platform-pill platform-${esc(p)}">${esc(PLATFORMS[p] || 'Altele')}</span>`; };
  const pill = (v, verify = false) => `<span class="status-pill status-${esc(v || (verify ? 'unverified' : 'pending'))}">${esc((verify ? VERIFY : STATUS)[v] || v || '—')}</span>`;
  const empty = (h = 'Nicio înregistrare', p = 'Nu există date pentru filtrele selectate.') => `<div class="empty-state"><div>◌</div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`;
  const loading = () => { el.content.innerHTML = '<div class="loading"><div><div class="spinner"></div><div>Actualizez datele…</div></div></div>'; };
  const destroyCharts = () => { state.charts.forEach(c => { try { c.destroy(); } catch {} }); state.charts = []; };

  function errText(error) {
    const raw = String(error?.message || error || 'A apărut o eroare.'), t = raw.toLowerCase();
    if (t.includes('invalid login credentials')) return 'Emailul sau parola nu sunt corecte.';
    if (t.includes('email not confirmed')) return 'Confirmă adresa de email, apoi autentifică-te din nou.';
    if (t.includes('user already registered')) return 'Există deja un cont cu acest email.';
    if (t.includes('row-level security') || t.includes('permission denied')) return 'Contul nu are permisiune pentru această acțiune.';
    if (t.includes('duplicate key')) return 'Această înregistrare există deja.';
    if (t.includes('failed to fetch') || t.includes('network')) return 'Conexiunea la server a eșuat.';
    return raw.length > 190 ? `${raw.slice(0, 187)}…` : raw;
  }
  let toastTimer;
  function toast(message, type = 'success') { clearTimeout(toastTimer); el.toast.textContent = message; el.toast.className = `toast show ${type}`; toastTimer = setTimeout(() => { el.toast.className = 'toast'; }, 5200); }
  function show(view) { el.auth.classList.toggle('hidden', view !== 'auth'); el.access.classList.toggle('hidden', view !== 'access'); el.app.classList.toggle('hidden', view !== 'app'); }
  async function sha256(value) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(value))); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join(''); }

  async function ownProfile(retries = 1) {
    for (let i = 0; i <= retries; i++) {
      const { data, error } = await db.from('pc_profiles').select('user_id,display_name,role,active,created_at,updated_at').eq('user_id', state.user.id).maybeSingle();
      if (error) throw error;
      if (data) return data;
      if (i < retries) await new Promise(r => setTimeout(r, 450));
    }
    return null;
  }
  async function ensureProfile() {
    let p = await ownProfile(2);
    if (p) return p;
    const display_name = state.user?.user_metadata?.display_name || state.user?.email?.split('@')[0] || 'Utilizator';
    const { error } = await db.from('pc_profiles').insert({ user_id: state.user.id, display_name, role: 'viewer', active: false });
    if (error && !norm(error.message).includes('duplicate')) throw error;
    return ownProfile(2);
  }
  function accessScreen() {
    const name = state.profile?.display_name || state.user?.email || 'Utilizator';
    $('#accessTitle').textContent = 'Activează accesul';
    $('#accessMessage').textContent = `${name}, contul este creat. Primul administrator introduce codul unic; ceilalți membri sunt aprobați din secțiunea Echipă.`;
    $('#claimAdminForm').classList.remove('hidden');
  }
  function userHeader() {
    const name = state.profile?.display_name || state.user?.email || 'Utilizator';
    el.userName.textContent = name; el.userRole.textContent = ROLES[state.profile?.role] || state.profile?.role || 'cont'; el.initials.textContent = initials(name);
  }
  function roleUi() { $$('.admin-only').forEach(x => x.classList.toggle('hidden', !isAdmin())); el.add.classList.toggle('hidden', !canCreate()); }

  async function routeSession() {
    if (state.routing) return;
    state.routing = true;
    try {
      const { data, error } = await db.auth.getSession(); if (error) throw error;
      state.session = data.session; state.user = data.session?.user || null;
      if (!state.user) { state.profile = null; show('auth'); return; }
      state.profile = await ensureProfile();
      if (!state.profile?.active) { accessScreen(); show('access'); return; }
      show('app'); userHeader(); roleUi(); await load(false); if (isAdmin()) await importLegacy(); subscribe(); setPage(location.hash.slice(1) || state.page, false);
    } catch (error) { console.error(error); toast(errText(error), 'error'); show('auth'); }
    finally { state.routing = false; }
  }
  async function importLegacy() {
    if (!isAdmin() || state.imported) return; state.imported = true;
    try {
      const { data, error } = await db.rpc('pc_import_legacy_posts');
      if (error) return console.warn(error.message);
      if (Number(data?.posts_inserted || 0) > 0) { toast(`Istoric restaurat: ${data.posts_inserted} postări.`, 'success'); await load(true); }
    } catch (e) { console.warn(e); }
  }
  function joinPosts(rows) {
    const am = new Map(state.agents.map(x => [x.id, x])), cm = new Map(state.channels.map(x => [x.id, x]));
    return (rows || []).map(p => ({ ...p, agent: am.get(p.agent_id) || null, channel: cm.get(p.channel_id) || null }));
  }
  async function load(silent = false) {
    if (!silent) loading();
    try {
      const [a, c, p] = await Promise.all([
        db.from('pc_agents').select('*').order('name'), db.from('pc_channels').select('*').order('name'),
        db.from('pc_posts').select('*').order('posted_at', { ascending: false }).limit(5000),
      ]);
      if (a.error) throw a.error; if (c.error) throw c.error; if (p.error) throw p.error;
      state.agents = a.data || []; state.channels = c.data || []; state.posts = joinPosts(p.data || []);
      if (isAdmin()) {
        const [profiles, audit] = await Promise.all([
          db.from('pc_profiles').select('*').order('display_name'), db.from('pc_audit_log').select('*').order('created_at', { ascending: false }).limit(600),
        ]);
        if (!profiles.error) state.profiles = profiles.data || []; if (!audit.error) state.audit = audit.data || [];
      } else { state.profiles = []; state.audit = []; }
      updateBadge(); roleUi(); if (silent) renderPage();
    } catch (error) { console.error(error); el.content.innerHTML = empty('Nu am putut încărca datele', errText(error)); toast(errText(error), 'error'); }
  }
  function subscribe() {
    if (state.realtime) db.removeChannel(state.realtime);
    state.realtime = db.channel('control-postari-live').on('postgres_changes', { event: '*', schema: 'public', table: 'pc_posts' }, () => { clearTimeout(state.refreshTimer); state.refreshTimer = setTimeout(() => load(true), 400); }).subscribe();
  }
  function updateBadge() { const n = state.posts.filter(p => p.verification_status === 'unverified').length; el.badge.textContent = n > 99 ? '99+' : String(n); el.badge.classList.toggle('hidden', !n); }
  function setPage(page, hash = true) {
    if (!PAGE[page]) page = 'dashboard'; if (['team', 'audit'].includes(page) && !isAdmin()) page = 'dashboard';
    state.page = page; [el.title.textContent, el.eyebrow.textContent] = PAGE[page];
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page)); if (hash) history.replaceState(null, '', `#${page}`);
    destroyCharts(); renderPage(); el.sidebar.classList.remove('open');
  }
  function renderPage() { ({ dashboard: dashboard, posts: postsPage, approvals, agents, channels, team, audit }[state.page] || dashboard)(); }

  function kpi(label, value, icon, foot, accent = 'rgba(79,224,178,.13)') { return `<article class="kpi-card" style="--accent:${accent}"><div class="kpi-head"><span>${esc(label)}</span><span class="kpi-icon">${icon}</span></div><div class="kpi-value">${esc(value)}</div><div class="kpi-foot">${foot}</div></article>`; }
  function latest() { const x = state.posts.map(p => new Date(p.posted_at).getTime()).filter(Number.isFinite); return x.length ? new Date(Math.max(...x)) : new Date(); }
  function ranking() { return state.agents.map(agent => { const p = state.posts.filter(x => x.agent_id === agent.id); return { agent, total: p.length, verified: p.filter(x => x.verification_status === 'verified').length }; }).sort((a, b) => b.total - a.total); }
  function dashboard() {
    const today = state.posts.filter(p => day(p.posted_at) === day()).length, pending = state.posts.filter(p => p.verification_status === 'unverified').length,
      verified = state.posts.filter(p => p.verification_status === 'verified').length, active = state.agents.filter(a => a.active).length,
      rate = state.posts.length ? Math.round(verified / state.posts.length * 100) : 0, rank = ranking().slice(0, 7), recent = state.posts.slice(0, 8);
    el.content.innerHTML = `<section class="kpi-grid">${kpi('Postări totale', String(state.posts.length), '▤', `<strong>${today}</strong> înregistrate astăzi`)}${kpi('De aprobat', String(pending), '✓', pending ? `<strong>${pending}</strong> necesită atenție` : '<strong>0</strong> coadă curată', 'rgba(255,191,91,.15)')}${kpi('Agenți activi', String(active), '◎', `<strong>${state.agents.length}</strong> configurați`, 'rgba(60,183,255,.15)')}${kpi('Rată verificare', `${rate}%`, '◈', `<strong>${verified}</strong> postări aprobate`, 'rgba(177,111,255,.14)')}</section>
    <section class="dashboard-grid"><article class="panel"><div class="panel-head"><div><h3>Ritmul publicării</h3><p>Ultimele 14 zile din istoricul disponibil</p></div><span class="status-pill status-published">${esc(fmt(latest()))}</span></div><div class="chart-wrap"><canvas id="trendChart"></canvas></div></article><article class="panel"><div class="panel-head"><div><h3>Platforme</h3><p>Distribuția postărilor</p></div></div><div class="chart-wrap small"><canvas id="platformChart"></canvas></div></article></section>
    <section class="dashboard-grid"><article class="panel"><div class="panel-head"><div><h3>Clasament agenți</h3><p>Volum total și postări aprobate</p></div><button class="action-btn" data-go="agents">Detalii</button></div>${rank.length ? `<div class="rank-list">${rank.map((r, i) => `<div class="rank-row"><span class="rank-index">${i + 1}</span><div class="rank-info"><strong>${esc(r.agent.name)}</strong><small>${r.verified} aprobate</small></div><div class="rank-score"><strong>${r.total}</strong><small>postări</small></div></div>`).join('')}</div>` : empty('Niciun agent', 'Adaugă primul agent.')}</article>
    <article class="panel"><div class="panel-head"><div><h3>Activitate recentă</h3><p>Cele mai noi înregistrări</p></div><button class="action-btn" data-go="posts">Toate</button></div>${recent.length ? `<div class="rank-list">${recent.map(p => `<div class="rank-row"><span class="rank-index">${esc(initials(p.agent?.name))}</span><div class="rank-info"><strong>${esc(clip(p.title || 'Fără titlu', 60))}</strong><small>${esc(p.agent?.name || 'Agent necunoscut')} • ${esc(relative(p.posted_at))}</small></div><div>${platformPill(p.channel)}</div></div>`).join('')}</div>` : empty()}</article></section>
    <article class="panel recent-panel"><div class="panel-head"><div><h3>Ultimele postări</h3><p>Acces rapid la verificare și editare</p></div></div>${postTable(recent, false)}</article>`;
    requestAnimationFrame(charts);
  }
  function charts() {
    if (!window.Chart) return;
    const end = latest(); end.setHours(0, 0, 0, 0); const counts = new Map(); state.posts.forEach(p => counts.set(day(p.posted_at), (counts.get(day(p.posted_at)) || 0) + 1));
    const s = Array.from({ length: 14 }, (_, i) => { const d = new Date(end); d.setDate(end.getDate() - (13 - i)); return { d, v: counts.get(day(d)) || 0 }; });
    const tc = $('#trendChart'); if (tc) state.charts.push(new Chart(tc, { type: 'line', data: { labels: s.map(x => new Intl.DateTimeFormat('ro', { day: '2-digit', month: 'short' }).format(x.d)), datasets: [{ data: s.map(x => x.v), borderColor: '#4fe0b2', backgroundColor: 'rgba(79,224,178,.13)', fill: true, tension: .38, pointRadius: 3, pointBackgroundColor: '#75e9c4' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#7890a7', font: { size: 9 } }, border: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(148,184,220,.08)' }, ticks: { color: '#7890a7', precision: 0, font: { size: 9 } }, border: { display: false } } } } }));
    const byPlatform = {}; state.posts.forEach(p => { const k = platform(p.channel); byPlatform[k] = (byPlatform[k] || 0) + 1; }); const entries = Object.entries(byPlatform).sort((a, b) => b[1] - a[1]);
    const pc = $('#platformChart'); if (pc) state.charts.push(new Chart(pc, { type: 'doughnut', data: { labels: entries.map(([k]) => PLATFORMS[k] || k), datasets: [{ data: entries.map(([, v]) => v), backgroundColor: ['#ff7481', '#e690ff', '#67e6df', '#65aaff', '#4fe0b2', '#ffbf5b', '#8fb1c8'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: '#9db2c5', boxWidth: 10, padding: 14, font: { size: 10 } } } } } }));
  }

  function filtered() {
    const q = norm(state.filters.search);
    return state.posts.filter(p => (!q || norm([p.title, p.campaign, p.notes, p.agent?.name, p.channel?.name, p.source_name, p.content_type].join(' ')).includes(q)) && (state.filters.agent === 'all' || p.agent_id === state.filters.agent) && (state.filters.platform === 'all' || platform(p.channel) === state.filters.platform) && (state.filters.status === 'all' || p.status === state.filters.status) && (state.filters.verification === 'all' || p.verification_status === state.filters.verification));
  }
  function postTable(rows, full = true) {
    if (!rows.length) return empty();
    return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Conținut</th><th>Agent</th><th>Platformă</th><th>Data</th><th>Status</th><th>Verificare</th>${full ? '<th>Link</th><th>Acțiuni</th>' : ''}</tr></thead><tbody>${rows.map(p => { const u = safeUrl(p.post_url) || safeUrl(p.proof_url); return `<tr><td><div class="row-title" title="${esc(p.title || '')}">${esc(p.title || 'Fără titlu')}</div><div class="muted">${esc(p.campaign || p.content_type || 'General')}</div></td><td>${esc(p.agent?.name || 'Necunoscut')}</td><td>${platformPill(p.channel)}</td><td>${esc(fmt(p.posted_at, true))}</td><td>${pill(p.status)}</td><td>${pill(p.verification_status, true)}</td>${full ? `<td>${u ? `<a class="action-btn" href="${esc(u)}" target="_blank" rel="noopener">Deschide ↗</a>` : '—'}</td><td><div class="panel-actions">${isAdmin() && p.verification_status !== 'verified' ? `<button class="action-btn" data-approve="${esc(p.id)}">✓</button>` : ''}${isAdmin() && p.verification_status !== 'rejected' ? `<button class="action-btn" data-reject="${esc(p.id)}">×</button>` : ''}${canEdit(p) ? `<button class="action-btn" data-edit-post="${esc(p.id)}">Editează</button>` : ''}</div></td>` : ''}</tr>`; }).join('')}</tbody></table></div>`;
  }
  function filterBar() {
    const p = [...new Set(state.posts.map(x => platform(x.channel)))];
    return `<div class="filterbar"><input id="filterSearch" value="${esc(state.filters.search)}" placeholder="Caută titlu, agent, campanie…"><select id="filterAgent"><option value="all">Toți agenții</option>${state.agents.map(a => `<option value="${esc(a.id)}" ${state.filters.agent === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select><select id="filterPlatform"><option value="all">Toate platformele</option>${p.map(k => `<option value="${k}" ${state.filters.platform === k ? 'selected' : ''}>${esc(PLATFORMS[k] || k)}</option>`).join('')}</select><select id="filterStatus"><option value="all">Orice status</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${state.filters.status === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select><select id="filterVerification"><option value="all">Orice verificare</option>${Object.entries(VERIFY).map(([k, v]) => `<option value="${k}" ${state.filters.verification === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select><button class="btn secondary" data-clear-filters>Reset</button></div>`;
  }
  function postsPage() {
    const all = filtered(), pages = Math.max(1, Math.ceil(all.length / state.pageSize)); state.postPage = Math.min(state.postPage, pages); const start = (state.postPage - 1) * state.pageSize, rows = all.slice(start, start + state.pageSize);
    el.content.innerHTML = `<article class="panel"><div class="panel-head"><div><h3>Evidență completă</h3><p>${all.length} din ${state.posts.length} postări</p></div><div class="panel-actions"><button class="btn secondary" data-export>Export CSV</button>${canCreate() ? '<button class="btn primary" data-new-post>＋ Adaugă</button>' : ''}</div></div>${filterBar()}${postTable(rows)}<div class="pager"><span>${all.length ? `${start + 1}–${Math.min(start + state.pageSize, all.length)} din ${all.length}` : '0 rezultate'}</span><div class="pager-actions"><button class="action-btn" data-post-page="${state.postPage - 1}" ${state.postPage <= 1 ? 'disabled' : ''}>← Înapoi</button><button class="action-btn" data-post-page="${state.postPage + 1}" ${state.postPage >= pages ? 'disabled' : ''}>Înainte →</button></div></div></article>`;
  }
  function approvals() {
    const rows = state.posts.filter(p => p.verification_status === 'unverified');
    el.content.innerHTML = `<article class="panel"><div class="panel-head"><div><h3>Coada de aprobare</h3><p>${rows.length} postări așteaptă o decizie</p></div></div>${rows.length ? `<div class="approval-grid">${rows.map(p => { const u = safeUrl(p.post_url) || safeUrl(p.proof_url); return `<section class="approval-card"><div class="entity-top"><div>${platformPill(p.channel)}</div>${pill(p.status)}</div><h3>${esc(p.title || 'Fără titlu')}</h3><p>${esc(clip(p.notes || p.campaign || 'Fără observații.', 160))}</p><div class="approval-meta"><span class="status-pill status-published">${esc(p.agent?.name || 'Agent')}</span><span class="status-pill status-pending">${esc(fmt(p.posted_at, true))}</span>${u ? `<a class="action-btn" href="${esc(u)}" target="_blank" rel="noopener">Vezi ↗</a>` : ''}</div>${isAdmin() ? `<div class="approval-actions"><button class="btn primary" data-approve="${esc(p.id)}">✓ Aprobă</button><button class="btn danger" data-reject="${esc(p.id)}">× Respinge</button><button class="btn secondary" data-edit-post="${esc(p.id)}">Editează</button></div>` : ''}</section>`; }).join('')}</div>` : empty('Coada este curată', 'Nu există postări care să aștepte aprobarea.')}</article>`;
  }
  function agentStats(a) { const p = state.posts.filter(x => x.agent_id === a.id); return { total: p.length, verified: p.filter(x => x.verification_status === 'verified').length, today: p.filter(x => day(x.posted_at) === day()).length }; }
  function agents() {
    const cards = state.agents.map(a => { const s = agentStats(a); return `<article class="entity-card"><div class="entity-top"><span class="entity-avatar">${esc(initials(a.name))}</span><span>${pill(a.active ? 'published' : 'removed')}</span></div><h3>${esc(a.name)}</h3><p>${esc(a.notes || (a.user_id ? 'Profil asociat' : 'Agent neasociat unui cont'))}</p><div class="entity-stats"><div><strong>${s.total}</strong><small>Total postări</small></div><div><strong>${s.verified}</strong><small>Aprobate</small></div><div><strong>${s.today}</strong><small>Astăzi</small></div><div><strong>${Number(a.target_daily || 0)}</strong><small>Țintă zilnică</small></div></div>${isAdmin() ? `<div class="approval-actions"><button class="action-btn" data-filter-agent="${esc(a.id)}">Postări</button><button class="action-btn" data-toggle-agent="${esc(a.id)}">${a.active ? 'Dezactivează' : 'Activează'}</button></div>` : ''}</article>`; }).join('');
    el.content.innerHTML = `<article class="panel"><div class="panel-head"><div><h3>Agenți și performanță</h3><p>${state.agents.filter(a => a.active).length} activi din ${state.agents.length}</p></div></div>${isAdmin() ? '<form id="agentInlineForm" class="inline-form"><input name="name" required minlength="2" maxlength="100" placeholder="Nume agent"><input name="target_daily" type="number" min="0" max="500" value="30"><select name="active"><option value="true">Activ</option><option value="false">Inactiv</option></select><button class="btn primary" type="submit">＋ Adaugă</button></form>' : ''}<div class="entity-grid">${cards || empty('Niciun agent', 'Administratorul trebuie să adauge primul agent.')}</div></article>`;
  }
  function channels() {
    const cards = state.channels.map(c => { const p = state.posts.filter(x => x.channel_id === c.id), u = safeUrl(c.url); return `<article class="entity-card"><div class="entity-top"><span class="entity-avatar">${esc((PLATFORMS[platform(c)] || '?').slice(0, 2).toUpperCase())}</span>${platformPill(c)}</div><h3>${esc(c.name)}</h3><p>${esc(c.notes || (u ? clip(u, 70) : 'Fără link configurat'))}</p><div class="entity-stats"><div><strong>${p.length}</strong><small>Total postări</small></div><div><strong>${p.filter(x => day(x.posted_at) === day()).length}</strong><small>Astăzi</small></div><div><strong>${Number(c.target_daily || 0)}</strong><small>Țintă zilnică</small></div><div><strong>${c.active ? 'DA' : 'NU'}</strong><small>Activ</small></div></div><div class="approval-actions">${u ? `<a class="action-btn" href="${esc(u)}" target="_blank" rel="noopener">Deschide ↗</a>` : ''}<button class="action-btn" data-filter-platform="${esc(platform(c))}">Postări</button>${isAdmin() ? `<button class="action-btn" data-toggle-channel="${esc(c.id)}">${c.active ? 'Dezactivează' : 'Activează'}</button>` : ''}</div></article>`; }).join('');
    el.content.innerHTML = `<article class="panel"><div class="panel-head"><div><h3>Canalele de publicare</h3><p>${state.channels.filter(c => c.active).length} canale active</p></div></div>${isAdmin() ? '<form id="channelInlineForm" class="inline-form"><input name="name" required minlength="2" maxlength="140" placeholder="Nume canal / grup"><select name="platform"><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="other">YouTube / Altele</option><option value="website">Website</option><option value="whatsapp">WhatsApp</option><option value="viber">Viber</option><option value="linkedin">LinkedIn</option><option value="telegram">Telegram</option></select><input name="url" type="url" placeholder="https://..."><button class="btn primary" type="submit">＋ Adaugă</button></form>' : ''}<div class="entity-grid">${cards || empty('Niciun canal', 'Configurează prima platformă sau primul grup.')}</div></article>`;
  }
  function team() {
    if (!isAdmin()) return setPage('dashboard'); const assigned = new Map(state.agents.filter(a => a.user_id).map(a => [a.user_id, a]));
    el.content.innerHTML = `<article class="panel"><div class="panel-head"><div><h3>Accesul echipei</h3><p>${state.profiles.filter(p => !p.active).length} conturi în așteptare • ${state.profiles.length} total</p></div></div>${state.profiles.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Membru</th><th>Rol</th><th>Agent asociat</th><th>Acces</th><th>Creat</th></tr></thead><tbody>${state.profiles.map(p => { const a = assigned.get(p.user_id), self = p.user_id === state.user.id; return `<tr><td><div class="row-title">${esc(p.display_name || 'Fără nume')}</div><div class="muted">${self ? 'Contul tău' : esc(String(p.user_id).slice(0, 8))}</div></td><td><select class="action-btn" data-team-role="${esc(p.user_id)}" ${self ? 'disabled' : ''}>${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${p.role === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></td><td><select class="action-btn" data-team-agent="${esc(p.user_id)}"><option value="">Fără asociere</option>${state.agents.map(x => `<option value="${esc(x.id)}" ${a?.id === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></td><td><select class="action-btn" data-team-active="${esc(p.user_id)}" ${self ? 'disabled' : ''}><option value="true" ${p.active ? 'selected' : ''}>Activ</option><option value="false" ${!p.active ? 'selected' : ''}>În așteptare</option></select></td><td>${esc(fmt(p.created_at))}</td></tr>`; }).join('')}</tbody></table></div>` : empty('Niciun cont', 'Conturile noi vor apărea aici după înregistrare.')}</article>`;
  }
  function audit() {
    if (!isAdmin()) return setPage('dashboard');
    el.content.innerHTML = `<article class="panel"><div class="panel-head"><div><h3>Jurnal administrativ</h3><p>${state.audit.length} evenimente recente</p></div></div>${state.audit.length ? `<div class="rank-list">${state.audit.map(r => { const data = r.payload || r.new_data || {}, label = `${r.action || r.event || 'acțiune'} • ${r.entity_type || r.table_name || 'înregistrare'}${data.name || data.title || data.display_name ? ` • ${data.name || data.title || data.display_name}` : ''}`; return `<div class="rank-row"><span class="rank-index">${esc(String(r.action || '?')[0].toUpperCase())}</span><div class="rank-info"><strong>${esc(clip(label, 130))}</strong><small>${r.actor_id ? `Actor ${esc(String(r.actor_id).slice(0, 8))}` : 'Sistem'}</small></div><div class="rank-score"><strong>${esc(relative(r.created_at))}</strong><small>${esc(fmt(r.created_at, true))}</small></div></div>`; }).join('')}</div>` : empty('Jurnalul este gol', 'Acțiunile administrative vor fi înregistrate aici.')}</article>`;
  }

  function fillForm(p = null) {
    state.postId = p?.id || null; $('#postId').value = p?.id || '';
    const allowed = isAdmin() ? state.agents : state.agents.filter(a => a.user_id === state.user.id);
    $('#postAgent').innerHTML = `<option value="">Alege agentul</option>${allowed.filter(a => a.active || a.id === p?.agent_id).map(a => `<option value="${esc(a.id)}" ${a.id === p?.agent_id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}`;
    $('#postChannel').innerHTML = `<option value="">Alege canalul</option>${state.channels.filter(c => c.active || c.id === p?.channel_id).map(c => `<option value="${esc(c.id)}" ${c.id === p?.channel_id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}`;
    $('#postTitle').value = p?.title || ''; $('#postCampaign').value = p?.campaign || ''; const d = p?.posted_at ? new Date(p.posted_at) : new Date(); $('#postDate').value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    $('#postUrl').value = p?.post_url || ''; $('#proofUrl').value = p?.proof_url || ''; $('#postStatus').value = p?.status || 'published'; $('#verificationStatus').value = p?.verification_status || 'unverified'; $('#verificationStatus').disabled = !isAdmin(); $('#postNotes').value = p?.notes || '';
    $('#deletePostBtn').classList.toggle('hidden', !p || !canEdit(p)); $('#modalTitle').textContent = p ? 'Editează postarea' : 'Adaugă postare';
  }
  function openModal(p = null) { if (!p && !canCreate()) return toast('Nu există un agent activ asociat acestui cont.', 'error'); if (!state.channels.some(c => c.active)) return toast('Administratorul trebuie să adauge cel puțin un canal activ.', 'error'); fillForm(p); el.modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; setTimeout(() => $('#postTitle').focus(), 20); }
  function closeModal() { el.modal.classList.add('hidden'); document.body.style.overflow = ''; state.postId = null; el.form.reset(); }
  async function savePost(event) {
    event.preventDefault(); const id = state.postId, existing = state.posts.find(p => p.id === id); if (existing && !canEdit(existing)) return toast('Nu ai permisiune să editezi această postare.', 'error');
    const payload = { agent_id: $('#postAgent').value, channel_id: $('#postChannel').value, title: $('#postTitle').value.trim(), campaign: $('#postCampaign').value.trim(), posted_at: new Date($('#postDate').value).toISOString(), post_url: safeUrl($('#postUrl').value), proof_url: safeUrl($('#proofUrl').value), status: $('#postStatus').value, notes: $('#postNotes').value.trim() };
    if (isAdmin()) payload.verification_status = $('#verificationStatus').value; if (!id) payload.created_by = state.user.id;
    const button = $('button[type="submit"]', el.form); button.disabled = true;
    try { const r = id ? await db.from('pc_posts').update(payload).eq('id', id) : await db.from('pc_posts').insert(payload); if (r.error) throw r.error; closeModal(); await load(true); toast(id ? 'Postarea a fost actualizată.' : 'Postarea a fost adăugată.'); } catch (e) { toast(errText(e), 'error'); } finally { button.disabled = false; }
  }
  async function removePost() { const p = state.posts.find(x => x.id === state.postId); if (!p || !canEdit(p) || !confirm('Ștergi definitiv această postare?')) return; try { const { error } = await db.from('pc_posts').delete().eq('id', p.id); if (error) throw error; closeModal(); await load(true); toast('Postarea a fost ștearsă.'); } catch (e) { toast(errText(e), 'error'); } }
  async function verifyPost(id, value) { if (!isAdmin()) return; try { const { error } = await db.from('pc_posts').update({ verification_status: value }).eq('id', id); if (error) throw error; await load(true); toast(value === 'verified' ? 'Postarea a fost aprobată.' : 'Postarea a fost respinsă.'); } catch (e) { toast(errText(e), 'error'); } }
  async function createAgent(form) { const d = new FormData(form); try { const { error } = await db.from('pc_agents').insert({ name: String(d.get('name')).trim(), target_daily: Number(d.get('target_daily') || 0), active: d.get('active') === 'true', notes: '', created_by: state.user.id }); if (error) throw error; form.reset(); await load(true); toast('Agent adăugat.'); } catch (e) { toast(errText(e), 'error'); } }
  async function createChannel(form) { const d = new FormData(form); try { const { error } = await db.from('pc_channels').insert({ name: String(d.get('name')).trim(), platform: d.get('platform'), url: safeUrl(d.get('url')), target_daily: 0, active: true, notes: '', created_by: state.user.id }); if (error) throw error; form.reset(); await load(true); toast('Canal adăugat.'); } catch (e) { toast(errText(e), 'error'); } }
  async function toggle(table, item) { try { const { error } = await db.from(table).update({ active: !item.active }).eq('id', item.id); if (error) throw error; await load(true); toast(!item.active ? 'Activat.' : 'Dezactivat.'); } catch (e) { toast(errText(e), 'error'); } }
  async function updateTeam(user, field, value) { try { if (field === 'role' || field === 'active') { const { error } = await db.from('pc_profiles').update({ [field]: field === 'active' ? value === 'true' : value }).eq('user_id', user); if (error) throw error; } else { const clear = await db.from('pc_agents').update({ user_id: null }).eq('user_id', user); if (clear.error) throw clear.error; if (value) { const set = await db.from('pc_agents').update({ user_id: user }).eq('id', value); if (set.error) throw set.error; } } await load(true); toast('Accesul echipei a fost actualizat.'); } catch (e) { toast(errText(e), 'error'); } }
  function exportCsv() { const head = ['Data', 'Agent', 'Canal', 'Platformă', 'Titlu', 'Campanie', 'Status', 'Verificare', 'Link', 'Dovadă', 'Observații'], rows = filtered().map(p => [p.posted_at, p.agent?.name || '', p.channel?.name || '', PLATFORMS[platform(p.channel)] || '', p.title || '', p.campaign || '', STATUS[p.status] || p.status, VERIFY[p.verification_status] || p.verification_status, p.post_url || '', p.proof_url || '', p.notes || '']); const csv = [head, ...rows].map(r => r.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n'), blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `control-postari-${day()}.csv`; a.click(); URL.revokeObjectURL(a.href); }
  async function logout() { if (state.realtime) db.removeChannel(state.realtime); await db.auth.signOut(); state.user = state.profile = null; show('auth'); }

  function bind() {
    $$('.auth-tab').forEach(tab => tab.onclick = () => { $$('.auth-tab').forEach(x => x.classList.toggle('active', x === tab)); $('#loginForm').classList.toggle('hidden', tab.dataset.authTab !== 'login'); $('#signupForm').classList.toggle('hidden', tab.dataset.authTab !== 'signup'); });
    $('#loginForm').onsubmit = async e => { e.preventDefault(); const b = $('button[type="submit"]', e.currentTarget); b.disabled = true; try { const { error } = await db.auth.signInWithPassword({ email: $('#loginEmail').value.trim(), password: $('#loginPassword').value }); if (error) throw error; await routeSession(); } catch (x) { toast(errText(x), 'error'); } finally { b.disabled = false; } };
    $('#signupForm').onsubmit = async e => { e.preventDefault(); const b = $('button[type="submit"]', e.currentTarget); b.disabled = true; try { const { data, error } = await db.auth.signUp({ email: $('#signupEmail').value.trim(), password: $('#signupPassword').value, options: { data: { display_name: $('#signupName').value.trim() }, emailRedirectTo: `${location.origin}${location.pathname}` } }); if (error) throw error; if (data.session) await routeSession(); else { toast('Cont creat. Confirmă emailul primit, apoi autentifică-te.'); $$('.auth-tab')[0].click(); } } catch (x) { toast(errText(x), 'error'); } finally { b.disabled = false; } };
    $('#claimAdminForm').onsubmit = async e => { e.preventDefault(); const b = $('button[type="submit"]', e.currentTarget); b.disabled = true; try { const hash = await sha256($('#activationCode').value.trim().toUpperCase()), name = state.profile?.display_name || state.user?.user_metadata?.display_name || state.user?.email?.split('@')[0] || 'Administrator'; const { error } = await db.from('pc_admin_claims').insert({ user_id: state.user.id, token_hash: hash, display_name: name }); if (error) throw error; state.profile = await ownProfile(3); if (!state.profile?.active || state.profile.role !== 'admin') throw new Error('Codul nu a putut activa administratorul.'); toast('Administratorul a fost activat.'); await routeSession(); } catch (x) { toast(errText(x), 'error'); } finally { b.disabled = false; } };
    $('#refreshAccessBtn').onclick = routeSession; $('#accessLogoutBtn').onclick = logout; $('#logoutBtn').onclick = logout; $('#refreshBtn').onclick = () => load(true); el.add.onclick = () => openModal(); $('#menuBtn').onclick = () => el.sidebar.classList.toggle('open'); $('#userMenuBtn').onclick = () => $('#userDropdown').classList.toggle('hidden'); $('#closeModalBtn').onclick = closeModal; $('#cancelModalBtn').onclick = closeModal; $('#deletePostBtn').onclick = removePost; el.form.onsubmit = savePost;
    el.modal.onclick = e => { if (e.target === el.modal) closeModal(); }; $('#mainNav').onclick = e => { const b = e.target.closest('[data-page]'); if (b) setPage(b.dataset.page); }; window.onhashchange = () => setPage(location.hash.slice(1) || 'dashboard', false); document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };
    el.content.onclick = async e => {
      const go = e.target.closest('[data-go]'); if (go) return setPage(go.dataset.go); if (e.target.closest('[data-new-post]')) return openModal(); if (e.target.closest('[data-export]')) return exportCsv();
      if (e.target.closest('[data-clear-filters]')) { state.filters = { search: '', agent: 'all', platform: 'all', status: 'all', verification: 'all' }; state.postPage = 1; return postsPage(); }
      const pg = e.target.closest('[data-post-page]'); if (pg && !pg.disabled) { state.postPage = Number(pg.dataset.postPage); return postsPage(); }
      const edit = e.target.closest('[data-edit-post]'); if (edit) return openModal(state.posts.find(p => p.id === edit.dataset.editPost));
      const ok = e.target.closest('[data-approve]'); if (ok) return verifyPost(ok.dataset.approve, 'verified'); const no = e.target.closest('[data-reject]'); if (no) return verifyPost(no.dataset.reject, 'rejected');
      const fa = e.target.closest('[data-filter-agent]'); if (fa) { state.filters.agent = fa.dataset.filterAgent; state.filters.platform = 'all'; state.postPage = 1; return setPage('posts'); }
      const fp = e.target.closest('[data-filter-platform]'); if (fp) { state.filters.platform = fp.dataset.filterPlatform; state.filters.agent = 'all'; state.postPage = 1; return setPage('posts'); }
      const ta = e.target.closest('[data-toggle-agent]'); if (ta) { const x = state.agents.find(a => a.id === ta.dataset.toggleAgent); if (x) return toggle('pc_agents', x); }
      const tc = e.target.closest('[data-toggle-channel]'); if (tc) { const x = state.channels.find(c => c.id === tc.dataset.toggleChannel); if (x) return toggle('pc_channels', x); }
    };
    el.content.oninput = e => { if (e.target.id === 'filterSearch') { state.filters.search = e.target.value; state.postPage = 1; clearTimeout(state.filterTimer); state.filterTimer = setTimeout(postsPage, 180); } };
    el.content.onchange = e => { const map = { filterAgent: 'agent', filterPlatform: 'platform', filterStatus: 'status', filterVerification: 'verification' }; if (map[e.target.id]) { state.filters[map[e.target.id]] = e.target.value; state.postPage = 1; return postsPage(); } if (e.target.dataset.teamRole) return updateTeam(e.target.dataset.teamRole, 'role', e.target.value); if (e.target.dataset.teamAgent) return updateTeam(e.target.dataset.teamAgent, 'agent', e.target.value); if (e.target.dataset.teamActive) return updateTeam(e.target.dataset.teamActive, 'active', e.target.value); };
    el.content.onsubmit = e => { if (e.target.id === 'agentInlineForm') { e.preventDefault(); createAgent(e.target); } if (e.target.id === 'channelInlineForm') { e.preventDefault(); createChannel(e.target); } };
  }
  async function init() { bind(); db.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') show('auth'); if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) setTimeout(routeSession, 0); }); await routeSession(); }
  init();
})();
