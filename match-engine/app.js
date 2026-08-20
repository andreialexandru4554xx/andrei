const seedJobs = [
  {id:"j1",title:"Carpenter — W14",trade:"Carpenter",postcode:"W14",rate:26,first:"First A",start:"Tomorrow",skills:["CSCS","tools"]},
  {id:"j2",title:"Labourer — Croydon",trade:"Labourer",postcode:"CR0",rate:14.5,first:"Unassigned — OPEN",start:"ASAP",skills:["CSCS"]},
  {id:"j3",title:"Shuttering Carpenter — HA9",trade:"Shuttering Carpenter",postcode:"HA9",rate:26,first:"Unassigned — OPEN",start:"ASAP",skills:["Blue CSCS","slipform"]},
  {id:"j4",title:"Shuttering Carpenter — TW1",trade:"Shuttering Carpenter",postcode:"TW1",rate:27,first:"Unassigned — OPEN",start:"Immediate",skills:["Blue CSCS"]},
  {id:"j5",title:"Carpenter / Joiner — TW9",trade:"Carpenter",postcode:"TW9",rate:26,first:"Unassigned — OPEN",start:"ASAP",skills:["CSCS","tools","cladding"]},
  {id:"j6",title:"Painter & Decorator — KT14",trade:"Painter",postcode:"KT14",rate:21,first:"First B",start:"Immediate",skills:["CSCS","tools"]},
  {id:"j7",title:"Handyman — Newbury",trade:"Handyman",postcode:"RG14",rate:26,first:"Unassigned — OPEN",start:"Monday",skills:["CSCS","tools","snagging"]},
  {id:"j8",title:"Joiners — W1B",trade:"Joiner",postcode:"W1B",rate:27,first:"Unassigned — OPEN",start:"ASAP",skills:["Blue CSCS","tools"]}
];

const seedWorkers = [
  {id:"w1",name:"Daniel M.",trade:"Carpenter",postcode:"W6",availability:"soon",rate:27,skills:["CSCS","tools"],second:"Second A",summary:"Interested in carpenter work in West London and requested the job details."},
  {id:"w2",name:"Victor C.",trade:"Labourer",postcode:"CR3",availability:"immediate",rate:14.5,skills:["CSCS"],second:"Second B",summary:"Interested in labourer work and lives in the Croydon area."},
  {id:"w3",name:"Steven L.",trade:"Shuttering Carpenter",postcode:"DA9",availability:"immediate",rate:26,skills:["Blue CSCS","slipform"],second:"Second C",summary:"Actively looking for shuttering carpenter work and wants suitable job details."},
  {id:"w4",name:"Ahmad D.",trade:"Carpenter",postcode:"NW10",availability:"immediate",rate:26,skills:["CSCS","tools","cladding"],second:"Second D",summary:"Can start quickly and is interested in carpenter jobs in London."},
  {id:"w5",name:"Lucian P.",trade:"Painter",postcode:"Unknown",availability:"immediate",rate:21,skills:["CSCS","tools"],second:"Second E",summary:"Available immediately for painting work; current postcode needs updating."},
  {id:"w6",name:"Anderson D.",trade:"Handyman",postcode:"London",availability:"soon",rate:26,skills:["CSCS","tools","snagging"],second:"Second F",summary:"Has tools, experience and can start soon."},
  {id:"w7",name:"Andrew D.",trade:"Handyman",postcode:"SM4",availability:"immediate",rate:26,skills:["CSCS","tools"],second:"Second G",summary:"Available quickly; some snagging tasks still need skill confirmation."},
  {id:"w8",name:"Stuart B.",trade:"Painter",postcode:"BD13",availability:"soon",rate:21,skills:["CSCS","tools"],second:"Second H",summary:"Interested in painting work; travel to London needs confirmation."}
];

let jobs = JSON.parse(localStorage.getItem("rme-jobs")||"null") || seedJobs.map(x=>({...x,skills:[...x.skills]}));
let workers = JSON.parse(localStorage.getItem("rme-workers")||"null") || seedWorkers.map(x=>({...x,skills:[...x.skills]}));
let confirmed = JSON.parse(localStorage.getItem("rme-confirmed")||"{}");
let alternatives = JSON.parse(localStorage.getItem("rme-alternatives")||"{}");
let selectedJobId = localStorage.getItem("rme-selected") || jobs[0]?.id;

const $ = s=>document.querySelector(s);
const jobList=$("#jobList"), matchList=$("#matchList"), confirmedList=$("#confirmedList");
const searchInput=$("#searchInput"), tradeFilter=$("#tradeFilter"), statusFilter=$("#statusFilter");

