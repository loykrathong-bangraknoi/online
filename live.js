(function(){
  const CFG = (window.LIVE_CONFIG||{});
  if (!CFG.provider || CFG.provider === 'none'){
    window.LiveStore = { init(){}, send: async ()=>Promise.resolve(), onNew(){} };
    return;
  }
  function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  async function initFirebase(){
    await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js');
    const app = firebase.initializeApp(CFG.firebase);
    const db = firebase.database();
    return {db};
  }
  let dbRef = null; let onNewCB = ()=>{};
  window.LiveStore = {
    async init(){
      try{
        const {db} = await initFirebase();
        dbRef = db.ref('/'+ (CFG.channel||'default'));
        dbRef.limitToLast(1).on('child_added', (snap)=>{
          const val = snap.val(); if (!val) return; onNewCB(val);
        });
      }catch(e){ console.warn('Live disabled:', e); }
    },
    async send(rec){
      if(!dbRef) return;
      const key = Date.now()+'_'+Math.random().toString(36).slice(2);
      await dbRef.child(key).set(rec);
    },
    onNew(fn){ onNewCB = fn; }
  };
})();