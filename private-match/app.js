const U='https://xqociudfqivplequiygw.supabase.co';
const K='sb_publishable_r8cu_BjC_9HBhQ5a56WKcw_MwHqXDml';
const s=supabase.createClient(U,K);
let rows=[];
let pollTimer=null;
const $=q=>document.querySelector(q);
const e=v=>String(v??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

function draw(){
  const q=($('#search')?.value||'').toLowerCase();
  const f=$('#filter')?.value||'all';
  $('#cards').innerHTML=rows.filter(r=>(f==='all'||r.status===f)&&JSON.stringify(r).toLowerCase().includes(q)).map(r=>`<article class="card ${e(r.status)}"><div class="top"><div><div class="name">${e(r.workerName)}</div><div>${e(r.workerTrade)} · ${e(r.workerPostcode)}</div></div><div class="score">${e(r.confidence)}%</div></div><div class="grid"><section class="side"><div class="label">SECOND</div><div class="value">${e(r.second)}</div><div class="label">OUTCOME</div><div class="value">${e(r.callOutcome)}</div></section><section class="side"><div class="label">JOB</div><div class="value">${e(r.jobTrade)} · ${e(r.jobPostcode)}</div><div class="label">FIRST</div><div class="value">${e(r.first)}</div><div class="label">RATE</div><div class="value">${e(r.rate)}</div></section></div><div class="summary"><b>Rezumat AI:</b> ${e(r.summary)}</div><div class="why">${(r.why||[]).map(x=>`<span>${e(x)}</span>`).join('')}</div></article>`).join('');
}

async function load(){
  const {data}=await s.auth.getSession();
  const session=data.session;
  if(!session)return showLogin();
  const r=await fetch(U+'/functions/v1/private-matching-feed',{cache:'no-store',headers:{Authorization:'Bearer '+session.access_token,apikey:K}});
  if(r.status===401){await s.auth.signOut();return showLogin()}
  const p=await r.json();
  rows=p.matches||[];
  $('#meta').textContent=`${p.warmCalls||0} apeluri calde · ${p.openJobs||0} joburi open · live 30 sec`;
  draw();
}

function showLogin(){
  $('#login').hidden=false;
  $('#app').hidden=true;
  if(pollTimer){clearInterval(pollTimer);pollTimer=null}
}

function showApp(){
  $('#login').hidden=true;
  $('#app').hidden=false;
  load();
  if(!pollTimer)pollTimer=setInterval(load,30000);
}

$('#loginForm').onsubmit=async ev=>{
  ev.preventDefault();
  const email=$('#email').value.trim();
  $('#loginMsg').textContent='Trimit linkul de acces…';
  const {error}=await s.auth.signInWithOtp({
    email,
    options:{
      emailRedirectTo:location.origin+location.pathname,
      shouldCreateUser:false
    }
  });
  if(error){
    $('#loginMsg').textContent='Nu am putut trimite accesul. Verifică dacă emailul este autorizat.';
    return;
  }
  localStorage.setItem('privateMatchEmail',email);
  $('#loginMsg').textContent='Gata. Verifică emailul și apasă pe linkul de acces. Nu ai nevoie de parolă.';
};

$('#logout').onclick=async()=>{await s.auth.signOut();showLogin()};
$('#search').oninput=draw;
$('#filter').onchange=draw;

const savedEmail=localStorage.getItem('privateMatchEmail');
if(savedEmail)$('#email').value=savedEmail;

s.auth.onAuthStateChange((_event,session)=>session?showApp():showLogin());
s.auth.getSession().then(({data})=>data.session?showApp():showLogin());