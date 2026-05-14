// ── Cloud Sync with Firebase Realtime Database ──
// Set your Firebase Realtime Database URL below (from Firebase Console)
const FIREBASE_URL = ''; // e.g. 'https://your-project-default-rtdb.firebaseio.com'

let ALIAS = '';
let cloudReady = false;
let syncTimer = null;

// Wrap the original sv() to also push to cloud
const _localSv = sv;
sv = function(){
  _localSv();
  if(cloudReady && ALIAS && FIREBASE_URL) debouncedSync();
};

function debouncedSync(){
  if(syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(pushToCloud, 1500);
}

async function pushToCloud(){
  if(!FIREBASE_URL || !ALIAS) return;
  try{
    const payload = {...S, lastSync: new Date().toISOString(), alias: ALIAS};
    await fetch(FIREBASE_URL+'/users/'+encodeURIComponent(ALIAS)+'.json',{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    showSyncStatus('☁️ Synced');
  }catch(e){
    showSyncStatus('⚠️ Offline');
    console.warn('Cloud push failed:',e);
  }
}

async function pullFromCloud(){
  if(!FIREBASE_URL || !ALIAS) return false;
  try{
    const res = await fetch(FIREBASE_URL+'/users/'+encodeURIComponent(ALIAS)+'.json');
    const data = await res.json();
    if(data && data.xp !== undefined){
      // Use cloud data if it has more progress
      if(data.dn && (data.dn.length > S.dn.length || data.xp > S.xp)){
        S = {...DEF, ...data};
        delete S.lastSync; delete S.alias;
        _localSv();
        return true;
      }
    }
  }catch(e){
    console.warn('Cloud pull failed:',e);
  }
  return false;
}

function showSyncStatus(txt){
  let el = document.getElementById('syncSt');
  if(!el){
    el = document.createElement('div');
    el.id = 'syncSt';
    el.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:9px;color:var(--cyan);background:var(--cd);border:1px solid rgba(0,212,255,0.3);padding:3px 10px;border-radius:99px;z-index:300;opacity:0;transition:opacity .3s;';
    document.body.appendChild(el);
  }
  el.textContent = txt;
  el.style.opacity = '1';
  setTimeout(()=>{ el.style.opacity = '0'; }, 2000);
}

// ── Alias Login Screen ──
function showAliasScreen(){
  const saved = localStorage.getItem('pq_alias');
  if(saved){
    ALIAS = saved;
    startWithCloud();
    return;
  }
  const ov = document.createElement('div');
  ov.id = 'aliasOv';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;';
  ov.innerHTML = `
  <div style="width:100%;max-width:380px;text-align:center;">
    <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--pipe);letter-spacing:0.15em;margin-bottom:6px;">PIPELINE<span style="color:var(--t3)">/</span>QUEST</div>
    <div style="font-size:22px;font-weight:800;margin-bottom:4px;">Welcome, Future DE 🚀</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:28px;line-height:1.6;">120 days to Data Engineer + AI/ML specialist.<br>Your progress syncs across all your devices.</div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--gold);letter-spacing:0.12em;margin-bottom:8px;text-align:left;">YOUR ALIAS</div>
    <input id="aliasIn" type="text" placeholder="e.g. ravi, pipeline_ninja, your_name"
      style="width:100%;background:var(--bg3);border:1px solid var(--b2);border-radius:var(--r2);padding:14px 16px;font-size:15px;color:var(--t);font-family:var(--body);outline:none;margin-bottom:6px;"
      onkeydown="if(event.key==='Enter')submitAlias()"
      autofocus />
    <div style="font-size:11px;color:var(--t3);margin-bottom:20px;">This is your save ID. Use the same alias on all devices.</div>
    <button onclick="submitAlias()"
      style="width:100%;background:var(--pipe);color:#000;border:none;border-radius:var(--r2);padding:14px;font-size:15px;font-weight:700;font-family:var(--mono);letter-spacing:0.05em;cursor:pointer;">
      START QUEST →
    </button>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--b2);">
      <div style="font-family:var(--mono);font-size:9px;color:var(--t3);letter-spacing:0.1em;margin-bottom:8px;">FIREBASE DATABASE URL (optional)</div>
      <input id="fbUrlIn" type="text" placeholder="https://your-project-default-rtdb.firebaseio.com"
        value="${FIREBASE_URL||localStorage.getItem('pq_fburl')||''}"
        style="width:100%;background:var(--bg3);border:1px solid var(--b);border-radius:var(--r2);padding:10px 12px;font-size:11px;color:var(--t2);font-family:var(--mono);outline:none;" />
      <div style="font-size:10px;color:var(--t3);margin-top:4px;">Leave blank = local-only (no cloud sync)</div>
    </div>
  </div>`;
  document.body.appendChild(ov);
  setTimeout(()=>{document.getElementById('aliasIn').focus();},100);
}

function submitAlias(){
  const inp = document.getElementById('aliasIn');
  const name = inp.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g,'');
  if(!name || name.length < 2){
    inp.style.borderColor = 'var(--red)';
    inp.placeholder = 'Enter at least 2 characters';
    return;
  }
  ALIAS = name;
  localStorage.setItem('pq_alias', ALIAS);

  // Save Firebase URL if provided
  const fbInp = document.getElementById('fbUrlIn');
  if(fbInp && fbInp.value.trim()){
    const url = fbInp.value.trim().replace(/\/$/,'');
    localStorage.setItem('pq_fburl', url);
    // We need to update the "constant" — use window trick
    window._FIREBASE_URL = url;
  }

  document.getElementById('aliasOv').remove();
  startWithCloud();
}

async function startWithCloud(){
  // Load Firebase URL from storage if not hardcoded
  if(!FIREBASE_URL){
    const stored = localStorage.getItem('pq_fburl');
    if(stored) window._FIREBASE_URL = stored;
  }
  const fbUrl = FIREBASE_URL || window._FIREBASE_URL || '';

  if(fbUrl){
    // Temporarily set for fetch calls
    const origUrl = FIREBASE_URL;
    // Override the const via a getter workaround — just use window global
    window._fbUrl = fbUrl;
    showSyncStatus('☁️ Loading...');
    const pulled = await pullFromCloudDirect(fbUrl);
    if(pulled) showSyncStatus('☁️ Progress restored!');
    cloudReady = true;
  }

  // Update alias display
  const aliasEl = document.getElementById('hAlias');
  if(aliasEl) aliasEl.textContent = ALIAS;

  init();
}

async function pullFromCloudDirect(url){
  if(!url || !ALIAS) return false;
  try{
    const res = await fetch(url+'/users/'+encodeURIComponent(ALIAS)+'.json');
    const data = await res.json();
    if(data && data.xp !== undefined){
      if(data.dn && (data.dn.length > S.dn.length || data.xp > S.xp)){
        S = {...DEF, ...data};
        delete S.lastSync; delete S.alias;
        _localSv();
        return true;
      }
    }
  }catch(e){ console.warn('Pull failed:',e); }
  return false;
}

// Override pushToCloud to use dynamic URL
const _origPush = pushToCloud;
pushToCloud = async function(){
  const url = FIREBASE_URL || window._FIREBASE_URL || window._fbUrl || '';
  if(!url || !ALIAS) return;
  try{
    const payload = {...S, lastSync: new Date().toISOString(), alias: ALIAS};
    await fetch(url+'/users/'+encodeURIComponent(ALIAS)+'.json',{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    showSyncStatus('☁️ Synced');
  }catch(e){
    showSyncStatus('⚠️ Offline');
  }
};

// Start the app — show alias screen instead of direct init
showAliasScreen();
