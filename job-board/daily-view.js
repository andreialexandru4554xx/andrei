'use strict';

(() => {
  const LONDON_TZ = 'Europe/London';
  let dayView = 'today';

  Object.assign(I18N.ro, {
    day_today: 'AZI',
    day_yesterday: 'IERI',
    day_all: 'TOATE',
    day_live: 'ZIUA CURENTĂ',
    day_jobs: 'joburi de lucru',
    day_positions: 'poziții de lucru',
    day_yesterday_jobs: 'joburi de ieri',
    day_today_hint: 'Tot ce trebuie lucrat azi',
    day_yesterday_hint: 'Vezi ce a fost postat ieri',
    day_all_hint: 'Istoricul complet',
    situations_title: '10 situații reale AZI',
    situations_subtitle: 'Cele mai importante situații reale care sunt încă active și trebuie lucrate azi. Se actualizează automat din Job Dashboard.',
    situation_new_today: 'NOU AZI',
    situation_from_yesterday: 'RĂMAS DE IERI',
    situation_carry: 'RĂMAS ACTIV',
    situation_positions: 'POZIȚII',
    situation_claimed: 'CLAIM',
    situation_found: 'GĂSIȚI',
    situation_free: 'LIBERE',
    situation_seconds: '{count} Seconds activi',
    situation_no_second: 'Fără Second',
    situation_view: 'Vezi jobul',
    situations_empty: 'Nu există momentan situații active de lucrat.',
  });
  Object.assign(I18N.en, {
    day_today: 'TODAY',
    day_yesterday: 'YESTERDAY',
    day_all: 'ALL',
    day_live: 'CURRENT DAY',
    day_jobs: 'jobs to work',
    day_positions: 'positions to work',
    day_yesterday_jobs: 'yesterday jobs',
    day_today_hint: 'Everything that needs work today',
    day_yesterday_hint: 'See what was posted yesterday',
    day_all_hint: 'Full history',
    situations_title: '10 real situations TODAY',
    situations_subtitle: 'The most important real situations that are still active and need work today. This updates automatically from the Job Dashboard.',
    situation_new_today: 'NEW TODAY',
    situation_from_yesterday: 'CARRIED FROM YESTERDAY',
    situation_carry: 'STILL ACTIVE',
    situation_positions: 'POSITIONS',
    situation_claimed: 'CLAIMED',
    situation_found: 'FOUND',
    situation_free: 'FREE',
    situation_seconds: '{count} active Seconds',
    situation_no_second: 'No Second',
    situation_view: 'View job',
    situations_empty: 'There are currently no active situations to work.',
  });

  const workspace = $('.workspace');
  if (!workspace) return;

  const dayStrip = document.createElement('section');
  dayStrip.id = 'dailyViewStrip';
  dayStrip.className = 'daily-view-strip';
  dayStrip.setAttribute('aria-label', 'Day view');
  dayStrip.innerHTML = `
    <button type="button" class="daily-main-card is-active" data-day-view="today">
      <span class="daily-live-dot"></span>
      <span class="daily-main-copy">
        <small id="todayEyebrow">ZIUA CURENTĂ</small>
        <strong id="todayLabel">AZI</strong>
        <span id="todayDate"></span>
      </span>
      <span class="daily-main-totals">
        <b id="todayJobCount">0</b><small id="todayJobsLabel">joburi de lucru</small>
        <i></i>
        <b id="todayPositionCount">0</b><small id="todayPositionsLabel">poziții de lucru</small>
      </span>
    </button>
    <div class="daily-secondary-group">
      <button type="button" class="daily-secondary-card" data-day-view="yesterday">
        <span><strong id="yesterdayLabel">IERI</strong><small id="yesterdayDate"></small></span>
        <span class="daily-secondary-count"><b id="yesterdayJobCount">0</b><small id="yesterdayJobsLabel">joburi de ieri</small></span>
      </button>
      <button type="button" class="daily-secondary-card daily-all-card" data-day-view="all">
        <span><strong id="allLabel">TOATE</strong><small id="allHint">Istoricul complet</small></span>
      </button>
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

  function yesterdayKey() {
    const p = londonParts();
    const utc = new Date(Date.UTC(p.year, p.month - 1, p.day));
    utc.setUTCDate(utc.getUTCDate() - 1);
    return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}-${String(utc.getUTCDate()).padStart(2, '0')}`;
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

  function isActive(job) {
    return isOperational(job) && ['open', 'claimed'].includes(job.status);
  }

  function matchesSelectedDay(job) {
    if (dayView === 'all') return isOperational(job);
    if (dayView === 'today') return isActive(job);
    return isOperational(job) && jobDayKey(job) === yesterdayKey();
  }

  window.jobBoardDayMatch = matchesSelectedDay;
  window.jobBoardDayView = () => dayView;

  function todayWorkJobs() {
    return state.jobs.filter(isActive);
  }

  function yesterdayJobs() {
    return state.jobs.filter((job) => isOperational(job) && jobDayKey(job) === yesterdayKey());
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

  function formatDay(key) {
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));
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

  function situationAgeLabel(job) {
    const key = jobDayKey(job);
    if (key === todayKey()) return t('situation_new_today');
    if (key === yesterdayKey()) return t('situation_from_yesterday');
    return t('situation_carry');
  }

  function situationJobs() {
    return todayWorkJobs().sort((a, b) => {
      const urgent = (a.priority === 'urgent' ? 0 : 1) - (b.priority === 'urgent' ? 0 : 1);
      if (urgent) return urgent;
      const remainingA = Math.max((Number(a.workers_needed) || 1) - (Number(a.workers_filled) || 0), 0);
      const remainingB = Math.max((Number(b.workers_needed) || 1) - (Number(b.workers_filled) || 0), 0);
      if (remainingB !== remainingA) return remainingB - remainingA;
      return new Date(b.created_at) - new Date(a.created_at);
    }).slice(0, 10);
  }

  function renderSituations() {
    const jobs = situationJobs();
    situations.classList.toggle('daily-hidden', dayView !== 'today');
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

  function situationHtml(job, index) {
    const totals = jobTotals(job);
    const age = situationAgeLabel(job);
    const urgent = job.priority === 'urgent';
    const seconds = totals.activeSeconds ? t('situation_seconds', { count: totals.activeSeconds }) : t('situation_no_second');
    return `<article class="real-situation-card ${urgent ? 'is-urgent' : ''}">
      <div class="situation-top"><span class="situation-number">${String(index + 1).padStart(2, '0')}</span><span class="situation-age ${jobDayKey(job) === todayKey() ? 'is-new' : ''}">${escapeHtml(age)}</span>${urgent ? '<span class="situation-urgent">URGENT</span>' : ''}</div>
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

  function updateDayStrip() {
    const todayJobs = todayWorkJobs();
    const yesterday = yesterdayJobs();
    $('#todayEyebrow').textContent = t('day_live');
    $('#todayLabel').textContent = t('day_today');
    $('#yesterdayLabel').textContent = t('day_yesterday');
    $('#allLabel').textContent = t('day_all');
    $('#todayDate').textContent = formatDay(todayKey());
    $('#yesterdayDate').textContent = formatDay(yesterdayKey());
    $('#allHint').textContent = t('day_all_hint');
    $('#todayJobCount').textContent = todayJobs.length;
    $('#todayPositionCount').textContent = positionsFor(todayJobs);
    $('#yesterdayJobCount').textContent = yesterday.length;
    $('#todayJobsLabel').textContent = t('day_jobs');
    $('#todayPositionsLabel').textContent = t('day_positions');
    $('#yesterdayJobsLabel').textContent = t('day_yesterday_jobs');
    dayStrip.querySelectorAll('[data-day-view]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.dayView === dayView);
    });
    renderSituations();
  }

  const baseRender = render;
  render = function dailyRender() {
    updateDayStrip();
    if (dayView === 'all') return baseRender();
    const allJobs = state.jobs;
    state.jobs = allJobs.filter(matchesSelectedDay);
    try {
      baseRender();
    } finally {
      state.jobs = allJobs;
    }
  };

  const baseApplyLanguage = applyLanguage;
  applyLanguage = function dailyApplyLanguage() {
    baseApplyLanguage();
    updateDayStrip();
  };

  dayStrip.addEventListener('click', (event) => {
    const button = event.target.closest('[data-day-view]');
    if (!button) return;
    dayView = ['today', 'yesterday', 'all'].includes(button.dataset.dayView) ? button.dataset.dayView : 'today';
    render();
    workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  situations.addEventListener('click', (event) => {
    const button = event.target.closest('[data-situation-job]');
    if (!button) return;
    dayView = 'today';
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

  // Every new visit starts on TODAY. TODAY is the active workload, including jobs carried over from previous days.
  updateDayStrip();
})();
