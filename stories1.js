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
/* Read — stories.json থেকে (fast) */
async function loadStories() {
  /* Instant: cache থেকে আগে দেখাও */
  const cached = localStorage.getItem('stories_cache');
  if (cached) {
    try {
      stories = JSON.parse(cached);
      render(activeF);
      updateStats();
      buildMoodboard();
    } catch(e) {}
  } else {
    showSkeletons();
  }

  /* JSON file থেকে fresh data নাও */
  try {
    const r = await fetch('stories.json?v=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    stories = await r.json();
    localStorage.setItem('stories_cache', JSON.stringify(stories));
    render(activeF);
    updateStats();
  } catch(err) {
    console.error('Could not load stories.json:', err);
    if (!stories.length) {
      G('grid').innerHTML = '<p style="grid-column:span 12;text-align:center;padding:80px 0;color:rgba(243,238,231,0.3);font-style:italic">Could not load stories.<br><button onclick="loadStories()" style="margin-top:16px;padding:10px 24px;background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.35);color:#C9A96E;border-radius:999px;cursor:pointer;font-size:0.7rem;letter-spacing:0.3em">Retry</button></p>';
      G('countNum').textContent = '0';
    }
  }
  setLoading(false);
}

/* Write — JSONBin এ (admin only) */
async function saveToBin(data) {
  const r = await fetch(BIN_URL, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body:    JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Save failed: ' + r.status);
  stories = data;
  localStorage.setItem('stories_cache', JSON.stringify(data));
  render(activeF);
  updateStats();
  /* Remind to update stories.json */
  showToast('Saved ✓ — Download stories.json to update site');
}
  

/* Real data এসে গেলে sk-loading সরিয়ে real cards দেখাও */
function renderReal() {
  document.querySelectorAll('.sk-text-wrap').forEach(el => el.remove());
  render(activeF);
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
  card.innerHTML='<div class="card-photo"><img src="'+s.img+'" alt="'+s.title+'" loading="lazy"/><div class="card-overlay"></div><div class="card-line"></div><span class="card-chip">'+s.cat+'</span><span class="card-index">'+s.eye+'</span><div class="card-text"><div class="card-loc">'+(s.loc||'')+'</div><h2 class="card-title">'+s.title+'</h2><p class="card-sub">'+(s.sub||'')+'</p><div class="card-action"><span class="card-cta">Read Story</span><span class="card-arrow">&#8594;</span></div></div></div><div class="card-light"></div>';
  
  
  card.addEventListener('click', ev => {
  spawnParticles(ev.clientX, ev.clientY);
  setTimeout(() => openModal(s), 180);
});
  
  /* Blur-up effect */
const img = card.querySelector('img');
img.classList.add('blur-loading');
img.addEventListener('load', () => {
  img.classList.remove('blur-loading');
  img.classList.add('blur-loaded');
});
img.addEventListener('error', () => {
  img.classList.remove('blur-loading');
  img.classList.add('blur-loaded');
});
/* যদি আগেই cached হয়ে থাকে */
if (img.complete && img.naturalWidth > 0) {
  img.classList.remove('blur-loading');
  img.classList.add('blur-loaded');
}
  
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
    
    /* EXIF data */
const exifEye    = document.getElementById('exifEye');
const exifLoc    = document.getElementById('exifLoc');
const exifSeason = document.getElementById('exifSeason');
const exifCat    = document.getElementById('exifCat');
if (exifEye)    exifEye.textContent    = 'No. ' + (s.eye || '—');
if (exifLoc)    exifLoc.textContent    = s.loc    || '—';
if (exifSeason) exifSeason.textContent = s.season || '—';
if (exifCat)    exifCat.textContent    = s.cat    || '—';


    requestAnimationFrame(()=>requestAnimationFrame(()=>{scroll.style.opacity='1';scroll.style.transform='translateY(0)';}));
  },220);
}
function closeModal(){modalWrap.classList.remove('open');document.body.style.overflow='';document.getElementById('modalBg').style.background = '';}
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
    item.innerHTML='<img class="sli-thumb" src="'+s.img+'" alt="" loading="lazy"/><div class="sli-info"><div class="sli-title">'+s.title+'</div><div class="sli-meta">'+s.cat+(s.loc?' &middot; '+s.loc:'')+'</div></div><div class="sli-actions"><button class="sli-btn" data-edit="'+s.id+'">&#9998;</button><button class="sli-btn del" data-del="'+s.id+'">&#128465;</button></div>';
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


