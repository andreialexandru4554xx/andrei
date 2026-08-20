'use strict';

(() => {
  const LONDON_TZ = 'Europe/London';

  Object.assign(I18N.ro, {
    day_today: 'AZI',
    day_live: 'ZIUA CURENTĂ',
    day_jobs: 'joburi azi',
    day_positions: 'poziții azi',
    situations_title: 'Situații reale AZI',
    situations_subtitle: 'Doar joburile postate azi. Joburile de ieri nu mai apar în site.',
    situation_new_today: 'NOU AZI',
    situation_positions: 'POZIȚII',
    situation_claimed: 'CLAIM',
    situation_found: 'GĂSIȚI',
    situation_free: 'LIBERE',
    situation_seconds: '{count} Seconds activi',
    situation_no_second: 'Fără Second',
    situation_view: 'Vezi jobul',
    situations_empty: 'Nu există încă joburi postate azi.',
  });
  Object.assign(I18N.en, {
    day_today: 'TODAY',
    day_live: 'CURRENT DAY',
    day_jobs: 'jobs today',
    day_positions: 'positions today',
    situations_title: 'Real situations TODAY',
    situations_subtitle: 'Only jobs posted today. Yesterday’s jobs are no longer shown on the site.',
    situation_new_today: 'NEW TODAY',
    situation_positions: 'POSITIONS',
    situation_claimed: 'CLAIMED',
    situation_found: 'FOUND',
    situation_free: 'FREE',
    situation_seconds: '{count} active Seconds',
    situation_no_second: 'No Second',
    situation_view: 'View job',
    situations_empty: 'No jobs have been posted today yet.',
  });

  const workspace = $('.workspace');
  if (!workspace) return;

  const dayStrip = document.createElement('section');
  dayStrip.id = 'dailyViewStrip';
  dayStrip.className = 'daily-view-strip today-only';
  dayStrip.innerHTML = `
    <div class="daily-main-card is-active">
      <span class="daily-live-dot"></span>
      <span class="daily-main-copy">
        <small id="todayEyebrow">ZIUA CURENTĂ</small>
        <strong id="todayLabel">AZI</strong>
        <span id="todayDate"></span>
      </span>
      <span class="daily-main-totals">
        <b id="todayJobCount">0</b><small id="todayJobsLabel">joburi azi</small>
        <i></i>
        <b id="todayPositionCount">0</b><small id="todayPositionsLabel">poziții azi</small>
      </span>
    </div>`;

  const situations = document.createElement('section');
  situations.id = 'todayRealSituations';
  situations.className = 'today-real-situations';

  workspace.prepend(situations);
  workspace.prepend(dayStrip);

  function londonParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: LONDON_TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(date);
    const pick = (type) => parts.find((part) => part.type === type)?.value || '';
    return { year: Number(pick('year')), month: Number(pick('month')), day: Number(pick('day')) };
  }

  function keyFromParts(parts) {
    return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  }

  function todayKey() {
    return keyFromParts(londonParts());
  }

  function jobDayKey(job) {
    if (!job?.created_at) return '';
    const date = new Date(job.created_at);
    if (Number.isNaN(date.getTime())) return '';
    return keyFromParts(londonParts(date));
  }

  function isOperational(job) {
    return Boolean(job)
      && job.source_kind !== 'import'
      && !String(job.job_reference || '').startsWith('HOT-WORKER-');
  }

  function isToday(job) {
    return isOperational(job) && jobDayKey(job) === todayKey();
  }

  function isTodayActive(job) {
    return isToday(job) && ['open', 'claimed'].includes(job.status);
  }

  window.jobBoardDayMatch = isToday;
  window.jobBoardDayView = () => 'today';

  function todayJobs() {
    return state.jobs.filter(isToday);
  }

  function todayActiveJobs() {
    return state.jobs.filter(isTodayActive);
  }

  function positionsFor(jobs) {
    return jobs.reduce((sum, job) => sum + Math.max(1, Number(job.workers_needed) || 1), 0);
  }

  function claimsFor(job) {
    return Array.isArray(job?.claims) ? job.claims : [];
  }

  function jobTotals(job) {
    const claims = claimsFor(job);
    const total = Math.max(1, Number(job.workers_needed) || 1);
    const claimed = Number.isFinite(Number(job.workers_claimed))
      ? Number(job.workers_claimed)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_claimed) || 0), 0);
    const found = Number.isFinite(Number(job.workers_filled))
      ? Number(job.workers_filled)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_filled) || 0), 0);
    const activeSeconds = claims.filter((claim) => Math.max((Number(claim.quantity_claimed) || 0) - (Number(claim.quantity_filled) || 0), 0) > 0).length;
    return { total, claimed, found, free: Math.max(total - claimed, 0), activeSeconds };
  }

  function formatToday() {
    const p = londonParts();
    const date = new Date(Date.UTC(p.year, p.month - 1, p.day, 12));
    return new Intl.DateTimeFormat(state.lang === 'en' ? 'en-GB' : 'ro-RO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(date);
  }

  function broadLocation(job) {
    let value = String(job?.location || '').trim();
    if (!value) return state.lang === 'en' ? 'UK area' : 'Zonă UK';
    value = value.replace(/\b[A-Z]{1,2}\d[A-Z\d]?\b/gi, '').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
    return value || (state.lang === 'en' ? 'UK area' : 'Zonă UK');
  }

  function situationJobs() {
    return todayActiveJobs().sort((a, b) => {
      const urgent = (a.priority === 'urgent' ? 0 : 1) - (b.priority === 'urgent' ? 0 : 1);
      if (urgent) return urgent;
      const remainingA = Math.max((Number(a.workers_needed) || 1) - (Number(a.workers_filled) || 0), 0);
      const remainingB = Math.max((Number(b.workers_needed) || 1) - (Number(b.workers_filled) || 0), 0);
      if (remainingB !== remainingA) return remainingB - remainingA;
      return new Date(b.created_at) - new Date(a.created_at);
    }).slice(0, 10);
  }

  function situationHtml(job, index) {
    const totals = jobTotals(job);
    const urgent = job.priority === 'urgent';
    const seconds = totals.activeSeconds ? t('situation_seconds', { count: totals.activeSeconds }) : t('situation_no_second');
    return `<article class="real-situation-card ${urgent ? 'is-urgent' : ''}">
      <div class="situation-top"><span class="situation-number">${String(index + 1).padStart(2, '0')}</span><span class="situation-age is-new">${escapeHtml(t('situation_new_today'))}</span>${urgent ? '<span class="situation-urgent">URGENT</span>' : ''}</div>
      <h4>${escapeHtml(job.trade || t('unknown'))}</h4>
      <div class="situation-location">⌖ ${escapeHtml(broadLocation(job))}</div>
      <div class="situation-metrics">
        <div><strong>${totals.total}</strong><small>${escapeHtml(t('situation_positions'))}</small></div>
        <div><strong>${totals.claimed}</strong><small>${escapeHtml(t('situation_claimed'))}</small></div>
        <div><strong>${totals.found}</strong><small>${escapeHtml(t('situation_found'))}</small></div>
        <div class="situation-free"><strong>${totals.free}</strong><small>${escapeHtml(t('situation_free'))}</small></div>
      </div>
      <div class="situation-bottom"><span class="situation-seconds">${escapeHtml(seconds)}</span><button type="button" data-situation-job="${Number(job.id)}">${escapeHtml(t('situation_view'))}</button></div>
    </article>`;
  }

  function renderSituations() {
    const jobs = situationJobs();
    if (!jobs.length) {
      situations.innerHTML = `<div class="situations-head"><div><span class="eyebrow dark">LIVE</span><h3>${escapeHtml(t('situations_title'))}</h3><p>${escapeHtml(t('situations_subtitle'))}</p></div></div><div class="situations-empty">${escapeHtml(t('situations_empty'))}</div>`;
      return;
    }
    situations.innerHTML = `
      <div class="situations-head">
        <div><span class="eyebrow dark">LIVE</span><h3>${escapeHtml(t('situations_title'))}</h3><p>${escapeHtml(t('situations_subtitle'))}</p></div>
        <strong class="situations-count">${jobs.length}</strong>
      </div>
      <div class="situations-grid">${jobs.map((job, index) => situationHtml(job, index)).join('')}</div>`;
  }

  function updateToday() {
    const allToday = todayJobs();
    $('#todayEyebrow').textContent = t('day_live');
    $('#todayLabel').textContent = t('day_today');
    $('#todayDate').textContent = formatToday();
    $('#todayJobCount').textContent = allToday.length;
    $('#todayPositionCount').textContent = positionsFor(allToday);
    $('#todayJobsLabel').textContent = t('day_jobs');
    $('#todayPositionsLabel').textContent = t('day_positions');
    renderSituations();
  }

  const baseRender = render;
  render = function todayOnlyRender() {
    updateToday();
    const allJobs = state.jobs;
    state.jobs = allJobs.filter(isToday);
    try {
      baseRender();
    } finally {
      state.jobs = allJobs;
    }
  };

  const baseApplyLanguage = applyLanguage;
  applyLanguage = function todayOnlyApplyLanguage() {
    baseApplyLanguage();
    updateToday();
  };

  situations.addEventListener('click', (event) => {
    const button = event.target.closest('[data-situation-job]');
    if (!button) return;
    state.status = 'active';
    state.priority = 'all';
    state.search = '';
    if ($('#statusFilter')) $('#statusFilter').value = 'active';
    if ($('#priorityFilter')) $('#priorityFilter').value = 'all';
    if ($('#searchInput')) $('#searchInput').value = '';
    render();
    window.setTimeout(() => {
      const card = document.querySelector(`[data-job-id="${Number(button.dataset.situationJob)}"]`);
      if (!card) return;
      card.classList.add('recommend-highlight');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => card.classList.remove('recommend-highlight'), 2200);
    }, 120);
  });

  updateToday();
})();
