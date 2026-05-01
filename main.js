/* ══════════════════════════════════════════════
   HUSSAIN MAHMUD PHOTOGRAPHY — main.js
══════════════════════════════════════════════ */

/* pricing */

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.pricing-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--px', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    card.style.setProperty('--py', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });
});

    /* FAQ */
    document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').style.maxHeight = '';
    });
    if (!isOpen) {
      item.classList.add('open');
      item.querySelector('.faq-answer').style.maxHeight = item.querySelector('.faq-answer').scrollHeight + 'px';
    }
  });
});


    /* DOMContentLoaded এর ভেতরে */
    const magBtn =
    document.querySelector('.form-submit');
    if (magBtn && window.matchMedia('(pointer: fine)').matches) {
  magBtn.addEventListener('mousemove', e => {
    const r = magBtn.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top  + r.height / 2);
    magBtn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
  });
    magBtn.addEventListener('mouseleave', () => {
    magBtn.style.transform = 'translate(0,0)';
    magBtn.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
  });
    magBtn.addEventListener('mouseenter', () => {
    magBtn.style.transition = 'transform 0.1s ease';
  });
}

  /* textarea text count */
    const msgArea =
    document.getElementById('message');
    const counter =
    document.getElementById('charCounter');
    const MAX = 500;
      if (msgArea && counter) {
      msgArea.addEventListener('input', () => {
    const len = msgArea.value.length;
      counter.textContent = `${len} / ${MAX}`;
      counter.classList.toggle('warn', len > MAX * 0.8 && len <= MAX);
      counter.classList.toggle('over', len > MAX);
      if (len > MAX) msgArea.value = msgArea.value.slice(0, MAX);
  });
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
  

/* ── 3D Tilt on Photo Cards ─── */
document.querySelectorAll('.about-photo-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.04)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
    card.style.transition = 'transform 0.5s ease';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease';
  });
});


/* ── Typewriter for About Hero Label ─── */
const typewriterEl = document.querySelector('.about-hero .section-label');
if (typewriterEl) {
  const text = typewriterEl.textContent.trim();
  typewriterEl.textContent = '';  
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

const typewriterEl3 = document.querySelector('.ph-label-text');
if (typewriterEl3) {
  const text = typewriterEl3.textContent.trim();
  typewriterEl3.textContent = '';
  let i = 0;
  const type = () => {
    if (i < text.length) {
      typewriterEl3.textContent += text[i++];
      setTimeout(type, 60);
    } else {
      setTimeout(() => typewriterEl3.style.borderRight = 'none', 500);
    }
  };
  setTimeout(type, 400); // navbar load হওয়ার পর start
}

  /* ── Animated Counters ───────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1800;
          let start = null;

          function step(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(ease * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ── Hero Parallax ───────────────────────── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    function parallax() {
      const scrollY = window.scrollY;
      const hero    = heroBg.closest('.hero');
      if (!hero) return;
      const heroH   = hero.offsetHeight;
      if (scrollY < heroH) {
        const t = scrollY / heroH;
        heroBg.style.transform = `translateY(${t * 30}%)`;
        const content = hero.querySelector('.hero-content');
        if (content) content.style.opacity = 1 - t * 1.2;
      }
    }
    window.addEventListener('scroll', parallax, { passive: true });
  }

  /* ── About Hero Parallax ─────────────────── */
  const aboutHeroBg = document.querySelector('.about-hero-bg');
  if (aboutHeroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const hero    = aboutHeroBg.closest('.about-hero');
      if (!hero || scrollY > hero.offsetHeight) return;
      aboutHeroBg.style.transform = `translateY(${(scrollY / hero.offsetHeight) * 20}%)`;
    }, { passive: true });
  }


  /* ── Contact Form ────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      const name    = contactForm.querySelector('#name');
      const email   = contactForm.querySelector('#email');
      const subject = contactForm.querySelector('#subject');
      const message = contactForm.querySelector('#message');

      const nameErr    = contactForm.querySelector('#nameErr');
      const emailErr   = contactForm.querySelector('#emailErr');
      const subjectErr = contactForm.querySelector('#subjectErr');
      const msgErr     = contactForm.querySelector('#msgErr');

      [nameErr, emailErr, subjectErr, msgErr].forEach(e => e && e.classList.remove('show'));

      if (!name.value || name.value.trim().length < 2) {
        nameErr && nameErr.classList.add('show'); valid = false;
      }
      if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        emailErr && emailErr.classList.add('show'); valid = false;
      }
      if (!subject.value || subject.value.trim().length < 5) {
        subjectErr && subjectErr.classList.add('show'); valid = false;
      }
      if (!message.value || message.value.trim().length < 10) {
        msgErr && msgErr.classList.add('show'); valid = false;
      }

      if (valid) {
        const sub = encodeURIComponent(`[Portfolio] ${subject.value}`);
        const bod = encodeURIComponent(
          `Hello Hussain,\n\nName: ${name.value}\nEmail: ${email.value}\n\n${message.value}`
        );
        window.open(`mailto:jnm309249@gmail.com?subject=${sub}&body=${bod}`);
        contactForm.reset();
      }
    });
  }

  /* ── Footer year ─────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  

});  // DOM closing



/* Theme Changing */

