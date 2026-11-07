// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky nav style + mobile menu
const nav = document.getElementById('nav');
const links = document.getElementById('links');
const burger = document.getElementById('burger');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10));
burger.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Count-up stats
const countObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, dur = 1200, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObs.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.num').forEach(el => countObs.observe(el));

// Active nav link on scroll
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...links.querySelectorAll('a:not(.btn)')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

// Hero video: shows the first frame on load; the mouse (or a finger) drives the animation
(() => {
  const video = document.getElementById('heroVideo');
  const hero = document.querySelector('.hero');
  const hint = document.getElementById('hint');
  if (!video || !hero) return;

  const touch = !window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (touch && hint) hint.querySelector('em').textContent = 'Drag across the screen';

  // safety cycle shown next to the video, tied to the video position
  const steps = [
    ['Identify', 'Walk the site and spot unsafe acts and conditions early.'],
    ['Assess',   'Review MSRA, JHA and permits before any work starts.'],
    ['Control',  'Brief the crews, verify equipment and PPE, apply controls.'],
    ['Improve',  'Close corrective actions and share the lessons learned.']
  ];
  const fill = document.getElementById('lcFill');
  const lis = [...document.querySelectorAll('#lcSteps li')];
  const card = document.getElementById('stepCard');
  const sNo = document.getElementById('stepNo'), sTitle = document.getElementById('stepTitle'), sText = document.getElementById('stepText');
  const floats = [...document.querySelectorAll('.fl')];
  let stepNow = -1;

  function showStep(p) {
    const k = Math.min(3, Math.floor(p * 4));
    if (k === stepNow) return;
    stepNow = k;
    lis.forEach((li, n) => li.classList.toggle('on', n <= k));
    sNo.textContent = 'STEP 0' + (k + 1) + ' / 04';
    sTitle.textContent = steps[k][0];
    sText.textContent = steps[k][1];
    card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
  }

  video.pause();
  video.currentTime = 0;                      // always start on the first frame
  showStep(0);

  let target = 0, current = 0, moved = false, mx = 0, my = 0, px = 0, py = 0;
  const dur = () => Math.max((video.duration || 5) - 0.04, 0.1);

  function setTarget(clientX, clientY) {
    const r = hero.getBoundingClientRect();
    const nx = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    target = nx * dur();
    mx = nx * 2 - 1;
    my = Math.min(Math.max((clientY - r.top) / r.height, 0), 1) * 2 - 1;
    if (!moved) { moved = true; hint && hint.classList.add('hide'); }
  }
  hero.addEventListener('mousemove', (e) => setTarget(e.clientX, e.clientY));
  hero.addEventListener('touchstart', (e) => setTarget(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  hero.addEventListener('touchmove', (e) => setTarget(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

  (function loop() {
    current += (target - current) * 0.12;     // smooth easing towards the cursor position
    if (Math.abs(video.currentTime - current) > 0.016) video.currentTime = current;
    const p = Math.min(current / dur(), 1);
    fill.style.width = (p * 100) + '%';
    showStep(p);
    if (!reduce) {                            // floating icons drift against the mouse
      px += (mx - px) * 0.08; py += (my - py) * 0.08;
      floats.forEach(f => {
        const d = +f.dataset.depth;
        f.style.setProperty('--tx', (px * d) + 'px');
        f.style.setProperty('--ty', (py * d * 0.7) + 'px');
      });
    }
    requestAnimationFrame(loop);
  })();
})();


// Blog: open an article in a pop-up
(() => {
  const modal = document.getElementById('postModal');
  const body = document.getElementById('modalBody');
  if (!modal) return;
  const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('.read').forEach(btn => btn.addEventListener('click', () => {
    body.innerHTML = document.getElementById(btn.dataset.post).innerHTML;
    modal.hidden = false; document.body.style.overflow = 'hidden';
  }));
  document.getElementById('modalClose').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
