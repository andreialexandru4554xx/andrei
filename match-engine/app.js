const realCases = [
  {id:1,status:'strong',worker:'M. V.',workerTrade:'Electrician',jobTrade:'Electrician',workerPostcode:'RG21…',workerPhone:'Private',second:'A. Gabi',callTime:'20 Aug 2026 · 08:21 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2 7JG',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: worker was contacted today about an electrician role in Reading for at least 3 months. He asked for the exact location and duration and said he would call back later.',why:['Exact Electrician trade','Reading/RG area matches RG2','3-month duration aligns with the call','Job is from the 19–20 Aug window'],confidence:99},
  {id:2,status:'strong',worker:'V. P.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW9…',workerPhone:'Private',second:'Miruna',callTime:'20 Aug 2026 · 10:14 UK',callOutcome:'Interested',job:'Dryliner — NW3',jobPostcode:'NW3 2AQ',rate:'£26/h',first:'A. Mario',summary:'Blue RecruitFlow summary: candidate was contacted today about dryliner work, showed interest and asked for offers. They agreed to continue on WhatsApp so job details can be sent.',why:['Exact Dryliner trade','Explicit interested outcome today','NW9 to NW3 is a close London match','Job is active from the 19–20 Aug window'],confidence:98},
  {id:3,status:'strong',worker:'M. F.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E15…',workerPhone:'Private',second:'M. Alessandro',callTime:'20 Aug 2026 · 08:52 UK',callOutcome:'Interested',job:'Dryliner — E1W',jobPostcode:'E1W',rate:'£27.50/h',first:'G. Ionescu',summary:'Blue RecruitFlow summary: worker was contacted about a central-London dryliner role paying £220/day for 8 hours, for at least 3 months. He was interested, said he is available from next week and can also bring a friend.',why:['Exact Dryliner trade','Interested outcome today','E15 to E1W is an East/Central London match','Call rate £220/day aligns closely with E1W job'],confidence:97},
  {id:4,status:'strong',worker:'G. D. A. M.',workerTrade:'Scaffolder / Labourer',jobTrade:'Labourer',workerPostcode:'CR4…',workerPhone:'Private',second:'Styleoutlet',callTime:'20 Aug 2026 · 10:19 UK',callOutcome:'Follow-up',job:'Labourer — Croydon',jobPostcode:'CR2 0NL',rate:'£14.50/h',first:'R. Ionut',summary:'Blue RecruitFlow summary: candidate was contacted today about a labourer job in Croydon. He asked about the rate and the recruiter agreed to send the complete offer on WhatsApp.',why:['Labourer-family trade','Worker already in Croydon area','Candidate asked for rate details','Current Croydon role starts tomorrow'],confidence:96},
  {id:5,status:'strong',worker:'E. B.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW10…',workerPhone:'Private',second:'A. Mircea',callTime:'20 Aug 2026 · 09:49 UK',callOutcome:'Follow-up',job:'Dryliner — NW3',jobPostcode:'NW3 2AQ',rate:'£26/h',first:'A. Mario',summary:'Blue RecruitFlow summary: the conversation concerned dryliner and tape-and-jointer work and the candidate asked whether there is any work available at present.',why:['Exact Dryliner trade','NW10 to NW3 is a strong North-West London match','Worker actively asked for available work','Active job is in the 19–20 Aug window'],confidence:94},
  {id:6,status:'followup',worker:'M. R.',workerTrade:'Electrician',jobTrade:'Electrician',workerPostcode:'CV10…',workerPhone:'Private',second:'Adam M',callTime:'20 Aug 2026 · 10:33 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2 7JG',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: recruiter contacted the candidate today regarding work around CB7. The candidate asked to be called back in one minute.',why:['Exact Electrician trade','Real Blue follow-up call today','Active electrician jobs exist in the 19–20 Aug window','Location/interest for RG2 are not yet confirmed'],confidence:68}
];

const $ = s => document.querySelector(s);
const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function badge(status){if(status==='strong')return '<span class="role-badge primary-role">STRICT MATCH</span>';if(status==='followup')return '<span class="role-badge alt-role">FOLLOW-UP</span>';return '<span class="role-badge blocked-role">BLOCKED</span>'}
function scoreClass(s){return s>=90?'score-strong':s>=75?'score-good':s>=50?'score-review':'score-low'}
function callRate(summary=''){
  const text=String(summary);
  const pound=text.match(/£\s?\d+(?:\.\d+)?(?:\s*[-–]\s*£?\d+(?:\.\d+)?)?\s*(?:\/h|\/hour|per hour|ph|pph)?/i);
  if(pound) return pound[0].replace(/\s+/g,' ');
  const day=text.match(/\b(\d{3})\s*(?:GBP|£)?\s*\/\s*day|\b(\d{3})\s*(?:GBP|£)?\s*(?:per day|\/day)/i);
  if(day) return `£${day[1]||day[2]}/day`;
  const plain=text.match(/\b(\d{2}(?:\.\d+)?)\s*(?:\/h|\/hour|per hour|pe oră|pe ora|ph|pph)\b/i);
  return plain ? `£${plain[1]}/h` : '—';
}
function acceptedRate(x){
  const s=String(x.summary||'').toLowerCase();
  const discussed=callRate(x.summary);
  if(discussed==='—') return '—';
  if(/agreed|accepted|acceptat|a acceptat|confirmed the rate|rate agreed/.test(s)) return discussed;
  return 'Not confirmed';
}
function renderStats(rows){const strong=rows.filter(x=>x.status==='strong').length,follow=rows.filter(x=>x.status==='followup').length;$('#stats').innerHTML=[[rows.length,'Today workers'],[strong,'Strong'],[follow,'Follow-up'],['19 + 20 Aug','Job window'],['10:33 UK','Latest matched call']].map(([n,l])=>`<div class="stat"><div class="num">${esc(n)}</div><div class="label">${esc(l)}</div></div>`).join('')}
function mini(label,value,cls=''){return `<div class="mini-field ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`}
function render(){
  const q=$('#searchInput').value.trim().toLowerCase();
  const status=$('#statusFilter').value;
  const rows=realCases.filter(x=>{const blob=[x.worker,x.workerTrade,x.jobTrade,x.workerPostcode,x.second,x.first,x.job,x.jobPostcode,x.rate,x.summary,x.status].join(' ').toLowerCase();return(!q||blob.includes(q))&&(status==='all'||x.status===status)});
  $('#caseCount').textContent=rows.length; renderStats(rows);
  $('#caseList').innerHTML=rows.map(x=>`<article class="match-card ${x.status}">
    <div class="match-topbar">
      <div class="match-id">#${x.id}</div>
      <div class="match-title">${esc(x.workerTrade)} <span>↔</span> ${esc(x.jobTrade)}</div>
      <div class="match-meta">${badge(x.status)}<div class="score ${scoreClass(x.confidence)}">${x.confidence}%</div></div>
    </div>
    <div class="compare-grid">
      <section class="side blue-side">
        <div class="side-title">BLUE CALL · 20 AUG ONLY</div>
        ${mini('MUNCITOR',x.worker,'hero-mini')}
        ${mini('MESERIE',x.workerTrade)}
        ${mini('POSTCODE',x.workerPostcode)}
        ${mini('SECOND',x.second,'second-mini')}
        ${mini('ORA',x.callTime)}
        ${mini('OUTCOME',x.callOutcome)}
      </section>
      <div class="match-arrow">MATCH</div>
      <section class="side job-side">
        <div class="side-title">JOB DASHBOARD · 19 + 20 AUG</div>
        ${mini('JOB',x.job,'hero-mini')}
        ${mini('MESERIE',x.jobTrade)}
        ${mini('POSTCODE',x.jobPostcode)}
        ${mini('FIRST',x.first,'first-mini')}
        ${mini('RATE PROPUS',x.rate,'rate-mini')}
        ${mini('RATE DIN APEL',callRate(x.summary),'accepted-mini')}
      </section>
    </div>
    <details class="summary-box">
      <summary><span>REZUMAT AI</span><b>${esc(x.summary)}</b></summary>
      <div class="summary-full">${esc(x.summary)}</div>
    </details>
    <div class="why-row">${x.why.slice(0,3).map(r=>`<span>${esc(r)}</span>`).join('')}</div>
  </article>`).join('')||'<div class="empty">No matches from today against jobs from 19–20 Aug.</div>'
}
$('#searchInput').addEventListener('input',render);$('#statusFilter').addEventListener('change',render);render();