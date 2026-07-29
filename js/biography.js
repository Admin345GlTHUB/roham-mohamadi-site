document.getElementById('year').textContent = new Date().getFullYear();

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
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes){
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,179,71,0.4)'; ctx.fill();
    }
    if (!prefersReduced) requestAnimationFrame(tick);
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
