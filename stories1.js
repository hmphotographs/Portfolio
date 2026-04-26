const BIN_ID  = '69e71a30856a682189574683';
const API_KEY = '$2a$10$rLBOYOLBJqyycZ9BVbDY4.o0Lwj5S65hMZ2//w2sgip5mC6e/PBta';
const BIN_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

let stories = [], activeF = 'all', isSaving = false;

/* ── helpers ── */
function G(id){ return document.getElementById(id); }
function showToast(msg, dur){
  const t=G('toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), dur||2800);
}
function setLoading(on, msg){
  const el=G('loOverlay');
  if(on){ G('loMsg').textContent=msg||'Loading...'; el.classList.add('show'); }
  else { el.classList.remove('show'); }
}
function toHtml(txt){ return '<p>'+txt.replace(/\n\n+/g,'</p><p>').replace(/\n/g,' ')+'</p>'; }
function toText(html){ return html.replace(/<\/p><p>/g,'\n\n').replace(/<\/?p>/g,''); }

/* ── JSONBin ── */

async function loadFromBin() {
  const grid = G('grid');

  /* Step 1: count বের করো cache থেকে অথবা default */
  let count = 6;
  const cached = localStorage.getItem('stories_cache');
  if (cached) {
    try { count = JSON.parse(cached).length; } catch(e) {}
  }

  /* Step 2: Real card structure render করো — sk-loading class দিয়ে */
  const fakeStories = Array.from({ length: count }, (_, i) => ({
    id: i+1, cat: '', eye: String(i+1).padStart(3,'0'),
    title: '', sub: '', loc: '', season: '',
    img: '', story: ''
  }));

  grid.innerHTML = '';
  fakeStories.forEach((s, i) => {
    const card = buildCard(s, i);
    card.classList.add('sk-loading');
    grid.appendChild(card);
    requestAnimationFrame(() => io.observe(card));
  });
  G('countNum').textContent = count;

  /* Step 3: Cache থেকে instantly দেখাও */
   if (cached) {
    try {
      stories = JSON.parse(cached);
      renderReal();
    } catch(e) {}
  } 

  /* Step 4: Fresh data fetch করো */
  try {
    const r = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const json = await r.json();
    if (Array.isArray(json.record) && json.record.length > 0) {
      stories = json.record;
      localStorage.setItem('stories_cache', JSON.stringify(stories));
      renderReal();
    } else {
      await saveToBin(getDefaults());
    }
  } catch(err) {
    console.error(err);
    if (!stories.length) {
      grid.innerHTML = '<p style="grid-column:span 12;text-align:center;padding:80px 0;color:rgba(243,238,231,0.3);font-style:italic">Could not connect.<br><button onclick="loadFromBin()" style="margin-top:16px;padding:10px 24px;background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.35);color:#C9A96E;border-radius:999px;cursor:pointer;font-size:0.7rem;letter-spacing:0.3em">Retry</button></p>';
      G('countNum').textContent = '0';
    }
  }
  setLoading(false);
}

/* Real data এসে গেলে sk-loading সরিয়ে real cards দেখাও */
function renderReal() {
  render(activeF);
}



async function saveToBin(data){
  const r=await fetch(BIN_URL,{method:'PUT',headers:{'Content-Type':'application/json','X-Master-Key':API_KEY},body:JSON.stringify(data)});
  if(!r.ok) throw new Error('Save failed: '+r.status);
  stories=data; render(activeF);
}
function getDefaults(){
  return [
    {id:1,cat:'Nature',eye:'001',title:'Lost Inside the Clouds',sub:'At the mountain peak, a silence where sky and earth forget their boundary',loc:'Himalayas, 4200m',season:'Early Autumn',img:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=90',story:'<p>I woke at five in the morning. Cup of tea in hand, I found the valley wrapped in cloud.</p><p>I grabbed my camera and climbed the steps. Dew underfoot, pine on the wind. Time felt suspended.</p><p>I pressed the shutter. That sound felt absurdly loud in the mountain silence.</p>'},
    {id:2,cat:'City',eye:'002',title:'The City Speaks at Night',sub:'Rain-slicked streets under neon',loc:'Prague, Czech Republic',season:'Late November',img:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=90',story:'<p>After rain the city transforms. Cobblestones shine. I walked out without an umbrella on purpose.</p><p>A figure crossed — red umbrella, yellow raincoat. I watched them double in the water: one real, one upside-down.</p>'},
    {id:3,cat:'People',eye:'003',title:'The Elder Hands',sub:'Ninety years of living written in every crease',loc:'Sylhet, Bangladesh',season:'Winter',img:'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1200&q=90',story:'<p>I met her at the village market. Her eyes looked far away.</p><p>I turned the lens toward her hands. Hands that had planted rice, raised children, wiped tears. Every line was a chapter.</p>'},
    {id:4,cat:'Nature',eye:'004',title:'The Last Colour of Dusk',sub:'The moment that always leaves',loc:'Padma River, Bangladesh',season:'Late Monsoon',img:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=90',story:'<p>First orange. Then pink. Then a colour arrived with no name in any language I know.</p><p>I held the shutter open. Minutes later it was all gone. But locked in the frame forever.</p>'},
    {id:5,cat:'Memory',eye:'005',title:'The Empty Chair',sub:'Absence is a presence too',loc:'Dhaka, Bangladesh',season:'Spring',img:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=90',story:'<p>I visited my grandfather room for the first time in months. Only that chair sat empty by the window.</p><p>I raised the camera because this emptiness was also a truth.</p>'},
    {id:6,cat:'City',eye:'006',title:'The First Rain',sub:'Petrichor and a child laughter',loc:'Chittagong, Bangladesh',season:'Monsoon',img:'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1200&q=90',story:'<p>For weeks the sun had ruled. Then the sky turned pewter and the children burst into the courtyard.</p><p>They danced in the rain. I photographed them from the balcony. They never noticed.</p>'}
  ];
}


/* ── Active nav link ─────────────────────── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (
      (href === 'index.html' && (page === '' || page === 'index.html')) ||
      href === page
    ) {
      link.classList.add('active');
    }
  });
  
 window.addEventListener('scroll', function () {
  let scroll = window.scrollY;

  const bg = document.querySelector('.hdr-bg img');
  bg.style.transform = `translateY(${scroll * 0.25}px)`;
});

  /* ── Custom Cursor ───────────────────────── */
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
    let mx = 0, my = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    document.addEventListener('mouseover', e => {
      const el = e.target.closest('a, button, [role="button"], input, textarea, select, label');
      if (el) {
        ring.classList.add('hovering');
      } else {
        ring.classList.remove('hovering');
      }
    });

    document.addEventListener('mousedown', () => dot.classList.add('clicking'));
    document.addEventListener('mouseup',   () => dot.classList.remove('clicking'));
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

    function animateCursor() {
      dotX  += (mx - dotX) * 0.9;
      dotY  += (my - dotY) * 0.9;
      ringX += (mx - ringX) * 0.12;
      ringY += (my - ringY) * 0.12;

      dot.style.left  = dotX  + 'px';
      dot.style.top   = dotY  + 'px';
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* ── Scroll Progress Bar ─────────────────── */
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress  = docHeight > 0 ? scrollTop / docHeight : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ── Navbar Scroll Effect ────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    function updateNavbar() {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
  }

  /* ── Mobile Menu ─────────────────────────── */
  const toggleBtn    = document.getElementById('menuToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  const menuIconOpen = document.getElementById('iconOpen');
  const menuIconClose= document.getElementById('iconClose');

  if (toggleBtn && mobileMenu) {
    let menuOpen = false;
    toggleBtn.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';
      if (menuIconOpen)  menuIconOpen.style.display  = menuOpen ? 'none' : 'block';
      if (menuIconClose) menuIconClose.style.display = menuOpen ? 'block' : 'none';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        if (menuIconOpen)  menuIconOpen.style.display  = 'block';
        if (menuIconClose) menuIconClose.style.display = 'none';
      });
    });
  }

  /* ── Scroll Reveal ───────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '-40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));
  }


/* ── grid ── */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});
},{threshold:0.07});