function save(){
  localStorage.setItem("rme-jobs",JSON.stringify(jobs));
  localStorage.setItem("rme-workers",JSON.stringify(workers));
  localStorage.setItem("rme-confirmed",JSON.stringify(confirmed));
  localStorage.setItem("rme-alternatives",JSON.stringify(alternatives));
  localStorage.setItem("rme-selected",selectedJobId||"");
}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function norm(s=""){return String(s).trim().toLowerCase()}
function tradeCompat(a,b){
  a=norm(a);b=norm(b);
  if(a===b) return 35;
  const groups=[
    ["carpenter","joiner","shuttering carpenter"],
    ["painter","painter & decorator","decorator"],
    ["handyman","multi trader","multi skilled worker"],
    ["labourer","general labourer"]
  ];
  const same=groups.some(g=>g.some(x=>a.includes(x))&&g.some(x=>b.includes(x)));
  return same?18:0;
}
function prefix(pc=""){
  const m=String(pc).toUpperCase().match(/^[A-Z]{1,2}/);
  return m?m[0]:"";
}
function locationScore(workerPc,jobPc){
  const a=prefix(workerPc),b=prefix(jobPc);
  if(!a||!b||/UNKNOWN|LONDON/.test(String(workerPc).toUpperCase())) return {score:7,label:"Location needs check",tone:"warn"};
  if(a===b) return {score:20,label:"Very close area",tone:"ok"};
  const london=["W","WC","NW","N","E","EC","SE","SW","CR","BR","DA","HA","TW","KT","SM","UB","EN","IG","RM"];
  if(london.includes(a)&&london.includes(b)) return {score:13,label:"London / commuter range",tone:"info"};
  return {score:3,label:"Long-distance travel check",tone:"warn"};
}
function availabilityScore(a){
  if(a==="immediate") return {score:15,label:"Available immediately",tone:"ok"};
  if(a==="soon") return {score:11,label:"Available soon",tone:"info"};
  if(a==="unavailable") return {score:-25,label:"Currently unavailable",tone:"bad"};
  return {score:5,label:"Availability unknown",tone:"warn"};
}
function rateScore(workerRate,jobRate){
  if(!workerRate||!jobRate) return {score:5,label:"Rate needs check",tone:"warn"};
  if(workerRate<=jobRate) return {score:10,label:"Rate aligned",tone:"ok"};
  const diff=workerRate-jobRate;
  if(diff<=1) return {score:4,label:`Rate mismatch £${diff.toFixed(0)}/h`,tone:"warn"};
  return {score:-8,label:`Expected £${workerRate}/h`,tone:"bad"};
}
function skillScore(workerSkills=[],jobSkills=[]){
  if(!jobSkills.length) return {score:10,label:"No extra skill blockers",tone:"ok"};
  const have=new Set(workerSkills.map(norm));
  let matched=0;
  jobSkills.forEach(s=>{
    const n=norm(s);
    if([...have].some(h=>h.includes(n)||n.includes(h))) matched++;
  });
  const ratio=matched/jobSkills.length;
  if(ratio===1) return {score:20,label:"All required skills verified",tone:"ok"};
  if(ratio>=.5) return {score:10,label:`${matched}/${jobSkills.length} required skills verified`,tone:"warn"};
  return {score:0,label:`Only ${matched}/${jobSkills.length} required skills verified`,tone:"bad"};
}
function stateOfWorker(workerId){
  const jobId=confirmed[workerId];
  if(jobId) return "confirmed";
  const w=workers.find(x=>x.id===workerId);
  if(w?.availability==="unavailable") return "unavailable";
  return "available";
}
function scoreMatch(worker,job){
  const reasons=[];
  let score=0;
  const t=tradeCompat(worker.trade,job.trade);
  if(t===35) reasons.push({label:"Exact primary trade",tone:"ok"});
  else if(t>0) reasons.push({label:"Related trade — verify exact fit",tone:"warn"});
  else reasons.push({label:"Trade mismatch",tone:"bad"});
  score+=t;

  const loc=locationScore(worker.postcode,job.postcode);score+=loc.score;reasons.push(loc);
  const av=availabilityScore(worker.availability);score+=av.score;reasons.push(av);
  const rs=rateScore(worker.rate,job.rate);score+=rs.score;reasons.push(rs);
  const sk=skillScore(worker.skills,job.skills);score+=sk.score;reasons.push(sk);

  const locked=confirmed[worker.id];
  if(locked && locked!==job.id){score-=45;reasons.unshift({label:"Confirmed on another job",tone:"bad"});}
  if(alternatives[worker.id]?.includes(job.id)) reasons.unshift({label:"Marked Alternative",tone:"info"});

  score=Math.max(0,Math.min(100,score));
  return {score,reasons};
}
function filteredJobs(){
  const q=norm(searchInput.value);
  return jobs.filter(j=>{
    const blob=norm([j.title,j.trade,j.postcode,j.first,j.skills.join(" ")].join(" "));
    return (!q||blob.includes(q))&&(tradeFilter.value==="all"||j.trade===tradeFilter.value);
  });
}
function workerVisible(w){
  if(statusFilter.value==="all") return true;
  return stateOfWorker(w.id)===statusFilter.value;
}
function renderTrades(){
  const cur=tradeFilter.value||"all";
  const trades=[...new Set(jobs.map(j=>j.trade))].sort();
  tradeFilter.innerHTML=`<option value="all">All trades</option>`+trades.map(t=>`<option>${esc(t)}</option>`).join("");
  if([...tradeFilter.options].some(o=>o.value===cur)) tradeFilter.value=cur;
}
function renderStats(){
  const allScores=[];
  jobs.forEach(j=>workers.forEach(w=>allScores.push(scoreMatch(w,j).score)));
  const strong=allScores.filter(s=>s>=80).length;
  const confirmedCount=Object.keys(confirmed).length;
  const workersWithAlternatives=Object.keys(alternatives).filter(k=>alternatives[k]?.length).length;
  const data=[
    [jobs.length,"Open jobs"],
    [workers.length,"Workers"],
    [strong,"Strong matches 80+"],
    [confirmedCount,"Confirmed"],
    [workersWithAlternatives,"Workers with alternatives"]
  ];
  $("#stats").innerHTML=data.map(([n,l])=>`<div class="stat"><div class="num">${n}</div><div class="label">${l}</div></div>`).join("");
}
function renderJobs(){
  const list=filteredJobs();
  $("#jobCount").textContent=list.length;
  if(!list.length){jobList.innerHTML=`<div class="empty">No jobs found.</div>`;return}
  if(!list.some(j=>j.id===selectedJobId)) selectedJobId=list[0].id;
  jobList.innerHTML=list.map(j=>{
    const top=workers.map(w=>scoreMatch(w,j).score).sort((a,b)=>b-a)[0]||0;
    const confWorker=Object.keys(confirmed).find(wid=>confirmed[wid]===j.id);
    return `<article class="job-card ${j.id===selectedJobId?"active":""}" data-job="${j.id}">
      <h3>${esc(j.title)}</h3>
      <div class="job-meta">
        <span class="mini">${esc(j.postcode)}</span>
        <span class="mini">£${j.rate||"?"}/h</span>
        <span class="mini">Top ${top}%</span>
        ${confWorker?`<span class="mini" style="color:#047857">Confirmed</span>`:""}
      </div>
    </article>`
  }).join("");
}
function scoreClass(s){return s>=80?"score-strong":s>=65?"score-good":s>=50?"score-review":"score-low"}
function initials(name){return name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}
function renderMatches(){
  const job=jobs.find(j=>j.id===selectedJobId);
  if(!job){matchList.innerHTML=`<div class="empty">Select a job.</div>`;return}
  $("#matchesTitle").textContent=`Best Matches · ${job.title}`;
  const q=norm(searchInput.value);
  const rows=workers.filter(workerVisible).map(w=>({...w,...scoreMatch(w,job)}))
    .filter(w=>{
      const blob=norm([w.name,w.trade,w.postcode,w.second,w.summary].join(" "));
      return !q||blob.includes(q)||norm(job.title).includes(q);
    })
    .sort((a,b)=>b.score-a.score);

  matchList.innerHTML=rows.map(w=>{
    const locked=confirmed[w.id];
    const isConfirmedHere=locked===job.id;
    const isLockedElsewhere=locked&&locked!==job.id;
    const isAlt=alternatives[w.id]?.includes(job.id);
    return `<article class="match-card">
      <div class="match-top">
        <div class="worker-id">
          <div class="avatar">${esc(initials(w.name))}</div>
          <div>
            <h3>${esc(w.name)}</h3>
            <div class="meta">${esc(w.trade)} · ${esc(w.postcode||"Unknown")} · Second: ${esc(w.second||"—")}</div>
          </div>
        </div>
        <div class="score ${scoreClass(w.score)}">${w.score}<small>MATCH</small></div>
      </div>
      <div class="reasons">
        ${w.reasons.slice(0,6).map(r=>`<span class="reason ${r.tone}">${esc(r.label)}</span>`).join("")}
      </div>
      <div class="summary">${esc(w.summary||"No conversation summary.")}</div>
      <div class="match-actions">
        ${isConfirmedHere
          ? `<button class="small-btn confirm" disabled>✓ Confirmed on this job</button><button class="small-btn" data-action="release" data-worker="${w.id}">Release</button>`
          : isLockedElsewhere
          ? `<button class="small-btn" disabled>Locked on another job</button>`
          : `<button class="small-btn confirm" data-action="confirm" data-worker="${w.id}">✓ Confirm this job</button>`
        }
        ${!isConfirmedHere && !isAlt ? `<button class="small-btn alt" data-action="alt" data-worker="${w.id}">Mark Alternative</button>`:""}
        ${isAlt ? `<button class="small-btn" data-action="unalt" data-worker="${w.id}">Remove Alternative</button>`:""}
      </div>
    </article>`
  }).join("") || `<div class="empty">No workers match the current filters.</div>`;
}
function renderConfirmed(){
  const items=Object.entries(confirmed).map(([wid,jid])=>({
    worker:workers.find(w=>w.id===wid),job:jobs.find(j=>j.id===jid)
  })).filter(x=>x.worker&&x.job);
  $("#confirmedCount").textContent=items.length;
  confirmedList.innerHTML=items.map(({worker,job})=>`
    <article class="confirmed-card">
      <h3>${esc(worker.name)} <span class="arrow">→</span> ${esc(job.title)}</h3>
      <p>${esc(worker.trade)} · ${esc(worker.postcode)} · First: ${esc(job.first||"—")}</p>
      <button class="small-btn" data-release="${worker.id}">Release</button>
    </article>
  `).join("") || `<div class="empty">No confirmed matches yet.</div>`;
}
function render(){
  renderTrades();renderStats();renderJobs();renderMatches();renderConfirmed();save();
}
jobList.addEventListener("click",e=>{
  const card=e.target.closest("[data-job]");if(!card)return;
  selectedJobId=card.dataset.job;render();
});
matchList.addEventListener("click",e=>{
  const b=e.target.closest("[data-action]");if(!b)return;
  const wid=b.dataset.worker,action=b.dataset.action,jobId=selectedJobId;
  if(action==="confirm"){
    confirmed[wid]=jobId;
    alternatives[wid]=jobs.filter(j=>j.id!==jobId).map(j=>j.id);
  }
  if(action==="release"){
    delete confirmed[wid];
  }
  if(action==="alt"){
    alternatives[wid]=[...new Set([...(alternatives[wid]||[]),jobId])];
  }
  if(action==="unalt"){
    alternatives[wid]=(alternatives[wid]||[]).filter(id=>id!==jobId);
  }
  render();
});
confirmedList.addEventListener("click",e=>{
  const b=e.target.closest("[data-release]");if(!b)return;
  delete confirmed[b.dataset.release];render();
});
[searchInput,tradeFilter,statusFilter].forEach(el=>el.addEventListener("input",render));
tradeFilter.addEventListener("change",render);statusFilter.addEventListener("change",render);

