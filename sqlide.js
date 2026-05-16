// ── In-browser SQL IDE for Phase 1 project ──
// Uses sql.js (SQLite WASM) loaded from CDN.
// Single source of truth for the loaded DB instance.
let SQLDB=null;
let SQLREADY=false;
let SQLLOADING=false;

async function loadSqlJs(){
  if(SQLREADY)return;
  if(SQLLOADING){
    // wait
    while(!SQLREADY)await new Promise(r=>setTimeout(r,100));
    return;
  }
  SQLLOADING=true;
  await new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
    s.onload=resolve;s.onerror=reject;
    document.head.appendChild(s);
  });
  const SQL=await initSqlJs({locateFile:f=>'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/'+f});
  SQLDB=new SQL.Database();
  SQLDB.exec(PROJECTS.p1.seed);
  SQLREADY=true;SQLLOADING=false;
}

function renderSqlIde(phId,done){
  const p=PROJECTS[phId];
  const ph=PH.find(x=>x.id===phId);
  const sub=S.pjs[phId]||{passed:[],lastSql:{}};
  const passedSet=new Set(sub.passed||[]);
  const totalC=p.challenges.length;
  const doneC=passedSet.size;
  const allPassed=doneC===totalC;

  const challengeList=p.challenges.map((c,i)=>{
    const passed=passedSet.has(c.id);
    const last=(sub.lastSql||{})[c.id]||'';
    return `<div class="card" style="background:var(--bg3);margin-bottom:10px;padding:11px;border-color:${passed?'rgba(57,255,110,0.35)':'var(--b2)'};">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px;">
        <div style="font-family:var(--mono);font-size:9px;color:${passed?'var(--green)':'var(--gold)'};letter-spacing:0.1em;">CHALLENGE ${i+1} ${passed?'✓ PASSED':''}</div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--t3);">${c.title}</div>
      </div>
      <div style="font-size:12px;color:var(--t);margin-bottom:8px;line-height:1.55;">${c.prompt}</div>
      <textarea id="sql_${c.id}" class="sqlta" placeholder="-- write your SELECT here" ${done?'disabled':''}>${last.replace(/</g,'&lt;')}</textarea>
      <div style="display:flex;gap:6px;margin-top:6px;">
        <button class="cbtn" onclick="runSql('${phId}','${c.id}')" ${done?'disabled':''}>▶ RUN</button>
        <button class="cbtn" onclick="checkSql('${phId}','${c.id}')" ${done?'disabled':''} style="background:var(--gold);color:#000;">✓ CHECK</button>
        <button class="cbtn" onclick="showHint('${phId}','${c.id}')" style="background:var(--bg4);color:var(--t2);">HINT</button>
      </div>
      <div id="hint_${c.id}" style="display:none;font-size:11px;color:var(--cyan);background:var(--cd);border-left:2px solid var(--cyan);padding:7px 10px;margin-top:7px;border-radius:0 var(--r2) var(--r2) 0;">${c.hint}</div>
      <div id="out_${c.id}" style="margin-top:8px;"></div>
    </div>`;
  }).join('');

  document.getElementById('tcon').innerHTML=`
<div class="card cp su">
  <div class="dh">
    <div class="dn" style="color:var(--purple);background:rgba(189,147,249,0.12);border-color:rgba(189,147,249,0.35);">🚀 ${ph.label} PROJECT</div>
    <div style="font-family:var(--mono);font-size:10px;color:${done?'var(--green)':'var(--gold)'};">${done?'✓ DONE':'+'+p.xp+' XP'}</div>
  </div>
  <div class="dtitle">${p.name}</div>
  <div class="why" style="border-left-color:var(--purple);">${p.brief}</div>
  <div class="cl">SCHEMA</div>
  <pre style="background:var(--bg3);padding:10px 12px;border-radius:var(--r2);font-family:var(--mono);font-size:10px;color:var(--t2);line-height:1.6;overflow-x:auto;margin-bottom:14px;">${p.schema}</pre>
  <div id="sqlStatus" style="font-family:var(--mono);font-size:10px;color:var(--t3);margin-bottom:10px;">⏳ Loading SQL engine…</div>
  <div class="cl">CHALLENGES · ${doneC}/${totalC} PASSED</div>
  ${challengeList}
  ${done?
    `<button class="dbtn" disabled style="background:var(--bg4);color:var(--t3);">✓ ALL CHALLENGES COMPLETE</button>
     <button class="dbtn" onclick="advanceFromGate('${phId}')" style="margin-top:8px;">UNLOCK PHASE 2 →</button>`
    :allPassed?
    `<button class="dbtn" onclick="markPjDone('${phId}')">SUBMIT — MARK PROJECT COMPLETE →</button>`
    :`<button class="dbtn" disabled>PASS ALL ${totalC} CHALLENGES (${doneC}/${totalC})</button>`
  }
</div>`;

  // Init sql.js then enable UI
  loadSqlJs().then(()=>{
    const st=document.getElementById('sqlStatus');
    if(st){st.innerHTML='✓ SQL engine ready · SQLite in your browser';st.style.color='var(--green)';}
  }).catch(e=>{
    const st=document.getElementById('sqlStatus');
    if(st){st.innerHTML='✗ Failed to load SQL engine — check your internet';st.style.color='var(--red)';}
    console.error(e);
  });
}

