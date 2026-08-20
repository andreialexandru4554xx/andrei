const realCases = [
  {id:1,status:'strong',worker:'M. V.',workerTrade:'Electrician',jobTrade:'Electrician',workerPostcode:'RG21…',workerPhone:'Private',second:'A. Gabi',callTime:'20 Aug 2026 · 08:21 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2 7JG',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: worker was contacted today about an electrician role in Reading for at least 3 months. He asked for the exact location and duration and said he would call back later.',why:['Exact Electrician trade','Reading/RG area matches RG2','3-month duration aligns with the call','Job is from the 19–20 Aug window'],confidence:99},
  {id:2,status:'strong',worker:'V. P.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW9…',workerPhone:'Private',second:'Miruna',callTime:'20 Aug 2026 · 10:14 UK',callOutcome:'Interested',job:'Dryliner — NW3',jobPostcode:'NW3 2AQ',rate:'£26/h',first:'A. Mario',summary:'Blue RecruitFlow summary: candidate was contacted today about dryliner work, showed interest and asked for offers. They agreed to continue on WhatsApp so job details can be sent.',why:['Exact Dryliner trade','Explicit interested outcome today','NW9 to NW3 is a close London match','Candidate actively asked for offers'],confidence:98},
  {id:3,status:'strong',worker:'M. F.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E15…',workerPhone:'Private',second:'M. Alessandro',callTime:'20 Aug 2026 · 08:52 UK',callOutcome:'Interested',job:'Dryliner — E1W',jobPostcode:'E1W',rate:'£27.50/h',first:'G. Ionescu',summary:'Blue RecruitFlow summary: worker was contacted about a central-London dryliner role paying £220/day for 8 hours, for at least 3 months. He was interested, said he is available from next week and can also bring a friend.',why:['Exact Dryliner trade','Interested outcome today','E15 to E1W is an East/Central London match','Call rate £220/day aligns closely with E1W job'],confidence:97},
  {id:4,status:'strong',worker:'G. D. A. M.',workerTrade:'Scaffolder / Labourer',jobTrade:'Labourer',workerPostcode:'CR4…',workerPhone:'Private',second:'Styleoutlet',callTime:'20 Aug 2026 · 10:19 UK',callOutcome:'Follow-up',job:'Labourer — Croydon',jobPostcode:'CR2 0NL',rate:'£14.50/h',first:'R. Ionut',summary:'Blue RecruitFlow summary: candidate was contacted today about a labourer job in Croydon. He asked about the rate and the recruiter agreed to send the complete offer on WhatsApp.',why:['Labourer-family trade','Worker already in Croydon area','Candidate asked for rate details','Current Croydon role starts tomorrow'],confidence:96},
  {id:5,status:'strong',worker:'E. B.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW10…',workerPhone:'Private',second:'A. Mircea',callTime:'20 Aug 2026 · 09:49 UK',callOutcome:'Follow-up',job:'Dryliner — NW3',jobPostcode:'NW3 2AQ',rate:'£26/h',first:'A. Mario',summary:'Blue RecruitFlow summary: the conversation concerned dryliner and tape-and-jointer work and the candidate asked whether there is any work available at present.',why:['Exact Dryliner trade','NW10 to NW3 is a strong North-West London match','Worker actively asked for available work','Active job is in the 19–20 Aug window'],confidence:94},
  {id:6,status:'followup',worker:'M. R.',workerTrade:'Electrician',jobTrade:'Electrician',workerPostcode:'CV10…',workerPhone:'Private',second:'Adam M',callTime:'20 Aug 2026 · 10:33 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2 7JG',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: recruiter contacted the candidate today regarding work around CB7. The candidate asked to be called back in one minute.',why:['Exact Electrician trade','Real Blue follow-up call today','Active electrician jobs exist in the 19–20 Aug window','Location/interest for RG2 are not yet confirmed'],confidence:68},

  {id:7,status:'followup',worker:'N. K.',workerTrade:'Handyman',jobTrade:'Handyman',workerPostcode:'AL3…',workerPhone:'Private',second:'F. Parker',callTime:'20 Aug 2026 · 10:55 UK',callOutcome:'Follow-up',job:'Handyman — AL5',jobPostcode:'AL5 2FH',rate:'£21/h',first:'A. Mario',summary:'Blue RecruitFlow summary: candidate was contacted today about handyman work but was busy and could not discuss at that moment.',why:['Exact Handyman trade','AL3 to AL5 is a short regional move','Active handyman job starts tomorrow','Need callback to confirm availability'],confidence:84},
  {id:8,status:'strong',worker:'A. V.',workerTrade:'Shuttering Carpenter',jobTrade:'Shuttering Carpenter',workerPostcode:'ME15…',workerPhone:'Private',second:'Nicoleta',callTime:'20 Aug 2026 · 10:50 UK',callOutcome:'Follow-up',job:'Shuttering Carpenter — ME10',jobPostcode:'ME10 3LF',rate:'£26–27/h',first:'A. Cristescu',summary:'Blue RecruitFlow summary: candidate is working this week through Saturday but said he may be available next week. A follow-up was agreed for tomorrow or the weekend.',why:['Exact Shuttering Carpenter trade','ME15 to ME10 is a very close Kent match','Candidate explicitly may be available next week','Job remains open'],confidence:92},
  {id:9,status:'followup',worker:'R. G.',workerTrade:'Labourer',jobTrade:'Labourer',workerPostcode:'BN11…',workerPhone:'Private',second:'Y. Arhannt',callTime:'20 Aug 2026 · 10:40 UK',callOutcome:'Follow-up',job:'Labourer — BN11',jobPostcode:'BN11',rate:'£15.50/h',first:'Dennis',summary:'Blue RecruitFlow summary: candidate confirmed that tomorrow is suitable for a visit or meeting and said he would be at home.',why:['Exact BN11 postcode family','Labourer profile matches the open BN11 role','Tomorrow timing may align','Call context needs recruitment confirmation'],confidence:78},
  {id:10,status:'strong',worker:'N. C.',workerTrade:'Labourer',jobTrade:'Labourer',workerPostcode:'CR4…',workerPhone:'Private',second:'Styleoutlet',callTime:'20 Aug 2026 · 10:34 UK',callOutcome:'Follow-up',job:'Labourer — Croydon',jobPostcode:'CR2 0NL',rate:'£14.50/h',first:'R. Ionut',summary:'Blue RecruitFlow summary: recruiter and candidate agreed to continue on WhatsApp so the candidate can receive the job offer.',why:['Labourer trade','CR4 to CR2 is a local Croydon move','WhatsApp follow-up agreed','Open Croydon role starts tomorrow'],confidence:89},

  {id:11,status:'strong',worker:'M. F.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E15…',workerPhone:'Private',second:'M. Alessandro',callTime:'20 Aug 2026 · 08:52 UK',callOutcome:'Interested',job:'Dryliner — EC4M',jobPostcode:'EC4M',rate:'£220/day · £27.50/h',first:'G. Ionescu',summary:'Blue RecruitFlow summary: worker was interested in a central-London dryliner role paying £220/day for 8 hours, available from next week and able to bring a friend.',why:['Alternative job for same worker','Exact £220/day discussed in the call','Central London location fits the conversation','EC4M role is long-term and open'],confidence:98},
  {id:12,status:'strong',worker:'V. P.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW9…',workerPhone:'Private',second:'Miruna',callTime:'20 Aug 2026 · 10:14 UK',callOutcome:'Interested',job:'Dryliner — EN5',jobPostcode:'EN5',rate:'£27/h',first:'N. Robert',summary:'Blue RecruitFlow summary: candidate showed interest in dryliner offers and asked for available options to be sent on WhatsApp.',why:['Alternative job for same worker','Exact Dryliner trade','North-London side of the city','Candidate asked for multiple offers'],confidence:87},
  {id:13,status:'followup',worker:'V. P.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW9…',workerPhone:'Private',second:'Miruna',callTime:'20 Aug 2026 · 10:14 UK',callOutcome:'Interested',job:'Dryliner — AL5',jobPostcode:'AL5',rate:'£26/h',first:'A. Mircea',summary:'Blue RecruitFlow summary: candidate showed interest in dryliner work and asked for offers. The AL5 role also includes tape-and-joint work.',why:['Alternative job for same worker','Exact core trade','Candidate is actively seeking offers','Travel and tape/joint capability need checking'],confidence:76},
  {id:14,status:'strong',worker:'E. B.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW10…',workerPhone:'Private',second:'A. Mircea',callTime:'20 Aug 2026 · 09:49 UK',callOutcome:'Follow-up',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: candidate discussed dryliner/tape-and-jointer work and directly asked whether there was work available.',why:['Alternative job for same worker','Exact Dryliner trade','NW10 to W14 is a practical West-London commute','Worker actively asked for work'],confidence:88},
  {id:15,status:'followup',worker:'A. V.',workerTrade:'Shuttering Carpenter',jobTrade:'Shuttering Carpenter',workerPostcode:'ME15…',workerPhone:'Private',second:'Nicoleta',callTime:'20 Aug 2026 · 10:50 UK',callOutcome:'Follow-up',job:'Shuttering Carpenter — TW1',jobPostcode:'TW1 3DX',rate:'£27/h · £243/day',first:'A. Mircea',summary:'Blue RecruitFlow summary: candidate is occupied until Saturday but may be available next week and agreed to a follow-up.',why:['Alternative job for same worker','Exact trade','Long-term 5-month project may suit next-week availability','Travel from Kent to TW1 needs explicit confirmation'],confidence:71},
  {id:16,status:'followup',worker:'N. K.',workerTrade:'Handyman',jobTrade:'Handyman',workerPostcode:'AL3…',workerPhone:'Private',second:'F. Parker',callTime:'20 Aug 2026 · 10:55 UK',callOutcome:'Follow-up',job:'Handyman / Multi Trader — RG14',jobPostcode:'RG14 5DQ',rate:'£26/h',first:'A. Mario',summary:'Blue RecruitFlow summary: candidate was contacted about handyman work but could not speak at the time.',why:['Alternative higher-rate handyman option','Exact handyman/multi-trade family','Job includes snagging and general handyman work','Distance and availability must be confirmed'],confidence:63}
];

const $ = s => document.querySelector(s);
const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function badge(status){if(status==='strong')return '<span class="role-badge primary-role">STRONG / ALT</span>';if(status==='followup')return '<span class="role-badge alt-role">ALTERNATIVE</span>';return '<span class="role-badge blocked-role">BLOCKED</span>'}
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
function renderStats(rows){const strong=rows.filter(x=>x.status==='strong').length,follow=rows.filter(x=>x.status==='followup').length;$('#stats').innerHTML=[[rows.length,'Match combinations'],[strong,'Strong / best'],[follow,'Alternatives'],['20 Aug','Calls only'],['19 + 20 Aug','Jobs searched']].map(([n,l])=>`<div class="stat"><div class="num">${esc(n)}</div><div class="label">${esc(l)}</div></div>`).join('')}
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
    <div class="why-row">${x.why.slice(0,4).map(r=>`<span>${esc(r)}</span>`).join('')}</div>
  </article>`).join('')||'<div class="empty">No matches from today against jobs from 19–20 Aug.</div>'
}
$('#searchInput').addEventListener('input',render);$('#statusFilter').addEventListener('change',render);render();