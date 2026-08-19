'use strict';

(() => {
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

  window.addEventListener('load', () => {
    if (!document.querySelector('link[data-premium-control-center]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'premium.css?v=2';
      link.dataset.premiumControlCenter = '1';
      document.head.append(link);
    }
    if (!document.querySelector('script[data-premium-control-center]')) {
      const script = document.createElement('script');
      script.src = 'premium.js?v=2';
      script.dataset.premiumControlCenter = '1';
      document.body.append(script);
    }

    if (!document.querySelector('link[data-ai-recommendations]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'ai-recommendations.css?v=1';
      link.dataset.aiRecommendations = '1';
      document.head.append(link);
    }
    if (!document.querySelector('script[data-ai-recommendations]')) {
      const script = document.createElement('script');
      script.src = 'ai-recommendations.js?v=1';
      script.dataset.aiRecommendations = '1';
      document.body.append(script);
    }
  }, { once: true });
})();