function getSlot(i){const p=[0,1,2,3,4,5,6];return i<p.length?p[i]:7+(i%3);}

function buildCard(s,i){
  const card=document.createElement('article');
  card.className='card'; card.tabIndex=0;
  card.setAttribute('data-slot',getSlot(i));
  card.setAttribute('role','button');
  card.style.animationDelay=(i%4)*0.09+'s';
  card.dataset.cat=s.cat;
  card.innerHTML='<div class="card-photo"><img src="'+s.img+'" alt="'+s.title+'" loading="lazy"/><div class="card-overlay"></div><div class="card-line"></div><span class="card-chip">'+s.cat+'</span><span class="card-index">'+s.eye+'</span><div class="card-text"><div class="card-loc">'+(s.loc||'')+'</div><h2 class="card-title">'+s.title+'</h2><p class="card-sub">'+(s.sub||'')+'</p><div class="card-action"><span class="card-cta">Read Story</span><span class="card-arrow">&#8594;</span></div></div></div>';
  card.addEventListener('click',()=>openModal(s));
  card.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();openModal(s);}});
  return card;
}

function render(filter){
  const grid=G('grid'); grid.innerHTML='';
  const list=filter==='all'?stories:stories.filter(s=>s.cat===filter);
  G('countNum').textContent=list.length;
  if(!list.length){
    const msg=document.createElement('p');
    msg.style.cssText='grid-column:span 12;text-align:center;padding:80px 0;color:rgba(243,238,231,0.25);font-style:italic';
    msg.textContent=stories.length?'No stories in this category yet.':'No stories yet.';
    grid.appendChild(msg); return;
  }
  list.forEach((s,i)=>{const c=buildCard(s,i);grid.appendChild(c);requestAnimationFrame(()=>io.observe(c));});
}

