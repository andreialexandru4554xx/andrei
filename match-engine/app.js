const realCases = [
  {id:1,status:'strong',worker:'M. V.',workerTrade:'Electrician',jobTrade:'Electrician',workerPostcode:'RG21…',workerPhone:'Private',second:'A. Gabi',callTime:'20 Aug 2026 · 08:21 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: worker was contacted today about an electrician role in Reading for at least 3 months. He asked for the exact location and duration and said he would call back later.',why:['Latest useful Blue AI call today','Exact Electrician trade','Worker is already in the Reading/RG area','Active Job Board electrician role in RG2','3-month duration aligns with the call','Availability still needs final confirmation'],confidence:96},
  {id:2,status:'strong',worker:'I. R.',workerTrade:'Plasterer / Renderer',jobTrade:'Renderer',workerPostcode:'SE14…',workerPhone:'Private',second:'S. Baer',callTime:'19 Aug 2026 · 18:30 UK',callOutcome:'Interested',job:'Renderer — SE28',jobPostcode:'SE28',rate:'£25/h',first:'N. Robert',summary:'Blue RecruitFlow summary: worker was called specifically about long-term rendering work in SE28. He reported 25 years of experience, said he is interested and wants to start Monday, and can also bring two additional renderers plus a labourer. Details were sent on WhatsApp and documents were expected afterwards.',why:['Real Blue AI call exists','Conversation is specifically about rendering','Active Job Board renderer vacancy is exactly SE28','Worker explicitly interested','Worker wants to start Monday','Can potentially bring an additional team','Confirm final rate before placement'],confidence:97},
  {id:3,status:'followup',worker:'C.',workerTrade:'Shuttering Carpenter',jobTrade:'Shuttering Carpenter',workerPostcode:'E11…',workerPhone:'Private',second:'S. Baer',callTime:'19 Aug 2026 · 19:08 UK',callOutcome:'Follow-up',job:'Shuttering Carpenter — N6',jobPostcode:'N6',rate:'£27.50/h',first:'Gabi',summary:'Blue RecruitFlow summary: the worker was initially contacted about drylining but clearly stated that he works only as a shuttering carpenter. The recruiter agreed to send suitable shuttering-carpentry opportunities on WhatsApp.',why:['Real Blue AI call exists','Worker explicitly corrected his trade to Shuttering Carpenter','Exact trade match with active N6 job','Both worker and job are London based','Availability for this specific start still needs confirmation'],confidence:89},
  {id:4,status:'strong',worker:'T. T.',workerTrade:'Roofing Labourer',jobTrade:'Labourer',workerPostcode:'N22…',workerPhone:'Private',second:'P. Cristian',callTime:'19 Aug 2026 · 15:03 UK',callOutcome:'Interested',job:'Labourer — N22',jobPostcode:'N22 5JY',rate:'£16/h',first:'A. Luca',summary:'Blue RecruitFlow summary: worker was offered a labourer role in N22 at £16/h for a 10-hour day, showed interest, confirmed having CSCS and agreed to continue on WhatsApp.',why:['Blue call exists','Worker explicitly interested','N22 worker area matches N22 job','CSCS confirmed in call','Job Board vacancy remains claimed'],confidence:98},
  {id:5,status:'strong',worker:'I. M. V.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'RG2…',workerPhone:'Private',second:'Thomas N',callTime:'19 Aug 2026 · 10:04 UK',callOutcome:'Follow-up',job:'Dryliner — RG2',jobPostcode:'RG2',rate:'£27/h',first:'N. Robert',summary:'Blue RecruitFlow summary: worker discussed a long-term RG2 role at £27/h. He was working at the time and could not start immediately, but agreed to keep contact on WhatsApp and send documents for future availability.',why:['Blue call exists','Exact Dryliner trade','Worker postcode is RG2','Job postcode is RG2','Rate discussed in call equals Job Board rate','Availability needs reconfirmation'],confidence:94},
  {id:6,status:'strong',worker:'R. C.',workerTrade:'Electrician Improver',jobTrade:'Electrician',workerPostcode:'RG22…',workerPhone:'Private',second:'F. Parker',callTime:'19 Aug 2026 · 09:28 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: worker was contacted about an electrician role in the RG area, asked for the job details by email and agreed to continue via WhatsApp.',why:['Blue call exists','Electrician-family trade match','RG postcode family is compatible','Worker requested job details','Active Job Board electrician vacancy'],confidence:89},
  {id:7,status:'followup',worker:'G. B.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E1…',workerPhone:'Private',second:'P. Jones',callTime:'19 Aug 2026 · 14:17 UK',callOutcome:'Follow-up',job:'Dryliner — E1W',jobPostcode:'E1W',rate:'£27.50/h',first:'G. Ionescu',summary:'Blue RecruitFlow summary: worker discussed a Central London dryliner role. He works as a pair and negotiated toward £30/h before agreeing to check with his colleague and reply on WhatsApp.',why:['Blue call exists','Exact Dryliner trade','E1 worker area is very close to E1W job','Conversation shows genuine engagement','Rate must be reconfirmed before sending'],confidence:87},
  {id:8,status:'followup',worker:'M. E.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E14…',workerPhone:'Private',second:'P. Jones',callTime:'19 Aug 2026 · 18:00 UK',callOutcome:'Follow-up',job:'Dryliner — E1W',jobPostcode:'E1W',rate:'£27.50/h',first:'G. Ionescu',summary:'Blue RecruitFlow summary: worker was offered a Central London dryliner role at £29/h for 6–8 weeks. He is currently working but showed interest and agreed to respond by call or WhatsApp.',why:['Blue call exists','Exact Dryliner trade','East/Central London location is plausible','Worker showed interest despite current work','Availability needs confirmation'],confidence:85},
  {id:9,status:'followup',worker:'C. D. L.',workerTrade:'Painter & Decorator',jobTrade:'Painter & Decorator',workerPostcode:'NW…',workerPhone:'Private',second:'P. Jones',callTime:'19 Aug 2026 · 19:49 UK',callOutcome:'Follow-up',job:'Painter — London',jobPostcode:'London',rate:'£22–£22.50/h',first:'N. Robert',summary:'Blue RecruitFlow summary: worker was contacted about a long-term painter role around Islington/North-West London at £22/h. After hearing the details and duration, he showed interest and asked for the information on WhatsApp.',why:['Blue call exists','Exact Painter trade','Worker is already in North-West London','Explicit interest in the call','Exact active job postcode still needs final selection'],confidence:82}
];

const $ = s => document.querySelector(s);
const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function badge(status){if(status==='strong')return '<span class="role-badge primary-role">STRONG MATCH</span>';if(status==='followup')return '<span class="role-badge alt-role">FOLLOW-UP</span>';return '<span class="role-badge blocked-role">BLOCKED / NOT NOW</span>'}
function scoreClass(s){return s>=90?'score-strong':s>=75?'score-good':s>=50?'score-review':'score-low'}
function renderStats(rows){const strong=rows.filter(x=>x.status==='strong').length,follow=rows.filter(x=>x.status==='followup').length,blocked=rows.filter(x=>x.status==='blocked').length;$('#stats').innerHTML=[[rows.length,'Current matches'],[strong,'Strong matches'],[follow,'Follow-up'],[blocked,'Blocked'],['20 Aug · 08:21 UK','Latest Blue AI call']].map(([n,l])=>`<div class="stat"><div class="num">${esc(n)}</div><div class="label">${esc(l)}</div></div>`).join('')}
function vrow(label,value,cls=''){return `<div class="vertical-row ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`}
function render(){
  const q=$('#searchInput').value.trim().toLowerCase();
  const status=$('#statusFilter').value;
  const rows=realCases.filter(x=>{const blob=[x.worker,x.workerTrade,x.jobTrade,x.workerPostcode,x.second,x.first,x.job,x.jobPostcode,x.rate,x.summary,x.status].join(' ').toLowerCase();return(!q||blob.includes(q))&&(status==='all'||x.status===status)});
  $('#caseCount').textContent=rows.length;
  renderStats(rows);
  $('#caseList').innerHTML=rows.map(x=>`<article class="top10-card match-${x.status}">
    <div class="card-head">
      <div><div class="match-found-label">MATCH FOUND</div><div class="rank-line">#${x.id} · ${esc(x.worker)} → ${esc(x.job)}</div></div>
      <div class="score ${scoreClass(x.confidence)}">${x.confidence}<small>CONFIDENCE</small></div>
    </div>

    <section class="vertical-section worker-section">
      <div class="section-kicker">1 · MUNCITOR</div>
      ${vrow('NUME MUNCITOR',x.worker,'emphasis')}
      ${vrow('MESERIE',x.workerTrade)}
      ${vrow('POSTCODE MUNCITOR',x.workerPostcode)}
    </section>

    <section class="vertical-section second-section">
      <div class="section-kicker">2 · SECOND · CINE A SUNAT</div>
      ${vrow('SECOND AGENT',x.second,'emphasis')}
      ${vrow('ORA APELULUI',x.callTime)}
      ${vrow('OUTCOME',x.callOutcome)}
    </section>

    <section class="vertical-section summary-section">
      <div class="section-kicker">3 · REZUMAT AI BLUE</div>
      <div class="summary">${esc(x.summary)}</div>
    </section>

    <section class="vertical-section job-section">
      <div class="section-kicker">4 · JOB DIN JOB DASHBOARD</div>
      ${vrow('JOB',x.job,'emphasis')}
      ${vrow('MESERIE JOB',x.jobTrade)}
      ${vrow('POSTCODE JOB',x.jobPostcode)}
      ${vrow('RATĂ',x.rate)}
    </section>

    <section class="vertical-section first-section">
      <div class="section-kicker">5 · FIRST · CINE A POSTAT JOBUL</div>
      ${vrow('FIRST',x.first,'emphasis')}
    </section>

    <section class="vertical-section why-section">
      <div class="section-kicker">6 · DE CE ESTE MATCH</div>
      <div class="reasons">${x.why.map(r=>`<span class="reason ${x.status==='strong'?'ok':'info'}">${esc(r)}</span>`).join('')}</div>
    </section>

    <div class="card-footer">${badge(x.status)}<span>Blue Supabase + Job Dashboard</span></div>
  </article>`).join('')||'<div class="empty">No real situations match these filters.</div>'
}
$('#searchInput').addEventListener('input',render);$('#statusFilter').addEventListener('change',render);render();
