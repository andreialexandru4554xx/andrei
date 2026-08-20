'use strict';

(() => {
  const LONDON_TZ = 'Europe/London';

  Object.assign(I18N.ro, {
    yesterday_section_title: 'Joburi de ieri',
    yesterday_section_subtitle: 'Mai jos, separat de lista principală · doar joburile încă active.',
    yesterday_positions: '{count} poziții',
    yesterday_empty: 'Nu mai sunt joburi active de ieri.',
  });
  Object.assign(I18N.en, {
    yesterday_section_title: "Yesterday's jobs",
    yesterday_section_subtitle: 'Shown lower down, separate from the main list · active jobs only.',
    yesterday_positions: '{count} positions',
    yesterday_empty: 'There are no active jobs left from yesterday.',
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

  function currentDayKey() {
    return keyFromParts(londonParts());
  }

  function previousDayKey() {
    const p = londonParts();
    const date = new Date(Date.UTC(p.year, p.month - 1, p.day, 12));
    date.setUTCDate(date.getUTCDate() - 1);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
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

  function isVisibleJob(job) {
    return isOperational(job) && jobDayKey(job) === currentDayKey();
  }

  function isActiveYesterday(job) {
    return isOperational(job)
      && jobDayKey(job) === previousDayKey()
      && ['open', 'claimed'].includes(String(job.status));
  }

  function yesterdayJobs(allJobs) {
    const statusOrder = { open: 0, claimed: 1 };
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };
    return allJobs.filter(isActiveYesterday).sort((a, b) => {
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

  // Current-day filtering stays invisible; yesterday is shown only in the lower secondary section.
  window.jobBoardDayMatch = isVisibleJob;
  window.jobBoardDayView = () => 'current';

  function appendYesterdaySection(allJobs) {
    const grid = $('#jobsGrid');
    if (!grid) return;
    grid.querySelector('#yesterdayJobsSection')?.remove();

    const jobs = yesterdayJobs(allJobs);
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

  const baseRender = render;
  render = function currentJobsWithYesterdayRender() {
    const allJobs = state.jobs;
    state.jobs = allJobs.filter(isVisibleJob);
    try {
      baseRender();
    } finally {
      state.jobs = allJobs;
    }
    appendYesterdaySection(allJobs);
  };

  if (!document.querySelector('link[data-recommendations-top]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'recommendations-top.css?v=1';
    link.dataset.recommendationsTop = '1';
    document.head.append(link);
  }

  if (!document.querySelector('script[data-recommendations-top]')) {
    const script = document.createElement('script');
    script.src = 'recommendations-top.js?v=1';
    script.dataset.recommendationsTop = '1';
    document.body.append(script);
  }
})();
