/* ══════════════════════════════════════════════
   GALLERY LOADER — gallery-loader.js
   gallery.json পড়ে grid build করে,
   তারপর Stagger + Lightbox + Filter + Swipe
   সব re-init করে।
══════════════════════════════════════════════ */

(async function initGallery() {

  /* ── 1. JSON Load ─────────────────────────── */
  let photos = [];
  try {
    const res = await fetch('./gallery.json');
    if (!res.ok) throw new Error('gallery.json load হয়নি');
    photos = await res.json();
  } catch (err) {
    console.error('[Gallery Loader]', err);
    return;
  }
 
  /* ── 2. Grid Build ────────────────────────── */
  const grid = document.querySelector('.masonry-grid');
  if (!grid) { console.error('[Gallery Loader] .masonry-grid পাওয়া যায়নি'); return; }

  grid.innerHTML = '';

  photos.forEach(photo => {
    const item = document.createElement('div');
    const isMob = window.innerWidth < 768;
const spanClass = (!isMob && photo.span) ? ` ${photo.span.trim()}` : '';
item.className = `grid-item${spanClass}`;
    item.dataset.cat   = photo.category || '';
    item.dataset.title = photo.title    || '';
    if (photo.new) item.dataset.new = 'true';
    if (photo.exif) {
      item.dataset.aperture = photo.exif.aperture || '';
      item.dataset.shutter  = photo.exif.shutter  || '';
      item.dataset.iso      = photo.exif.iso       || '';
      item.dataset.location = photo.exif.location  || '';
    }

    const imgSrc = convertDriveUrl(photo.src);

    item.innerHTML = `
      <img 
  data-src="${imgSrc}" 
  alt="${escapeHtml(photo.title)}" 
  loading="lazy"
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
/>
      <div class="grid-item-overlay">
        <div class="grid-item-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </div>
        <div class="grid-item-title">${escapeHtml(photo.title)}</div>
        <div class="grid-item-cat">${escapeHtml(photo.category)}</div>
      </div>
    `;

    // শুরুতে invisible — stagger animation এর জন্য
    item.style.opacity = '0';
    grid.appendChild(item);
  });

  /* ── 3. Filter Count Update ───────────────── */
  const allItems = [...document.querySelectorAll('.grid-item')];

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const cat     = btn.dataset.cat;
    const countEl = btn.querySelector('.filter-count');
    if (!countEl) return;
    countEl.textContent = cat === 'All'
      ? allItems.length
      : allItems.filter(el => el.dataset.cat === cat).length;
  });
  
  
  /* ── Progressive Image Load ───────────────── */
  
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    const src = img.dataset.src;
    if (!src) return;

    // Placeholder blur effect
    img.style.filter    = 'blur(8px)';
    img.style.transform = 'scale(1.04)';
    img.style.transition = 'filter 0.6s ease, transform 0.6s ease';

    const loader = new Image();
    loader.src   = src;
    loader.onload = () => {
      img.src             = src;
      img.style.filter    = '';
      img.style.transform = '';
      delete img.dataset.src;
    };
    loader.onerror = () => {
      img.style.filter = '';
    };

    imageObserver.unobserve(img);
    
  });
}, {
  rootMargin: '200px 0px', // viewport এর 200px আগে থেকেই load শুরু
  threshold: 0
});

allItems.forEach(item => {
  const img = item.querySelector('img');
  if (img) imageObserver.observe(img);
});

  /* ── 4. Stagger Entrance Animation ───────── */
  /* ── 5. Scroll Entrance ───────────────────── */
const entranceObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // আগে যদি already visible হয়ে থাকে skip
    if (el.dataset.entered) return;
    el.dataset.entered = '1';

    // Column position থেকে slight delay
    const idx   = allItems.indexOf(el);
    const delay = Math.min(idx * 0.04, 0.3);

    el.style.transition = `opacity 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1),
                           transform 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1)`;
    el.style.opacity    = '1';
    el.style.transform  = 'translateY(0)';

    entranceObserver.unobserve(el);
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px' // viewport এর একটু ভেতরে ঢুকলে trigger
});