const themes = [

 {
    gradient: "linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6, #06b6d4)"
  },
  {
    gradient: "linear-gradient(90deg, #BF0FFF, #CBFF49)"
  },
  {
    gradient: "linear-gradient(90deg, #F9F5E0, #F5895C, #B34ECC)"
  },
  {
    gradient: "linear-gradient(90deg, #FFCE06, #6C960D)"
  },
  {
    gradient: "linear-gradient(90deg, #F9E7BB, #E97CBB, #3D47D9)"
  },
  {
    gradient: "linear-gradient(90deg, #EEDDF3, #EE92B1, #6330B4)"
  },
  {
    gradient: "linear-gradient(90deg, #58EFEC, #E85C90, #FCC9BA)"
  },
  {
    gradient: "linear-gradient(90deg, #BF0FFF, #CBFF49)"
  },
  {
    gradient: "linear-gradient(90deg, #A9FF68, #FF8989)"
  }
  
  
];
  
  let lastIndex = -1;

function applyRandomTheme() {
  let index;
  do {
    index = Math.floor(Math.random() * themes.length);
  } while(index === lastIndex);

  lastIndex = index;

  const theme = themes[index];
  const root = document.documentElement;

  
  root.style.setProperty('--grad-1', theme.gradient);


localStorage.setItem('theme', JSON.stringify(theme));

}





/* ── Staggered Grid Entrance ── */
const staggerItems = [...document.querySelectorAll('.grid-item')];

// Diagonal index calculate করে delay দেয়
function getDiagonalIndex(el) {
  const columns = window.innerWidth < 768 ? 1 : 3;
  const idx = staggerItems.indexOf(el);
  const row = Math.floor(idx / columns);
  const col = idx % columns;
  return row + col; // diagonal group
}

const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const diagIdx = getDiagonalIndex(el);
      el.style.animationDelay = `${diagIdx * 0.07}s`;
      el.classList.add('grid-visible');
      staggerObserver.unobserve(el);
    }
  });
}, { threshold: 0.08 });

staggerItems.forEach(el => staggerObserver.observe(el));


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



(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const palette = ['rgba(129,140,248,','rgba(6,182,212,','rgba(245,158,11,','rgba(255,255,255,'];
  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    col: palette[Math.floor(Math.random() * palette.length)],
    alpha: Math.random() * 0.5 + 0.1,
    pulse: Math.random() * Math.PI * 2,
  }));

  let mouseX = W / 2, mouseY = H / 2;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.pulse += 0.012;
      const alpha = p.alpha + Math.sin(p.pulse) * 0.12;
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.3;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx;   p.y += p.vy;
      if (p.x < -5) p.x = W + 5; if (p.x > W+5) p.x = -5;
      if (p.y < -5) p.y = H + 5; if (p.y > H+5) p.y = -5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col + Math.max(0.05, alpha) + ')';
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const ex = p.x - q.x, ey = p.y - q.y;
        const d = Math.sqrt(ex * ex + ey * ey);
        if (d < 130) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(129,140,248,${(1 - d / 130) * 0.08})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* blur text */

(function () {
  const selectors = [
    '.about-quote',
    '.about-body',
    '.specialty-desc',
    '.section-title',
    '.timeline-body',
    '.footer-brand-desc',
    '.contact-subtitle',
    '.blur-text',
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


/* ── Text Scramble ── */

function scrambleText(el, finalText, duration = 1200) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const steps = 18;
  let step    = 0;

  const interval = setInterval(() => {
    el.textContent = finalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (i < (step / steps) * finalText.length) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');

    step++;
    if (step > steps) {
      el.textContent = finalText;
      clearInterval(interval);
    }
  }, duration / steps);
}

const portTitle = document.getElementById('port-title');
if (portTitle) {
  setTimeout(() => scrambleText(portTitle, 'Gallery'), 400);
}

const portTitle2 = document.getElementById('suff-text-cont');
if (portTitle2) {
  setTimeout(() => scrambleText(portTitle2, 'Connect'), 400);
}



applyRandomTheme();

