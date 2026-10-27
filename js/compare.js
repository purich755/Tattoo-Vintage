// Кадр 06: слайдер до/после. Два слоя, верхний («после») обрезается clip-path: inset(0 0 0 X%).
// Pointer events + role="slider" с клавишами ← →. При первом показе ручка сама проезжает 30% → 70% → 50%.
import { PAIRS, PHOTOS } from './data.js';
import { pic, pad, reduced } from './pic.js';

export function initCompare() {
  const wrap = document.getElementById('compare-wrap');
  if (!wrap) return;
  const pairs = PAIRS.filter((p) => PHOTOS[p.before] && PHOTOS[p.after]);
  if (!pairs.length) {
    // нет ни одной пары — одно фото перекрытия без слайдера
    wrap.innerHTML = `<figure class="cmp">${pic('cover-dragon', { sizes: '(min-width: 1024px) 40vw, 100vw' })}</figure>`;
    return;
  }
  const nav = pairs.length > 1 ? `<div class="pairs-nav" role="group" aria-label="Пары до и после">${pairs.map((p, i) => `<button type="button" aria-pressed="${i === 0}" data-i="${i}">${pad(i + 1)}</button>`).join('')}<span class="pn-label mono">${pairs[0].label}</span></div>` : '';
  wrap.innerHTML = `${nav}<div class="cmp" id="cmp" style="--x:50%">
<div class="cmp-before"></div><div class="cmp-after"></div>
<span class="cmp-label l mono" aria-hidden="true">До</span><span class="cmp-label r mono" aria-hidden="true">После</span>
<div class="cmp-handle" role="slider" tabindex="0" aria-label="Сравнить до и после" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="50% — до слева, после справа"><svg aria-hidden="true"><use href="#nazar"/></svg></div></div>`;
  const cmp = wrap.querySelector('.cmp');
  const before = cmp.querySelector('.cmp-before'), after = cmp.querySelector('.cmp-after');
  const handle = cmp.querySelector('.cmp-handle');
  const label = wrap.querySelector('.pn-label');
  const sizes = '(min-width: 1024px) 40vw, 100vw';
  const showPair = (i) => {
    before.innerHTML = pic(pairs[i].before, { sizes });
    after.innerHTML = pic(pairs[i].after, { sizes });
    wrap.querySelectorAll('.pairs-nav button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    if (label) label.textContent = pairs[i].label;
    cmp.style.setProperty('--ar', (1 / PHOTOS[pairs[i].after].ratio).toFixed(3));
  };
  // слои — блоки с картинками внутри: фильтр «до» и обрезка «после» живут на обёртках
  before.style.cssText = after.style.cssText = 'position:absolute;inset:0';
  showPair(0);
  wrap.querySelector('.pairs-nav')?.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showPair(+b.dataset.i); });

  let x = 50;
  const set = (v) => {
    x = Math.max(0, Math.min(100, v));
    cmp.style.setProperty('--x', x.toFixed(2) + '%');
    handle.setAttribute('aria-valuenow', String(Math.round(x)));
    handle.setAttribute('aria-valuetext', `${Math.round(x)}% — до слева, после справа`);
  };
  let down = false;
  const fromEvent = (e) => { const r = cmp.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
  cmp.addEventListener('pointerdown', (e) => { down = true; hint?.kill?.(); fromEvent(e); });
  addEventListener('pointermove', (e) => { if (down) fromEvent(e); });
  addEventListener('pointerup', () => { down = false; });
  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(x - step); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(x + step); }
    if (e.key === 'Home') { e.preventDefault(); set(0); }
    if (e.key === 'End') { e.preventDefault(); set(100); }
  });

  // подсказка при первом показе
  let hint = null;
  new IntersectionObserver(([en], io) => {
    if (!en.isIntersecting) return;
    io.disconnect();
    if (reduced() || !window.gsap) return;
    const o = { v: 50 };
    hint = window.gsap.timeline({ onUpdate: () => set(o.v) })
      .to(o, { v: 30, duration: .7, ease: 'power3.inOut' })
      .to(o, { v: 70, duration: 1, ease: 'power3.inOut' })
      .to(o, { v: 50, duration: .8, ease: 'power3.out' });
  }, { threshold: .5 }).observe(cmp);
}
