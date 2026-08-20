'use strict';

(() => {
  const LONDON_TZ = 'Europe/London';

  Object.assign(I18N.ro, {
    yesterday_section_title: 'Joburi de ieri',
    yesterday_section_subtitle: 'Mai jos, separat de lista principală · doar joburile încă active.',
    yesterday_positions: '{count} poziții',
    yesterday_empty: 'Nu mai sunt joburi active de ieri.',
    view_recommended: 'Recomandate AI',
  });
  Object.assign(I18N.en, {
    yesterday_section_title: "Yesterday's jobs",
    yesterday_section_subtitle: 'Shown lower down, separate from the main list · active jobs only.',
    yesterday_positions: '{count} positions',
    yesterday_empty: 'There are no active jobs left from yesterday.',
    view_recommended: 'AI Recommended',
  });

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

  function clockDayKey() {
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

  function boardDayKey(allJobs = state.jobs) {
    const keys = (Array.isArray(allJobs) ? allJobs : [])
      .filter(isOperational)
      .map(jobDayKey)
      .filter(Boolean)
      .sort();
    return keys.length ? keys[keys.length - 1] : clockDayKey();
  }

  function previousDayKey(key) {
    const [year, month, day] = String(key || '').split('-').map(Number);
    if (!year || !month || !day) return '';
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    date.setUTCDate(date.getUTCDate() - 1);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }

  function isMainDayJob(job, allJobs = state.jobs) {
    return isOperational(job) && jobDayKey(job) === boardDayKey(allJobs);
  }

  function isActivePreviousDay(job, allJobs = state.jobs) {
    return isOperational(job)
      && jobDayKey(job) === previousDayKey(boardDayKey(allJobs))
      && ['open', 'claimed'].includes(String(job.status));
  }

  function previousJobs(allJobs) {
    const statusOrder = { open: 0, claimed: 1 };
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };
    return allJobs.filter((job) => isActivePreviousDay(job, allJobs)).sort((a, b) => {
      const priority = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      if (priority) return priority;
      const status = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (status) return status;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  function positionCount(jobs) {
    return jobs.reduce((sum, job) => sum + Math.max(1, Number(job.workers_needed) || 1), 0);
  }

  window.jobBoardDayMatch = (job) => isMainDayJob(job, state.jobs);
  window.jobBoardDayView = () => 'current';

  function appendPreviousSection(allJobs) {
    const grid = $('#jobsGrid');
    if (!grid) return;
    grid.querySelector('#yesterdayJobsSection')?.remove();

    const jobs = previousJobs(allJobs);
    if (!jobs.length) return;

    const section = document.createElement('section');
    section.id = 'yesterdayJobsSection';
    section.className = 'yesterday-jobs-section';
    section.innerHTML = `
      <div class="yesterday-jobs-head">
        <div>
          <span class="yesterday-kicker">HISTORY</span>
          <h3>${escapeHtml(t('yesterday_section_title'))}</h3>
          <p>${escapeHtml(t('yesterday_section_subtitle'))}</p>
        </div>
        <div class="yesterday-summary">
          <strong>${jobs.length}</strong>
          <span>${escapeHtml(t('yesterday_positions', { count: positionCount(jobs) }))}</span>
        </div>
      </div>
      <div class="yesterday-jobs-grid">${jobs.map((job) => jobCardHtml(job)).join('')}</div>`;
    grid.append(section);
  }

  function setVisibleCounters(mainJobs) {
    const open = mainJobs.filter((job) => job.status === 'open').length;
    const claimed = mainJobs.filter((job) => job.status === 'claimed').length;
    const filled = mainJobs.filter((job) => job.status === 'filled').length;
    const mine = mainJobs.filter((job) => {
      if (!['open', 'claimed'].includes(job.status)) return false;
      if (Array.isArray(job.claims)) {
        return job.claims.some((claim) => isSameAgent(claim.agent_name)
          && Math.max((Number(claim.quantity_claimed) || 0) - (Number(claim.quantity_filled) || 0), 0) > 0);
      }
      return isSameAgent(job.claimed_by);
    }).length;
    if ($('#openCount')) $('#openCount').textContent = open;
    if ($('#claimedCount')) $('#claimedCount').textContent = claimed;
    if ($('#filledCount')) $('#filledCount').textContent = filled;
    if ($('#mineCount')) $('#mineCount').textContent = mine;
  }

  function syncRecommendationsTop() {
    const switcher = document.querySelector('.transparency-switcher');
    const recTab = switcher?.querySelector('[data-ops-view="recommendations"]');
    if (!switcher || !recTab) return false;

    const tabLabel = recTab.querySelector('[data-i18n="view_recommended"]');
    if (tabLabel) tabLabel.textContent = t('view_recommended');
    switcher.prepend(recTab);

    let entry = document.querySelector('#aiRecommendationsTop');
    if (!entry) {
      if (!document.querySelector('link[data-recommendations-top]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'recommendations-top.css?v=2';
        link.dataset.recommendationsTop = '1';
        document.head.append(link);
      }
      entry = document.createElement('button');
      entry.id = 'aiRecommendationsTop';
      entry.className = 'ai-recommendations-top';
      entry.type = 'button';
      entry.innerHTML = `
        <span class="ai-recommendations-icon">✦</span>
        <span class="ai-recommendations-copy">
          <strong id="aiRecommendationsTopTitle"></strong>
          <small id="aiRecommendationsTopHint"></small>
        </span>
        <span class="ai-recommendations-count" id="aiRecommendationsTopCount">0</span>
        <span class="ai-recommendations-arrow">→</span>`;
      const kpiStrip = document.querySelector('#opsKpiStrip');
      (kpiStrip || switcher).before(entry);
      entry.addEventListener('click', () => recTab.click());
    }

    const ro = state.lang !== 'en';
    const title = entry.querySelector('#aiRecommendationsTopTitle');
    const hint = entry.querySelector('#aiRecommendationsTopHint');
    const count = entry.querySelector('#aiRecommendationsTopCount');
    if (title) title.textContent = ro ? 'RECOMANDATE AI' : 'AI RECOMMENDED';
    if (hint) hint.textContent = ro
      ? 'Vezi rapid joburile recomandate pentru recruiterul conectat'
      : 'Quickly see the best jobs recommended for the signed-in recruiter';
    if (count) count.textContent = document.querySelector('#recommendedTabCount')?.textContent || '0';
    return true;
  }

  const baseRender = render;
  render = function stableBoardRender() {
    const allJobs = Array.isArray(state.jobs) ? state.jobs : [];
    const key = boardDayKey(allJobs);
    const mainJobs = allJobs.filter((job) => isOperational(job) && jobDayKey(job) === key);

    state.jobs = mainJobs;
    try {
      baseRender();
    } finally {
      state.jobs = allJobs;
    }

    setVisibleCounters(mainJobs);
    appendPreviousSection(allJobs);
    syncRecommendationsTop();
  };

  let recommendationAttempts = 0;
  const recommendationTimer = window.setInterval(() => {
    recommendationAttempts += 1;
    if (syncRecommendationsTop() || recommendationAttempts >= 30) window.clearInterval(recommendationTimer);
  }, 100);
})();
