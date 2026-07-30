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

// ===== Signature: drawn live like a real pen stroke =====
(function drawSignature(){
  const path = document.getElementById('signaturePath');
  const tip = document.getElementById('signatureTip');
  const caption = document.querySelector('.signature-caption');
  const block = document.querySelector('.signature-block');
  if (!path || !block) return;

  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  const DURATION = 2600; // ms, matches the CSS transition below
  let played = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played){
        played = true;

        path.style.transition = `stroke-dashoffset ${DURATION}ms cubic-bezier(.65,0,.35,1)`;
        requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });

        if (tip){
          tip.style.opacity = '1';
          const start = performance.now();
          function moveTip(now){
            const elapsed = now - start;
            const t = Math.min(elapsed / DURATION, 1);
            const point = path.getPointAtLength(t * len);
            tip.setAttribute('cx', point.x);
            tip.setAttribute('cy', point.y);
            if (t < 1){
              requestAnimationFrame(moveTip);
            } else {
              tip.style.transition = 'opacity 0.5s ease';
              tip.style.opacity = '0';
            }
          }
          requestAnimationFrame(moveTip);
        }

        setTimeout(() => {
          if (caption) caption.classList.add('show');
        }, DURATION + 150);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(block);
})();

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
      r: Math.random() * 1.6 + 0.6
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
      ctx.fillStyle = 'rgba(255,179,71,0.4)';
      ctx.fill();
    }
    if (!prefersReduced) requestAnimationFrame(tick);
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
