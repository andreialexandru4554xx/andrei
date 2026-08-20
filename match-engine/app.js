const realCases = [
  {id:1,status:'strong',worker:'M. V.',workerTrade:'Electrician',jobTrade:'Electrician',workerPostcode:'RG21…',workerPhone:'Private',second:'A. Gabi',callTime:'20 Aug 2026 · 08:21 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2 7JG',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: worker was contacted today about an electrician role in Reading for at least 3 months. He asked for the exact location and duration and said he would call back later.',why:['Exact Electrician trade','Reading/RG area matches RG2','Call duration requirement matches 3-month Job Dashboard role','Real Blue AI call today'],confidence:99},
  {id:2,status:'strong',worker:'C. D. L.',workerTrade:'Painter & Decorator',jobTrade:'Painter & Decorator',workerPostcode:'NW…',workerPhone:'Private',second:'P. Jones',callTime:'19 Aug 2026 · 19:49 UK',callOutcome:'Follow-up',job:'Painter — NW1',jobPostcode:'NW1 8XY',rate:'£22/h',first:'Alexandra',summary:'Blue RecruitFlow summary: worker was contacted about a long-term painter role around Islington/North-West London at £22/h. After hearing the details and duration, he showed interest and asked for the information on WhatsApp.',why:['Exact Painter trade','North-West London worker and NW1 job','£22/h in the call matches the Job Dashboard rate','Worker showed explicit interest'],confidence:97},
  {id:3,status:'strong',worker:'M. F.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E15…',workerPhone:'Private',second:'M. Alessandro',callTime:'20 Aug 2026 · 08:52 UK',callOutcome:'Interested',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: worker was contacted about a central-London dryliner role paying £220/day for 8 hours, for at least 3 months. He was interested, said he is available from next week and can also bring a friend.',why:['Exact Dryliner trade','Real interested outcome today','Worker is London based','Can potentially supply a second dryliner','Rate and duration need reconfirmation against the W14 role'],confidence:93},
  {id:4,status:'followup',worker:'E. B.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'NW10…',workerPhone:'Private',second:'A. Mircea',callTime:'20 Aug 2026 · 09:49 UK',callOutcome:'Follow-up',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: the conversation concerned dryliner and tape-and-jointer work. The worker asked whether there is any work available at present.',why:['Latest useful Blue AI conversation','Exact Dryliner trade','NW10 to W14 is a practical West-London match','Worker actively asked for available work'],confidence:91},
  {id:5,status:'followup',worker:'C.',workerTrade:'Shuttering Carpenter',jobTrade:'Shuttering Carpenter',workerPostcode:'E11…',workerPhone:'Private',second:'S. Baer',callTime:'19 Aug 2026 · 19:08 UK',callOutcome:'Follow-up',job:'Shuttering Carpenter — SE18',jobPostcode:'SE18',rate:'£240/day',first:'C. Chirca',summary:'Blue RecruitFlow summary: the worker was initially contacted about drylining but clearly stated that he works only as a shuttering carpenter. The recruiter agreed to send suitable shuttering-carpentry opportunities on WhatsApp.',why:['Exact Shuttering Carpenter trade','New SE18 Job Dashboard role','East-London geography is plausible','Availability for tomorrow still needs confirmation'],confidence:90},
  {id:6,status:'strong',worker:'I. R.',workerTrade:'Plasterer / Renderer',jobTrade:'Renderer',workerPostcode:'SE14…',workerPhone:'Private',second:'S. Baer',callTime:'19 Aug 2026 · 18:30 UK',callOutcome:'Interested',job:'Renderer — SE28',jobPostcode:'SE28',rate:'£25/h',first:'N. Robert',summary:'Blue RecruitFlow summary: worker was called specifically about long-term rendering work in SE28. He reported 25 years of experience, said he is interested and wants to start Monday, and can also bring two additional renderers plus a labourer. Details were sent on WhatsApp and documents were expected afterwards.',why:['Conversation specifically about rendering','SE14 to SE28 is a strong South-East London match','Worker wants to start Monday','Can potentially bring an additional team'],confidence:97},
  {id:7,status:'followup',worker:'S. M.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E17…',workerPhone:'Private',second:'S. Baer',callTime:'19 Aug 2026 · 19:37 UK',callOutcome:'Follow-up',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: worker discussed a dryliner role around E1/E1W at £27-28/h. He is currently busy but remains open to offers depending on location and type of work and requested the details on WhatsApp.',why:['Exact Dryliner trade','Worker remains open to offers','London-to-London match','Rate and availability need reconfirmation'],confidence:84},
  {id:8,status:'strong',worker:'T. T.',workerTrade:'Roofing Labourer',jobTrade:'Labourer',workerPostcode:'N22…',workerPhone:'Private',second:'P. Cristian',callTime:'19 Aug 2026 · 15:03 UK',callOutcome:'Interested',job:'Labourer — N22',jobPostcode:'N22 5JY',rate:'£16/h',first:'A. Luca',summary:'Blue RecruitFlow summary: worker was offered a labourer role in N22 at £16/h for a 10-hour day, showed interest, confirmed having CSCS and agreed to continue on WhatsApp.',why:['Exact local N22 match','Worker explicitly interested','CSCS confirmed in the call','Job remains active/claimed'],confidence:98},
  {id:9,status:'followup',worker:'M. E.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E14…',workerPhone:'Private',second:'P. Jones',callTime:'19 Aug 2026 · 18:00 UK',callOutcome:'Follow-up',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: worker was offered a Central London dryliner role at £29/h for 6–8 weeks. He is currently working but showed interest and agreed to respond by call or WhatsApp.',why:['Exact Dryliner trade','London based','Worker showed interest despite current work','Availability and rate need confirmation'],confidence:82},
  {id:10,status:'followup',worker:'A. P.',workerTrade:'Dryliner',jobTrade:'Dryliner',workerPostcode:'E10…',workerPhone:'Private',second:'S. Baer',callTime:'19 Aug 2026 · 19:15 UK',callOutcome:'Follow-up',job:'Dryliner — W14',jobPostcode:'W14',rate:'£26/h',first:'N. Robert',summary:'Blue RecruitFlow summary: the worker answered briefly, said he could not talk at that moment and would return the call. His profile trade is Dryliner, but interest, rate and availability were not established in the call.',why:['Exact Dryliner trade','London-to-London possibility','Real Blue call exists','No confirmed interest or availability yet'],confidence:68},
  {id:11,status:'followup',worker:'A. M.',workerTrade:'Banksman / electrical skills',jobTrade:'Multi Trader',workerPostcode:'NW2…',workerPhone:'Private',second:'L. Constantin',callTime:'19 Aug 2026 · 17:41 UK',callOutcome:'Follow-up',job:'Multi Trader — RG14',jobPostcode:'RG14 5DQ',rate:'£25/h negotiable',first:'N. Robert',summary:'Blue RecruitFlow summary: the worker confirmed interest in a handyman-type opportunity, said he was available the following day, and reported electrical qualifications, CSCS, banksman card, right to work and his own tools. The current Multi Trader job includes general repairs and mixed apartment tasks.',why:['Relevant handyman/electrical/tool skills','Real interest and availability in the call','Job is multi-skilled general repairs','Trade and travel are not exact matches'],confidence:62},
  {id:12,status:'followup',worker:'S. T.',workerTrade:'Electrician',jobTrade:'Electrician',workerPostcode:'SW15…',workerPhone:'Private',second:'L. Constantin',callTime:'19 Aug 2026 · 17:29 UK',callOutcome:'Follow-up',job:'Electrician — RG2',jobPostcode:'RG2 7JG',rate:'£29/h',first:'Gabi',summary:'Blue RecruitFlow summary: the worker was interested in other suitable roles, but his site card had expired and he was waiting for renewal. His profile is Electrician. The current RG2 electrician job requires all documents, CSCS, PPE and tools.',why:['Exact Electrician trade','Real Blue conversation','Document requirement currently conflicts','Distance and availability need checking'],confidence:55}
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
function renderStats(rows){const strong=rows.filter(x=>x.status==='strong').length,follow=rows.filter(x=>x.status==='followup').length;$('#stats').innerHTML=[[rows.length,'Matches'],[strong,'Strong'],[follow,'Follow-up'],['55%','Lowest shown'],['09:49 UK','Latest useful AI call']].map(([n,l])=>`<div class="stat"><div class="num">${esc(n)}</div><div class="label">${esc(l)}</div></div>`).join('')}
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
        <div class="side-title">BLUE CALL</div>
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
  </article>`).join('')||'<div class="empty">No matches.</div>'
}
$('#searchInput').addEventListener('input',render);$('#statusFilter').addEventListener('change',render);render();