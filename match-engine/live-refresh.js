(() => {
  const FEED_URL = 'https://xqociudfqivplequiygw.supabase.co/functions/v1/matching-feed';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxb2NpdWRmcWl2cGxlcXVpeWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMzIxNjgsImV4cCI6MjEwMjYwODE2OH0.qZqQrHBLDidfSZb2vxIh-sy5w_3cigVC3jlsqMvidOM';
  const POLL_MS = 30_000;
  let refreshing = false;

  function ukTime(iso) {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '—';
    const date = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', day: '2-digit', month: 'short'
    }).format(d);
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(d);
    return `${date} · ${time} UK`;
  }

  function normalize(row, i) {
    return {
      id: i + 1,
      day: row.day || '—',
      status: row.status || 'followup',
      worker: row.worker || '—',
      workerTrade: row.workerTrade || '—',
      jobTrade: row.jobTrade || '—',
      workerPostcode: row.workerPostcode || '—',
      second: row.second || '—',
      callTime: ukTime(row.callTime),
      callOutcome: row.callOutcome || '—',
      job: row.job || '—',
      jobPostcode: row.jobPostcode || '—',
      rate: row.rate || 'To confirm',
      first: row.first || '—',
      claimedJob: row.claimedJob || null,
      claimState: row.claimState || 'none',
      claimLabel: row.claimLabel || 'NO CLAIM LINKED',
      claimNote: row.claimNote || 'No safe Job Dashboard claim was linked to this Second.',
      summary: row.summary || '—',
      why: Array.isArray(row.why) ? row.why : [],
      confidence: Number(row.confidence) || 0
    };
  }

  async function refreshMatches() {
    if (refreshing || document.hidden) return;
    refreshing = true;
    try {
      const res = await fetch(`${FEED_URL}?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          Accept: 'application/json'
        }
      });
      if (!res.ok) throw new Error(`Feed ${res.status}`);
      const payload = await res.json();
      if (!payload?.ok || !Array.isArray(payload.matches)) throw new Error('Invalid feed');
      const next = payload.matches.map(normalize);
      realCases.splice(0, realCases.length, ...next);
      render();
      document.documentElement.dataset.liveMatching = 'ok';
      document.documentElement.dataset.lastMatchingRefresh = payload.generatedAt || new Date().toISOString();
    } catch (err) {
      console.warn('Live matching refresh failed; keeping last good data.', err);
      document.documentElement.dataset.liveMatching = 'error';
    } finally {
      refreshing = false;
    }
  }

  refreshMatches();
  setInterval(refreshMatches, POLL_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshMatches();
  });
})();
