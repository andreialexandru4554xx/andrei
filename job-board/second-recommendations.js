'use strict';

(() => {
  Object.assign(I18N.ro, {
    view_seconds: 'Second Agents',
    view_recommended: 'Recomandate',
    second_dashboard_title: 'Second Agents — ce job caută fiecare',
    second_dashboard_subtitle: 'Pivot pe recruiter: vezi joburile active, First-ul, câte poziții a preluat, câte a găsit și câte îi mai rămân.',
    second_jobs: 'JOBURI', second_claimed: 'CLAIM', second_found: 'GĂSIȚI', second_remaining: 'RĂMAȘI',
    second_you: 'TU', second_multiple: '{count} joburi simultan', second_first: 'First: {name}',
    second_job_line: '{claimed} claim · {found} găsiți · {remaining} rămași',
    second_view_job: 'Vezi jobul', second_empty: 'Nu există Second Agents cu responsabilități active acum.',
    kpi_firsts: 'FIRSTS', kpi_seconds: 'SECONDS ACTIVI', kpi_jobs: 'JOBURI ACTIVE', kpi_positions: 'POZIȚII',
    kpi_firsts_hint: 'First Agents cu joburi active', kpi_seconds_hint: 'Recruiteri care încă au muncitori de găsit',
    kpi_jobs_hint: 'Joburi OPEN + CLAIMED', kpi_positions_hint: '{claimed} claim · {found} găsite',
    recommendations_title: 'Recomandate pentru tine',
    recommendations_subtitle: 'Joburile pe care le poți alege acum, ordonate după urgență, poziții libere, acoperire și cât de recent au fost postate.',
    recommendations_none: 'Nu există momentan joburi cu poziții libere pentru recomandare.',
    recommendation_focus_clear: 'Nu ai un job activ. Poți alege unul dintre joburile recomandate de mai jos.',
    recommendation_focus_busy: 'Ai deja {count} job activ. Recomandarea este să îl termini înainte să iei altul; folosește al doilea doar ca excepție.',
    recommendation_focus_busy_many: 'Ai deja {count} joburi active. Nu este recomandat să mai iei unul până nu eliberezi sau finalizezi o responsabilitate.',
    recommendation_score: 'scor', recommendation_rank: 'Recomandarea #{rank}',
    recommendation_positions: 'POZIȚII', recommendation_free: 'LIBERE', recommendation_seconds: 'SECONDS',
    recommendation_first: 'First: {name}', recommendation_view: 'Vezi jobul', recommendation_claim: 'Alege / Claim',
    reason_urgent: 'Urgent', reason_free: '{count} poziții libere', reason_no_second: 'Niciun Second încă',
    reason_low_coverage: 'Acoperire mică', reason_recent: 'Postat recent', reason_trade_match: 'Meserie familiară',
    reason_start_soon: 'Start apropiat',
  });

  Object.assign(I18N.en, {
    view_seconds: 'Second Agents',
    view_recommended: 'Recommended',
    second_dashboard_title: 'Second Agents — what each recruiter is working on',
    second_dashboard_subtitle: 'Recruiter pivot: see active jobs, the First, slots claimed, workers found and remaining responsibility.',
    second_jobs: 'JOBS', second_claimed: 'CLAIMED', second_found: 'FOUND', second_remaining: 'REMAINING',
    second_you: 'YOU', second_multiple: '{count} simultaneous jobs', second_first: 'First: {name}',
    second_job_line: '{claimed} claimed · {found} found · {remaining} remaining',
    second_view_job: 'View job', second_empty: 'There are no Second Agents with active responsibilities right now.',
    kpi_firsts: 'FIRSTS', kpi_seconds: 'ACTIVE SECONDS', kpi_jobs: 'ACTIVE JOBS', kpi_positions: 'POSITIONS',
    kpi_firsts_hint: 'First Agents with active jobs', kpi_seconds_hint: 'Recruiters who still have workers to find',
    kpi_jobs_hint: 'OPEN + CLAIMED jobs', kpi_positions_hint: '{claimed} claimed · {found} found',
    recommendations_title: 'Recommended for you',
    recommendations_subtitle: 'Jobs you can choose now, ranked by urgency, free positions, current coverage and recency.',
    recommendations_none: 'There are currently no jobs with free positions to recommend.',
    recommendation_focus_clear: 'You have no active job. Choose one of the recommended jobs below.',
    recommendation_focus_busy: 'You already have {count} active job. Finish it before taking another; use a second job only as an exception.',
    recommendation_focus_busy_many: 'You already have {count} active jobs. Taking another is not recommended until you release or complete one responsibility.',
    recommendation_score: 'score', recommendation_rank: 'Recommendation #{rank}',
    recommendation_positions: 'POSITIONS', recommendation_free: 'FREE', recommendation_seconds: 'SECONDS',
    recommendation_first: 'First: {name}', recommendation_view: 'View job', recommendation_claim: 'Choose / Claim',
    reason_urgent: 'Urgent', reason_free: '{count} free positions', reason_no_second: 'No Second yet',
    reason_low_coverage: 'Low coverage', reason_recent: 'Posted recently', reason_trade_match: 'Familiar trade',
    reason_start_soon: 'Starts soon',
  });

  const VIEW_KEY = 'recruitflow_job_board_transparency_view';
  const storedView = localStorage.getItem(VIEW_KEY);
  let opsView = ['seconds', 'recommendations'].includes(storedView) ? storedView : null;

  const switcher = $('.transparency-switcher');
  const toolbar = $('.toolbar');
  const jobsGrid = $('#jobsGrid');
  const firstDashboard = $('#firstDashboard');
  const workspace = $('.workspace');
  if (!switcher || !toolbar || !jobsGrid || !workspace) return;

  switcher.insertAdjacentHTML('beforeend', `
    <button type="button" class="transparency-tab ops-extra-tab" data-ops-view="seconds">
      <span data-i18n="view_seconds">Second Agents</span><span class="tab-count" id="secondTabCount">0</span>
    </button>
    <button type="button" class="transparency-tab ops-extra-tab recommended-tab" data-ops-view="recommendations">
      <span>✦ </span><span data-i18n="view_recommended">Recomandate</span><span class="tab-count" id="recommendedTabCount">0</span>
    </button>`);

  const kpiStrip = document.createElement('section');
  kpiStrip.id = 'opsKpiStrip';
  kpiStrip.className = 'ops-kpi-strip';
  kpiStrip.innerHTML = `
    <button type="button" class="ops-kpi-card" data-kpi-view="firsts"><strong id="opsFirstCount">0</strong><span data-i18n="kpi_firsts">FIRSTS</span><small data-i18n="kpi_firsts_hint">First Agents cu joburi active</small></button>
    <button type="button" class="ops-kpi-card" data-kpi-view="seconds"><strong id="opsSecondCount">0</strong><span data-i18n="kpi_seconds">SECONDS ACTIVI</span><small data-i18n="kpi_seconds_hint">Recruiteri care încă au muncitori de găsit</small></button>
    <button type="button" class="ops-kpi-card" data-kpi-view="jobs"><strong id="opsJobCount">0</strong><span data-i18n="kpi_jobs">JOBURI ACTIVE</span><small data-i18n="kpi_jobs_hint">Joburi OPEN + CLAIMED</small></button>
    <button type="button" class="ops-kpi-card positions" data-kpi-view="recommendations"><strong id="opsPositionCount">0</strong><span data-i18n="kpi_positions">POZIȚII</span><small id="opsPositionHint"></small></button>`;
  switcher.before(kpiStrip);

  const secondDashboard = document.createElement('section');
  secondDashboard.id = 'secondDashboard';
  secondDashboard.className = 'ops-dashboard transparency-hidden';
  (firstDashboard || jobsGrid).after(secondDashboard);

  const recommendationDashboard = document.createElement('section');
  recommendationDashboard.id = 'recommendationDashboard';
  recommendationDashboard.className = 'ops-dashboard transparency-hidden';
  secondDashboard.after(recommendationDashboard);

  const baseRender = render;
  const baseApplyLanguage = applyLanguage;

  function isHotWorker(job) {
    return String(job?.job_reference || '').startsWith('HOT-WORKER-');
  }

  function isOperational(job) {
    return Boolean(job) && job.source_kind !== 'import' && !isHotWorker(job);
  }

  function activeJobs() {
    return state.jobs.filter((job) => isOperational(job) && ['open', 'claimed'].includes(job.status));
  }

  function claimsFor(job) {
    return Array.isArray(job?.claims) ? job.claims : [];
  }

  function totalsFor(job) {
    const claims = claimsFor(job);
    const total = Math.max(1, Number(job.workers_needed) || 1);
    const claimed = Number.isFinite(Number(job.workers_claimed))
      ? Number(job.workers_claimed)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_claimed) || 0), 0);
    const found = Number.isFinite(Number(job.workers_filled))
      ? Number(job.workers_filled)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_filled) || 0), 0);
    return { total, claimed, found, free: Math.max(total - claimed, 0), remaining: Math.max(total - found, 0) };
  }

  function activeClaimRows() {
    const rows = [];
    for (const job of activeJobs()) {
      for (const claim of claimsFor(job)) {
        const claimed = Number(claim.quantity_claimed) || 0;
        const found = Number(claim.quantity_filled) || 0;
        const remaining = Math.max(claimed - found, 0);
        if (remaining <= 0) continue;
        rows.push({ job, claim, claimed, found, remaining });
      }
    }
    return rows;
  }

  function secondGroups() {
    const groups = new Map();
    for (const row of activeClaimRows()) {
      const name = String(row.claim.agent_name || t('unknown')).trim();
      const key = normalizeName(name) || 'unknown';
      if (!groups.has(key)) groups.set(key, { name, rows: [], claimed: 0, found: 0, remaining: 0 });
      const group = groups.get(key);
      group.rows.push(row);
      group.claimed += row.claimed;
      group.found += row.found;
      group.remaining += row.remaining;
    }
    return [...groups.values()].sort((a, b) => b.rows.length - a.rows.length || b.remaining - a.remaining || a.name.localeCompare(b.name));
  }

  function firstCount() {
    return new Set(activeJobs().map((job) => normalizeName(job.created_by)).filter(Boolean)).size;
  }

  function operationTotals() {
    return activeJobs().reduce((sum, job) => {
      const item = totalsFor(job);
      sum.positions += item.total;
      sum.claimed += item.claimed;
      sum.found += item.found;
      return sum;
    }, { positions: 0, claimed: 0, found: 0 });
  }

  function myActiveJobs() {
    return activeClaimRows().filter((row) => isSameAgent(row.claim.agent_name));
  }

  function tradeAffinity() {
    const affinity = new Map();
    for (const job of state.jobs.filter(isOperational)) {
      if (!claimsFor(job).some((claim) => isSameAgent(claim.agent_name))) continue;
      const key = normalizeName(job.trade);
      if (key) affinity.set(key, (affinity.get(key) || 0) + 1);
    }
    return affinity;
  }

  function startSoon(job) {
    if (!job.start_date) return false;
    const date = new Date(`${job.start_date}T12:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    const days = (date.getTime() - Date.now()) / 86400000;
    return days >= -1 && days <= 2;
  }

  function recommendations() {
    const affinity = tradeAffinity();
    const mine = new Set(myActiveJobs().map((row) => Number(row.job.id)));
    const now = Date.now();
    let candidates = activeJobs().filter((job) => totalsFor(job).free > 0 && !mine.has(Number(job.id)));
    const recent = candidates.filter((job) => {
      const created = new Date(job.created_at).getTime();
      return Number.isFinite(created) && now - created <= 24 * 60 * 60 * 1000;
    });
    if (recent.length) candidates = recent;

    return candidates.map((job) => {
      const totals = totalsFor(job);
      const claims = claimsFor(job).filter((claim) => Math.max((Number(claim.quantity_claimed) || 0) - (Number(claim.quantity_filled) || 0), 0) > 0);
      const created = new Date(job.created_at).getTime();
      const ageHours = Number.isFinite(created) ? Math.max(0, (now - created) / 3600000) : 999;
      const reasons = [];
      let score = 30;

      if (job.priority === 'urgent') { score += 28; reasons.push({ key: 'reason_urgent', urgent: true }); }
      score += Math.min(18, totals.free * 4);
      reasons.push({ key: 'reason_free', values: { count: totals.free } });
      if (claims.length === 0) { score += 18; reasons.push({ key: 'reason_no_second' }); }
      else if (claims.length === 1 && totals.free > 0) { score += 7; reasons.push({ key: 'reason_low_coverage' }); }
      if (ageHours <= 4) { score += 11; reasons.push({ key: 'reason_recent' }); }
      else if (ageHours <= 12) { score += 7; reasons.push({ key: 'reason_recent' }); }
      else if (ageHours <= 24) score += 3;
      const affinityCount = affinity.get(normalizeName(job.trade)) || 0;
      if (affinityCount > 0) { score += Math.min(16, 6 + affinityCount * 3); reasons.push({ key: 'reason_trade_match' }); }
      if (startSoon(job)) { score += 6; reasons.push({ key: 'reason_start_soon' }); }

      return { job, totals, seconds: claims.length, score: Math.min(99, score), reasons: reasons.slice(0, 4) };
    }).sort((a, b) => b.score - a.score || b.totals.free - a.totals.free || new Date(b.job.created_at) - new Date(a.job.created_at));
  }

  function updateCounts() {
    const seconds = secondGroups();
    const totals = operationTotals();
    const recs = recommendations();
    $('#opsFirstCount').textContent = firstCount();
    $('#opsSecondCount').textContent = seconds.length;
    $('#opsJobCount').textContent = activeJobs().length;
    $('#opsPositionCount').textContent = totals.positions;
    $('#opsPositionHint').textContent = t('kpi_positions_hint', { claimed: totals.claimed, found: totals.found });
    $('#secondTabCount').textContent = seconds.length;
    $('#recommendedTabCount').textContent = recs.length;
  }

  function renderSeconds() {
    const groups = secondGroups();
    if (!groups.length) {
      secondDashboard.innerHTML = `<div class="recommend-empty">${escapeHtml(t('second_empty'))}</div>`;
      return;
    }
    secondDashboard.innerHTML = `
      <div class="ops-dashboard-head"><div><h3>${escapeHtml(t('second_dashboard_title'))}</h3><p>${escapeHtml(t('second_dashboard_subtitle'))}</p></div></div>
      <div class="second-grid">${groups.map(secondCardHtml).join('')}</div>`;
  }

  function secondCardHtml(group) {
    const multiple = group.rows.length > 1;
    const rows = group.rows.map(({ job, claimed, found, remaining }) => {
      const place = [job.location, job.postcode].filter(Boolean).join(' · ') || t('location_unspecified');
      return `<div class="second-job-row">
        <div class="second-job-main"><strong>${escapeHtml(job.trade)}</strong><small>${escapeHtml(t('second_first', { name: job.created_by || t('unknown') }))}</small></div>
        <div class="second-job-meta">${escapeHtml(place)}</div>
        <div class="second-job-chips"><span class="second-chip">${claimed} claim</span><span class="second-chip found">${found} ${escapeHtml(t('second_found').toLocaleLowerCase())}</span><span class="second-chip remaining">${remaining} ${escapeHtml(t('second_remaining').toLocaleLowerCase())}</span></div>
        <button type="button" class="second-job-open" data-open-job="${job.id}">${escapeHtml(t('second_view_job'))}</button>
      </div>`;
    }).join('');
    return `<article class="second-card ${isSameAgent(group.name) ? 'is-me' : ''} ${multiple ? 'overloaded' : ''}">
      <div class="second-card-head">
        <div class="second-name-row"><h4>${escapeHtml(group.name)}</h4><div class="second-name-badges">${isSameAgent(group.name) ? `<span class="second-badge">${escapeHtml(t('second_you'))}</span>` : ''}${multiple ? `<span class="second-badge warning">${escapeHtml(t('second_multiple', { count: group.rows.length }))}</span>` : ''}</div></div>
        <div class="second-summary">
          <div><strong>${group.rows.length}</strong><small>${escapeHtml(t('second_jobs'))}</small></div>
          <div><strong>${group.claimed}</strong><small>${escapeHtml(t('second_claimed'))}</small></div>
          <div><strong>${group.found}</strong><small>${escapeHtml(t('second_found'))}</small></div>
          <div><strong>${group.remaining}</strong><small>${escapeHtml(t('second_remaining'))}</small></div>
        </div>
      </div><div class="second-job-list">${rows}</div>
    </article>`;
  }

  function renderRecommendations() {
    const recs = recommendations();
    const activeMine = myActiveJobs();
    const focusText = activeMine.length === 0
      ? t('recommendation_focus_clear')
      : activeMine.length === 1
        ? t('recommendation_focus_busy', { count: 1 })
        : t('recommendation_focus_busy_many', { count: activeMine.length });
    recommendationDashboard.innerHTML = `
      <div class="ops-dashboard-head"><div><h3>${escapeHtml(t('recommendations_title'))}</h3><p>${escapeHtml(t('recommendations_subtitle'))}</p></div></div>
      <div class="recommend-focus-note ${activeMine.length ? 'has-active' : ''}"><span class="recommend-icon">${activeMine.length ? '⚠' : '✦'}</span><div><b>${escapeHtml(state.agent || 'Second')}</b><span>${escapeHtml(focusText)}</span></div></div>
      ${recs.length ? `<div class="recommend-grid">${recs.slice(0, 8).map((item, index) => recommendationHtml(item, index)).join('')}</div>` : `<div class="recommend-empty">${escapeHtml(t('recommendations_none'))}</div>`}`;
  }

  function recommendationHtml(item, index) {
    const { job, totals, seconds, score, reasons } = item;
    const place = [job.location, job.postcode].filter(Boolean).join(' · ') || t('location_unspecified');
    return `<article class="recommend-card ${job.priority === 'urgent' ? 'recommend-urgent' : ''}">
      <div class="recommend-top"><div class="recommend-rank"><strong>${escapeHtml(t('recommendation_rank', { rank: index + 1 }))}</strong></div><div class="recommend-score">${score}<small>/99</small></div></div>
      <h4>${escapeHtml(job.trade)}</h4><div class="recommend-place">⌖ ${escapeHtml(place)}</div><div class="recommend-first">${escapeHtml(t('recommendation_first', { name: job.created_by || t('unknown') }))}</div>
      <div class="recommend-slots"><div><strong>${totals.total}</strong><small>${escapeHtml(t('recommendation_positions'))}</small></div><div><strong>${totals.free}</strong><small>${escapeHtml(t('recommendation_free'))}</small></div><div><strong>${seconds}</strong><small>${escapeHtml(t('recommendation_seconds'))}</small></div></div>
      <div class="recommend-reasons">${reasons.map((reason) => `<span class="recommend-reason ${reason.urgent ? 'urgent' : ''}">${escapeHtml(t(reason.key, reason.values || {}))}</span>`).join('')}</div>
      <div class="recommend-actions"><button type="button" class="recommend-view" data-recommend-view="${job.id}">${escapeHtml(t('recommendation_view'))}</button><button type="button" class="recommend-claim" data-recommend-claim="${job.id}">${escapeHtml(t('recommendation_claim'))}</button></div>
    </article>`;
  }

  function renderOps() {
    updateCounts();
    renderSeconds();
    renderRecommendations();
  }

  function applyOpsView() {
    switcher.querySelectorAll('[data-ops-view]').forEach((button) => button.classList.toggle('is-active', button.dataset.opsView === opsView));
    if (!opsView) {
      secondDashboard.classList.add('transparency-hidden');
      recommendationDashboard.classList.add('transparency-hidden');
      return;
    }
    toolbar.classList.add('transparency-hidden');
    jobsGrid.classList.add('transparency-hidden');
    firstDashboard?.classList.add('transparency-hidden');
    secondDashboard.classList.toggle('transparency-hidden', opsView !== 'seconds');
    recommendationDashboard.classList.toggle('transparency-hidden', opsView !== 'recommendations');
    const heading = $('.section-heading h2');
    if (heading) heading.textContent = opsView === 'seconds' ? t('second_dashboard_title') : t('recommendations_title');
  }

  render = function operationsRender() {
    baseRender();
    renderOps();
    applyOpsView();
  };

  applyLanguage = function operationsApplyLanguage() {
    baseApplyLanguage();
    renderOps();
    applyOpsView();
  };

  function selectOpsView(view) {
    opsView = view;
    localStorage.setItem(VIEW_KEY, view);
    render();
    workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function selectNativeView(view) {
    opsView = null;
    localStorage.setItem(VIEW_KEY, view);
    const button = switcher.querySelector(`[data-board-view="${view}"]`);
    if (button) button.click(); else render();
  }

  function switchToJob(jobId, claimNow = false) {
    opsView = null;
    localStorage.setItem(VIEW_KEY, 'jobs');
    state.status = 'active';
    state.priority = 'all';
    state.search = '';
    if ($('#statusFilter')) $('#statusFilter').value = 'active';
    if ($('#priorityFilter')) $('#priorityFilter').value = 'all';
    if ($('#searchInput')) $('#searchInput').value = '';
    const button = switcher.querySelector('[data-board-view="jobs"]');
    if (button) button.click(); else render();
    window.setTimeout(() => {
      const card = document.querySelector(`[data-job-id="${Number(jobId)}"]`);
      if (!card) return;
      card.classList.add('recommend-highlight');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => card.classList.remove('recommend-highlight'), 2200);
      if (claimNow) window.setTimeout(() => card.querySelector('[data-action="claim-slots"]')?.click(), 300);
    }, 120);
  }

  switcher.addEventListener('click', (event) => {
    const opsButton = event.target.closest('[data-ops-view]');
    if (opsButton) {
      event.preventDefault();
      event.stopPropagation();
      return selectOpsView(opsButton.dataset.opsView);
    }
    const nativeButton = event.target.closest('[data-board-view]');
    if (nativeButton) opsView = null;
  }, true);

  kpiStrip.addEventListener('click', (event) => {
    const card = event.target.closest('[data-kpi-view]');
    if (!card) return;
    const view = card.dataset.kpiView;
    if (['seconds', 'recommendations'].includes(view)) selectOpsView(view);
    else selectNativeView(view === 'firsts' ? 'firsts' : 'jobs');
  });

  secondDashboard.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-job]');
    if (button) switchToJob(button.dataset.openJob, false);
  });

  recommendationDashboard.addEventListener('click', (event) => {
    const view = event.target.closest('[data-recommend-view]');
    if (view) return switchToJob(view.dataset.recommendView, false);
    const claim = event.target.closest('[data-recommend-claim]');
    if (claim) return switchToJob(claim.dataset.recommendClaim, true);
  });

  $('.stats')?.addEventListener('click', () => { opsView = null; localStorage.setItem(VIEW_KEY, 'jobs'); }, true);

  applyLanguage();
})();