function showHint(phId,cid){
  const el=document.getElementById('hint_'+cid);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}

function runSqlQuery(sql){
  if(!SQLREADY)throw new Error('SQL engine not ready');
  const res=SQLDB.exec(sql);
  if(res.length===0)return {cols:[],rows:[]};
  const r=res[0];
  return {cols:r.columns, rows:r.values.map(row=>{
    const obj={};r.columns.forEach((c,i)=>obj[c]=row[i]);return obj;
  })};
}

function runSql(phId,cid){
  const ta=document.getElementById('sql_'+cid);
  const sql=ta.value.trim();
  const out=document.getElementById('out_'+cid);
  // persist
  const sub=S.pjs[phId]||{passed:[],lastSql:{}};
  sub.lastSql=sub.lastSql||{};sub.lastSql[cid]=sql;S.pjs[phId]=sub;sv();
  if(!sql){out.innerHTML='<div class="sqlerr">Empty query</div>';return null;}
  if(!SQLREADY){out.innerHTML='<div class="sqlerr">SQL engine still loading…</div>';return null;}
  try{
    const r=runSqlQuery(sql);
    if(r.rows.length===0){
      out.innerHTML='<div class="sqlerr" style="border-left-color:var(--gold);color:var(--gold);background:var(--god);">⚠ Query ran but returned 0 rows</div>';
      return r;
    }
    const head='<tr>'+r.cols.map(c=>`<th>${c}</th>`).join('')+'</tr>';
    const body=r.rows.slice(0,20).map(row=>'<tr>'+r.cols.map(c=>`<td>${row[c]===null?'<i>NULL</i>':row[c]}</td>`).join('')+'</tr>').join('');
    const more=r.rows.length>20?`<div style="font-family:var(--mono);font-size:9px;color:var(--t3);padding:5px 0;">…and ${r.rows.length-20} more rows</div>`:'';
    out.innerHTML=`<div class="sqltbl-wrap"><table class="sqltbl">${head}${body}</table></div>${more}<div style="font-family:var(--mono);font-size:9px;color:var(--green);margin-top:4px;">✓ ${r.rows.length} row${r.rows.length===1?'':'s'}</div>`;
    return r;
  }catch(e){
    out.innerHTML=`<div class="sqlerr">SQL error: ${e.message}</div>`;
    return null;
  }
}

function checkSql(phId,cid){
  const result=runSql(phId,cid);
  if(!result)return;
  const p=PROJECTS[phId];
  const ch=p.challenges.find(c=>c.id===cid);
  const out=document.getElementById('out_'+cid);
  let pass=false;
  try{pass=ch.check(result.rows);}catch(e){pass=false;}
  if(pass){
    const sub=S.pjs[phId]||{passed:[],lastSql:{}};
    sub.passed=sub.passed||[];
    if(!sub.passed.includes(cid)){
      sub.passed.push(cid);S.pjs[phId]=sub;
      S.xp+=20;sv();uhdr();toast('Challenge passed! +20 XP');
    }
    out.innerHTML+='<div style="margin-top:6px;font-family:var(--mono);font-size:10px;color:var(--green);background:var(--gd);border-left:2px solid var(--green);padding:6px 10px;border-radius:0 var(--r2) var(--r2) 0;">✓ Challenge passed!</div>';
    // Re-render after a beat to update header counts
    setTimeout(()=>renderSqlIde(phId,false),900);
  }else{
    out.innerHTML+='<div class="sqlerr" style="border-left-color:var(--red);">✗ Output does not match expected. Check column names, ordering, and filter conditions.</div>';
  }
}
