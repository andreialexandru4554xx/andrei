'use strict';

(() => {
  const PRESENCE_API = 'https://lmztoiikbgcaeztdweov.supabase.co/functions/v1/job-board-presence-api';
  const ONLINE_MS = 15 * 60 * 1000;
  let presence = [];

  const normalize = (v) => String(v || '').trim().toLocaleLowerCase();
  const claimsActiveFor = (name) => {
    const key = normalize(name);
    return state.jobs.flatMap((job) => Array.isArray(job.claims) ? job.claims.map((claim) => ({ job, claim })) : [])
      .filter(({ job, claim }) => ['open','claimed'].includes(job.status)
        && normalize(claim.agent_name) === key
        && Math.max((Number(claim.quantity_claimed)||0) - (Number(claim.quantity_filled)||0), 0) > 0);
  };

  async function presenceApi(action, payload = {}) {
    const response = await fetch(PRESENCE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: PUBLISHABLE_KEY },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || `Presence ${response.status}`);
    return data;
  }

  async function heartbeat() {
    if (!state.agent || !state.email) return;
    try {
      await presenceApi('heartbeat', { agent: state.agent, email: state.email, page: 'job-board' });
    } catch (error) {
      console.warn('Presence heartbeat failed', error);
    }
  }

  async function loadPresence() {
    try {
      const data = await presenceApi('list');
      presence = Array.isArray(data.agents) ? data.agents : [];
      patchSecondDashboard();
    } catch (error) {
      console.warn('Presence list failed', error);
    }
  }

  function onlineAgents() {
    const now = Date.now();
    return presence.filter((agent) => {
      const seen = new Date(agent.last_seen_at).getTime();
      return Number.isFinite(seen) && now - seen <= ONLINE_MS;
    });
  }

  function patchSecondDashboard() {
    const dashboard = document.querySelector('#secondDashboard');
    if (!dashboard) return;
    const grid = dashboard.querySelector('.second-grid');
    const tabCount = document.querySelector('#secondTabCount');
    const online = onlineAgents();
    const represented = new Set();

    dashboard.querySelectorAll('.second-card').forEach((card) => {
      const heading = card.querySelector('.second-name-row h4, h4');
      if (heading) represented.add(normalize(heading.textContent));
    });

    if (!grid && online.length) return;
    for (const agent of online) {
      const key = normalize(agent.agent_name);
      if (!key || represented.has(key) || !grid) continue;
      const rows = claimsActiveFor(agent.agent_name);
      if (rows.length) continue;
      const card = document.createElement('article');
      card.className = 'second-card presence-only-card';
      const lastSeen = typeof relativeTime === 'function' ? relativeTime(agent.last_seen_at) : '';
      card.innerHTML = `
        <div class="second-card-head">
          <div class="second-name-row">
            <h4>${escapeHtml(agent.agent_name)}</h4>
            <div class="second-name-badges"><span class="second-badge presence-online">● ONLINE</span></div>
          </div>
          <div class="second-summary">
            <div><strong>0</strong><small>JOBURI</small></div>
            <div><strong>0</strong><small>CLAIM</small></div>
            <div><strong>0</strong><small>GĂSIȚI</small></div>
            <div><strong>0</strong><small>RĂMAȘI</small></div>
          </div>
        </div>
        <div class="presence-empty-work">Este în aplicație, dar nu are niciun claim activ acum.${lastSeen ? ` <span>${escapeHtml(lastSeen)}</span>` : ''}</div>`;
      grid.append(card);
      represented.add(key);
    }

    if (tabCount) tabCount.textContent = String(new Set([...represented, ...online.map((a) => normalize(a.agent_name)).filter(Boolean)]).size);
  }

  const baseRender = render;
  render = function presenceRender() {
    baseRender();
    window.setTimeout(patchSecondDashboard, 0);
  };

  const accessForm = document.querySelector('#accessForm');
  if (accessForm) {
    accessForm.addEventListener('submit', () => {
      window.setTimeout(async () => { await heartbeat(); await loadPresence(); }, 350);
    });
  }

  document.querySelector('#agentButton')?.addEventListener('click', () => window.setTimeout(loadPresence, 150));

  window.addEventListener('focus', async () => { await heartbeat(); await loadPresence(); });
  window.addEventListener('pageshow', async () => { await heartbeat(); await loadPresence(); });

  heartbeat().then(loadPresence);
  window.setInterval(heartbeat, 2 * 60 * 1000);
  window.setInterval(loadPresence, 60 * 1000);
})();