/* ------ Particle Brust ------ */


function spawnParticles(x, y) {
  const colors = ['#C9A96E','#E8C98A','#ffffff',
                  'rgba(201,169,110,0.8)','rgba(232,201,138,0.9)'];
  const count  = 24;
  for (let i = 0; i < count; i++) {
    const p      = document.createElement('div');
    p.className  = 'particle';
    const angle  = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist   = 35 + Math.random() * 110;
    const size   = 3 + Math.random() * 7;
    const dur    = 0.5 + Math.random() * 0.5;
    const delay  = Math.random() * 0.12;
    const color  = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      background:${color};
      --tx:${Math.cos(angle)*dist}px;
      --ty:${Math.sin(angle)*dist}px;
      --dur:${dur}s;
      animation-delay:${delay}s;
      box-shadow:0 0 ${size*2}px ${color}, 0 0 ${size*4}px rgba(201,169,110,0.3);
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), (dur + delay) * 1000 + 100);
  }
}

/* magnetic fab */

(function initMagneticFab() {
  const fab = document.getElementById('adminFab');
  if (!fab) return;
  fab.addEventListener('mousemove', ev => {
    const r  = fab.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const dx = (ev.clientX - cx) * 0.35;
    const dy = (ev.clientY - cy) * 0.35;
    fab.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
  });
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = '';
  });
})();


/* Theme changing */

const themes = [
  { //Orange-y
  title: "#ffdc00",
  subtitle: "#000000",
  grad: "linear-gradient(90deg, #BF0FFF, #CBFF49)"
  },
  { //green
  title: "#aab2ff",
  subtitle: "#000000",
  grad: "linear-gradient(90deg, #84FFC9, #AAB2FF, #ECA0FF)"
  },
  { //l-green-y
  title: "#c5f9d7",
  subtitle: "#000000",
  grad: "linear-gradient(90deg, #C5F9D7, #F7D486, #F27A7D)"
  },
  { //violate
  title: "#f5c900",
  subtitle: "#000000",
  grad: "linear-gradient(90deg, #F5C900, #183182)"
  },
  
];

function applyRandomTheme() {
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const root = document.documentElement;

  root.style.setProperty('--gold', theme.title);
  root.style.setProperty('--gold2', theme.subtitle);
  root.style.setProperty('--grad-1', theme.grad);
}

applyRandomTheme();

(function initReadProgress() {
  const scroll = document.getElementById('mScroll');
  const bar    = document.getElementById('readProgress');
  if (!scroll || !bar) return;
  scroll.addEventListener('scroll', () => {
    const max = scroll.scrollHeight - scroll.clientHeight;
    const pct = max > 0 ? (scroll.scrollTop / max) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });

  /* Reset on each story open */
  const origOpen = window.openModal;
  if (origOpen) {
    window.openModal = function(s) {
      bar.style.width = '0%';
      origOpen(s);
    };
  }
})();

(function initRotatingQuotes() {
  const quotes = [
    "Some pictures are not taken to show the world, but to remember how it felt.",
    "Photography is the art of frozen time — the ability to store emotion and feelings within a frame.",
    "A photograph is a secret about a secret. The more it tells you, the less you know.",
    "In photography there is a reality so subtle that it becomes more real than reality.",
    "Every photograph is a certificate of presence.",
    "The camera is an instrument that teaches people how to see without a camera.",
    "Light makes photography. Embrace light. Admire it. Love it. But above all, know light.",
  ];

  const el  = document.querySelector('.q-text');
  if (!el) return;

  let idx = 0;

  setInterval(() => {
    el.classList.add('fading');
    setTimeout(() => {
      idx = (idx + 1) % quotes.length;
      el.textContent = quotes[idx];
      el.classList.remove('fading');
    }, 600);
  }, 5000);
})();


