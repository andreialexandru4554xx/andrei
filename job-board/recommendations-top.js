'use strict';

(() => {
  Object.assign(I18N.ro, { view_recommended: 'Recomandate AI' });
  Object.assign(I18N.en, { view_recommended: 'AI Recommended' });

  const switcher = document.querySelector('.transparency-switcher');
  if (!switcher) return;

  const recTab = switcher.querySelector('[data-ops-view="recommendations"]');
  if (!recTab) return;
  switcher.prepend(recTab);

  const entry = document.createElement('button');
  entry.id = 'aiRecommendationsTop';
  entry.className = 'ai-recommendations-top';
  entry.type = 'button';
  entry.innerHTML = `
    <span class="ai-recommendations-icon">✦</span>
    <span class="ai-recommendations-copy">
      <strong id="aiRecommendationsTopTitle">RECOMANDATE AI</strong>
      <small id="aiRecommendationsTopHint">Vezi rapid joburile recomandate pentru recruiterul conectat</small>
    </span>
    <span class="ai-recommendations-count" id="aiRecommendationsTopCount">0</span>
    <span class="ai-recommendations-arrow">→</span>`;

  const kpiStrip = document.querySelector('#opsKpiStrip');
  (kpiStrip || switcher).before(entry);

  function sync() {
    const ro = state.lang !== 'en';
    const title = document.querySelector('#aiRecommendationsTopTitle');
    const hint = document.querySelector('#aiRecommendationsTopHint');
    const count = document.querySelector('#aiRecommendationsTopCount');
    const tabLabel = recTab.querySelector('[data-i18n="view_recommended"]');
    if (title) title.textContent = ro ? 'RECOMANDATE AI' : 'AI RECOMMENDED';
    if (hint) hint.textContent = ro
      ? 'Vezi rapid joburile recomandate pentru recruiterul conectat'
      : 'Quickly see the best jobs recommended for the signed-in recruiter';
    if (tabLabel) tabLabel.textContent = t('view_recommended');
    if (count) count.textContent = document.querySelector('#recommendedTabCount')?.textContent || '0';
  }

  entry.addEventListener('click', () => recTab.click());

  const baseRender = render;
  render = function recommendationsTopRender() {
    baseRender();
    sync();
  };

  const baseApplyLanguage = applyLanguage;
  applyLanguage = function recommendationsTopLanguage() {
    baseApplyLanguage();
    sync();
  };

  new MutationObserver(sync).observe(document.querySelector('#recommendedTabCount'), { childList: true, characterData: true, subtree: true });
  sync();
})();
