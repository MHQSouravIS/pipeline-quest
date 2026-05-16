// ── Phase Capstone Projects ──
// Phase 1: real in-browser SQL IDE with sample SEH-style data (sql.js)
// Phases 2-6: structured brief + checklist + GitHub URL submission
// All projects must be marked done to unlock the next phase.

const PROJECTS={
p1:{
  ph:'p1',type:'sql-ide',name:'SEH Patient Analytics — SQL Capstone',xp:200,
  brief:`Build a complete patient-analytics query suite against a small SEH-style schema. You have 4 tables: <b>patients</b>, <b>doctors</b>, <b>centres</b>, <b>visits</b>. Pass all 5 challenges below to complete this project.`,
  schema:`patients(patient_id, name, dob, city, phone, registered_on)
doctors(doctor_id, name, specialisation, centre_id)
centres(centre_id, name, city)
visits(visit_id, patient_id, doctor_id, centre_id, visit_date, duration_mins, revenue, status)`,
  challenges:[
    {id:'c1',title:'JOIN basics',
     prompt:'Return name, visit_date, status for every visit by patient_id = 3. Order by visit_date.',
     check:r=>r.length>=2 && r[0].name && r[0].visit_date && 'status' in r[0],
     hint:'JOIN visits to patients on patient_id; WHERE patient_id=3; ORDER BY visit_date.'},
    {id:'c2',title:'GROUP BY + HAVING',
     prompt:'Find centre names with more than 5 completed visits. Return centre_name and visit_count.',
     check:r=>r.length>=1 && r[0].centre_name && Number(r[0].visit_count)>5,
     hint:"JOIN visits to centres; WHERE status='completed'; GROUP BY centre name; HAVING COUNT(*) > 5."},
    {id:'c3',title:'LEFT JOIN — find no-shows',
     prompt:'List patient names who have NEVER had a completed visit. Return only the name column.',
     check:r=>r.length>=1 && r[0].name && Object.keys(r[0]).length===1,
     hint:"LEFT JOIN patients to (visits filtered to status='completed') and keep rows where the visit side is NULL."},
    {id:'c4',title:'Window function — latest visit per patient',
     prompt:'For each patient, return their MOST RECENT visit only: name, visit_date, revenue. Use ROW_NUMBER().',
     check:r=>r.length>=5 && r[0].name && r[0].visit_date && 'revenue' in r[0],
     hint:'CTE: SELECT *, ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY visit_date DESC) rn FROM visits. Filter rn=1, then join to patients.'},
    {id:'c5',title:'Revenue analytics — top doctors',
     prompt:'Return top 3 doctors by total completed-visit revenue. Columns: doctor_name, total_revenue. Order desc.',
     check:r=>r.length===3 && r[0].doctor_name && Number(r[0].total_revenue)>0 && Number(r[0].total_revenue)>=Number(r[1].total_revenue),
     hint:"JOIN visits to doctors; WHERE status='completed'; GROUP BY doctor; SUM(revenue); ORDER BY total DESC LIMIT 3."}
  ],
  // SQL to set up the sample DB. Loaded into sql.js at runtime.
  seed:`
CREATE TABLE centres (centre_id INTEGER PRIMARY KEY, name TEXT, city TEXT);
INSERT INTO centres VALUES
  (1,'SEH Guwahati Main','Guwahati'),
  (2,'SEH Dispur','Guwahati'),
  (3,'SEH Shillong','Shillong'),
  (4,'SEH Jorhat','Jorhat');

CREATE TABLE doctors (doctor_id INTEGER PRIMARY KEY, name TEXT, specialisation TEXT, centre_id INTEGER);
INSERT INTO doctors VALUES
  (1,'Dr. Anjali Sharma','Cardiology',1),
  (2,'Dr. Rohit Das','General Medicine',1),
  (3,'Dr. Priya Nair','Paediatrics',2),
  (4,'Dr. Sameer Khan','Orthopaedics',2),
  (5,'Dr. Meera Iyer','Cardiology',3),
  (6,'Dr. Vikas Bora','Dermatology',4);

CREATE TABLE patients (patient_id INTEGER PRIMARY KEY, name TEXT, dob TEXT, city TEXT, phone TEXT, registered_on TEXT);
INSERT INTO patients VALUES
  (1,'Ravi Kalita','1985-03-12','Guwahati','9876543210','2023-01-15'),
  (2,'Sunita Devi','1992-07-22','Guwahati','9123456780','2023-02-03'),
  (3,'Aniket Bora','1978-11-05','Jorhat','9988776655','2023-02-18'),
  (4,'Pooja Singh','2001-04-30','Guwahati','9001122334','2023-03-22'),
  (5,'Manoj Roy','1965-09-14','Shillong','9112233445','2023-04-01'),
  (6,'Kavita Saikia','1988-12-08','Guwahati',NULL,'2023-04-19'),
  (7,'Deepak Hazarika','1995-06-25','Jorhat','9223344556','2023-05-10'),
  (8,'Rina Pathak','1972-02-17','Shillong','9334455667','2023-05-28'),
  (9,'Arjun Mehta','1990-10-03','Guwahati','9445566778','2023-06-15'),
  (10,'Lalita Goswami','1983-08-21','Guwahati','9556677889','2023-07-02'),
  (11,'Suresh Talukdar','2000-01-11','Jorhat',NULL,'2023-08-20'),
  (12,'Anita Barua','1970-05-09','Guwahati','9667788990','2023-09-05');

CREATE TABLE visits (visit_id INTEGER PRIMARY KEY, patient_id INTEGER, doctor_id INTEGER, centre_id INTEGER, visit_date TEXT, duration_mins INTEGER, revenue REAL, status TEXT);
INSERT INTO visits VALUES
  (1,1,1,1,'2024-01-10',30,1200,'completed'),
  (2,1,2,1,'2024-02-14',20,800,'completed'),
  (3,2,3,2,'2024-01-22',25,900,'completed'),
  (4,2,3,2,'2024-03-08',25,900,'no_show'),
  (5,3,1,1,'2024-02-02',40,1500,'completed'),
  (6,3,1,1,'2024-04-18',35,1300,'completed'),
  (7,3,2,1,'2024-05-11',20,750,'completed'),
  (8,4,4,2,'2024-03-15',45,1800,'completed'),
  (9,5,5,3,'2024-01-30',30,1100,'completed'),
  (10,5,5,3,'2024-04-22',30,1100,'cancelled'),
  (11,7,6,4,'2024-02-12',20,650,'completed'),
  (12,7,6,4,'2024-05-04',20,650,'completed'),
  (13,8,5,3,'2024-03-01',35,1400,'completed'),
  (14,9,2,1,'2024-01-19',25,850,'completed'),
  (15,9,1,1,'2024-04-10',30,1200,'completed'),
  (16,10,4,2,'2024-02-25',40,1700,'completed'),
  (17,10,3,2,'2024-05-29',25,900,'completed'),
  (18,1,1,1,'2024-06-05',30,1250,'completed'),
  (19,3,2,1,'2024-06-18',20,800,'completed'),
  (20,4,4,2,'2024-06-30',45,1850,'no_show'),
  (21,9,2,1,'2024-07-12',25,900,'completed'),
  (22,2,3,2,'2024-07-21',25,950,'completed'),
  (23,5,5,3,'2024-08-04',30,1200,'completed'),
  (24,7,6,4,'2024-08-15',20,700,'no_show'),
  (25,10,4,2,'2024-08-28',40,1750,'completed');
`
},
p2:{
  ph:'p2',type:'brief',name:'Healthcare ETL Pipeline — Python Capstone',xp:220,
  brief:`Build a complete Python ETL pipeline that ingests a public healthcare dataset, transforms it, and loads it into Postgres (or SQLite). Push to GitHub with a clean README. This is Portfolio Project #1.`,
  checklist:[
    'Pick a public dataset (Kaggle healthcare, data.gov.in, or NHS open data)',
    'Build extractor: reads CSV/JSON or hits a public API with pagination',
    'Build transformer: snake_case columns, type cast, COALESCE nulls, dedupe',
    'Build loader: writes to Postgres or SQLite with if_exists=append + dedupe key',
    'Wrap in a Pipeline class (extract/transform/load/run)',
    'Add logging with the logging module — not print()',
    'Add at least 3 pytest unit tests for the transform layer',
    'Use environment variables for credentials (no secrets in code)',
    'Write a Dockerfile so it runs anywhere',
    'README with architecture diagram, tech stack, how-to-run, sample output'
  ],
  deliverable:'GitHub repository URL'
},
p3:{
  ph:'p3',type:'brief',name:'SEH dbt Warehouse — Modelling Capstone',xp:240,
  brief:`Build a complete dbt project that models the SEH healthcare warehouse: staging → marts. Demonstrate dbt's full power: ref() lineage, tests, docs, snapshots. This is Portfolio Project #2.`,
  checklist:[
    'dbt init a new project; configure profiles.yml for BigQuery OR Postgres',
    'Create models/staging/ with stg_patients, stg_visits, stg_doctors, stg_centres',
    'Each staging model: cast types, TRIM/LOWER strings, rename to snake_case',
    'Create models/marts/ with mart_patient_summary, mart_centre_performance, mart_doctor_revenue',
    'Marts use {{ ref(\'stg_...\') }} — never direct source references',
    'schema.yml with tests: not_null on PKs, unique on PKs, relationships on FKs',
    'Add a dbt snapshot on patients (SCD2 tracking city + phone)',
    'Configure at least one mart with partition_by or cluster_by (if BQ)',
    'Run dbt docs generate and screenshot the lineage DAG into the README',
    'README with architecture diagram, dbt project structure, screenshot of docs DAG'
  ],
  deliverable:'GitHub repository URL'
},
p4:{
  ph:'p4',type:'brief',name:'Orchestrated Healthcare Pipeline — Airflow Capstone',xp:240,
  brief:`Wire your Phase 2 ETL and Phase 3 dbt project together with Airflow. Build a production-grade DAG with sensors, retries, alerts, and idempotency. Screenshot the Airflow UI for your README.`,
  checklist:[
    'docker-compose up local Airflow (LocalExecutor)',
    'Create a DAG: ingest → validate → dbt_run → dbt_test → notify',
    'Use Airflow Connections for credentials — no hardcoded secrets',
    'Add a sensor (FileSensor or GCSObjectExistenceSensor) for upstream dependency',
    'Each task has retries=3 with exponential backoff',
    'on_failure_callback that fires a Slack/email alert (mock is fine)',
    'Pipeline is idempotent — manually rerun a day, verify no duplicates',
    'Add a Cosmos provider task or BashOperator running dbt run + dbt test',
    'Screenshot the Airflow Graph View and Tree View into the README',
    'README with DAG architecture diagram, idempotency design notes, run instructions'
  ],
  deliverable:'GitHub repository URL'
},
p5:{
  ph:'p5',type:'brief',name:'No-Show Prediction ML Pipeline — AI/ML Infra Capstone',xp:280,
  brief:`Build an end-to-end ML pipeline: ingest visits → engineer features → train model → log to MLflow → serve via FastAPI. This is Portfolio Project #3 — your strongest differentiator.`,
  checklist:[
    'Feature engineering pipeline computes: days_since_last_visit, no_show_rate, age, weekday',
    'Use point-in-time correctness — features only use data from BEFORE the visit',
    'Train a scikit-learn model (LogisticRegression or RandomForest) predicting no_show',
    'Log params, metrics, and the model artifact to MLflow',
    'Build a FastAPI POST /predict endpoint loading the MLflow model',
    'Pydantic input validation; return JSON {no_show_probability: float}',
    'Add a /health endpoint and basic logging',
    'Containerise with a Dockerfile',
    'Add a vector DB or RAG component (ChromaDB) for clinical notes retrieval — bonus',
    'README with architecture diagram, MLflow screenshot, sample curl request + response'
  ],
  deliverable:'GitHub repository URL'
},
p6:{
  ph:'p6',type:'brief',name:'Portfolio Launch — Resume + LinkedIn + Applications',xp:300,
  brief:`The final phase is about getting hired. Your three portfolio projects are done. Now you polish, position, and apply. Track your applications in a spreadsheet — quality over quantity.`,
  checklist:[
    'Rewrite resume with target headline: "Data Engineer | SQL · Python · dbt · Airflow · AI/ML Pipelines | Healthcare"',
    'Reframe SEH bullets as DE achievements with quantified impact',
    'Update LinkedIn headline, about section, and skills',
    'Publish 3 project READMEs with architecture diagrams (screenshot them)',
    'Pin the 3 projects on your GitHub profile',
    'Write a 1-line elevator pitch and rehearse it',
    'Identify 20 target companies (remote India + global remote)',
    'Submit 5 quality, customised applications THIS WEEK',
    'Schedule 1 mock interview (peer or paid platform)',
    'Track in a spreadsheet: company, role, date applied, status, notes'
  ],
  deliverable:'GitHub profile URL + LinkedIn URL'
}
};

