// ===== Load editable content from data/content.json =====
(function loadContent(){
  fetch('data/content.json', { cache: 'no-store' })
    .then(res => res.ok ? res.json() : Promise.reject('content.json not found'))
    .then(data => {
      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el && value !== undefined) el.textContent = value;
      };

      if (data.hero){
        setText('hero-eyebrow', data.hero.eyebrow);
        setText('hero-first-name', data.hero.firstName);
        setText('hero-last-name', data.hero.lastName);
        setText('hero-subtitle', data.hero.subtitle);
        if (data.hero.firstName || data.hero.lastName){
          document.title = `${data.hero.firstName || ''} ${data.hero.lastName || ''} — Biology Student & Curious Mind, Tehran`.trim();
        }
      }
      if (data.about){
        setText('about-lead', data.about.lead);
        setText('about-detail', data.about.detail);
      }
      if (data.interests){
        ['card1','card2','card3'].forEach(key => {
          const c = data.interests[key];
          if (!c) return;
          setText(`${key}-tag`, c.tag);
          setText(`${key}-title`, c.title);
          setText(`${key}-desc`, c.description);
        });
      }
      if (data.timeline){
        ['item1','item2','item3','item4'].forEach((key, i) => {
          const t = data.timeline[key];
          if (!t) return;
          setText(`tl${i+1}-title`, t.title);
          setText(`tl${i+1}-desc`, t.description);
        });
      }
      if (data.skills){
        ['skill1','skill2','skill3','skill4'].forEach((key, i) => {
          const s = data.skills[key];
          if (!s) return;
          setText(`skill${i+1}-name`, s.name);
          const bar = document.getElementById(`skill${i+1}-bar`);
          if (bar && s.level !== undefined){
            const span = bar.querySelector('span');
            if (span) span.style.setProperty('--level', `${s.level}%`);
          }
        });
      }
      if (data.contact){
        setText('contact-desc', data.contact.description);
        const emailEl = document.getElementById('contact-email');
        if (emailEl && data.contact.email){
          emailEl.textContent = data.contact.email;
          emailEl.href = `mailto:${data.contact.email}`;
        }
        const linkedin = document.getElementById('contact-linkedin');
        if (linkedin && data.contact.linkedin) linkedin.href = data.contact.linkedin;
        const github = document.getElementById('contact-github');
        if (github && data.contact.github) github.href = data.contact.github;
        const instagram = document.getElementById('contact-instagram');
        if (instagram && data.contact.instagram) instagram.href = data.contact.instagram;
      }
    })
    .catch(() => { /* fall back silently to the default text already in the HTML */ });
})();

// ===== Settings panel: theme + reduced motion + edit/source links =====
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

// ===== Mobile hamburger menu =====
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

// ===== Specimen card tilt (follows cursor) =====
(function cardTilt(){
  const cards = document.querySelectorAll('.specimen-card');
  if (!cards.length || window.matchMedia('(pointer: coarse)').matches) return;
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--rx', `${x * 14}deg`);
      card.style.setProperty('--ry', `${-y * 14}deg`);
      card.style.transform = `perspective(800px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
})();

// ===== Ambient cursor glow =====
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

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Scroll progress bar =====
const progressBar = document.getElementById('progressBar');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
}
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ===== Reveal on scroll =====
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

// ===== Skill bars animate when visible =====
const skillBars = document.querySelectorAll('.skill-bar');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('animate');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
skillBars.forEach(el => skillObserver.observe(el));

// ===== Hero signature: helix that resolves into a molar =====
(function drawSpecimen(){
  const helixGroup = document.getElementById('helixGroup');
  const rungGroup = document.getElementById('rungGroup');
  const molarPath = document.getElementById('molarPath');
  if (!helixGroup) return;

  const width = 400, topY = 20, bottomY = 400, turns = 4, amplitude = 55, centerX = 200, steps = 140;

  function xFor(t, phase){
    return centerX + amplitude * Math.sin((t * turns * Math.PI * 2) + phase);
  }

  let strandA = 'M ';
  let strandB = 'M ';
  for (let i = 0; i <= steps; i++){
    const t = i / steps;
    const y = topY + t * (bottomY - topY);
    const xa = xFor(t, 0);
    const xb = xFor(t, Math.PI);
    strandA += `${xa.toFixed(1)} ${y.toFixed(1)} `;
    strandB += `${xb.toFixed(1)} ${y.toFixed(1)} `;
    if (i < steps){ strandA += 'L '; strandB += 'L '; }
  }

  const pathA = document.createElementNS('http://www.w3.org/2000/svg','path');
  pathA.setAttribute('d', strandA);
  const pathB = document.createElementNS('http://www.w3.org/2000/svg','path');
  pathB.setAttribute('d', strandB);
  helixGroup.appendChild(pathA);
  helixGroup.appendChild(pathB);

  [pathA, pathB].forEach(p => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
  });

  // rungs
  const rungCount = 16;
  for (let i = 0; i <= rungCount; i++){
    const t = i / rungCount;
    const y = topY + t * (bottomY - topY);
    const xa = xFor(t, 0);
    const xb = xFor(t, Math.PI);
    const rung = document.createElementNS('http://www.w3.org/2000/svg','line');
    rung.setAttribute('x1', xa); rung.setAttribute('y1', y);
    rung.setAttribute('x2', xb); rung.setAttribute('y2', y);
    rung.style.opacity = 0;
    rungGroup.appendChild(rung);
  }

  let played = false;
  const heroVisual = document.querySelector('.hero-visual');
  const specimenObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played){
        played = true;
        [pathA, pathB].forEach((p, idx) => {
          p.style.transition = `stroke-dashoffset 2.1s cubic-bezier(.22,1,.36,1) ${idx * 0.15}s`;
          requestAnimationFrame(() => { p.style.strokeDashoffset = '0'; });
        });
        Array.from(rungGroup.children).forEach((rung, i) => {
          setTimeout(() => {
            rung.style.transition = 'opacity 0.5s ease';
            rung.style.opacity = 0.75;
          }, 300 + i * 70);
        });
        const molarLen = molarPath.getTotalLength();
        molarPath.style.strokeDasharray = molarLen;
        molarPath.style.strokeDashoffset = molarLen;
        setTimeout(() => {
          molarPath.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1), opacity 0.3s ease';
          molarPath.style.opacity = 1;
          molarPath.style.strokeDashoffset = '0';
        }, 1900);
      }
    });
  }, { threshold: 0.3 });
  if (heroVisual) specimenObserver.observe(heroVisual);
})();

// ===== Ambient node-field background canvas =====
(function bgCanvas(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((w * h) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
      violet: Math.random() < 0.35
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
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes){
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.violet ? 'rgba(155,107,255,0.45)' : 'rgba(255,179,71,0.4)';
      ctx.fill();
    }
    if (!prefersReduced && document.documentElement.dataset.motion !== 'reduced') requestAnimationFrame(tick);
  }
  tick();
})();

// ===== Nav shrink on scroll =====
const navEl = document.getElementById('nav');
document.addEventListener('scroll', () => {
  if (window.scrollY > 40){
    navEl.style.padding = '14px 6vw';
  } else {
    navEl.style.padding = '22px 6vw';
  }
}, { passive: true });