// সব item শুরুতে নিচে থাকবে
allItems.forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(36px)';
  el.style.transition = 'none';
  entranceObserver.observe(el);
});

  /* ── 5. Lightbox ──────────────────────────── */
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbTitle  = document.getElementById('lbTitle');
  const lbCat    = document.getElementById('lbCat');
  const lbClose  = document.getElementById('lbClose');

  let currentLbIndex = 0;

  function buildLbList() {
    return [...document.querySelectorAll('.grid-item:not(.hidden)')];
  }

  function openLightbox(index, lbList) {
    if (!lbList[index]) return;
    const item = lbList[index];
    lbImg.src           = item.querySelector('img').src;
    lbTitle.textContent = item.dataset.title || '';
    lbCat.textContent   = item.dataset.cat   || '';
    currentLbIndex      = index;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Ambient glow (Upgrade L)
    const ambient = document.getElementById('lbAmbient');
    if (ambient) {
      const tempImg      = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.src        = item.querySelector('img').src;
      tempImg.onload     = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 10; canvas.height = 10;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempImg, 0, 0, 10, 10);
        const pixels = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        ambient.style.background =
          `radial-gradient(ellipse at center, rgba(${r},${g},${b},0.45) 0%, transparent 70%)`;
        ambient.style.opacity = '1';
      };
    }

    // Counter (Upgrade D)
    const counter = document.getElementById('lbCounter');
    if (counter) counter.textContent = `${index + 1} of ${lbList.length}`;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
    const ambient = document.getElementById('lbAmbient');
    if (ambient) ambient.style.opacity = '0';
  }

  function lbNavigate(dir) {
    const lbList = buildLbList();
    const next   = (currentLbIndex + dir + lbList.length) % lbList.length;
    openLightbox(next, lbList);
  }

  if (lightbox) {
    // Grid item click
    allItems.forEach(item => {
      item.addEventListener('click', () => {
        const lbList = buildLbList();
        const idx    = lbList.indexOf(item);
        if (idx !== -1) openLightbox(idx, lbList);
      });
    });

    document.getElementById('lbPrev')?.addEventListener('click', e => {
      e.stopPropagation(); lbNavigate(-1);
    });
    document.getElementById('lbNext')?.addEventListener('click', e => {
      e.stopPropagation(); lbNavigate(1);
    });

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowRight') lbNavigate(1);
      if (e.key === 'ArrowLeft')  lbNavigate(-1);
    });

    // Swipe (Upgrade G)
    let touchStartX = 0, touchStartY = 0;
    lightbox.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      const diffX = touchStartX - e.changedTouches[0].clientX;
      const diffY = Math.abs(touchStartY - e.changedTouches[0].clientY);
      if (Math.abs(diffX) > 50 && diffY < 40) lbNavigate(diffX > 0 ? 1 : -1);
    });
  }
  /* ── 6. Filter ────────────────────────────── */
  /* Category descriptions */
const catMeta = {
  'All':    { label: 'All Works',      desc: 'Full collection — all categories combined.' },
  'Macro':  { label: 'Macro World',    desc: 'Extreme close-up — revealing the invisible.' },
  'Floral': { label: 'Floral Studies', desc: 'Petals, colour, and quiet botanical life.' },
  'Nature': { label: 'Harbor Light',   desc: 'Water, vessels, and the golden hour.' },
  'Street': { label: 'Street Life',    desc: 'Candid moments from everyday Rajbari.' },
};

const filtersActiveLabel = document.getElementById('filtersActiveLabel');
const filtersVisible     = document.getElementById('filtersVisible');
const filtersTotal       = document.getElementById('filtersTotal');
const filtersDesc        = document.getElementById('filtersDesc');
const filtersIndicator   = document.getElementById('filtersIndicator');

if (filtersTotal) filtersTotal.textContent = allItems.length;

