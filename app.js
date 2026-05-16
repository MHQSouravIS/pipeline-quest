// ── Complete app.js — all missing functions ──

function mkDone(){
  const d=getDay();if(S.dn.includes(d.d))return;
  S.xp+=d.xp;S.dn.push(d.d);
  const td=new Date().toISOString().slice(0,10);
  if(S.ld){const diff=(new Date(td)-new Date(S.ld))/864e5;S.st=diff<=1?S.st+1:1;}else S.st=1;
  S.ld=td;
  // Advance to next day unless this is the last day of a phase — gate will handle routing
  if(d.d<120){
    const phDays=D.filter(x=>x.ph===d.ph);
    const isLastOfPhase=phDays[phDays.length-1].d===d.d;
    if(!isLastOfPhase)S.cd=d.d+1;
  }
  sv();uhdr();toast('DAY '+d.d+' COMPLETE! +'+d.xp+' XP');
  checkBadges();rToday();
}

function skipDay(){
  const d=getDay();if(d.d<120){S.cd=d.d+1;sv();rToday();}
}

function nxtDay(){
  const d=getDay();const n=D.find(x=>x.d===d.d+1);
  if(n){S.cd=n.d;sv();rToday();document.querySelector('.main').scrollTop=0;}
}

function go(id,btn){
  document.querySelectorAll('.pane').forEach(p=>p.classList.remove('on'));
  document.getElementById('pane-'+id).classList.add('on');
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  if(id==='map')rMap();
  if(id==='stats')rStats();
  document.querySelector('.main').scrollTop=0;
}

function oL(u){window.open(u,'_blank');}

function openGate(phId){
  // Show the gate's current stage for this phase (test or project, or review if cleared)
  go('today',document.querySelectorAll('.nb')[0]);
  if(S.tp.includes(phId) && S.pj.includes(phId)){
    // Both cleared — show project view as a read-only review
    renderProject(phId);
  }else if(S.tp.includes(phId)){
    renderProject(phId);
  }else{
    renderGateIntro(phId,'test');
  }
}

function showXP(txt){
  const el=document.getElementById('xpp');el.textContent=txt;el.classList.add('on');
  setTimeout(()=>el.classList.remove('on'),1800);
}

function toast(txt){
  const el=document.getElementById('tst');el.textContent=txt;el.classList.add('on');
  setTimeout(()=>el.classList.remove('on'),2200);
}

function uhdr(){
  document.getElementById('hS').textContent='🔥 '+S.st;
  document.getElementById('hX').textContent='⚡ '+S.xp;
  const lv=getLv(S.xp);
  document.getElementById('lvlL').textContent='LVL '+lv.idx+' — '+lv.n;
  const pct=Math.min(100,((S.xp-lv.min)/(lv.max-lv.min))*100);
  document.getElementById('lvlX').textContent=(S.xp-lv.min)+' / '+(lv.max-lv.min)+' XP';
  document.getElementById('trkF').style.width=pct+'%';
}

function rMap(){
  const el=document.getElementById('pmap');
  const tot=D.length,dn=S.dn.length;
  const pct=Math.round((dn/tot)*100);
  document.getElementById('rPct').textContent=pct+'%';
  document.getElementById('rSub').textContent=dn+' of '+tot+' days';
  const cur=getDay(),cph=PH.find(p=>p.id===cur.ph);
  document.getElementById('rPh').textContent=(cph?cph.label:'')+' active';
  const ring=document.getElementById('ringC');
  ring.style.strokeDashoffset=163.36-(163.36*(pct/100));
  let h='';
  PH.forEach(ph=>{
    const phDays=D.filter(d=>d.ph===ph.id);
    const allDaysDone=phDays.every(d=>S.dn.includes(d.d));
    const testPassed=S.tp.includes(ph.id);
    const projDone=S.pj.includes(ph.id);
    let badge='';
    if(allDaysDone && testPassed && projDone)badge='<span style="font-family:var(--mono);font-size:8px;color:var(--green);background:var(--gd);border:1px solid rgba(57,255,110,0.3);padding:2px 7px;border-radius:99px;margin-left:8px;">✓ CLEARED</span>';
    else if(allDaysDone && testPassed)badge='<span style="font-family:var(--mono);font-size:8px;color:var(--purple);background:rgba(189,147,249,0.12);border:1px solid rgba(189,147,249,0.35);padding:2px 7px;border-radius:99px;margin-left:8px;">PROJECT PENDING</span>';
    else if(allDaysDone)badge='<span style="font-family:var(--mono);font-size:8px;color:var(--gold);background:var(--god);border:1px solid rgba(255,209,102,0.3);padding:2px 7px;border-radius:99px;margin-left:8px;">TEST PENDING</span>';
    h+=`<div class="psep" style="color:${ph.col};background:${ph.col}15;border:1px solid ${ph.col}44;">${ph.label}: ${ph.name}${badge}</div>`;
    phDays.forEach(d=>{
      const done=S.dn.includes(d.d),ac=S.cd===d.d;
      h+=`<div class="pnode"><div class="ndot ${done?'dn2':ac?'ac':''}">${done?'✓':d.d}</div>`;
      h+=`<div class="nbody ${done?'dnn':ac?'acn':''}" onclick="S.cd=${d.d};sv();go('today',document.querySelectorAll('.nb')[0])">`;
      h+=`<div class="nday">DAY ${d.d}</div><div class="ntitle">${d.t}</div>`;
      h+=`<div class="nsub">${done?'Completed':ac?'Current':'Locked'}</div></div></div>`;
    });
    // Gate node — test + project for this phase
    if(allDaysDone || testPassed || projDone){
      const gateState=projDone?'done':testPassed?'project':'test';
      const gateLabel=gateState==='done'?'✓ Phase Cleared':gateState==='project'?'Capstone Project':'Phase Test';
      const gateSub=gateState==='done'?'Test passed · Project submitted':gateState==='project'?'Test passed — submit project to unlock next phase':'Pass the test to access the project';
      h+=`<div class="pnode" style="margin-bottom:14px;">
        <div class="ndot" style="border-color:${gateState==='done'?'var(--green)':'var(--gold)'};background:${gateState==='done'?'var(--gd)':'var(--god)'};color:${gateState==='done'?'var(--green)':'var(--gold)'};">${gateState==='done'?'✓':'🔒'}</div>
        <div class="nbody" style="border-color:${gateState==='done'?'rgba(57,255,110,0.3)':'rgba(255,209,102,0.3)'};cursor:${allDaysDone?'pointer':'default'};opacity:${allDaysDone?1:0.5};" ${allDaysDone?`onclick="openGate('${ph.id}')"`:''}>
          <div class="nday" style="color:${gateState==='done'?'var(--green)':'var(--gold)'};">${ph.label} GATE</div>
          <div class="ntitle">${gateLabel}</div>
          <div class="nsub">${gateSub}</div>
        </div>
      </div>`;
    }
  });
  el.innerHTML=h;
}

