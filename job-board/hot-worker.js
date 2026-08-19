'use strict';

(() => {
  Object.assign(I18N.ro, {
    hot_worker_button: '🔥 Muncitor disponibil',
    hot_worker_eyebrow: 'HOT WORKER',
    hot_worker_title: 'Muncitor disponibil acum',
    hot_worker_intro: 'Adaugă un muncitor care este disponibil imediat, separat de joburile First Agents. Intrarea rămâne activă 24 de ore.',
    hot_worker_privacy: 'Folosește doar o referință internă sau inițiale. Nu pune aici telefon, email sau alte date personale ale muncitorului.',
    hot_worker_ref: 'Referință / inițiale muncitor',
    hot_worker_ref_placeholder: 'Ex: AB-42',
    hot_worker_trade: 'Meserie',
    hot_worker_trade_placeholder: 'Ex: Electrician',
    hot_worker_location: 'Locație',
    hot_worker_location_placeholder: 'Ex: London',
    hot_worker_postcode: 'Postcode',
    hot_worker_notes: 'Notă scurtă',
    hot_worker_notes_placeholder: 'Ex: disponibil azi, CSCS, tools',
    hot_worker_publish: '🔥 Publică Hot Worker',
    hot_worker_active: 'Hot Workers activi',
    hot_worker_active_hint: 'Doar ultimele 24h',
    hot_worker_empty: 'Nu există muncitori disponibili publicați în ultimele 24 de ore.',
    hot_worker_posted: 'Hot Worker publicat pentru 24 de ore.',
    hot_worker_removed: 'Muncitorul nu mai este afișat ca disponibil.',
    hot_worker_remove: 'Nu mai e disponibil',
    hot_worker_by: 'Publicat de {name}',
    hot_worker_required: 'Completează referința și meseria.',
  });
  Object.assign(I18N.en, {
    hot_worker_button: '🔥 Hot Worker',
    hot_worker_eyebrow: 'HOT WORKER',
    hot_worker_title: 'Worker available now',
    hot_worker_intro: 'Add a worker who is available immediately, separately from First Agent jobs. The entry stays active for 24 hours.',
    hot_worker_privacy: 'Use only an internal reference or initials. Do not add the worker’s phone, email or other personal information here.',
    hot_worker_ref: 'Worker reference / initials',
    hot_worker_ref_placeholder: 'e.g. AB-42',
    hot_worker_trade: 'Trade',
    hot_worker_trade_placeholder: 'e.g. Electrician',
    hot_worker_location: 'Location',
    hot_worker_location_placeholder: 'e.g. London',
    hot_worker_postcode: 'Postcode',
    hot_worker_notes: 'Short note',
    hot_worker_notes_placeholder: 'e.g. available today, CSCS, tools',
    hot_worker_publish: '🔥 Publish Hot Worker',
    hot_worker_active: 'Active Hot Workers',
    hot_worker_active_hint: 'Last 24h only',
    hot_worker_empty: 'No available workers were posted in the last 24 hours.',
    hot_worker_posted: 'Hot Worker published for 24 hours.',
    hot_worker_removed: 'The worker is no longer shown as available.',
    hot_worker_remove: 'No longer available',
    hot_worker_by: 'Posted by {name}',
    hot_worker_required: 'Enter the worker reference and trade.',
  });

  const HOT_PREFIX = 'HOT-WORKER-';
  const HOT_MS = 24 * 60 * 60 * 1000;
  const baseRender = render;
  const baseApplyLanguage = applyLanguage;

  const isHotWorker = (job) => String(job?.job_reference || '').startsWith(HOT_PREFIX);
  const hotWorkerIsActive = (job) => {
    if (!isHotWorker(job) || job.status === 'closed') return false;
    const created = new Date(job.created_at).getTime();
    return Number.isFinite(created) && Date.now() - created < HOT_MS;
  };

  function hotWorkers() {
    return state.jobs.filter(hotWorkerIsActive).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  function parseHotData(job) {
    try {
      const parsed = JSON.parse(job.source_text || '{}');
      if (parsed?.kind === 'hot_worker') return parsed;
    } catch {}
    return { ref: job.job_reference?.replace(/^HOT-WORKER-\d+-?/, '') || 'Worker', notes: job.description || '' };
  }

  // Keep Hot Worker rows in state for the Hot Worker modal, but remove them temporarily
  // whenever the normal Job Board or First Dashboard renders.
  render = function hotWorkerSafeRender() {
    const allJobs = state.jobs;
    state.jobs = allJobs.filter((job) => !isHotWorker(job));
    try { baseRender(); } finally { state.jobs = allJobs; }
    updateHotButton();
    if ($('#hotWorkerDialog')?.open) renderHotWorkers();
  };

  const addButton = $('#addButton');
  const topActions = addButton?.parentElement;
  if (!addButton || !topActions) return;
  const stack = document.createElement('div');
  stack.className = 'post-action-stack';
  topActions.insertBefore(stack, addButton);
  stack.append(addButton);
  const hotButton = document.createElement('button');
  hotButton.id = 'hotWorkerButton';
  hotButton.type = 'button';
  hotButton.className = 'hot-worker-button';
  hotButton.innerHTML = `<span data-i18n="hot_worker_button">🔥 Muncitor disponibil</span><span class="hot-worker-count" id="hotWorkerCount">0</span>`;
  stack.append(hotButton);

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="hotWorkerDialog" class="hot-worker-dialog">
      <form id="hotWorkerForm" class="dialog-form">
        <button class="dialog-close" type="button" id="closeHotWorkerDialog" aria-label="Close">×</button>
        <span class="eyebrow dark" data-i18n="hot_worker_eyebrow">HOT WORKER</span>
        <h2 data-i18n="hot_worker_title">Muncitor disponibil acum</h2>
        <p class="hot-worker-intro" data-i18n="hot_worker_intro">Adaugă un muncitor disponibil imediat.</p>
        <div class="hot-worker-privacy" data-i18n="hot_worker_privacy">Folosește doar o referință internă sau inițiale.</div>
        <div class="hot-worker-form-grid">
          <label><span data-i18n="hot_worker_ref">Referință / inițiale muncitor</span> <b>*</b>
            <input id="hotWorkerRef" type="text" maxlength="40" data-i18n-placeholder="hot_worker_ref_placeholder" placeholder="Ex: AB-42" required>
          </label>
          <label><span data-i18n="hot_worker_trade">Meserie</span> <b>*</b>
            <input id="hotWorkerTrade" type="text" maxlength="120" list="tradeOptions" data-i18n-placeholder="hot_worker_trade_placeholder" placeholder="Ex: Electrician" required>
          </label>
          <label><span data-i18n="hot_worker_location">Locație</span>
            <input id="hotWorkerLocation" type="text" maxlength="160" data-i18n-placeholder="hot_worker_location_placeholder" placeholder="Ex: London">
          </label>
          <label><span data-i18n="hot_worker_postcode">Postcode</span>
            <input id="hotWorkerPostcode" type="text" maxlength="16" placeholder="Ex: SW1A 1AA">
          </label>
        </div>
        <label><span data-i18n="hot_worker_notes">Notă scurtă</span>
          <textarea id="hotWorkerNotes" rows="3" maxlength="800" data-i18n-placeholder="hot_worker_notes_placeholder" placeholder="Ex: disponibil azi, CSCS, tools"></textarea>
        </label>
        <div class="form-actions">
          <button class="ghost" type="button" id="cancelHotWorker" data-i18n="cancel">Renunță</button>
          <button class="primary hot-worker-save" type="submit" data-i18n="hot_worker_publish">🔥 Publică Hot Worker</button>
        </div>
        <div class="hot-worker-list-title">
          <h3 data-i18n="hot_worker_active">Hot Workers activi</h3>
          <span data-i18n="hot_worker_active_hint">Doar ultimele 24h</span>
        </div>
        <div id="hotWorkerList" class="hot-worker-list"></div>
      </form>
    </dialog>`);

  function updateHotButton() {
    const count = hotWorkers().length;
    $('#hotWorkerCount').textContent = count;
  }

  function renderHotWorkers() {
    const list = $('#hotWorkerList');
    if (!list) return;
    const workers = hotWorkers();
    if (!workers.length) {
      list.innerHTML = `<div class="hot-worker-empty">${escapeHtml(t('hot_worker_empty'))}</div>`;
      return;
    }
    list.innerHTML = workers.map((job) => {
      const data = parseHotData(job);
      const place = [job.location, job.postcode].filter(Boolean).join(' · ');
      const mine = isSameAgent(job.created_by) || (state.email && String(job.created_by_email || '').toLowerCase() === state.email.toLowerCase());
      return `<article class="hot-worker-card">
        <div class="hot-worker-card-main">
          <div class="hot-worker-ref"><span class="fire">🔥</span><span>${escapeHtml(data.ref || 'Worker')} · ${escapeHtml(job.trade || '')}</span></div>
          <div class="hot-worker-meta">
            ${place ? `<span>⌖ ${escapeHtml(place)}</span>` : ''}
            <span>◷ ${escapeHtml(relativeTime(job.created_at))}</span>
          </div>
          ${data.notes ? `<div class="hot-worker-notes">${escapeHtml(data.notes)}</div>` : ''}
          <div class="hot-worker-by">${escapeHtml(t('hot_worker_by', { name: job.created_by || t('unknown') }))}</div>
        </div>
        ${mine ? `<button class="hot-worker-close" type="button" data-hot-close="${job.id}">${escapeHtml(t('hot_worker_remove'))}</button>` : ''}
      </article>`;
    }).join('');
  }

  function openHotWorker() {
    $('#hotWorkerForm').reset();
    renderHotWorkers();
    $('#hotWorkerDialog').showModal();
    window.setTimeout(() => $('#hotWorkerRef').focus(), 60);
  }

  hotButton.addEventListener('click', openHotWorker);
  $('#closeHotWorkerDialog').addEventListener('click', () => $('#hotWorkerDialog').close());
  $('#cancelHotWorker').addEventListener('click', () => $('#hotWorkerDialog').close());
  $('#hotWorkerDialog').addEventListener('click', (event) => { if (event.target === $('#hotWorkerDialog')) $('#hotWorkerDialog').close(); });

  $('#hotWorkerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const ref = $('#hotWorkerRef').value.trim();
    const trade = $('#hotWorkerTrade').value.trim();
    const location = $('#hotWorkerLocation').value.trim();
    const postcode = $('#hotWorkerPostcode').value.trim();
    const notes = $('#hotWorkerNotes').value.trim();
    if (!ref || !trade) return toast(t('hot_worker_required'), 'error');
    setBusy(true, t('saving'));
    try {
      await api('create', {
        agent: state.agent,
        job: {
          trade,
          location,
          postcode,
          workers_needed: 1,
          priority: 'urgent',
          source_kind: 'manual',
          job_reference: `${HOT_PREFIX}${Date.now()}`,
          description: notes || null,
          source_text: JSON.stringify({ kind: 'hot_worker', ref, notes }),
        },
      });
      toast(t('hot_worker_posted'), 'success');
      $('#hotWorkerForm').reset();
      await loadJobs({ silent: true });
      renderHotWorkers();
    } catch (error) {
      toast(error.message || t('network_error'), 'error', 5000);
    } finally {
      setBusy(false);
    }
  });

  $('#hotWorkerList').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-hot-close]');
    if (!button) return;
    setBusy(true, t('saving'));
    try {
      await api('close', { id: Number(button.dataset.hotClose), agent: state.agent });
      toast(t('hot_worker_removed'), 'success');
      await loadJobs({ silent: true });
      renderHotWorkers();
    } catch (error) {
      toast(error.message || t('network_error'), 'error', 5000);
    } finally {
      setBusy(false);
    }
  });

  applyLanguage = function hotWorkerApplyLanguage() {
    baseApplyLanguage();
    if ($('#hotWorkerDialog')?.open) renderHotWorkers();
  };

  applyLanguage();
  updateHotButton();
})();