/* Sliding indicator position */
function moveIndicator(btn) {
  if (!filtersIndicator || !btn) return;
  const track = btn.closest('.filters-track');
  if (!track) return;
  const trackRect = track.getBoundingClientRect();
  const btnRect   = btn.getBoundingClientRect();
  filtersIndicator.style.left  = `${btnRect.left - trackRect.left + track.scrollLeft}px`;
  filtersIndicator.style.width = `${btnRect.width}px`;
}

/* Init indicator on first active button */

requestAnimationFrame(() => {
  const firstActive = document.querySelector('.filter-btn.active');
  moveIndicator(firstActive);
});

/* Attach to each button inside filter block */
document.querySelectorAll('.filter-btn').forEach(btn => {
  const fresh = btn.cloneNode(true);
  btn.parentNode.replaceChild(fresh, btn);

  fresh.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    fresh.classList.add('active');
    moveIndicator(fresh);

    const cat  = fresh.dataset.cat;
    const meta = catMeta[cat] || { label: cat, desc: '' };

    /* Update labels */
    if (filtersActiveLabel) {
      filtersActiveLabel.style.opacity = '0';
      setTimeout(() => {
        filtersActiveLabel.textContent  = meta.label;
        filtersActiveLabel.style.opacity = '1';
      }, 150);
    }
    if (filtersDesc) {
      filtersDesc.style.opacity = '0';
      setTimeout(() => {
        filtersDesc.textContent  = meta.desc;
        filtersDesc.style.opacity = '1';
      }, 150);
    }

    /* Visible count */
    const visible = cat === 'All'
      ? allItems.length
      : allItems.filter(el => el.dataset.cat === cat).length;
    if (filtersVisible) filtersVisible.textContent = visible;

    /* Ghost text (Upgrade O) */
    const ghost = document.getElementById('filterGhost');
    if (ghost) {
      ghost.classList.remove('visible');
      ghost.textContent = cat === 'All' ? 'Gallery' : cat;
      void ghost.offsetWidth;
      ghost.classList.add('visible');
      clearTimeout(ghost._timer);
      ghost._timer = setTimeout(() => ghost.classList.remove('visible'), 2000);
    }

    /* Filter items */
    allItems.forEach(item => {
      if (cat === 'All' || item.dataset.cat === cat) {
        item.classList.remove('hidden');
        item.style.opacity   = '0';
        item.style.transform = 'scale(0.96)';
        item.style.transition = '';
        setTimeout(() => {
          item.style.opacity   = '1';
          item.style.transform = 'scale(1)';
          item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        }, 10);
      } else {
        item.classList.add('hidden');
      }
    });

    activeLbList = [...document.querySelectorAll('.grid-item:not(.hidden)')];
  });
});    



/* Recalculate indicator on resize */
window.addEventListener('resize', () => {
  const active = document.querySelector('.filter-btn.active');
  moveIndicator(active);
}, { passive: true });
 


   /* ── Hero stat count update ── */
const heroTotalEl = document.getElementById('heroTotal');
if (heroTotalEl) heroTotalEl.textContent = photos.length;


const heroTotalEl2 = document.getElementById('heroTotal2');
if (heroTotalEl2) heroTotalEl2.textContent = photos.length;


    initPrintShop(photos);

  console.log(`[Gallery Loader] ${photos.length}টি photo load হয়েছে।`);

})();





/* ── Helpers ──────────────────────────────── */