function rStats(){
  document.getElementById('stX').textContent=S.xp;
  document.getElementById('stS').textContent=S.st;
  document.getElementById('stD').textContent=S.dn.length;
  document.getElementById('stC').textContent=S.cr;
  // streak grid
  const sg=document.getElementById('stgrid');
  let gh='';const now=new Date();
  for(let i=27;i>=0;i--){
    const dt=new Date(now);dt.setDate(dt.getDate()-i);
    const ds=dt.toISOString().slice(0,10);
    const isToday=i===0;
    const hit=ds===S.ld||(S.dn.length>0&&i<S.st);
    gh+=`<div class="stc ${hit?'h':''} ${isToday?'td':''}">${dt.getDate()}</div>`;
  }
  sg.innerHTML=gh;
  // badges
  const bw=document.getElementById('bgw');
  let bh='';
  BG.forEach(b=>{
    const got=b.f(S);
    bh+=`<div class="bg2 ${got?'gt':''}"><div class="bi">${b.i}</div><div class="bn">${b.n}</div></div>`;
  });
  bw.innerHTML=bh;
}

function checkBadges(){
  BG.forEach(b=>{if(b.f(S))toast(b.i+' '+b.n+'!');});
}

// ── Mentor Chat ──
const MENTOR_RESPONSES={
  'focus':['Based on your progress, complete today\'s lesson. Consistency beats speed — one solid day is better than skimming three.'],
  'default':[
    "That's a great question! As a DE specialising in AI/ML infrastructure, understanding this deeply will set you apart.",
    "Good thinking! This connects directly to your SEH work. In a production pipeline, you'd approach this by first understanding the data flow.",
    "This is commonly asked in DE interviews. The key insight is: data engineers own the infrastructure that makes data reliable and accessible.",
  ]
};