// ── Phase gating logic ──
// Returns phase id that needs gate clearance, or null.
function gateNeeded(){
  for(const ph of PH){
    const phDays=D.filter(d=>d.ph===ph.id);
    if(phDays.length===0)continue;
    const allDone=phDays.every(d=>S.dn.includes(d.d));
    if(allDone && (!S.tp.includes(ph.id) || !S.pj.includes(ph.id))){
      return ph.id;
    }
  }
  return null;
}

// What stage of the gate: 'test' or 'project'?
function gateStage(phId){
  if(!S.tp.includes(phId))return 'test';
  if(!S.pj.includes(phId))return 'project';
  return null;
}

// ── Test runner ──
let TS={ph:null,i:0,ans:[],done:false};
function startTest(phId){
  TS={ph:phId,i:0,ans:[],done:false};
  renderTest();
}
function renderTest(){
  const t=TESTS[TS.ph];if(!t)return;
  const ph=PH.find(p=>p.id===t.ph);
  if(TS.done){renderTestResult();return;}
  const q=t.q[TS.i];
  const total=t.q.length;
  const tag=q.ty==='sc'?'<span style="font-family:var(--mono);font-size:9px;color:var(--purple);background:rgba(189,147,249,0.12);border:1px solid rgba(189,147,249,0.35);padding:2px 7px;border-radius:99px;margin-left:6px;">SCENARIO</span>':'';
  const opts=q.o.map((o,i)=>`<button class="cho" onclick="answerTest(${i})">${o}</button>`).join('');
  document.getElementById('tcon').innerHTML=`
<div class="card cp su">
  <div class="dh">
    <div class="dn" style="color:var(--gold);background:var(--god);border-color:rgba(255,209,102,0.3);">🧪 ${ph.label} TEST</div>
    <div style="font-family:var(--mono);font-size:10px;color:var(--t3);">${TS.i+1} / ${total}</div>
  </div>
  <div class="dtitle">${t.name}${tag}</div>
  <div class="dsub" style="margin-bottom:14px;">Pass threshold: <b style="color:var(--gold);">${Math.round(t.pass*100)}%</b> · Reward: <b style="color:var(--gold);">+${t.xp} XP</b></div>
  <div class="trk" style="margin-bottom:14px;"><div class="trkf" style="width:${(TS.i/total)*100}%;background:var(--gold);"></div></div>
  <div class="chq">${q.q}</div>
  <div class="chopts">${opts}</div>
</div>`;
  document.querySelector('.main').scrollTop=0;
}
function answerTest(ch){
  const t=TESTS[TS.ph];const q=t.q[TS.i];
  TS.ans.push({ch,ok:ch===q.c,ex:q.ex,c:q.c});
  TS.i++;
  if(TS.i>=t.q.length){TS.done=true;}
  renderTest();
}
function renderTestResult(){
  const t=TESTS[TS.ph];
  const ph=PH.find(p=>p.id===t.ph);
  const correct=TS.ans.filter(a=>a.ok).length;
  const total=t.q.length;
  const pct=correct/total;
  const pass=pct>=t.pass;
  if(pass && !S.tp.includes(t.ph)){
    S.tp.push(t.ph);
    S.xp+=t.xp;
    S.ts[t.ph]={score:correct,total:total,attempts:(S.ts[t.ph]?.attempts||0)+1,pct:pct};
    sv();uhdr();toast('✓ Phase test passed! +'+t.xp+' XP');
  }else if(!pass){
    S.ts[t.ph]={...(S.ts[t.ph]||{}),attempts:(S.ts[t.ph]?.attempts||0)+1,lastPct:pct};
    sv();
  }
  const review=TS.ans.map((a,i)=>{
    const q=t.q[i];
    return `<div class="card" style="background:var(--bg3);margin-bottom:8px;padding:11px;border-color:${a.ok?'rgba(57,255,110,0.3)':'rgba(255,68,102,0.3)'};">
      <div style="font-family:var(--mono);font-size:9px;color:${a.ok?'var(--green)':'var(--red)'};margin-bottom:5px;">Q${i+1} ${a.ok?'✓ CORRECT':'✗ INCORRECT'}</div>
      <div style="font-size:12px;color:var(--t);margin-bottom:6px;line-height:1.5;">${q.q}</div>
      <div style="font-size:11px;color:var(--t2);line-height:1.6;">
        ${a.ok?'':`<div style="margin-bottom:5px;"><b style="color:var(--green);">Correct answer:</b> ${q.o[q.c]}</div>`}
        <div><b style="color:var(--cyan);">Why:</b> ${a.ex}</div>
      </div>
    </div>`;
  }).join('');
  document.getElementById('tcon').innerHTML=`
<div class="card cp su">
  <div class="dh">
    <div class="dn" style="color:${pass?'var(--green)':'var(--red)'};background:${pass?'var(--gd)':'rgba(255,68,102,0.1)'};border-color:${pass?'rgba(57,255,110,0.3)':'rgba(255,68,102,0.3)'};">${pass?'✓ PASSED':'✗ NOT YET'}</div>
    <div style="font-family:var(--mono);font-size:10px;color:var(--gold);">${correct}/${total} · ${Math.round(pct*100)}%</div>
  </div>
  <div class="dtitle">${pass?'You passed the '+ph.label+' test!':'Almost there — review and retry'}</div>
  <div class="dsub" style="margin-bottom:14px;">${pass?'+'+t.xp+' XP awarded. Next: complete the capstone project to unlock the next phase.':'Pass threshold is '+Math.round(t.pass*100)+'%. Review the explanations below and try again.'}</div>
  <div class="cl">REVIEW</div>
  ${review}
  ${pass?
    `<button class="dbtn" onclick="rToday()" style="margin-top:10px;">CONTINUE TO PROJECT →</button>`
    :`<button class="dbtn" onclick="startTest('${t.ph}')" style="margin-top:10px;">RETRY TEST</button>
      <div class="skip" onclick="rToday()">Back</div>`
  }
</div>`;
}

