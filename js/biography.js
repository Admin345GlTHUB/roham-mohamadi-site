document.getElementById('year').textContent = new Date().getFullYear();

// Settings panel: theme + reduced motion
(function settingsPanel(){
  const btn = document.getElementById('settingsBtn');
  const panel = document.getElementById('settingsPanel');
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btn){
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  const themeOpts = panel.querySelectorAll('.theme-opt');
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  themeOpts.forEach(opt => opt.classList.toggle('active', opt.dataset.themeChoice === currentTheme));
  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      const choice = opt.dataset.themeChoice;
      if (choice === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      try{ localStorage.setItem('rm-theme', choice); }catch(e){}
      themeOpts.forEach(o => o.classList.toggle('active', o === opt));
    });
  });

  const motionSwitch = document.getElementById('motionSwitch');
  if (motionSwitch){
    const currentlyReduced = document.documentElement.getAttribute('data-motion') === 'reduced';
    motionSwitch.setAttribute('aria-checked', String(currentlyReduced));
    motionSwitch.addEventListener('click', () => {
      const next = motionSwitch.getAttribute('aria-checked') !== 'true';
      motionSwitch.setAttribute('aria-checked', String(next));
      if (next) document.documentElement.setAttribute('data-motion', 'reduced');
      else document.documentElement.removeAttribute('data-motion');
      try{ localStorage.setItem('rm-motion', next ? 'reduced' : 'normal'); }catch(e){}
    });
  }
})();

// Mobile hamburger menu
(function mobileMenu(){
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  function close(){
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    menu.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

// Ambient cursor glow
(function cursorGlow(){
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;
  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  let curX = targetX, curY = targetY;
  let active = false;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX; targetY = e.clientY;
    if (!active){ active = true; glow.classList.add('active'); }
  }, { passive: true });
  window.addEventListener('mouseleave', () => glow.classList.remove('active'));

  function tick(){
    curX += (targetX - curX) * 0.12;
    curY += (targetY - curY) * 0.12;
    glow.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();
})();

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Nav shrink on scroll
const navEl = document.getElementById('nav');
document.addEventListener('scroll', () => {
  if (navEl) navEl.style.padding = window.scrollY > 40 ? '14px 6vw' : '22px 6vw';
}, { passive: true });

// Ambient node-field background canvas (same as homepage)
(function bgCanvas(){
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((w * h) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6, violet: Math.random() < 0.35
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  function tick(){
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++){
      for (let j = i + 1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130){
          ctx.strokeStyle = `rgba(255,107,53,${(1 - dist / 130) * 0.14})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes){
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.violet ? 'rgba(155,107,255,0.45)' : 'rgba(255,179,71,0.4)'; ctx.fill();
    }
    if (!prefersReduced && document.documentElement.dataset.motion !== 'reduced') requestAnimationFrame(tick);
  }
  tick();
})();

// Scroll progress bar (reuse same behavior as main site)
const progressBar = document.getElementById('progressBar');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if (progressBar) progressBar.style.width = (scrolled || 0) + '%';
}
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

fetch('data/content.json', { cache: 'no-store' })
  .then(res => res.ok ? res.json() : Promise.reject('content.json not found'))
  .then(data => {
    const bio = data.biography;
    if (!bio) return;

    if (bio.pageTitle) document.getElementById('archiveTitle').textContent = bio.pageTitle;
    if (bio.pageIntro) document.getElementById('archiveIntro').textContent = bio.pageIntro;

    const topicKeys = ['topic1','topic2','topic3','topic4','topic5'].filter(k => bio[k]);
    const rail = document.getElementById('folderRail');
    const tag = document.getElementById('contentTag');
    const title = document.getElementById('contentTitle');
    const body = document.getElementById('contentBody');
    const content = document.getElementById('folderContent');

    function render(key){
      const topic = bio[key];
      content.classList.add('switching');
      setTimeout(() => {
        tag.textContent = topic.folderLabel || '';
        title.textContent = topic.title || '';
        body.textContent = topic.body || '';
        content.classList.remove('switching');
      }, 220);

      Array.from(rail.children).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.key === key);
      });
    }

    topicKeys.forEach((key, i) => {
      const topic = bio[key];
      const btn = document.createElement('button');
      btn.className = 'folder-tab';
      btn.type = 'button';
      btn.dataset.key = key;
      btn.textContent = topic.folderLabel || `Topic ${i + 1}`;
      btn.addEventListener('click', () => render(key));
      rail.appendChild(btn);
    });

    if (topicKeys.length){
      render(topicKeys[0]);
      rail.children[0].classList.add('active');
    }
  })
  .catch(() => {
    document.getElementById('contentBody').textContent =
      "Couldn't load the archive content right now — try refreshing the page.";
  });
