(function(){
  const area = document.getElementById('floatArea');
  const btn = document.getElementById('floatBtn');
  const wishText = document.getElementById('wishText');
  const fwBox = document.getElementById('fireworks');
  let ktype = 'krathong1';

  document.querySelectorAll('.kbtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('.kbtn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      ktype = b.dataset.type || 'krathong1';
    });
  });

  function addWish(text){
    const arr = JSON.parse(localStorage.getItem('wishes')||'[]');
    const rec = {text, time: Date.now(), type: ktype};
    if(text) arr.push(rec);
    localStorage.setItem('wishes', JSON.stringify(arr));
    if (window.LiveStore && text) window.LiveStore.send(rec).catch(()=>{});
  }

  function fire(){
    if(!fwBox) return;
    const N = 14 + Math.floor(Math.random()*10);
    const cx = (Math.random()*60 + 20);
    const cy = (Math.random()*20 + 8);
    for(let i=0;i<N;i++){
      const s = document.createElement('div');
      s.className = 'fw';
      const a = (Math.PI*2)*(i/N);
      const r = 120 + Math.random()*80;
      const dx = Math.cos(a)*r, dy = Math.sin(a)*r;
      s.style.left = cx+'%';
      s.style.top  = cy+'%';
      s.style.setProperty('--tr', `translate(${dx}px, ${dy}px)`);
      fwBox.appendChild(s);
      s.addEventListener('animationend', ()=>s.remove(), {once:true});
    }
  }

  function spawn(rec){
    const river = document.getElementById('river');
    if(!river) return;

    const el = document.createElement('div');
    el.className = 'krathong';
    const img = new Image();
    const typeToUse = (rec && rec.type) ? rec.type : ktype;
    img.src = `assets/${typeToUse}.png`;
    img.alt = 'กระทง';
    el.appendChild(img);
    area.appendChild(el);

    function start(){
      const H  = river.clientHeight;
      const wl = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--waterline')) || 0.62;
      const kh = (img.naturalHeight || 120);
      const waterline = H * wl;
      const bobOffset = kh * 0.62;
      const jitter    = (H*0.04) * (Math.random()-0.5);
      el.style.left = '-160px';
      el.style.top  = (waterline - bobOffset + jitter) + 'px';

      const runW   = area.clientWidth + 360;
      const speed  = 40 + Math.random()*30;
      const amp    = 5  + Math.random()*7;
      const freq   = 1.4 + Math.random()*0.6;

      let x = -160;
      let t0 = performance.now();
      function tick(now){
        const dt = (now - t0)/1000; t0 = now;
        x += speed * dt;
        const y = Math.sin(now/1000*freq*2*Math.PI) * amp;
        el.style.transform = `translate(${x}px, ${y}px)`;
        if (x < runW) requestAnimationFrame(tick); else el.remove();
      }
      requestAnimationFrame(tick);
    }
    if (img.complete) start(); else img.onload = start;
  }

  if (btn){
    btn.addEventListener('click', ()=>{
      const text = (wishText?.value || '').trim();
      const rec = {text, time: Date.now(), type: ktype};
      addWish(text);
      spawn(rec);
      fire();
      if (wishText) wishText.value = '';
    });
  }

  if (window.LiveStore){
    window.LiveStore.onNew((rec)=>{ spawn(rec); });
    window.LiveStore.init();
  }

  const shareWrap = document.querySelector('.share-wrap');
  function shareTo(app){
    const url = window.__SHARE_URL__ || location.href;
    const text = window.__SHARE_TEXT__ || document.title;
    if (navigator.share && (app==='copy' || app==='tiktok')){
      navigator.share({title: document.title, text, url}).catch(()=>{});
      if(app==='tiktok'){ navigator.clipboard?.writeText(url); }
      return;
    }
    let shareURL = '';
    if (app==='facebook'){
      shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    } else if (app==='line'){
      shareURL = `https://line.me/R/msg/text/?${encodeURIComponent(text + ' ' + url)}`;
    } else if (app==='x'){
      shareURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (app==='tiktok'){
      navigator.clipboard?.writeText(url);
      shareURL = `https://www.tiktok.com/`;
    } else if (app==='copy'){
      navigator.clipboard?.writeText(url); alert('คัดลอกลิงก์แล้ว'); return;
    }
    if (shareURL) window.open(shareURL,'_blank','noopener');
  }
  if (shareWrap){
    shareWrap.addEventListener('click', (e)=>{
      const b = e.target.closest('.sbtn'); if(!b) return;
      shareTo(b.dataset.app);
    });
  }
})();