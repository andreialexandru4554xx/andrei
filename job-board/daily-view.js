'use strict';

(() => {
  const LONDON_TZ = 'Europe/London';
  let dayView = 'today';

  Object.assign(I18N.ro, {
    day_today: 'AZI',
    day_yesterday: 'IERI',
    day_all: 'TOATE',
    day_live: 'ZIUA CURENTĂ',
    day_jobs: 'joburi active',
    day_positions: 'poziții active',
    day_today_hint: 'Tot ce este de lucrat azi',
    day_yesterday_hint: 'Vezi ce a fost postat ieri',
    day_all_hint: 'Istoricul complet',
  });
  Object.assign(I18N.en, {
    day_today: 'TODAY',
    day_yesterday: 'YESTERDAY',
    day_all: 'ALL',
    day_live: 'CURRENT DAY',
    day_jobs: 'active jobs',
    day_positions: 'active positions',
    day_today_hint: 'Everything to work on today',
    day_yesterday_hint: 'See what was posted yesterday',
    day_all_hint: 'Full history',
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
        <b id="todayJobCount">0</b><small id="todayJobsLabel">joburi active</small>
        <i></i>
        <b id="todayPositionCount">0</b><small id="todayPositionsLabel">poziții active</small>
      </span>
    </button>
    <div class="daily-secondary-group">
      <button type="button" class="daily-secondary-card" data-day-view="yesterday">
        <span><strong id="yesterdayLabel">IERI</strong><small id="yesterdayDate"></small></span>
        <span class="daily-secondary-count"><b id="yesterdayJobCount">0</b><small id="yesterdayJobsLabel">joburi active</small></span>
      </button>
      <button type="button" class="daily-secondary-card daily-all-card" data-day-view="all">
        <span><strong id="allLabel">TOATE</strong><small id="allHint">Istoricul complet</small></span>
      </button>
    </div>`;

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

  function matchesSelectedDay(job) {
    if (dayView === 'all') return true;
    const key = jobDayKey(job);
    return key === (dayView === 'yesterday' ? yesterdayKey() : todayKey());
  }

  window.jobBoardDayMatch = matchesSelectedDay;
  window.jobBoardDayView = () => dayView;

  function activeDayJobs(view) {
    const target = view === 'yesterday' ? yesterdayKey() : todayKey();
    return state.jobs.filter((job) => isOperational(job)
      && ['open', 'claimed'].includes(job.status)
      && jobDayKey(job) === target);
  }

  function positionsFor(jobs) {
    return jobs.reduce((sum, job) => sum + Math.max(1, Number(job.workers_needed) || 1), 0);
  }

  function formatDay(key) {
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    return new Intl.DateTimeFormat(state.lang === 'en' ? 'en-GB' : 'ro-RO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(date);
  }

  function updateDayStrip() {
    const todayJobs = activeDayJobs('today');
    const yesterdayJobs = activeDayJobs('yesterday');
    $('#todayEyebrow').textContent = t('day_live');
    $('#todayLabel').textContent = t('day_today');
    $('#yesterdayLabel').textContent = t('day_yesterday');
    $('#allLabel').textContent = t('day_all');
    $('#todayDate').textContent = formatDay(todayKey());
    $('#yesterdayDate').textContent = formatDay(yesterdayKey());
    $('#allHint').textContent = t('day_all_hint');
    $('#todayJobCount').textContent = todayJobs.length;
    $('#todayPositionCount').textContent = positionsFor(todayJobs);
    $('#yesterdayJobCount').textContent = yesterdayJobs.length;
    $('#todayJobsLabel').textContent = t('day_jobs');
    $('#todayPositionsLabel').textContent = t('day_positions');
    $('#yesterdayJobsLabel').textContent = t('day_jobs');
    dayStrip.querySelectorAll('[data-day-view]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.dayView === dayView);
    });
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

  // A new browser visit always starts on TODAY. This is intentional so yesterday never looks like today's workload.
  updateDayStrip();
})();