/* numbers */

function updateStats() {
  const total = stories.length;
  const cats  = new Set(stories.map(s => s.cat)).size;
  const locs  = new Set(stories.map(s => s.loc).filter(Boolean)).size;

  function countUp(el, target, dur) {
    if (!el) return;
    let start = 0;
    const step = target / (dur / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { el.textContent = target; clearInterval(timer); }
      else { el.textContent = Math.floor(start); }
    }, 16);
  }

  const row = document.getElementById('statsRow');
  if (!row) return;

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    row.querySelectorAll('.stat-item').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120);
    });
    countUp(document.getElementById('statStories'), total, 1200);
    countUp(document.getElementById('statCats'),    cats,  900);
    countUp(document.getElementById('statLocs'),    locs,  1000);
  }, { threshold: 0.3 });

  observer.observe(row);
}

/* mood strip */

function buildMoodboard() {
  const wrap = document.getElementById('moodboard');
  if (!wrap || !stories.length) return;
  wrap.innerHTML = '';

  /* id দিয়ে sort করে সর্বশেষ ৫টা নাও */
  const sorted = [...stories].sort((a, b) => b.id - a.id);
  const items  = sorted.slice(0, 5).reverse();

  items.forEach(s => {
    const el = document.createElement('div');
    el.className = 'mood-item';
    el.innerHTML = `
      <img src="${s.img}" alt="${s.title}" loading="lazy"/>
      <div class="mood-label">${s.title}</div>
    `;
    el.addEventListener('click', () => openModal(s));
    wrap.appendChild(el);
  });
}

/* blur text */

(function () {
  const selectors = [
    '.blur-text-s',
    '.q-text',
    '.hero-sub',
    '.card-loc',
  ];

  /* এই class গুলো থাকলে ভেতরে ঢুকবে না */
  const skipClasses = ['text-grad-vivid', 'text-grad', 'br-word'];

  function shouldSkip(node) {
    return skipClasses.some(c => node.classList && node.classList.contains(c));
  }

  function wrapTextOnly(el) {
    const nodes = [...el.childNodes];
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement('span');
            span.className   = 'br-word';
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        node.replaceWith(frag);

      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (shouldSkip(node)) {
          /* পুরো element টাকে একটা br-word unit বানাও,
             ভেতরে ঢুকবে না — gradient intact থাকবে */
          node.classList.add('br-word');
        } else {
          wrapTextOnly(node);
        }
      }
    });
  }

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => wrapTextOnly(el));
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.br-word').forEach((w, i) => {
        setTimeout(() => w.classList.add('visible'), i * 42);
      });
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '-10px 0px' });

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => io.observe(el));
  });
})();


/* ── Typewriter for About Hero Label ─── */
const typewriterEl = document.querySelector('.hero-eyebrow');
if (typewriterEl) {
  const text = typewriterEl.textContent.trim();
  typewriterEl.textContent = '';
  typewriterEl.style.borderRight = '1px solid currentColor';
  let i = 0;
  const type = () => {
    if (i < text.length) {
      typewriterEl.textContent += text[i++];
      setTimeout(type, 60);
    } else {
      setTimeout(() => typewriterEl.style.borderRight = 'none', 800);
    }
  };
  setTimeout(type, 600); // navbar load হওয়ার পর start
}


/* cursor trail */

let lastTrailTime = 0;
document.addEventListener('mousemove', e => {
  const now = Date.now();
  if (now - lastTrailTime < 40) return; // throttle: 25fps
  lastTrailTime = now;
  const dot = document.createElement('div');
  dot.className = 'trail-dot';
  dot.style.left = e.clientX + 'px';
  dot.style.top  = e.clientY + 'px';
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 700);
});

/* ── boot ── */
loadStories();