function convertDriveUrl(url) {
  if (!url) return '';
  if (url.includes('uc?export=view')) return url;
  const match = url.match(/\/file\/d\/([^/]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  return url;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


/* ── Hero Photo Parallax ── */
const phBgImg = document.getElementById('phPhotoBgImg');
if (phBgImg) {
  function updateParallax() {
    const scrollY   = window.scrollY;
    const heroEl    = document.querySelector('.ph-hero');
    if (!heroEl) return;
    const heroH     = heroEl.offsetHeight;

    // Hero visible থাকলেই parallax চলবে
    if (scrollY > heroH) return;

    // Scroll এর সাথে image উপরে উঠবে — slow rate
    const offset = scrollY * 0.35;
    phBgImg.style.transform = `translateY(${offset}px)`;
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();
}


/* ── Mobile Filter Auto Scroll ── */
if (window.innerWidth < 768) {
  const track = document.querySelector('.filter-track');
  if (track) {
    const speed = 0.6; // px per frame — এটা তুমি adjust করবে

    let pos       = 0;
    let direction = 1;
    let paused    = false;

    // Touch করলে pause
    track.addEventListener('touchstart', () => { paused = true;  }, { passive: true });
    track.addEventListener('touchend',   () => {
      setTimeout(() => { paused = false; }, 1500); // ১.৫ সেকেন্ড পর resume
    }, { passive: true });

    function autoScroll() {
      if (!paused) {
        pos += speed * direction;

        const maxScroll = track.scrollWidth - track.clientWidth;

        if (pos >= maxScroll) { direction = -1; } // শেষে পৌঁছালে পেছনে
        if (pos <= 0)         { direction =  1; } // শুরুতে পৌঁছালে সামনে

        track.scrollLeft = pos;
      }
      requestAnimationFrame(autoScroll);
    }

    requestAnimationFrame(autoScroll);
  }
}



/* ══════════════════════════════════════════════
   PRINT SHOP + MAP — photos passed as argument
══════════════════════════════════════════════ */
function initPrintShop(photos) {
  const WHATSAPP = '8801XXXXXXXXX';
  const EMAIL    = 'hussain@example.com';

  const grid  = document.getElementById('printGrid');
  const modal = document.getElementById('printModal');
  if (!grid || !modal) return;

  const printPhotos = photos.slice(0, 6);

  printPhotos.forEach(photo => {
    const src  = convertDriveUrl(photo.src);
    const card = document.createElement('div');
    card.className = 'print-card';
    card.innerHTML = `
      <div class="print-card-img-wrap">
        <img src="${src}" alt="${escapeHtml(photo.title)}" loading="lazy"/>
      </div>
      <div class="print-card-info">
        <div class="print-card-title">${escapeHtml(photo.title)}</div>
        <div class="print-card-cat">${escapeHtml(photo.category)}</div>
      </div>
      <div class="print-card-btn">Inquire Print</div>
    `;
    card.addEventListener('click', () => openPrintModal(photo, src));
    grid.appendChild(card);
  });

  const modalImg   = document.getElementById('printModalImg');
  const modalTitle = document.getElementById('printModalTitle');
  const waBtn      = document.getElementById('printWaBtn');
  const emailBtn   = document.getElementById('printEmailBtn');
  const closeBtn   = document.getElementById('printModalClose');
  const backdrop   = document.getElementById('printModalBackdrop');

  let selectedSize  = 'A4';
  let selectedPaper = 'Matte';

  document.querySelectorAll('.print-option-btns').forEach(group => {
    group.querySelectorAll('.print-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.print-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (group.id === 'printSizeGroup')  selectedSize  = btn.dataset.val;
        if (group.id === 'printPaperGroup') selectedPaper = btn.dataset.val;
        updateLinks();
      });
    });
  });

  function updateLinks() {
    const title   = modalTitle?.textContent || '';
    const msg     = `Hi Hussain! I'm interested in a print of "${title}" — Size: ${selectedSize}, Paper: ${selectedPaper}.`;
    if (waBtn)    waBtn.href    = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    if (emailBtn) emailBtn.href = `mailto:${EMAIL}?subject=Print Inquiry — ${encodeURIComponent(title)}&body=${encodeURIComponent(msg)}`;
  }

  function openPrintModal(photo, src) {
  if (modalImg)   modalImg.src           = src;
  if (modalTitle) modalTitle.textContent = photo.title;
  updateLinks();

  // Modal কে body তে move করো — যেকোনো parent এর বাইরে
  document.body.appendChild(modal);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

  function closePrintModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closePrintModal);
  backdrop?.addEventListener('click', closePrintModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePrintModal();
  });
}











