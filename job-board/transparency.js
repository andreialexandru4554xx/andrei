'use strict';

(() => {
  Object.assign(I18N.ro, {
    status_mine: 'Joburile mele active',
    stat_mine: 'ALE MELE ACTIVE',
    view_jobs: 'Joburi live',
    view_firsts: 'First Agents',
    first_dashboard_title: 'First Agents — joburi active',
    first_dashboard_subtitle: 'Vezi fiecare First, joburile lui active și exact cine a făcut claim pe fiecare necesar.',
    first_label: 'FIRST',
    first_you: 'TU',
    claimers_label: 'Cine face claim',
    nobody_claimed: 'Nimeni nu a făcut claim încă',
    claim_line: '{claimed} claim · {filled} găsiți',
    first_jobs: 'JOBURI',
    first_open: 'OPEN',
    first_claimed: 'CLAIMED',
    first_found: 'GĂSIȚI',
    first_workers: '{total} locuri necesare · {claimed} claim · {filled} muncitori găsiți',
    first_job_slots: '{total} necesari · {claimed} claim · {filled} găsiți',
    see_first_jobs: 'Vezi doar joburile acestui First',
    no_firsts: 'Nu există First Agents cu joburi active acum.',
    focus_warning_eyebrow: 'AVERTISMENT DE FOCUS',
    focus_warning_title: 'Ai deja un job activ',
    focus_warning_text: 'Recomandarea este să lucrezi pe un singur job până îți termini responsabilitatea, ca să nu îți împarți atenția și să scadă viteza de recrutare.',
    focus_warning_exception: 'Dacă următorul job este o excepție și știi că poți acoperi responsabil toate joburile active, poți continua.',
    focus_current_jobs: 'Lucrezi deja la:',
    focus_stay_one: 'Rămân la joburile actuale',
    focus_continue: 'Este o excepție — claim și următorul',
    active_assignment_line: '{trade} · {remaining} muncitori rămași pentru tine',
  });

  Object.assign(I18N.en, {
    status_mine: 'My active jobs',
    stat_mine: 'MY ACTIVE JOBS',
    view_jobs: 'Live jobs',
    view_firsts: 'First Agents',
    first_dashboard_title: 'First Agents — active jobs',
    first_dashboard_subtitle: 'See every First, their active jobs and exactly who has claimed each worker requirement.',
    first_label: 'FIRST',
    first_you: 'YOU',
    claimers_label: 'Who is claiming',
    nobody_claimed: 'No one has claimed this job yet',
    claim_line: '{claimed} claimed · {filled} found',
    first_jobs: 'JOBS',
    first_open: 'OPEN',
    first_claimed: 'CLAIMED',
    first_found: 'FOUND',
    first_workers: '{total} worker slots required · {claimed} claimed · {filled} workers found',
    first_job_slots: '{total} required · {claimed} claimed · {filled} found',
    see_first_jobs: 'View only this First’s jobs',
    no_firsts: 'There are no First Agents with active jobs right now.',
    focus_warning_eyebrow: 'FOCUS WARNING',
    focus_warning_title: 'You already have an active job',
    focus_warning_text: 'The recommendation is to work on one job until you finish your responsibility, so your attention is not split and recruitment speed does not drop.',
    focus_warning_exception: 'If the next job is a genuine exception and you know you can responsibly cover all your active jobs, you can continue.',
    focus_current_jobs: 'You are already working on:',
    focus_stay_one: 'Keep my current jobs',
    focus_continue: 'This is an exception — claim the next one',
    active_assignment_line: '{trade} · {remaining} workers remaining for you',
  });

  const VIEW_KEY = 'recruitflow_job_board_transparency_view';
  let currentView = localStorage.getItem(VIEW_KEY) === 'firsts' ? 'firsts' : 'jobs';

  const workspace = $('.workspace');
  const toolbar = $('.toolbar');
  const jobsGrid = $('#jobsGrid');
  if (!workspace || !toolbar || !jobsGrid) return;

  const switcher = document.createElement('div');
  switcher.className = 'transparency-switcher';
  switcher.innerHTML = `
    <button type="button" class="transparency-tab" data-board-view="jobs">
      <span data-i18n="view_jobs">Joburi live</span><span class="tab-count" id="liveJobTabCount">0</span>
    </button>
    <button type="button" class="transparency-tab" data-board-view="firsts">
      <span data-i18n="view_firsts">First Agents</span><span class="tab-count" id="firstTabCount">0</span>
    </button>`;
  toolbar.before(switcher);

  const firstDashboard = document.createElement('section');
  firstDashboard.id = 'firstDashboard';
  firstDashboard.className = 'first-dashboard transparency-hidden';
  jobsGrid.after(firstDashboard);

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="multiJobWarningDialog" class="small-dialog">
      <div class="dialog-form focus-warning-dialog">
        <button class="dialog-close" type="button" id="closeMultiJobWarning" aria-label="Close">×</button>
        <span class="eyebrow dark" data-i18n="focus_warning_eyebrow">AVERTISMENT DE FOCUS</span>
        <h2 data-i18n="focus_warning_title">Ai deja un job activ</h2>
        <p data-i18n="focus_warning_text">Recomandarea este să lucrezi pe un singur job până îți termini responsabilitatea.</p>
        <strong class="focus-current-label" data-i18n="focus_current_jobs">Lucrezi deja la:</strong>
        <div id="focusActiveJobs" class="focus-active-jobs"></div>
        <p class="focus-exception" data-i18n="focus_warning_exception">Dacă următorul job este o excepție, poți continua.</p>
        <div class="form-actions">
          <button class="ghost" type="button" id="stayOnOneJob" data-i18n="focus_stay_one">Rămân la joburile actuale</button>
          <button class="warning-continue-button" type="button" id="continueSecondJob" data-i18n="focus_continue">Este o excepție — claim și următorul</button>
        </div>
      </div>
    </dialog>`);

  const warningStyle = document.createElement('style');
  warningStyle.textContent = `
    .focus-warning-dialog h2{margin:7px 0 8px;font-size:27px;letter-spacing:-.035em}.focus-warning-dialog>p{color:#64748b;line-height:1.55}.focus-current-label{display:block;margin:18px 0 8px;color:#334155;font-size:12px}.focus-active-jobs{display:grid;gap:7px}.focus-active-job{padding:10px 11px;border:1px solid #fde0a8;border-radius:11px;background:#fff8e9}.focus-active-job strong{display:block;font-size:13px;color:#70480c}.focus-active-job span{display:block;margin-top:3px;color:#8a682d;font-size:10px}.focus-exception{padding:10px 12px;border-radius:11px;background:#f3f6f9;color:#56677a!important;font-size:12px}.warning-continue-button{border:0;border-radius:12px;padding:12px 16px;background:#f5b83e;color:#4b3004;font-weight:900;cursor:pointer}@media(max-width:620px){.warning-continue-button,.focus-warning-dialog .ghost{flex:1}.focus-warning-dialog .form-actions{align-items:stretch;flex-direction:column-reverse}}`;
  document.head.append(warningStyle);

  const baseFilteredJobs = filteredJobs;
  const baseJobCardHtml = jobCardHtml;
  const baseRender = render;
  const baseApplyLanguage = applyLanguage;

  function isLiveJob(job) {
    return job && job.source_kind !== 'import';
  }

  function claimsFor(job) {
    return Array.isArray(job?.claims) ? job.claims : [];
  }

  function myClaimFor(job) {
    return claimsFor(job).find((claim) => isSameAgent(claim.agent_name)) || null;
  }

  function remainingOnClaim(claim) {
    if (!claim) return 0;
    return Math.max((Number(claim.quantity_claimed) || 0) - (Number(claim.quantity_filled) || 0), 0);
  }

  function isMyCurrentResponsibility(job) {
    if (!isLiveJob(job) || !['open', 'claimed'].includes(job.status)) return false;
    return remainingOnClaim(myClaimFor(job)) > 0;
  }

  function activeJobsForMe(excludeJobId = null) {
    return state.jobs.filter((job) => isMyCurrentResponsibility(job) && Number(job.id) !== Number(excludeJobId));
  }

  function totalsFor(job) {
    const claims = claimsFor(job);
    const total = Math.max(1, Number(job.workers_needed) || 1);
    const claimed = Number.isFinite(Number(job.workers_claimed))
      ? Number(job.workers_claimed)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_claimed) || 0), 0);
    const filled = Number.isFinite(Number(job.workers_filled))
      ? Number(job.workers_filled)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_filled) || 0), 0);
    return { total, claimed, filled };
  }

  function activeLiveJobs() {
    return state.jobs.filter((job) => isLiveJob(job) && ['open', 'claimed'].includes(job.status));
  }

  function firstGroups() {
    const groups = new Map();
    for (const job of activeLiveJobs()) {
      const name = String(job.created_by || t('unknown')).trim();
      const key = normalizeName(name) || 'unknown';
      if (!groups.has(key)) groups.set(key, { name, jobs: [] });
      groups.get(key).jobs.push(job);
    }
    return [...groups.values()].sort((a, b) => {
      const claimsA = a.jobs.reduce((sum, job) => sum + claimsFor(job).length, 0);
      const claimsB = b.jobs.reduce((sum, job) => sum + claimsFor(job).length, 0);
      return b.jobs.length - a.jobs.length || claimsB - claimsA || a.name.localeCompare(b.name);
    });
  }

  function claimRowsHtml(job, compact = false) {
    const claims = claimsFor(job);
    if (!claims.length) {
      return `<span class="${compact ? 'first-no-claim' : 'transparent-no-claim'}">${escapeHtml(t('nobody_claimed'))}</span>`;
    }
    if (compact) {
      return claims.map((claim) => {
        const claimed = Number(claim.quantity_claimed) || 0;
        const filled = Number(claim.quantity_filled) || 0;
        return `<span class="first-claim-chip ${isSameAgent(claim.agent_name) ? 'is-me' : ''}">${escapeHtml(claim.agent_name)} · ${escapeHtml(t('claim_line', { claimed, filled }))}</span>`;
      }).join('');
    }
    return claims.map((claim) => {
      const claimed = Number(claim.quantity_claimed) || 0;
      const filled = Number(claim.quantity_filled) || 0;
      return `<div class="transparent-claim-row"><strong>${escapeHtml(claim.agent_name)}${isSameAgent(claim.agent_name) ? ' ★' : ''}</strong><span>${escapeHtml(t('claim_line', { claimed, filled }))}</span></div>`;
    }).join('');
  }

  filteredJobs = function transparencyFilteredJobs() {
    const jobs = baseFilteredJobs();
    if (state.status !== 'mine') return jobs;
    return jobs.filter(isMyCurrentResponsibility);
  };

  jobCardHtml = function transparencyJobCardHtml(job) {
    let html = baseJobCardHtml(job);
    if (!isLiveJob(job)) return html;
    const first = String(job.created_by || t('unknown'));
    const transparency = `<section class="job-transparency">
      <div class="job-transparency-head">
        <div class="job-first-owner"><span class="first-badge">${escapeHtml(t('first_label'))}</span><b>${escapeHtml(first)}</b>${isSameAgent(first) ? ` <span class="first-you">${escapeHtml(t('first_you'))}</span>` : ''}</div>
        <span class="eyebrow dark">${escapeHtml(t('claimers_label'))}</span>
      </div>
      <div class="job-transparency-claims">${claimRowsHtml(job)}</div>
    </section>`;
    if (html.includes('<section class="worker-capacity')) {
      html = html.replace('<section class="worker-capacity', `${transparency}<section class="worker-capacity`);
    } else if (html.includes('<details class="contact-details"')) {
      html = html.replace('<details class="contact-details"', `${transparency}<details class="contact-details"`);
    } else {
      html = html.replace('</article>', `${transparency}</article>`);
    }
    return html;
  };

  function renderFirstDashboard() {
    const groups = firstGroups();
    $('#liveJobTabCount').textContent = activeLiveJobs().length;
    $('#firstTabCount').textContent = groups.length;
    if (!groups.length) {
      firstDashboard.innerHTML = `<div class="first-empty">${escapeHtml(t('no_firsts'))}</div>`;
      return;
    }
    firstDashboard.innerHTML = `
      <div class="first-dashboard-toolbar">
        <div><h3>${escapeHtml(t('first_dashboard_title'))}</h3><span>${escapeHtml(t('first_dashboard_subtitle'))}</span></div>
      </div>
      <div class="first-grid">${groups.map((group) => firstCardHtml(group)).join('')}</div>`;
  }

  function firstCardHtml(group) {
    const jobs = group.jobs;
    const open = jobs.filter((job) => job.status === 'open').length;
    const claimedJobs = jobs.filter((job) => job.status === 'claimed').length;
    const totals = jobs.reduce((sum, job) => {
      const item = totalsFor(job);
      sum.total += item.total;
      sum.claimed += item.claimed;
      sum.filled += item.filled;
      return sum;
    }, { total: 0, claimed: 0, filled: 0 });
    const jobRows = jobs.slice(0, 6).map((job) => {
      const slots = totalsFor(job);
      const place = [job.location, job.postcode].filter(Boolean).join(' · ') || t('location_unspecified');
      return `<div class="first-job-row">
        <div class="first-job-main"><strong>${escapeHtml(job.trade)}</strong><small>${escapeHtml(String(job.status).toUpperCase())}</small></div>
        <div class="first-job-meta">${escapeHtml(place)} · ${escapeHtml(t('first_job_slots', slots))}</div>
        <div class="first-job-claims">${claimRowsHtml(job, true)}</div>
      </div>`;
    }).join('');
    return `<article class="first-card ${isSameAgent(group.name) ? 'is-me' : ''}">
      <div class="first-card-head">
        <div class="first-name-row"><h4>${escapeHtml(group.name)}</h4>${isSameAgent(group.name) ? `<span class="first-you">${escapeHtml(t('first_you'))}</span>` : ''}</div>
        <div class="first-summary">
          <div><strong>${jobs.length}</strong><small>${escapeHtml(t('first_jobs'))}</small></div>
          <div><strong>${open}</strong><small>${escapeHtml(t('first_open'))}</small></div>
          <div><strong>${claimedJobs}</strong><small>${escapeHtml(t('first_claimed'))}</small></div>
          <div><strong>${totals.filled}</strong><small>${escapeHtml(t('first_found'))}</small></div>
        </div>
        <div class="first-worker-summary">${escapeHtml(t('first_workers', totals))}</div>
      </div>
      <div class="first-job-list">${jobRows}</div>
      <button type="button" class="first-show-jobs" data-first-name="${escapeHtml(group.name)}">${escapeHtml(t('see_first_jobs'))}</button>
    </article>`;
  }

  function applyView() {
    const showingFirsts = currentView === 'firsts';
    switcher.querySelectorAll('[data-board-view]').forEach((button) => button.classList.toggle('is-active', button.dataset.boardView === currentView));
    toolbar.classList.toggle('transparency-hidden', showingFirsts);
    jobsGrid.classList.toggle('transparency-hidden', showingFirsts);
    firstDashboard.classList.toggle('transparency-hidden', !showingFirsts);
    const heading = $('.section-heading h2');
    if (heading) heading.textContent = showingFirsts ? t('first_dashboard_title') : t('team_jobs');
  }

  render = function transparencyRender() {
    baseRender();
    $('#mineCount').textContent = state.jobs.filter(isMyCurrentResponsibility).length;
    renderFirstDashboard();
    applyView();
  };

  applyLanguage = function transparencyApplyLanguage() {
    baseApplyLanguage();
    renderFirstDashboard();
    applyView();
  };

  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('[data-board-view]');
    if (!button) return;
    currentView = button.dataset.boardView === 'firsts' ? 'firsts' : 'jobs';
    localStorage.setItem(VIEW_KEY, currentView);
    render();
  });

  firstDashboard.addEventListener('click', (event) => {
    const button = event.target.closest('[data-first-name]');
    if (!button) return;
    currentView = 'jobs';
    localStorage.setItem(VIEW_KEY, currentView);
    state.status = 'active';
    $('#statusFilter').value = 'active';
    state.search = button.dataset.firstName || '';
    $('#searchInput').value = state.search;
    render();
    workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('.stats')?.addEventListener('click', (event) => {
    if (!event.target.closest('[data-stat-filter]')) return;
    currentView = 'jobs';
    localStorage.setItem(VIEW_KEY, currentView);
  }, true);

  const claimForm = $('#claimForm');
  const warningDialog = $('#multiJobWarningDialog');
  let bypassFocusWarning = false;

  function closeWarning() {
    if (warningDialog?.open) warningDialog.close();
  }

  function showFocusWarning(otherJobs) {
    $('#focusActiveJobs').innerHTML = otherJobs.map((job) => {
      const claim = myClaimFor(job);
      const remaining = remainingOnClaim(claim);
      const place = [job.location, job.postcode].filter(Boolean).join(' · ') || t('location_unspecified');
      return `<div class="focus-active-job"><strong>${escapeHtml(job.trade)}</strong><span>${escapeHtml(t('active_assignment_line', { trade: job.trade, remaining }))} · ${escapeHtml(place)}</span></div>`;
    }).join('');
    warningDialog.showModal();
  }

  if (claimForm && warningDialog) {
    claimForm.addEventListener('submit', (event) => {
      if (bypassFocusWarning) {
        bypassFocusWarning = false;
        return;
      }
      const targetJobId = Number($('#claimJobId').value);
      const otherActiveJobs = activeJobsForMe(targetJobId);
      if (!otherActiveJobs.length) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showFocusWarning(otherActiveJobs);
    }, true);

    $('#continueSecondJob').addEventListener('click', () => {
      closeWarning();
      bypassFocusWarning = true;
      claimForm.requestSubmit();
    });
    $('#stayOnOneJob').addEventListener('click', closeWarning);
    $('#closeMultiJobWarning').addEventListener('click', closeWarning);
    warningDialog.addEventListener('click', (event) => { if (event.target === warningDialog) closeWarning(); });
  }

  applyLanguage();
})();
