const realCases = [
  {id:1,status:'strong',worker:'M. V.',workerTrade:'Electrician',jobTrade:'Electrician',workerPostcode:'RG21…',workerPhone:'Private',second:'A. Gabi',callTime:'20 Aug 2026 · 08:21 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2 7JG',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: worker was contacted today about an electrician role in Reading for at least 3 months. He asked for the exact location and duration and said he would call back later.',why:['Exact Electrician trade','Reading/RG area matches RG2','3-month duration aligns','Real Blue AI call today'],confidence:99},
  {id:2,status:'strong',worker:'V. P.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW9…',workerPhone:'Private',second:'Miruna',callTime:'20 Aug 2026 · 10:14 UK',callOutcome:'Interested',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: candidate was contacted today about dryliner work, showed interest and asked for offers. They agreed to continue on WhatsApp so job details can be sent.',why:['Exact Dryliner trade','Explicit interested outcome today','NW9 to W14 is a practical London match','Candidate actively asked for offers'],confidence:96},
  {id:3,status:'strong',worker:'M. F.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E15…',workerPhone:'Private',second:'M. Alessandro',callTime:'20 Aug 2026 · 08:52 UK',callOutcome:'Interested',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: worker was contacted about a central-London dryliner role paying £220/day for 8 hours, for at least 3 months. He was interested, said he is available from next week and can also bring a friend.',why:['Exact Dryliner trade','Interested outcome today','London-based worker','Can potentially bring a second dryliner'],confidence:93},
  {id:4,status:'strong',worker:'G. D. A. M.',workerTrade:'Scaffolder / Labourer',jobTrade:'Labourer',workerPostcode:'CR4…',workerPhone:'Private',second:'Styleoutlet',callTime:'20 Aug 2026 · 10:19 UK',callOutcome:'Follow-up',job:'Labourer — Croydon',jobPostcode:'CR28 / Croydon',rate:'£14.50/h',first:'N. Robert',summary:'Blue RecruitFlow summary: candidate was contacted today about a labourer job in Croydon. He asked about the rate and the recruiter agreed to send the complete offer on WhatsApp.',why:['Labourer-family trade','Worker already in CR4/Croydon area','Candidate asked for rate details','Real Blue call today'],confidence:92},
  {id:5,status:'followup',worker:'E. B.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW10…',workerPhone:'Private',second:'A. Mircea',callTime:'20 Aug 2026 · 09:49 UK',callOutcome:'Follow-up',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: the conversation concerned dryliner and tape-and-jointer work and the candidate asked whether there is any work available at present.',why:['Exact Dryliner trade','NW10 to W14 is practical','Worker actively asked for available work','Conversation is somewhat fragmented'],confidence:88},
  {id:6,status:'followup',worker:'A. A.',workerTrade:'Labourer',jobTrade:'Labourer',workerPostcode:'CR0…',workerPhone:'Private',second:'Styleoutlet',callTime:'20 Aug 2026 · 10:17 UK',callOutcome:'Unknown / review',job:'Labourer — Croydon',jobPostcode:'CR28 / Croydon',rate:'£14.50/h',first:'N. Robert',summary:'Blue RecruitFlow summary: recruiter contacted the candidate today to check availability for labourer work in Croydon. The call ended without a clear agreement or decision.',why:['Exact Labourer trade','CR0 is Croydon','Real recruitment call today','Interest and availability not confirmed'],confidence:68},
  {id:7,status:'followup',worker:'K. P.',workerTrade:'Painter & Decorator',jobTrade:'Painter & Decorator',workerPostcode:'SE17…',workerPhone:'Private',second:'R. Vella',callTime:'20 Aug 2026 · 09:29 UK',callOutcome:'Unknown / review',job:'Painter — NW1',jobPostcode:'NW1 8XY',rate:'£22/h',first:'Alexandra',summary:'Blue RecruitFlow summary: recruiter initiated a call today regarding a job, but the conversation is incomplete and does not contain a clear response from the candidate.',why:['Exact Painter trade','Active painter job exists','Real call today','No usable confirmation from candidate'],confidence:58},
  {id:8,status:'followup',worker:'R. R.',workerTrade:'Shuttering Carpenter',jobTrade:'Shuttering Carpenter',workerPostcode:'KT36…',workerPhone:'Private',second:'A. Alexandru',callTime:'20 Aug 2026 · 09:00 UK',callOutcome:'Unknown / review',job:'Shuttering Carpenter — SE18',jobPostcode:'SE18',rate:'£240/day',first:'C. Chirca',summary:'Blue RecruitFlow summary: candidate thanked the caller and asked to continue contact through support. The short call does not establish availability or rate acceptance.',why:['Exact Shuttering Carpenter trade','Active SE18 role exists','Real call today','Call context is too weak for a strong match'],confidence:55},
  {id:9,status:'followup',worker:'W. K.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'SW2…',workerPhone:'Private',second:'Vania',callTime:'20 Aug 2026 · 10:21 UK',callOutcome:'Unknown / low signal',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: today’s transcript is extremely short and does not contain an effective recruitment conversation. The profile trade is Dryliner, but interest is not established.',why:['Exact Dryliner profile trade','Active W14 Dryliner role','Real call today','No useful candidate response'],confidence:47},
  {id:10,status:'followup',worker:'D. S.',workerTrade:'Shuttering Carpenter',jobTrade:'Shuttering Carpenter',workerPostcode:'TW14…',workerPhone:'Private',second:'P. Cristian',callTime:'20 Aug 2026 · 09:21 UK',callOutcome:'Unknown / low signal',job:'Shuttering Carpenter — SE18',jobPostcode:'SE18',rate:'£240/day',first:'C. Chirca',summary:'Blue RecruitFlow summary: today’s call contains only a brief greeting/apology without meaningful recruitment details. The worker profile is Shuttering Carpenter.',why:['Exact Shuttering Carpenter profile trade','Active SE18 role','Real Blue call today','No confirmed interest, rate or availability'],confidence:45}
];

const $ = s => document.querySelector(s);
const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function badge(status){if(status==='strong')return '<span class="role-badge primary-role">STRONG</span>';if(status==='followup')return '<span class="role-badge alt-role">FOLLOW-UP</span>';return '<span class="role-badge blocked-role">BLOCKED</span>'}
function scoreClass(s){return s>=90?'score-strong':s>=75?'score-good':s>=50?'score-review':'score-low'}
function callRate(summary=''){
  const text=String(summary);
  const pound=text.match(/£\s?\d+(?:\.\d+)?(?:\s*[-–]\s*£?\d+(?:\.\d+)?)?\s*(?:\/h|\/hour|per hour|ph|pph)?/i);
  if(pound) return pound[0].replace(/\s+/g,' ');
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
function renderStats(rows){const strong=rows.filter(x=>x.status==='strong').length,follow=rows.filter(x=>x.status==='followup').length;$('#stats').innerHTML=[[rows.length,'Today only'],[strong,'Strong'],[follow,'Review / follow-up'],['45%','Lowest shown'],['10:21 UK','Latest call in Top 10']].map(([n,l])=>`<div class="stat"><div class="num">${esc(n)}</div><div class="label">${esc(l)}</div></div>`).join('')}
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
        <div class="side-title">BLUE CALL · TODAY</div>
        ${mini('MUNCITOR',x.worker,'hero-mini')}
        ${mini('MESERIE',x.workerTrade)}
        ${mini('POSTCODE',x.workerPostcode)}
        ${mini('SECOND',x.second,'second-mini')}
        ${mini('ORA',x.callTime)}
        ${mini('OUTCOME',x.callOutcome)}
      </section>
      <div class="match-arrow">MATCH</div>
      <section class="side job-side">
        <div class="side-title">JOB DASHBOARD</div>
        ${mini('JOB',x.job,'hero-mini')}
        ${mini('MESERIE',x.jobTrade)}
        ${mini('POSTCODE',x.jobPostcode)}
        ${mini('FIRST',x.first,'first-mini')}
        ${mini('RATE PROPUS',x.rate,'rate-mini')}
        ${mini('RATE ACCEPTAT',acceptedRate(x),'accepted-mini')}
      </section>
    </div>
    <details class="summary-box">
      <summary><span>REZUMAT AI</span><b>${esc(x.summary)}</b></summary>
      <div class="summary-full">${esc(x.summary)}</div>
    </details>
    <div class="why-row">${x.why.slice(0,3).map(r=>`<span>${esc(r)}</span>`).join('')}</div>
  </article>`).join('')||'<div class="empty">No matches from today.</div>'
}
$('#searchInput').addEventListener('input',render);$('#statusFilter').addEventListener('change',render);render();