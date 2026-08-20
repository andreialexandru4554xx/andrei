'use strict';

(() => {
  const LONDON_TZ = 'Europe/London';

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

  function jobDayKey(job) {
    if (!job?.created_at) return '';
    const date = new Date(job.created_at);
    if (Number.isNaN(date.getTime())) return '';
    return keyFromParts(londonParts(date));
  }

  function isVisibleJob(job) {
    return Boolean(job)
      && job.source_kind !== 'import'
      && !String(job.job_reference || '').startsWith('HOT-WORKER-')
      && jobDayKey(job) === currentDayKey();
  }

  // Keep older jobs out of the live UI without showing any day-related controls or labels.
  window.jobBoardDayMatch = isVisibleJob;
  window.jobBoardDayView = () => 'current';

  const baseRender = render;
  render = function currentJobsOnlyRender() {
    const allJobs = state.jobs;
    state.jobs = allJobs.filter(isVisibleJob);
    try {
      baseRender();
    } finally {
      state.jobs = allJobs;
    }
  };
})();
