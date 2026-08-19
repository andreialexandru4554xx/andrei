'use strict';

(() => {
  const BLUE_BASE_URL = 'https://blue-recruitflow.vercel.app/';

  Object.assign(I18N.ro, {
    blue_find_workers: '🔎 Găsește muncitori în Blue',
    blue_find_workers_title: 'Deschide Blue cu filtrele acestui job',
  });
  Object.assign(I18N.en, {
    blue_find_workers: '🔎 Find workers in Blue',
    blue_find_workers_title: 'Open Blue with this job’s filters',
  });

  const baseJobCardHtml = jobCardHtml;

  function claimsFor(job) {
    return Array.isArray(job?.claims) ? job.claims : [];
  }

  function myActiveClaim(job) {
    if (!job || !['open', 'claimed'].includes(String(job.status))) return null;
    const claim = claimsFor(job).find((item) => isSameAgent(item.agent_name));
    if (!claim) return null;
    const remaining = Math.max(
      (Number(claim.quantity_claimed) || 0) - (Number(claim.quantity_filled) || 0),
      0,
    );
    return remaining > 0 ? claim : null;
  }

  function postcodeDistrict(value) {
    const postcode = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
    if (!postcode) return '';
    if (postcode.includes(' ')) return postcode.split(' ')[0];
    const compact = postcode.replace(/\s/g, '');
    const match = compact.match(/^([A-Z]{1,2}\d[A-Z\d]?)/);
    return match ? match[1] : compact;
  }

  function blueUrl(job) {
    const url = new URL(BLUE_BASE_URL);
    const trade = String(job?.trade || '').trim();
    const postcode = postcodeDistrict(job?.postcode);
    if (trade) url.searchParams.set('trade', trade);
    if (postcode) url.searchParams.set('postcode', postcode);
    return url.toString();
  }

  jobCardHtml = function blueSearchJobCardHtml(job) {
    let html = baseJobCardHtml(job);
    if (!myActiveClaim(job)) return html;

    const button = `<button class="card-action action-blue-search" type="button" data-action="blue-search" data-id="${job.id}" title="${escapeHtml(t('blue_find_workers_title'))}">${escapeHtml(t('blue_find_workers'))}</button>`;

    if (html.includes('<div class="card-actions">')) {
      html = html.replace('<div class="card-actions">', `<div class="card-actions">${button}`);
    } else {
      html = html.replace('</article>', `<div class="card-actions">${button}</div></article>`);
    }
    return html;
  };

  $('#jobsGrid')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="blue-search"]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const job = state.jobs.find((item) => Number(item.id) === Number(button.dataset.id));
    if (!job || !myActiveClaim(job)) return;
    window.open(blueUrl(job), '_blank', 'noopener,noreferrer');
  }, true);
})();
