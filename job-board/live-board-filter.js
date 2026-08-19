'use strict';

(() => {
  const isLiveJob = (job) => job && job.source_kind !== 'import';
  const baseFilteredJobs = filteredJobs;
  const baseRender = render;

  filteredJobs = function liveOnlyFilteredJobs() {
    return baseFilteredJobs().filter(isLiveJob);
  };

  render = function liveOnlyRender() {
    baseRender();
    const liveJobs = state.jobs.filter(isLiveJob);
    $('#openCount').textContent = liveJobs.filter((job) => job.status === 'open').length;
    $('#claimedCount').textContent = liveJobs.filter((job) => job.status === 'claimed').length;
    $('#filledCount').textContent = liveJobs.filter((job) => job.status === 'filled').length;
    $('#mineCount').textContent = liveJobs.filter((job) => {
      const createdByMe = isSameAgent(job.created_by);
      const claimedByMe = Array.isArray(job.claims)
        && job.claims.some((claim) => isSameAgent(claim.agent_name));
      return createdByMe || claimedByMe;
    }).length;
  };
})();