G('filterTabs').addEventListener('click',ev=>{
  const tab=ev.target.closest('.ftab'); if(!tab)return;
  document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('on'));
  tab.classList.add('on'); activeF=tab.dataset.f; render(activeF);
});

/* ── modal ── */
const modalWrap=G('modalWrap'), modalBg=G('modalBg');
let cur=0;
function getFL(){return activeF==='all'?stories:stories.filter(s=>s.cat===activeF);}

function openModal(s){
  const list=getFL(); cur=list.findIndex(x=>x.id===s.id); if(cur===-1)cur=0;
  fillModal(list[cur],list); modalWrap.classList.add('open'); document.body.style.overflow='hidden';
}
function fillModal(s,list){
  const scroll=G('mScroll');
  scroll.style.transition='opacity 0.22s ease, transform 0.22s ease';
  scroll.style.opacity='0'; scroll.style.transform='translateY(10px)';
  setTimeout(()=>{
    const img=G('mImg'); img.style.transition='opacity 0.3s ease'; img.style.opacity='0';
    G('mChip').textContent=s.cat; G('mLoc').textContent=s.loc||'';
    G('mSeason').textContent=s.season||''; G('mEye').textContent='Story #'+s.eye;
    G('mTitle').textContent=s.title; G('mSub').textContent=s.sub||'';
    G('mStory').innerHTML=s.story; scroll.scrollTop=0;
    G('navCurrent').textContent=cur+1; G('navTotal').textContent=list.length;
    G('modalPrev').disabled=cur===0; G('modalNext').disabled=cur===list.length-1;
    img.src=s.img; img.onload=()=>{img.style.opacity='1';};
    scroll.style.transform='translateY(-10px)';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{scroll.style.opacity='1';scroll.style.transform='translateY(0)';}));
  },220);
}
function closeModal(){modalWrap.classList.remove('open');document.body.style.overflow='';}
G('modalClose').addEventListener('click',closeModal);
modalBg.addEventListener('click',closeModal);
G('modalPrev').addEventListener('click',()=>{const l=getFL();if(cur>0){cur--;fillModal(l[cur],l);}});
G('modalNext').addEventListener('click',()=>{const l=getFL();if(cur<l.length-1){cur++;fillModal(l[cur],l);}});