function getMentorReply(msg){
  const m=msg.toLowerCase();
  if(m.includes('focus')||m.includes('today'))return'Day '+S.cd+' is your current focus. You have completed '+S.dn.length+' days so far with '+S.xp+' XP. '+(S.st>0?'Your '+S.st+'-day streak is great — keep it going!':'Start a streak today by completing your daily challenge!')+' Review the resources thoroughly before answering the knowledge check.';
  if(m.includes('window function'))return'Window functions operate on a "window" of rows related to the current row WITHOUT collapsing them (unlike GROUP BY). Example with your SEH data:\n\nROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY visit_date DESC)\n\nThis ranks each patient\'s visits. Row 1 = latest visit. Use WHERE rn=1 to deduplicate — keeping only the most recent record per patient. This is the #1 tested DE SQL pattern.';
  if(m.includes('airflow'))return'Apache Airflow is a pipeline orchestrator — it schedules, runs, and monitors your data pipelines. Think of it as a smart cron job manager. You define a DAG (directed acyclic graph) of tasks:\n\nextract >> transform >> load\n\nAirflow ensures transform only runs after extract succeeds. If transform fails, load never runs. You get retries, alerts, logs, and a visual UI showing pipeline status. Nearly every DE job requires it.';
  if(m.includes('dbt'))return'dbt (data build tool) turns SELECT statements into warehouse tables. Instead of writing CREATE TABLE + INSERT manually, you write:\n\n-- models/stg_patients.sql\nSELECT patient_id, TRIM(name) as name FROM raw.patients\n\ndbt handles materialisation, testing (not_null, unique), documentation, and dependency ordering via ref(). It\'s version-controlled SQL with software engineering practices built in.';
  if(m.includes('vector'))return'Vector databases store numerical embeddings — dense representations of text/images. In your RAG chatbot:\n\n1. Document chunks → embedding model → [0.23, -0.87, ...] vectors\n2. Stored in ChromaDB/pgvector with the original text\n3. User query → embedded → find most similar vectors → retrieve those chunks\n4. Chunks sent to LLM as context\n\nYou already built this! Now you understand the plumbing at a deeper level.';
  if(m.includes('job')||m.includes('guwahati'))return'DE jobs in Guwahati are limited but growing. Your best strategy:\n\n1. Remote-first Indian companies (Razorpay, Zerodha, etc.)\n2. Global remote roles (many US/EU companies hire Indian DEs)\n3. Your healthcare + AI/ML specialisation is rare — highlight it\n4. Target "Data Engineer" + "ML Engineer" + "Analytics Engineer" roles\n5. LinkedIn + Naukri + direct company career pages\n\nYour SEH pipeline + RAG chatbot experience is genuinely differentiating.';
  if(m.includes('resume'))return'Frame your SEH work as DE achievements:\n\n• "Built ETL pipelines processing patient visit data across multiple hospital centres"\n• "Designed data models for healthcare analytics dashboards"\n• "Developed RAG-based chatbot with document ingestion pipeline and vector database"\n\nHeadline: "Data Engineer | SQL · Python · dbt · Airflow · AI/ML Pipelines | Healthcare"\n\nQuantify: rows processed, pipeline frequency, data sources integrated.';
  if(m.includes('lake')||m.includes('warehouse'))return'Data Lake: raw storage of everything — structured, semi-structured, unstructured. Like a library where books are dumped in boxes. Cheap, scalable (GCS/S3).\n\nData Warehouse: structured, cleaned, modelled data optimised for analytics. Like a well-organised library with a catalogue. Fast queries (BigQuery, Snowflake).\n\nModern pattern: land raw data in a lake → transform with dbt → serve from warehouse. You\'ll build this in Phases 3-4.';
  if(m.includes('kafka'))return'Kafka is a distributed event streaming platform. Think of it as a high-throughput message queue:\n\n• Producer publishes events (e.g., each patient check-in)\n• Kafka stores events in ordered logs (topics)\n• Consumer reads and processes events\n\nUse Kafka when you need real-time: fraud detection (<1s), live dashboards, event-driven microservices. For batch analytics (hourly/daily), Airflow is simpler. Most DE roles are batch-first, streaming-aware.';
  if(m.includes('track')||m.includes('on track'))return'You have completed '+S.dn.length+'/120 days ('+Math.round(S.dn.length/120*100)+'%). '+(S.dn.length>=S.cd-5?'You are on track! Keep the daily habit going.':'You are a bit behind schedule. Focus on one day per actual day.')+' Your '+S.xp+' XP puts you at '+getLv(S.xp).n+' level. The AI/ML specialisation (Phase 5) is what makes you unique.';
  return MENTOR_RESPONSES.default[Math.floor(Math.random()*MENTOR_RESPONSES.default.length)]+'\n\nYou are on Day '+S.cd+' with '+S.xp+' XP. Keep building! 🔥';
}

function addBub(cls,txt){
  const log=document.getElementById('clog');
  const b=document.createElement('div');b.className='bub '+cls;b.innerHTML=txt;
  log.appendChild(b);log.scrollTop=log.scrollHeight;
  S.ch.push({c:cls,t:txt});if(S.ch.length>50)S.ch.shift();sv();
}

function sendC(){
  const inp=document.getElementById('cin');
  const msg=inp.value.trim();if(!msg)return;
  inp.value='';addBub('me',msg);
  const btn=document.getElementById('csnd');btn.disabled=true;
  addBub('ai tk','thinking...');
  setTimeout(()=>{
    const log=document.getElementById('clog');
    const last=log.querySelector('.tk');if(last)last.remove();
    S.ch=S.ch.filter(c=>!c.t.includes('thinking'));
    addBub('ai',getMentorReply(msg));
    btn.disabled=false;
  },600+Math.random()*800);
}

function qa(txt){
  document.getElementById('cin').value=txt;sendC();
}

// ── Init ──
function init(){
  uhdr();rToday();
  // restore chat
  if(S.ch&&S.ch.length){
    S.ch.forEach(m=>{
      const log=document.getElementById('clog');
      const b=document.createElement('div');b.className='bub '+m.c;b.innerHTML=m.t;
      log.appendChild(b);
    });
  }else{
    addBub('ai','Welcome to Pipeline Quest! 🚀 I\'m your AI mentor. I know your background — SEH healthcare data, Python, RAG chatbot experience. Ask me anything about your DE + AI/ML journey. What would you like to know?');
  }
}
// init() is called by sync.js after alias screen