// ── Project rendering ──
function renderProject(phId){
  const p=PROJECTS[phId];
  if(!p)return;
  const ph=PH.find(x=>x.id===phId);
  const done=S.pj.includes(phId);
  if(p.type==='sql-ide'){
    renderSqlIde(phId,done);
    return;
  }
  // Brief + checklist + URL
  const sub=S.pjs[phId]||{checks:[],url:''};
  const checks=p.checklist.map((c,i)=>{
    const checked=sub.checks.includes(i);
    return `<div class="ritem" onclick="togglePjCheck('${phId}',${i})" style="cursor:pointer;align-items:flex-start;">
      <div style="width:18px;height:18px;border:2px solid ${checked?'var(--green)':'var(--b2)'};background:${checked?'var(--gd)':'transparent'};border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
        ${checked?'<span style="color:var(--green);font-weight:700;font-size:12px;">✓</span>':''}
      </div>
      <div class="rtitle" style="font-size:12px;line-height:1.5;${checked?'color:var(--t2);text-decoration:line-through;':''}">${c}</div>
    </div>`;
  }).join('');
  const checkedCount=sub.checks.length;
  const totalChecks=p.checklist.length;
  const allChecked=checkedCount===totalChecks;
  const hasUrl=sub.url && sub.url.trim().length>5 && sub.url.includes('http');
  const canSubmit=allChecked && hasUrl;
  document.getElementById('tcon').innerHTML=`
<div class="card cp su">
  <div class="dh">
    <div class="dn" style="color:var(--purple);background:rgba(189,147,249,0.12);border-color:rgba(189,147,249,0.35);">🚀 ${ph.label} PROJECT</div>
    <div style="font-family:var(--mono);font-size:10px;color:${done?'var(--green)':'var(--gold)'};">${done?'✓ DONE':'+'+p.xp+' XP'}</div>
  </div>
  <div class="dtitle">${p.name}</div>
  <div class="why" style="border-left-color:var(--purple);">${p.brief}</div>
  <div class="cl">CHECKLIST · ${checkedCount}/${totalChecks}</div>
  <div class="rlist">${checks}</div>
  <div class="cl">DELIVERABLE — ${p.deliverable}</div>
  <input type="text" id="pjUrl" value="${(sub.url||'').replace(/"/g,'&quot;')}" placeholder="https://github.com/yourname/repo" class="ci" style="width:100%;margin-bottom:10px;" oninput="setPjUrl('${phId}',this.value)" ${done?'disabled':''}/>
  ${done?
    `<button class="dbtn" disabled style="background:var(--bg4);color:var(--t3);">✓ PROJECT COMPLETE</button>`
    :`<button class="dbtn" onclick="markPjDone('${phId}')" ${canSubmit?'':'disabled'}>${canSubmit?'SUBMIT & MARK COMPLETE →':allChecked?'ADD A VALID URL':'COMPLETE ALL CHECKLIST ITEMS ('+checkedCount+'/'+totalChecks+')'}</button>`
  }
  ${done && S.dn.length<D.length?`<button class="dbtn" onclick="advanceFromGate('${phId}')" style="margin-top:8px;">UNLOCK NEXT PHASE →</button>`:''}
</div>`;
}
function togglePjCheck(phId,i){
  const sub=S.pjs[phId]||{checks:[],url:''};
  if(sub.checks.includes(i)){sub.checks=sub.checks.filter(x=>x!==i);}
  else{sub.checks.push(i);}
  S.pjs[phId]=sub;sv();renderProject(phId);
}
function setPjUrl(phId,v){
  const sub=S.pjs[phId]||{checks:[],url:''};
  sub.url=v;S.pjs[phId]=sub;sv();
  // Live update the submit button without re-rendering whole view
  const allChecked=sub.checks.length===PROJECTS[phId].checklist.length;
  const hasUrl=v && v.trim().length>5 && v.includes('http');
  const btn=document.querySelector('#tcon .dbtn');
  if(btn && !S.pj.includes(phId)){
    btn.disabled=!(allChecked&&hasUrl);
    btn.textContent=(allChecked&&hasUrl)?'SUBMIT & MARK COMPLETE →':allChecked?'ADD A VALID URL':'COMPLETE ALL CHECKLIST ITEMS ('+sub.checks.length+'/'+PROJECTS[phId].checklist.length+')';
  }
}
function markPjDone(phId){
  if(S.pj.includes(phId))return;
  const p=PROJECTS[phId];
  S.pj.push(phId);
  S.xp+=p.xp;sv();uhdr();toast('🏆 '+p.name+' complete! +'+p.xp+' XP');
  renderProject(phId);
}
function advanceFromGate(phId){
  // Find the next phase's first day; set cd to it.
  const idx=PH.findIndex(p=>p.id===phId);
  if(idx<0||idx>=PH.length-1){rToday();return;}
  const next=PH[idx+1];
  const firstDay=D.find(d=>d.ph===next.id);
  if(firstDay){S.cd=firstDay.d;sv();rToday();}
}