/* ── password gate ── */
const ADMIN_PW='HmPhoto909';
function openPwGate(){
  G('pwInput').value=''; G('pwErr').textContent='';
  G('pwInput').classList.remove('shake');
  G('pwOverlay').classList.add('open');
  setTimeout(()=>G('pwInput').focus(),300);
  document.body.style.overflow='hidden';
}
function closePwGate(){G('pwOverlay').classList.remove('open');document.body.style.overflow='';}
function tryUnlock(){
  if(G('pwInput').value===ADMIN_PW){
    closePwGate(); G('adminWrap').classList.add('open');
    document.body.style.overflow='hidden'; refreshList(); showToast('Welcome');
  } else {
    G('pwInput').value='';
    G('pwInput').classList.add('shake');
    G('pwErr').textContent='Incorrect password.';
    setTimeout(()=>G('pwInput').classList.remove('shake'),500);
    G('pwInput').focus();
  }
}
G('pwSubmitBtn').addEventListener('click',tryUnlock);
G('pwCloseBtn').addEventListener('click',closePwGate);
G('pwOverlay').addEventListener('click',ev=>{if(ev.target===G('pwOverlay'))closePwGate();});
G('pwInput').addEventListener('keydown',ev=>{if(ev.key==='Enter')tryUnlock();});
G('pwEyeBtn').addEventListener('click',()=>{
  const inp=G('pwInput'); const isT=inp.type==='text';
  inp.type=isT?'password':'text';
  G('pwEyeBtn').textContent=isT?'👁':'🙈';
});

/* ── admin ── */
function openAdmin(){openPwGate();}
function closeAdmin(){G('adminWrap').classList.remove('open');document.body.style.overflow='';}
G('adminFab').addEventListener('click',openAdmin);
G('openAdmin').addEventListener('click',openAdmin);
G('adminClose').addEventListener('click',closeAdmin);
G('adminBg').addEventListener('click',closeAdmin);
document.querySelectorAll('.admin-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('on'));
    document.querySelectorAll('.admin-pane').forEach(p=>p.classList.remove('active'));
    tab.classList.add('on');
    G('pane-'+tab.dataset.pane).classList.add('active');
    if(tab.dataset.pane==='manage')refreshList();
  });
});

/* ── image upload ── */
let uploadedImg='';
G('imgFileInput').addEventListener('change',function(){
  const file=this.files[0]; if(!file)return;
  if(file.size>5*1024*1024){showToast('Too large — use a URL');return;}
  const reader=new FileReader();
  reader.onload=ev=>{uploadedImg=ev.target.result;const p=G('imgPreview');p.src=uploadedImg;p.style.display='block';G('nImg').value='';showToast('Photo ready');};
  reader.readAsDataURL(file);
});

/* ── add story ── */
G('doSubmit').addEventListener('click',async()=>{
  if(isSaving)return;
  const imgUrl=G('nImg').value.trim(), title=G('nTitle').value.trim();
  const sub=G('nSub').value.trim(), stTxt=G('nStory').value.trim();
  const cat=G('nCat').value.trim()||'Uncategorised';
  const loc=G('nLoc').value.trim()||'', season=G('nSeason').value.trim()||'';
  if(!title){showToast('Please add a title');return;}
  const finalImg=uploadedImg||imgUrl||'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=90';
  const storyHtml=stTxt?toHtml(stTxt):'<p>No story written yet.</p>';
  const maxId=stories.reduce((mx,s)=>Math.max(mx,s.id),0), newId=maxId+1;
  const ns={id:newId,cat,eye:String(newId).padStart(3,'0'),title,sub,loc,season,img:finalImg,story:storyHtml};
  isSaving=true; setLoading(true,'Saving story...');
  try{
    await saveToBin([...stories,ns]);
    ['nImg','nTitle','nSub','nStory','nCat','nLoc','nSeason'].forEach(id=>{G(id).value='';});
    uploadedImg=''; G('imgPreview').style.display='none'; G('imgPreview').src='';
    activeF='all'; document.querySelectorAll('.ftab').forEach(t=>t.classList.toggle('on',t.dataset.f==='all'));
    closeAdmin(); showToast('Story published');
    setTimeout(()=>{const g=G('grid');g.lastElementChild&&g.lastElementChild.scrollIntoView({behavior:'smooth',block:'center'});},500);
  }catch(err){showToast('Failed to save',4000);console.error(err);}
  isSaving=false; setLoading(false);
});

