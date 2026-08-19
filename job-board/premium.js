'use strict';

(() => {
  const hero = document.querySelector('.hero');
  const stack = document.querySelector('.post-action-stack');
  if (hero && stack && !document.querySelector('.hero-action-panel')) {
    const panel = document.createElement('div');
    panel.className = 'hero-action-panel';
    panel.append(stack);
    hero.append(panel);
  }

  const baseRender = render;
  const baseApplyLanguage = applyLanguage;

  function jobById(id) {
    return state.jobs.find((job) => Number(job.id) === Number(id));
  }

  function liveTotals(job) {
    const claims = Array.isArray(job?.claims) ? job.claims : [];
    const needed = Math.max(1, Number(job?.workers_needed) || 1);
    const claimed = Number.isFinite(Number(job?.workers_claimed))
      ? Number(job.workers_claimed)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_claimed) || 0), 0);
    const found = Number.isFinite(Number(job?.workers_filled))
      ? Number(job.workers_filled)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_filled) || 0), 0);
    return {
      needed,
      claimed,
      found,
      free: Math.max(needed - claimed, 0),
      recruiters: claims.length,
    };
  }

  function labels() {
    return state.lang === 'en'
      ? { title: 'Live situation', first: 'First', needed: 'Needed', claimed: 'Claimed', found: 'Found', free: 'Free', recruiters: 'Recruiters' }
      : { title: 'Situație live', first: 'First', needed: 'Necesar', claimed: 'Claim', found: 'Găsiți', free: 'Liberi', recruiters: 'Recruiteri' };
  }

  function addSnapshots() {
    const text = labels();
    document.querySelectorAll('.job-card[data-job-id]').forEach((card) => {
      if (card.querySelector('.premium-snapshot')) return;
      const job = jobById(card.dataset.jobId);
      if (!job || String(job.job_reference || '').startsWith('HOT-WORKER-')) return;
      const totals = liveTotals(job);
      const block = document.createElement('section');
      block.className = 'premium-snapshot';
      block.innerHTML = `
        <div class="premium-snapshot-head">
          <strong>${escapeHtml(text.title)}</strong>
          <span>${escapeHtml(text.first)}: ${escapeHtml(job.created_by || t('unknown'))}</span>
        </div>
        <div class="premium-snapshot-grid">
          <div class="premium-snapshot-cell"><strong>${totals.needed}</strong><small>${escapeHtml(text.needed)}</small></div>
          <div class="premium-snapshot-cell"><strong>${totals.claimed}</strong><small>${escapeHtml(text.claimed)}</small></div>
          <div class="premium-snapshot-cell"><strong>${totals.found}</strong><small>${escapeHtml(text.found)}</small></div>
          <div class="premium-snapshot-cell"><strong>${totals.free}</strong><small>${escapeHtml(text.free)}</small></div>
          <div class="premium-snapshot-cell"><strong>${totals.recruiters}</strong><small>${escapeHtml(text.recruiters)}</small></div>
        </div>`;
      const transparency = card.querySelector('.job-transparency');
      const capacity = card.querySelector('.worker-capacity');
      const anchor = transparency || capacity || card.querySelector('.contact-details');
      if (anchor) card.insertBefore(block, anchor);
      else card.append(block);
    });
  }

  render = function premiumRender() {
    baseRender();
    addSnapshots();
  };

  applyLanguage = function premiumApplyLanguage() {
    baseApplyLanguage();
    document.querySelectorAll('.premium-snapshot').forEach((node) => node.remove());
    addSnapshots();
  };

  const languageButton = document.querySelector('#languageButton');
  if (languageButton) {
    languageButton.addEventListener('click', () => {
      document.documentElement.lang = state.lang === 'en' ? 'en' : 'ro';
    });
  }
  document.documentElement.lang = state.lang === 'en' ? 'en' : 'ro';
  addSnapshots();
})();
