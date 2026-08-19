'use strict';

(() => {
  const labels = () => state.lang === 'en'
    ? { title: 'AI SIGNAL', prefix: 'Why AI recommends it:', noReason: 'Strong current operational fit' }
    : { title: 'SEMNAL AI', prefix: 'De ce îl recomandă AI:', noReason: 'Potrivire operațională bună acum' };

  function decorateRecommendedTab() {
    const tab = document.querySelector('.recommended-tab');
    if (!tab) return;
    tab.setAttribute('title', state.lang === 'en' ? 'AI-ranked recommended jobs' : 'Joburi recomandate și ordonate cu semnal AI');
    tab.setAttribute('aria-label', state.lang === 'en' ? 'AI Recommended jobs' : 'Recomandate AI');
  }

  function decorateRecommendationCards() {
    const cards = [...document.querySelectorAll('.recommend-card')];
    const text = labels();
    cards.forEach((card, index) => {
      const old = card.querySelector('.ai-signal-panel');
      if (old) old.remove();
      card.classList.toggle('ai-top-pick', index === 0);

      const scoreNode = card.querySelector('.recommend-score');
      const scoreMatch = scoreNode?.textContent?.match(/\d+/);
      const score = scoreMatch ? scoreMatch[0] : '—';
      const reasons = [...card.querySelectorAll('.recommend-reason')]
        .map((node) => node.textContent.trim())
        .filter(Boolean)
        .slice(0, 3);
      const reasonText = reasons.length ? reasons.join(' · ') : text.noReason;

      const panel = document.createElement('div');
      panel.className = 'ai-signal-panel';
      panel.innerHTML = `
        <span class="ai-signal-icon">AI</span>
        <span class="ai-signal-copy">
          <strong>${escapeHtml(text.title)}</strong>
          <span>${escapeHtml(text.prefix)} ${escapeHtml(reasonText)}</span>
        </span>
        <span class="ai-signal-score">${escapeHtml(score)}</span>`;

      const reasonsBlock = card.querySelector('.recommend-reasons');
      const actions = card.querySelector('.recommend-actions');
      const anchor = reasonsBlock || actions;
      if (anchor) card.insertBefore(panel, anchor);
      else card.append(panel);
    });
  }

  function decorate() {
    decorateRecommendedTab();
    decorateRecommendationCards();
  }

  const observer = new MutationObserver(() => window.requestAnimationFrame(decorate));
  const recommendationDashboard = document.querySelector('#recommendationDashboard');
  const switcher = document.querySelector('.transparency-switcher');
  if (recommendationDashboard) observer.observe(recommendationDashboard, { childList: true, subtree: true });
  if (switcher) observer.observe(switcher, { childList: true, subtree: true });

  document.querySelector('#languageButton')?.addEventListener('click', () => window.setTimeout(decorate, 30));
  window.setInterval(decorate, 1500);
  decorate();
})();
