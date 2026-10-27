// Кадр 05: «Сушка» — отпечатки на верёвке. Каждый — демпфированный маятник вокруг прищепки:
// vel += (-k·angle − c·vel + impulse) / mass; angle += vel. Импульс — скорость скролла и перетаскивание мышью.
import { PHOTOS, DRYING } from './data.js';
import { pic, reduced } from './pic.js';

const K = .02, C = .08, MAXA = 12;
const PEG = `<svg class="peg" viewBox="0 0 16 48" aria-hidden="true"><rect x="2" y="0" width="5.5" height="46" rx="1.5" fill="#6f6458"/><rect x="8.5" y="0" width="5.5" height="46" rx="1.5" fill="#857869"/><rect x="0" y="17" width="16" height="5" rx="1" fill="#3b3631"/><circle cx="8" cy="19.5" r="1.4" fill="#9a958d"/></svg>`;

export function initDrying(viewer) {
  const section = document.getElementById('drying');
  const pinEl = document.getElementById('drying-pin');
  const track = document.getElementById('drying-track');
  const line = document.getElementById('line');
  const list = document.getElementById('prints');
  const rope = document.getElementById('rope');
  if (!list) return {};

  const photos = DRYING.filter((d) => !d.photo || PHOTOS[d.photo]);
  list.innerHTML = photos.map((d, i) => {
    const no = `${34 + i}A`;
    const ar = d.photo ? `--ar: ${(1 / PHOTOS[d.photo].ratio).toFixed(3)}` : '';
    const body = d.photo
      ? `<button class="print-paper" type="button" data-look aria-label="Открыть отпечаток: ${PHOTOS[d.photo].alt}" style="${ar}">${pic(d.photo, { sizes: '(min-width: 1024px) 24vw, 72vw', alt: '' })}<span class="print-no" aria-hidden="true">${no}</span></button>`
      : `<div class="print-paper"><div class="print-dark"><a href="${d.link}" target="_blank" rel="noopener"><span>Засвечено — кадр не&nbsp;проявился</span><span class="mono">${d.linkText}</span></a></div><span class="print-no" aria-hidden="true">${no}</span></div>`;
    return `<li class="print" data-i="${i}">${PEG}${body}${d.caption ? `<p class="print-cap">${d.caption}</p>` : ''}</li>`;
  }).join('');
  const prints = [...list.children];
  const state = prints.map((el, i) => ({ el, a: 0, v: 0, m: 1 + (((i * 37) % 9) / 9 - .5) * .4, ph: i * 1.7 }));
  const isPinMode = () => matchMedia('(min-width: 1024px)').matches && !reduced();

  // раскладка: на десктопе отпечатки висят на точках верёвки, на телефоне — лента со snap
  function layout() {
    if (isPinMode()) {
      const H = pinEl.clientHeight;
      const pw = Math.round(Math.min(360, Math.max(240, innerWidth * .24), (H * .64) / 1.45));
      const gap = Math.round(pw * .42 + 40);
      const ropeY = Math.round(H * .19);
      line.style.width = `${60 + photos.length * (pw + gap) + 160}px`;
      prints.forEach((el, i) => {
        el.style.setProperty('--pw', pw + 'px');
        el.style.left = `${60 + i * (pw + gap)}px`;
        el.style.top = `${ropeY + Math.round(Math.sin(i * 1.7) * 10)}px`;
      });
    } else {
      line.style.width = '';
      prints.forEach((el) => { el.style.left = ''; el.style.top = ''; el.style.removeProperty('--pw'); });
    }
    drawRope();
  }
  function drawRope() {
    const lr = line.getBoundingClientRect();
    const sx = line.scrollLeft;
    const pts = prints.map((el) => { const r = el.getBoundingClientRect(); return [r.left - lr.left + sx + r.width / 2, r.top - lr.top + 2]; });
    if (!pts.length) return;
    const W = Math.max(line.scrollWidth, lr.width);
    rope.setAttribute('viewBox', `0 0 ${W} ${Math.max(lr.height, 10)}`);
    rope.style.width = W + 'px';
    const y0 = pts[0][1] - 26;
    let d = `M0,${y0}`;
    let prev = [0, y0];
    for (const p of [...pts, [W, pts[pts.length - 1][1] - 26]]) {
      const mx = (prev[0] + p[0]) / 2, sag = Math.min(46, (p[0] - prev[0]) * .09);
      d += ` Q${mx.toFixed(1)},${(Math.max(prev[1], p[1]) + sag).toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}`;
      prev = p;
    }
    rope.querySelector('path').setAttribute('d', d);
  }
  layout();
  addEventListener('resize', layout);
  document.fonts?.ready.then(drawRope);
  new ResizeObserver(drawRope).observe(line);

  // импульс от скорости: на десктопе — ScrollTrigger (задаётся в pin), на телефоне — скорость горизонтальной ленты
  let velocity = () => 0;
  let lastSL = line.scrollLeft, lastT = performance.now(), slVel = 0;
  line.addEventListener('scroll', () => {
    const now = performance.now();
    slVel = ((line.scrollLeft - lastSL) / Math.max(1, now - lastT)) * 1000;
    lastSL = line.scrollLeft; lastT = now;
  }, { passive: true });

  // drag мышью даёт импульс; короткий клик — просмотрщик
  let drag = null;
  list.addEventListener('pointerdown', (e) => {
    const paper = e.target.closest('.print-paper');
    if (!paper || e.pointerType !== 'mouse') return;
    e.preventDefault();
    drag = { s: state[+paper.closest('.print').dataset.i], x: e.clientX, x0: e.clientX, moved: 0 };
  });
  list.addEventListener('dragstart', (e) => e.preventDefault());
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    drag.x = e.clientX; drag.moved += Math.abs(dx);
    drag.s.v += (dx * .06) / drag.s.m;
    wake();
  });
  addEventListener('pointerup', () => { if (drag) setTimeout(() => { drag = null; }, 0); });
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button.print-paper');
    if (!btn) return;
    if (drag && drag.moved > 6) { e.preventDefault(); return; }
    const items = photos.map((d, i) => ({ d, i })).filter(({ d }) => d.photo).map(({ d, i }) => ({ name: d.photo, no: `${34 + i}A`, label: (d.caption || 'отпечаток').toUpperCase() }));
    const idx = items.findIndex((it) => it.no === `${34 + +btn.closest('.print').dataset.i}A`);
    viewer.open(items, idx, btn);
  });

  // маятники — rAF только пока секция на экране
  let raf = 0, visible = false;
  const still = reduced();
  function tick(now) {
    const t = now / 1000;
    const I = Math.max(-MAXA * K, Math.min(MAXA * K, velocity() * .00004)); // равновесный угол = I / k, до ±12°
    let moving = false;
    for (const s of state) {
      s.v += (-K * s.a - C * s.v + I) / s.m;
      s.a = Math.max(-MAXA, Math.min(MAXA, s.a + s.v));
      const idle = .6 * Math.sin(t * .9 + s.ph);
      s.el.style.transform = `rotate(${(s.a + idle).toFixed(3)}deg)`;
      if (Math.abs(s.v) > .001 || Math.abs(s.a) > .01) moving = true;
    }
    slVel *= .9;
    raf = visible ? requestAnimationFrame(tick) : 0;
    void moving;
  }
  function wake() { if (!raf && visible && !still) raf = requestAnimationFrame(tick); }
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; wake(); }, { rootMargin: '10% 0px' }).observe(section);
  velocity = () => -slVel;

  return {
    // десктоп: pin, лента едет по x со scrub 1
    pin(gsap, ScrollTrigger) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        layout();
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const st = ScrollTrigger.create({
          trigger: pinEl, pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true,
          animation: gsap.fromTo(track, { x: 0 }, { x: () => -dist(), ease: 'none', immediateRender: false }),
          onRefresh: drawRope,
        });
        velocity = () => -st.getVelocity();
        return () => { velocity = () => -slVel; layout(); };
      });
    },
  };
}
