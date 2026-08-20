'use strict';

(() => {
  const blocker = document.createElement('style');
  blocker.id = 'deprecated-suite-ui-blocker';
  blocker.textContent = `
    .suite-history-tab,
    [data-suite-view="history"],
    #suiteHistoryDashboard,
    .suite-attention-tab,
    [data-suite-view="attention"],
    #suiteAttentionDashboard,
    .suite-command-center,
    .suite-activity { display:none!important; }
  `;
  document.head.append(blocker);

  const isLiveJob = (job) => job && job.source_kind !== 'import';
  const baseFilteredJobs = filteredJobs;
  const baseRender = render;

  const myActiveResponsibility = (job) => {
    if (!isLiveJob(job) || !['open', 'claimed'].includes(job.status)) return false;
    if (!Array.isArray(job.claims)) return false;
    const claim = job.claims.find((item) => isSameAgent(item.agent_name));
    if (!claim) return false;
    return Math.max((Number(claim.quantity_claimed) || 0) - (Number(claim.quantity_filled) || 0), 0) > 0;
  };

  filteredJobs = function liveOnlyFilteredJobs() {
    const jobs = baseFilteredJobs().filter(isLiveJob);
    return state.status === 'mine' ? jobs.filter(myActiveResponsibility) : jobs;
  };

  render = function liveOnlyRender() {
    baseRender();
    const liveJobs = state.jobs.filter(isLiveJob);
    $('#openCount').textContent = liveJobs.filter((job) => job.status === 'open').length;
    $('#claimedCount').textContent = liveJobs.filter((job) => job.status === 'claimed').length;
    $('#filledCount').textContent = liveJobs.filter((job) => job.status === 'filled').length;
    $('#mineCount').textContent = liveJobs.filter(myActiveResponsibility).length;
  };

  function addStyle(key, href) {
    if (document.querySelector(`link[data-${key}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = '1';
    document.head.append(link);
  }

  function removeDeprecatedUi() {
    document.querySelectorAll('.suite-history-tab,[data-suite-view="history"],#suiteHistoryDashboard,.suite-attention-tab,[data-suite-view="attention"],#suiteAttentionDashboard,.suite-command-center,.suite-activity').forEach((node) => node.remove());
    const saved = localStorage.getItem('rf_job_board_suite_view');
    if (saved === 'history' || saved === 'attention') localStorage.removeItem('rf_job_board_suite_view');
  }

  const observer = new MutationObserver(removeDeprecatedUi);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  removeDeprecatedUi();

  function loadDailyView() {
    addStyle('daily-view', 'daily-view.css?v=1');
    const existing = document.querySelector('script[data-daily-view]');
    if (existing) {
      if (state.jobs.length) render();
      return;
    }
    const script = document.createElement('script');
    script.src = 'daily-view.js?v=1';
    script.dataset.dailyView = '1';
    script.addEventListener('load', () => {
      if (state.jobs.length) render();
    }, { once: true });
    document.body.append(script);
  }

  function loadOperations() {
    addStyle('operations-suite', 'operations-suite.css?v=3');
    addStyle('operations-tweaks', 'operations-tweaks.css?v=3');
    const existing = document.querySelector('script[data-operations-suite]');
    if (existing) {
      removeDeprecatedUi();
      window.setTimeout(loadDailyView, 120);
      return;
    }
    const script = document.createElement('script');
    script.src = 'operations-suite.js?v=3';
    script.dataset.operationsSuite = '1';
    script.addEventListener('load', () => {
      removeDeprecatedUi();
      window.setTimeout(removeDeprecatedUi, 100);
      window.setTimeout(removeDeprecatedUi, 500);
      window.setTimeout(removeDeprecatedUi, 1500);
      window.setTimeout(loadDailyView, 120);
    }, { once: true });
    script.addEventListener('error', loadDailyView, { once: true });
    document.body.append(script);
  }

  function loadAiThenOperations() {
    addStyle('ai-recommendations', 'ai-recommendations.css?v=3');
    const existing = document.querySelector('script[data-ai-recommendations]');
    if (existing) { window.setTimeout(loadOperations, 120); return; }
    const script = document.createElement('script');
    script.src = 'ai-recommendations.js?v=2';
    script.dataset.aiRecommendations = '1';
    script.addEventListener('load', loadOperations, { once: true });
    script.addEventListener('error', loadOperations, { once: true });
    document.body.append(script);
  }

  window.addEventListener('load', () => {
    addStyle('premium-control-center', 'premium.css?v=3');
    const existingPremium = document.querySelector('script[data-premium-control-center]');
    if (existingPremium) { loadAiThenOperations(); return; }
    const premium = document.createElement('script');
    premium.src = 'premium.js?v=3';
    premium.dataset.premiumControlCenter = '1';
    premium.addEventListener('load', loadAiThenOperations, { once: true });
    premium.addEventListener('error', loadAiThenOperations, { once: true });
    document.body.append(premium);
  }, { once: true });
})();