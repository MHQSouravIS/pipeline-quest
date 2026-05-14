const PH=[
{id:'p1',label:'PHASE 1',name:'SQL Mastery',days:'Days 1–25',col:'#ff6b2b'},
{id:'p2',label:'PHASE 2',name:'Python for Data Engineering',days:'Days 26–45',col:'#00d4ff'},
{id:'p3',label:'PHASE 3',name:'Data Warehousing & dbt',days:'Days 46–65',col:'#39ff6e'},
{id:'p4',label:'PHASE 4',name:'Pipelines & Orchestration',days:'Days 66–85',col:'#bd93f9'},
{id:'p5',label:'PHASE 5',name:'AI/ML Data Infrastructure',days:'Days 86–105',col:'#ffd166'},
{id:'p6',label:'PHASE 6',name:'Portfolio & Jobs',days:'Days 106–120',col:'#ff4466'},
];
const LV=[
{min:0,max:200,n:'Raw Data'},{min:200,max:500,n:'Pipeline Novice'},
{min:500,max:900,n:'SQL Engineer'},{min:900,max:1400,n:'dbt Practitioner'},
{min:1400,max:2000,n:'Airflow Architect'},{min:2000,max:2800,n:'ML Infra Specialist'},
{min:2800,max:9999,n:'Senior Data Engineer'}
];
function getLv(xp){for(let i=LV.length-1;i>=0;i--)if(xp>=LV[i].min)return{...LV[i],idx:i+1};}
const BG=[
{id:'b1',i:'⚡',n:'First day done',f:s=>s.dn.length>=1},
{id:'b2',i:'🔥',n:'3-day streak',f:s=>s.st>=3},
{id:'b3',i:'🌟',n:'Week warrior',f:s=>s.st>=7},
{id:'b4',i:'💎',n:'SQL complete',f:s=>s.dn.includes(25)},
{id:'b5',i:'🐍',n:'Python complete',f:s=>s.dn.includes(45)},
{id:'b6',i:'🌀',n:'dbt practitioner',f:s=>s.dn.includes(54)},
{id:'b7',i:'🛩️',n:'Airflow pilot',f:s=>s.dn.includes(72)},
{id:'b8',i:'🤖',n:'ML infra built',f:s=>s.dn.includes(93)},
{id:'b9',i:'🏆',n:'Pipeline Master',f:s=>s.dn.includes(120)},
];
const DEF={xp:0,st:0,ld:'',dn:[],cr:0,tot:0,ch:[],cd:1};
let S={...DEF};
try{const r=localStorage.getItem('pqv2');if(r){const p=JSON.parse(r);S={...DEF,...p};}}catch(e){}
function sv(){try{localStorage.setItem('pqv2',JSON.stringify(S));}catch(e){}}
let qa2=false;
function getDay(){return D.find(d=>d.d===S.cd)||D[0];}
function rToday(){
  qa2=false;
  const d=getDay();
  const done=S.dn.includes(d.d);
  const ph=PH.find(p=>p.id===d.ph)||PH[0];
  const rl=d.res.map(r=>`<div class="ritem" onclick="oL('${r.u}')"><div class="rdot"></div><div class="rtitle">${r.t}</div><div class="rtag">→</div></div>`).join('');
  const ol=d.o.map((o,i)=>`<button class="cho ${done&&i===d.c?'ok':''}" onclick="ansQ(${i},this)" ${done?'disabled':''}>${o}</button>`).join('');
  const nxt=D.find(x=>x.d===d.d+1);
  document.getElementById('tcon').innerHTML=`
<div class="card cp su">
  <div class="dh">
    <div class="dn">DAY ${d.d} · ${ph.label}</div>
    <div style="font-family:var(--mono);font-size:10px;color:var(--gold);background:var(--god);border:1px solid rgba(255,209,102,0.3);padding:3px 9px;border-radius:99px;">${done?'✓ DONE':'+'+d.xp+' XP'}</div>
  </div>
  <div class="dtitle">${d.t}</div>
  <div class="dsub">${d.tp}</div>
  <div class="why">${d.why}</div>
  <div class="cl">TODAY'S RESOURCES</div>
  <div class="rlist">${rl}</div>
  <div>
    <div class="chlbl">KNOWLEDGE CHECK</div>
    <div class="chq">${d.q}</div>
    <div class="chopts" id="qo">${ol}</div>
    <div id="qex" style="display:${done?'block':'none'};">${done?`<div class="chex">${d.ex}</div>`:''}</div>
  </div>
  ${done?`
    <button class="dbtn" style="background:var(--bg4);color:var(--t3);cursor:default;" disabled>✓ DAY ${d.d} COMPLETE</button>
    ${d.d<120&&nxt?`<button class="dbtn" onclick="nxtDay()" style="margin-top:8px;">DAY ${d.d+1}: ${nxt.t} →</button>`:''}
  `:`
    <button class="dbtn" id="dbtn" onclick="mkDone()" disabled>ANSWER THE CHECK TO UNLOCK</button>
    <div class="skip" onclick="skipDay()">Skip — come back later</div>
  `}
</div>
<div style="display:flex;gap:8px;">
  <div class="card" style="flex:1;text-align:center;padding:12px;margin-bottom:0;"><div style="font-size:20px;font-weight:700;font-family:var(--mono);color:var(--pipe);">${S.dn.length}</div><div style="font-family:var(--mono);font-size:9px;color:var(--t3);margin-top:3px;">DAYS DONE</div></div>
  <div class="card" style="flex:1;text-align:center;padding:12px;margin-bottom:0;"><div style="font-size:20px;font-weight:700;font-family:var(--mono);color:var(--gold);">${S.xp}</div><div style="font-family:var(--mono);font-size:9px;color:var(--t3);margin-top:3px;">TOTAL XP</div></div>
  <div class="card" style="flex:1;text-align:center;padding:12px;margin-bottom:0;"><div style="font-size:20px;font-weight:700;font-family:var(--mono);color:var(--pipe);">${S.st}🔥</div><div style="font-family:var(--mono);font-size:9px;color:var(--t3);margin-top:3px;">STREAK</div></div>
</div>`;
}
function ansQ(ch,btn){
  if(qa2)return;qa2=true;
  const d=getDay();
  const ok=d.c===-1||ch===d.c;
  document.querySelectorAll('.cho').forEach((b,i)=>{
    b.disabled=true;
    if(i===ch)b.classList.add(ok?'ok':'no');
    if(!ok&&i===d.c&&d.c!==-1)b.classList.add('ok');
  });
  const ex=document.getElementById('qex');
  ex.innerHTML=`<div class="chex ${ok?'':'bad'}">${d.ex}</div>`;ex.style.display='block';
  const db=document.getElementById('dbtn');
  if(db){db.disabled=false;db.textContent='MARK DAY '+d.d+' DONE →';}
  if(ok){S.cr++;showXP('+'+d.xp+' XP');}
  S.tot++;sv();uhdr();
}
