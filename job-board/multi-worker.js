'use strict';

(() => {
  Object.assign(I18N.ro, {
    hero_description: 'First Agent stabilește numărul total de muncitori necesari. Apoi mai mulți recruiteri pot prelua câte locuri vor, fără să se suprapună.',
    field_workers: 'Număr total de muncitori necesari',
    workers_hint: 'First Agent completează aici necesarul total pentru acest job.',
    capacity_title: 'Necesar total: {total} muncitori',
    capacity_summary: '{filled} găsiți · {recruiting} în lucru · {available} locuri libere',
    legend_found: 'Găsiți', legend_claimed: 'Claimed', legend_free: 'Liberi',
    allocation_line: '{claimed} preluați · {filled} găsiți',
    claim_slots_button: 'CLAIM LOCURI ({available})',
    found_slots_button: '✓ AM GĂSIT ({count})',
    release_slots_button: 'Eliberează locurile',
    claim_dialog_eyebrow: 'CLAIM MUNCITORI',
    claim_dialog_title: 'Câte locuri preiei?',
    claim_dialog_description: 'Poți prelua doar o parte din necesar. Restul locurilor rămân disponibile pentru alți recruiteri.',
    claim_quantity: 'Număr de muncitori pe care îi vei căuta',
    claim_dialog_summary: '<strong>{trade}</strong><br>{available} din {total} locuri sunt disponibile.',
    claim_confirm: 'Claim locurile',
    found_title: 'Câți muncitori ai găsit?',
    found_description: 'Confirmă numărul găsit de tine. Jobul ajunge la <strong>OM GĂSIT</strong> numai când este completat întregul necesar.',
    found_quantity: 'Număr de muncitori găsiți acum',
    found_dialog_summary: 'Ai preluat {claimed} locuri și ai confirmat deja {filled}. Mai poți confirma {remaining}.',
    found_confirm: '✓ Confirmă muncitorii',
    claiming_slots: 'Rezervăm locurile…', filling_slots: 'Confirmăm muncitorii…', releasing_slots: 'Eliberăm locurile…',
    claimed_slots_success: 'Ai preluat {quantity} locuri de muncitor.',
    filled_slots_success: 'Ai confirmat {quantity} muncitori găsiți.',
    released_slots_success: 'Locurile pe care nu le-ai completat au fost eliberate.',
    no_slots_available: 'Nu mai sunt locuri libere la acest job.',
    no_unfilled_slots: 'Nu mai ai locuri de completat la acest job.',
    confirm_release_slots: 'Eliberezi toate locurile pe care le-ai preluat, dar pentru care nu ai găsit încă muncitori?',
    created: 'Jobul a fost publicat. Numărul total de muncitori este vizibil pentru toată echipa.',
  });

  Object.assign(I18N.en, {
    hero_description: 'The First Agent sets the total number of workers required. Multiple recruiters can then claim the number of worker slots they will cover without overlapping.',
    field_workers: 'Total workers needed',
    workers_hint: 'The First Agent enters the full number of workers required for this job.',
    capacity_title: 'Total required: {total} workers',
    capacity_summary: '{filled} found · {recruiting} in progress · {available} slots free',
    legend_found: 'Found', legend_claimed: 'Claimed', legend_free: 'Free',
    allocation_line: '{claimed} claimed · {filled} found',
    claim_slots_button: 'CLAIM SLOTS ({available})',
    found_slots_button: '✓ I FOUND ({count})',
    release_slots_button: 'Release slots',
    claim_dialog_eyebrow: 'CLAIM WORKERS',
    claim_dialog_title: 'How many slots will you take?',
    claim_dialog_description: 'You can claim only part of the requirement. The remaining slots stay available to other recruiters.',
    claim_quantity: 'Number of workers you will recruit',
    claim_dialog_summary: '<strong>{trade}</strong><br>{available} of {total} slots are available.',
    claim_confirm: 'Claim slots',
    found_title: 'How many workers did you find?',
    found_description: 'Confirm the number you found. The job becomes <strong>WORKER FOUND</strong> only when the full requirement is completed.',
    found_quantity: 'Workers found now',
    found_dialog_summary: 'You claimed {claimed} slots and already confirmed {filled}. You can confirm {remaining} more.',
    found_confirm: '✓ Confirm workers',
    claiming_slots: 'Claiming worker slots…', filling_slots: 'Confirming workers…', releasing_slots: 'Releasing slots…',
    claimed_slots_success: 'You claimed {quantity} worker slots.',
    filled_slots_success: 'You confirmed {quantity} workers found.',
    released_slots_success: 'Your unfilled worker slots were released.',
    no_slots_available: 'There are no free worker slots on this job.',
    no_unfilled_slots: 'You have no remaining worker slots to fill on this job.',
    confirm_release_slots: 'Release all slots you claimed but have not filled yet?',
    created: 'The job was posted. The full worker requirement is visible to the team.',
  });

  const workersInput = $('#workersInput');
  workersInput.required = true;
  workersInput.min = '1';
  workersInput.max = '100';
  workersInput.step = '1';
  const workersLabel = workersInput.closest('label');
  if (workersLabel && !workersLabel.querySelector('.worker-number-hint')) {
    workersLabel.insertAdjacentHTML('beforeend', '<small class="worker-number-hint" data-i18n="workers_hint"></small>');
  }

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="claimDialog" class="small-dialog">
      <form id="claimForm" class="dialog-form">
        <button class="dialog-close" type="button" id="closeClaimDialog" aria-label="Close">×</button>
        <span class="eyebrow dark" data-i18n="claim_dialog_eyebrow">CLAIM MUNCITORI</span>
        <h2 data-i18n="claim_dialog_title">Câte locuri preiei?</h2>
        <p data-i18n="claim_dialog_description">Poți prelua doar o parte din necesar.</p>
        <p id="claimDialogSummary" class="slot-dialog-summary"></p>
        <input id="claimJobId" type="hidden">
        <label class="slot-quantity-field"><span data-i18n="claim_quantity">Număr de muncitori pe care îi vei căuta</span>
          <input id="claimQuantity" type="number" min="1" max="1" step="1" value="1" required>
        </label>
        <div class="form-actions">
          <button class="ghost" type="button" id="cancelClaimDialog" data-i18n="cancel">Renunță</button>
          <button class="primary" type="submit" data-i18n="claim_confirm">Claim locurile</button>
        </div>
      </form>
    </dialog>
  `);

  const foundNoteLabel = $('#foundNote')?.closest('label');
  if (foundNoteLabel && !$('#foundQuantity')) {
    foundNoteLabel.insertAdjacentHTML('beforebegin', `
      <p id="foundDialogSummary" class="slot-dialog-summary"></p>
      <label class="slot-quantity-field"><span data-i18n="found_quantity">Număr de muncitori găsiți acum</span>
        <input id="foundQuantity" type="number" min="1" max="1" step="1" value="1" required>
      </label>
    `);
  }

  const baseFilteredJobs = filteredJobs;
  const baseJobCardHtml = jobCardHtml;
  const baseRender = render;
  const baseApplyLanguage = applyLanguage;

  function claimsFor(job) {
    return Array.isArray(job.claims) ? job.claims : [];
  }

  function slotTotals(job) {
    const claims = claimsFor(job);
    const total = Math.max(1, Number(job.workers_needed) || 1);
    const claimed = Number.isFinite(Number(job.workers_claimed))
      ? Number(job.workers_claimed)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_claimed) || 0), 0);
    const filled = Number.isFinite(Number(job.workers_filled))
      ? Number(job.workers_filled)
      : claims.reduce((sum, claim) => sum + (Number(claim.quantity_filled) || 0), 0);
    return {
      total,
      claimed,
      filled,
      recruiting: Math.max(claimed - filled, 0),
      available: Math.max(total - claimed, 0),
    };
  }

  function myClaimFor(job) {
    return claimsFor(job).find((claim) => isSameAgent(claim.agent_name)) || null;
  }

  function hasMyJob(job) {
    return isSameAgent(job.created_by) || Boolean(myClaimFor(job));
  }

  function slotText(key, values = {}) {
    return t(key, values);
  }

  filteredJobs = function multiWorkerFilteredJobs() {
    const query = state.search.trim().toLocaleLowerCase();
    const statusOrder = { open: 0, claimed: 1, filled: 2, closed: 3 };
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };

    return state.jobs.filter((job) => {
      const statusMatch = state.status === 'all'
        || (state.status === 'active' && ['open', 'claimed'].includes(job.status))
        || (state.status === 'mine' && hasMyJob(job))
        || job.status === state.status;
      const priorityMatch = state.priority === 'all' || job.priority === state.priority;
      if (!statusMatch || !priorityMatch) return false;
      if (!query) return true;
      const claimAgents = claimsFor(job).map((claim) => claim.agent_name).join(' ');
      return [job.trade, job.location, job.postcode, job.rate, job.company_name, job.description, job.created_by, job.job_reference, claimAgents]
        .filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
    }).sort((a, b) => {
      const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (statusDiff) return statusDiff;
      const priorityDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      if (priorityDiff) return priorityDiff;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  jobCardHtml = function multiWorkerJobCardHtml(job) {
    let html = baseJobCardHtml(job);
    const claims = claimsFor(job);
    const totals = slotTotals(job);
    const myClaim = myClaimFor(job);
    const myUnfilled = myClaim ? Math.max(Number(myClaim.quantity_claimed) - Number(myClaim.quantity_filled), 0) : 0;
    const foundPercent = Math.min(100, (totals.filled / totals.total) * 100);
    const claimedOnlyPercent = Math.min(100 - foundPercent, (totals.recruiting / totals.total) * 100);

    const allocations = claims.length
      ? `<div class="worker-allocations">${claims.map((claim) => {
          const claimed = Number(claim.quantity_claimed) || 0;
          const filled = Number(claim.quantity_filled) || 0;
          return `<div class="worker-allocation ${isSameAgent(claim.agent_name) ? 'is-me' : ''}">
            <strong>${escapeHtml(claim.agent_name)}${isSameAgent(claim.agent_name) ? ' ★' : ''}</strong>
            <span>${escapeHtml(slotText('allocation_line', { claimed, filled }))}</span>
          </div>`;
        }).join('')}</div>`
      : '';

    const capacity = `<section class="worker-capacity ${totals.filled >= totals.total ? 'capacity-complete' : ''}">
      <div class="worker-capacity-head">
        <strong>${escapeHtml(slotText('capacity_title', { total: totals.total }))}</strong>
        <span>${escapeHtml(slotText('capacity_summary', totals))}</span>
      </div>
      <div class="worker-slot-bar" aria-label="Worker allocation progress">
        <span class="worker-slot-found" style="width:${foundPercent}%"></span>
        <span class="worker-slot-claimed" style="width:${claimedOnlyPercent}%"></span>
      </div>
      <div class="worker-slot-legend">
        <span class="legend-found"><i></i>${escapeHtml(slotText('legend_found'))}: ${totals.filled}</span>
        <span class="legend-claimed"><i></i>${escapeHtml(slotText('legend_claimed'))}: ${totals.recruiting}</span>
        <span class="legend-free"><i></i>${escapeHtml(slotText('legend_free'))}: ${totals.available}</span>
      </div>
      ${allocations}
    </section>`;

    html = html.replace('<article class="job-card', `<article data-job-id="${job.id}" class="job-card`);
    html = html.replace(/<div class="claim-owner[^\"]*">[\s\S]*?<\/div>/g, '');
    html = html.replace(/<button class="card-action action-(?:claim|found|release)"[\s\S]*?<\/button>/g, '');
    html = html.replace(/(<details class="contact-details"|<div class="contact-details")/, `${capacity}$1`);

    let slotActions = '';
    if (!['closed', 'filled'].includes(job.status) && totals.available > 0) {
      slotActions += `<button class="card-action action-claim-slots" data-action="claim-slots" data-id="${job.id}">${escapeHtml(slotText('claim_slots_button', { available: totals.available }))}</button>`;
    }
    if (!['closed', 'filled'].includes(job.status) && myUnfilled > 0) {
      slotActions += `<button class="card-action action-found-slots" data-action="found-slots" data-id="${job.id}">${escapeHtml(slotText('found_slots_button', { count: myUnfilled }))}</button>`;
      slotActions += `<button class="card-action action-release-slots" data-action="release-slots" data-id="${job.id}">${escapeHtml(slotText('release_slots_button'))}</button>`;
    }
    if (myClaim && ['open', 'claimed'].includes(job.status) && !html.includes('action-edit')) {
      slotActions += `<button class="card-action action-edit" data-action="edit" data-id="${job.id}">${escapeHtml(t('action_edit'))}</button>`;
    }
    if (myClaim && ['open', 'claimed'].includes(job.status) && !html.includes('action-close')) {
      slotActions += `<button class="card-action action-close" data-action="close" data-id="${job.id}" title="${escapeHtml(t('close_title'))}">×</button>`;
    }

    if (slotActions) {
      if (html.includes('<div class="card-actions">')) {
        html = html.replace('<div class="card-actions">', `<div class="card-actions">${slotActions}`);
      } else {
        html = html.replace('</article>', `<div class="card-actions">${slotActions}</div></article>`);
      }
    }
    return html;
  };

  render = function multiWorkerRender() {
    baseRender();
    $('#mineCount').textContent = state.jobs.filter(hasMyJob).length;
  };

  function openClaimDialog(jobId) {
    const job = state.jobs.find((item) => Number(item.id) === Number(jobId));
    if (!job) return;
    const totals = slotTotals(job);
    if (totals.available < 1) return toast(t('no_slots_available'), 'error');
    $('#claimJobId').value = String(job.id);
    $('#claimQuantity').max = String(totals.available);
    $('#claimQuantity').value = '1';
    $('#claimDialogSummary').innerHTML = slotText('claim_dialog_summary', {
      trade: escapeHtml(job.trade), total: totals.total, available: totals.available,
    });
    $('#claimDialog').showModal();
    window.setTimeout(() => $('#claimQuantity').focus(), 60);
  }

  function openFoundDialog(jobId) {
    const job = state.jobs.find((item) => Number(item.id) === Number(jobId));
    if (!job) return;
    const claim = myClaimFor(job);
    const remaining = claim ? Math.max(Number(claim.quantity_claimed) - Number(claim.quantity_filled), 0) : 0;
    if (!claim || remaining < 1) return toast(t('no_unfilled_slots'), 'error');
    $('#foundJobId').value = String(job.id);
    $('#foundQuantity').max = String(remaining);
    $('#foundQuantity').value = '1';
    $('#foundNote').value = '';
    $('#foundDialogSummary').textContent = slotText('found_dialog_summary', {
      claimed: Number(claim.quantity_claimed) || 0,
      filled: Number(claim.quantity_filled) || 0,
      remaining,
    });
    $('#foundDialog').showModal();
    window.setTimeout(() => $('#foundQuantity').focus(), 60);
  }

  function friendlySlotError(error) {
    const message = String(error?.message || error || t('network_error'));
    const available = message.match(/Only (\d+) worker slot\(s\) are still available/i);
    if (available && Number(available[1]) === 0) return t('no_slots_available');
    return message;
  }

  async function runSlotAction(action, jobId, quantity = null, note = null) {
    const busyKey = action === 'claim' ? 'claiming_slots' : action === 'fill' ? 'filling_slots' : 'releasing_slots';
    setBusy(true, t(busyKey));
    try {
      const payload = { id: Number(jobId), agent: state.agent };
      if (quantity !== null) payload.quantity = Number(quantity);
      if (note !== null) payload.note = note;
      await api(action, payload);
      const successKey = action === 'claim' ? 'claimed_slots_success' : action === 'fill' ? 'filled_slots_success' : 'released_slots_success';
      toast(t(successKey, { quantity }), 'success');
      await loadJobs({ silent: true });
      return true;
    } catch (error) {
      toast(friendlySlotError(error), 'error', 5200);
      await loadJobs({ silent: true });
      return false;
    } finally {
      setBusy(false);
    }
  }

  $('#claimForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const quantity = Number($('#claimQuantity').value);
    const max = Number($('#claimQuantity').max);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) return;
    if (await runSlotAction('claim', $('#claimJobId').value, quantity)) $('#claimDialog').close();
  });

  $('#foundForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const quantity = Number($('#foundQuantity').value);
    const max = Number($('#foundQuantity').max);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) return;
    const note = $('#foundNote').value.trim();
    if (await runSlotAction('fill', $('#foundJobId').value, quantity, note)) $('#foundDialog').close();
  }, true);

  $('#jobsGrid').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (!['claim-slots', 'found-slots', 'release-slots'].includes(action)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const id = Number(button.dataset.id);
    if (action === 'claim-slots') return openClaimDialog(id);
    if (action === 'found-slots') return openFoundDialog(id);
    if (action === 'release-slots' && window.confirm(t('confirm_release_slots'))) {
      await runSlotAction('release', id);
    }
  }, true);

  $('#closeClaimDialog').addEventListener('click', () => $('#claimDialog').close());
  $('#cancelClaimDialog').addEventListener('click', () => $('#claimDialog').close());
  $('#claimDialog').addEventListener('click', (event) => { if (event.target === $('#claimDialog')) $('#claimDialog').close(); });

  applyLanguage = function multiWorkerApplyLanguage() {
    baseApplyLanguage();
    if ($('#claimDialog').open && $('#claimJobId').value) {
      const job = state.jobs.find((item) => Number(item.id) === Number($('#claimJobId').value));
      if (job) {
        const totals = slotTotals(job);
        $('#claimDialogSummary').innerHTML = slotText('claim_dialog_summary', {
          trade: escapeHtml(job.trade), total: totals.total, available: totals.available,
        });
      }
    }
    if ($('#foundDialog').open && $('#foundJobId').value) {
      const job = state.jobs.find((item) => Number(item.id) === Number($('#foundJobId').value));
      const claim = job ? myClaimFor(job) : null;
      if (claim) {
        $('#foundDialogSummary').textContent = slotText('found_dialog_summary', {
          claimed: Number(claim.quantity_claimed) || 0,
          filled: Number(claim.quantity_filled) || 0,
          remaining: Math.max(Number(claim.quantity_claimed) - Number(claim.quantity_filled), 0),
        });
      }
    }
  };

  applyLanguage();
})();