$("#recalcBtn").addEventListener("click",render);
$("#resetBtn").addEventListener("click",()=>{
  jobs=seedJobs.map(x=>({...x,skills:[...x.skills]}));
  workers=seedWorkers.map(x=>({...x,skills:[...x.skills]}));
  confirmed={};alternatives={};selectedJobId=jobs[0].id;render();
});

const jobDialog=$("#jobDialog"), workerDialog=$("#workerDialog");
$("#addJobBtn").addEventListener("click",()=>jobDialog.showModal());
$("#addWorkerBtn").addEventListener("click",()=>workerDialog.showModal());
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.close).close()));

$("#jobForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);
  const j={id:"j"+Date.now(),title:f.get("title").trim(),trade:f.get("trade").trim(),postcode:f.get("postcode").trim(),
    rate:Number(f.get("rate"))||0,first:f.get("first").trim()||"Unassigned — OPEN",start:f.get("start").trim()||"ASAP",
    skills:f.get("skills").split(",").map(x=>x.trim()).filter(Boolean)};
  jobs.push(j);selectedJobId=j.id;e.currentTarget.reset();jobDialog.close();render();
});
$("#workerForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);
  workers.push({id:"w"+Date.now(),name:f.get("name").trim(),trade:f.get("trade").trim(),postcode:f.get("postcode").trim()||"Unknown",
    availability:f.get("availability"),rate:Number(f.get("rate"))||0,second:f.get("second").trim()||"Unassigned",
    skills:f.get("skills").split(",").map(x=>x.trim()).filter(Boolean),summary:f.get("summary").trim()});
  e.currentTarget.reset();workerDialog.close();render();
});
render();