/* ── story list ── */
function refreshList(){
  const el=G('storyList'); el.innerHTML='';
  if(!stories.length){el.innerHTML='<p style="color:rgba(243,238,231,0.25);font-style:italic;padding:20px 0">No stories yet.</p>';return;}
  stories.forEach(s=>{
    const item=document.createElement('div'); item.className='story-list-item';
    item.innerHTML='<img class="sli-thumb" src="'+s.img+'" alt=""/><div class="sli-info"><div class="sli-title">'+s.title+'</div><div class="sli-meta">'+s.cat+(s.loc?' &middot; '+s.loc:'')+'</div></div><div class="sli-actions"><button class="sli-btn" data-edit="'+s.id+'">&#9998;</button><button class="sli-btn del" data-del="'+s.id+'">&#128465;</button></div>';
    el.appendChild(item);
  });
  el.addEventListener('click',ev=>{
    const e=ev.target.dataset.edit, d=ev.target.dataset.del;
    if(e)openEdit(parseInt(e)); if(d)delStory(parseInt(d));
  });
}

/* ── delete ── */
async function delStory(id){
  if(!confirm('Delete this story?'))return;
  setLoading(true,'Deleting...');
  try{await saveToBin(stories.filter(s=>s.id!==id));refreshList();showToast('Deleted');}
  catch(err){showToast('Failed',4000);}
  setLoading(false);
}

/* ── edit ── */
function openEdit(id){
  const s=stories.find(x=>x.id===id); if(!s)return;
  G('eId').value=id; G('eImg').value=s.img; G('eTitle').value=s.title;
  G('eSub').value=s.sub||''; G('eLoc').value=s.loc||'';
  G('eSeason').value=s.season||''; G('eCat').value=s.cat;
  G('eStory').value=toText(s.story);
  G('editWrap').classList.add('open');
  setTimeout(()=>{G('editWrap').querySelector('.admin-panel').style.transform='translateX(-50%) scale(1)';},10);
}
function closeEdit(){
  G('editWrap').querySelector('.admin-panel').style.transform='translateX(-50%) scale(0.95)';
  setTimeout(()=>G('editWrap').classList.remove('open'),400);
}
G('editClose').addEventListener('click',closeEdit);
G('editBg').addEventListener('click',closeEdit);
G('doEdit').addEventListener('click',async()=>{
  if(isSaving)return;
  const id=parseInt(G('eId').value), idx=stories.findIndex(s=>s.id===id); if(idx===-1)return;
  const stTxt=G('eStory').value.trim();
  const updated=stories.map((s,i)=>i!==idx?s:{...s,
    img:G('eImg').value.trim()||s.img, title:G('eTitle').value.trim()||s.title,
    sub:G('eSub').value.trim(), loc:G('eLoc').value.trim(),
    season:G('eSeason').value.trim(), cat:G('eCat').value.trim()||s.cat,
    story:stTxt?toHtml(stTxt):s.story
  });
  isSaving=true; setLoading(true,'Saving...');
  try{await saveToBin(updated);refreshList();closeEdit();showToast('Updated');}
  catch(err){showToast('Failed',4000);}
  isSaving=false; setLoading(false);
});

/* ── reset/export ── */
G('resetBtn').addEventListener('click',async()=>{
  if(!confirm('Reset to default 6 stories?'))return;
  setLoading(true,'Resetting...');
  try{await saveToBin(getDefaults());refreshList();showToast('Reset done');}
  catch(err){showToast('Failed',4000);}
  setLoading(false);
});
function doExport(){
  const blob=new Blob([JSON.stringify(stories,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download='stories.json'; a.click(); URL.revokeObjectURL(url); showToast('Exported');
}
G('exportBtn').addEventListener('click',doExport);
G('exportBtn2').addEventListener('click',doExport);

/* ── keyboard ── */
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'){closeModal();closeAdmin();closeEdit();closePwGate();}
  if(!modalWrap.classList.contains('open'))return;
  if(ev.key==='ArrowRight')G('modalNext').click();
  if(ev.key==='ArrowLeft')G('modalPrev').click();
});

/* ── boot ── */
loadFromBin();