// ── Gate dispatcher: called from rToday() ──
function tryRenderGate(){
  const phId=gateNeeded();
  if(!phId)return false;
  const stage=gateStage(phId);
  if(stage==='test'){
    // Show intro card if test not started, else continue test
    if(TS.ph===phId && (!TS.done||TS.i<TESTS[phId].q.length))return renderTest()||true;
    renderGateIntro(phId,'test');
    return true;
  }
  if(stage==='project'){
    renderProject(phId);
    return true;
  }
  return false;
}
function renderGateIntro(phId,stage){
  const ph=PH.find(p=>p.id===phId);
  const t=TESTS[phId];
  const lastTest=S.ts[phId];
  document.getElementById('tcon').innerHTML=`
<div class="card cp su">
  <div class="dh">
    <div class="dn" style="color:var(--gold);background:var(--god);border-color:rgba(255,209,102,0.3);">🔒 GATE — ${ph.label}</div>
    <div style="font-family:var(--mono);font-size:10px;color:var(--gold);">+${t.xp} XP</div>
  </div>
  <div class="dtitle">${ph.name}: Phase Test</div>
  <div class="dsub" style="margin-bottom:14px;">You've completed all ${D.filter(d=>d.ph===phId).length} days of ${ph.label}. Pass this test (≥${Math.round(t.pass*100)}%) to unlock the capstone project.</div>
  <div class="why" style="border-left-color:var(--gold);">
    <b>${t.q.length} questions</b> · MCQs and scenario questions · No time limit · Retry as many times as needed
    ${lastTest?`<br><br><b style="color:var(--t2);">Last attempt:</b> ${Math.round((lastTest.lastPct||lastTest.pct||0)*100)}% (${lastTest.attempts} attempt${lastTest.attempts>1?'s':''})`:''}
  </div>
  <button class="dbtn" onclick="startTest('${phId}')" style="background:var(--gold);">START TEST →</button>
  <div class="skip" onclick="goBackToLastDay()">Review the phase content first</div>
</div>`;
}
function goBackToLastDay(){
  // Go to the last day of the locked phase (read-only view of completed material)
  const phId=gateNeeded();
  if(!phId){rToday();return;}
  const days=D.filter(d=>d.ph===phId);
  const last=days[days.length-1];
  S.cd=last.d;sv();
  // Force the gate skip by temporarily bypassing it; render the day directly.
  renderDayDirect();
}
window.SKIP_GATE_ONCE=false;
function renderDayDirect(){window.SKIP_GATE_ONCE=true;rToday();}
