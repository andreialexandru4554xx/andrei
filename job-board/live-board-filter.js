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
})();
