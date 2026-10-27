// Кадр 07: лабораторный таймер. Десктоп — pin на 320vh со snap к пяти шагам, стрелка 0° → 288°.
// Телефон и reduced-motion — без pin: маленький циферблат sticky, стрелка поворачивается по мере появления шагов.
import { STEPS } from './data.js';
import { pad, reduced } from './pic.js';

const C = 240, NS = 'http://www.w3.org/2000/svg';
const pt = (deg, r) => { const a = (deg * Math.PI) / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
const f = (n) => n.toFixed(2);

export function initTimer() {
  const section = document.getElementById('process');
  const dial = document.getElementById('dial');
  const stepsEl = document.getElementById('steps');
  if (!dial) return {};

  stepsEl.innerHTML = STEPS.map((s, i) => `<li class="step${i === 0 ? ' on' : ''}"><span class="step-n">${pad(i + 1)}</span><h3>${s.name}</h3><p>${s.text}</p></li>`).join('');
  const steps = [...stepsEl.children];

  let svg = `<circle class="ring" cx="${C}" cy="${C}" r="226"/><circle class="ring" cx="${C}" cy="${C}" r="150" opacity=".5"/><path class="arc" d=""/>`;
  for (let i = 0; i < 60; i++) {
    const big = i % 12 === 0;
    const [x1, y1] = pt(i * 6, big ? 194 : 208), [x2, y2] = pt(i * 6, 224);
    svg += `<line class="tick${big ? ' big' : ''}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  }
  STEPS.forEach((_, i) => { const [x, y] = pt(i * 72, 256); svg += `<text class="num" data-n="${i}" x="${f(x)}" y="${f(y)}">${pad(i + 1)}</text>`; });
  svg += `<text class="face" x="${C}" y="${C + 22}">01</text><text class="face-sub" x="${C}" y="${C + 52}">${STEPS[0].name.toUpperCase()}</text>`;
  svg += `<g class="hand-g"><line class="hand" x1="${C}" y1="${C - 112}" x2="${C}" y2="${C - 214}"/><circle class="hub" cx="${C}" cy="${C - 214}" r="5"/></g>`;
  dial.innerHTML = svg;
  const hand = dial.querySelector('.hand-g'), arc = dial.querySelector('.arc');
  const face = dial.querySelector('.face'), faceSub = dial.querySelector('.face-sub');
  const nums = [...dial.querySelectorAll('.num')];

  let active = -1;
  function set(deg) {
    hand.setAttribute('transform', `rotate(${f(deg)} ${C} ${C})`);
    if (deg < .5) arc.setAttribute('d', '');
    else {
      const [x0, y0] = pt(0, 150), [x1, y1] = pt(deg, 150);
      arc.setAttribute('d', `M${f(x0)},${f(y0)} A150,150 0 ${deg > 180 ? 1 : 0} 1 ${f(x1)},${f(y1)}`);
    }
    const i = Math.max(0, Math.min(STEPS.length - 1, Math.round(deg / 72)));
    if (i !== active) {
      active = i;
      steps.forEach((s, k) => s.classList.toggle('on', k === i));
      nums.forEach((n, k) => n.classList.toggle('on', k <= i));
      face.textContent = pad(i + 1);
      faceSub.textContent = STEPS[i].name.toUpperCase();
    }
  }
  set(0);

  // мобильная версия: стрелка догоняет шаг, который сейчас в центре экрана
  let cur = 0, target = 0, raf = 0;
  const ease = () => { cur += (target - cur) * .12; set(cur); raf = Math.abs(target - cur) > .2 ? requestAnimationFrame(ease) : (set(target), 0); };
  const io = new IntersectionObserver((ens) => {
    for (const en of ens) if (en.isIntersecting) { target = steps.indexOf(en.target) * 72; if (!raf) raf = requestAnimationFrame(ease); }
  }, { rootMargin: '-40% 0px -45% 0px' });
  steps.forEach((s) => io.observe(s));

  // видео процесса: источник подключаем у секции, играем только на экране
  const video = document.getElementById('timer-video');
  let loaded = false;
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !loaded) {
      loaded = true;
      video.poster = video.dataset.poster;
      video.querySelectorAll('source').forEach((s) => { s.src = s.dataset.src; });
      video.load();
    }
    if (reduced()) return;
    if (en.isIntersecting) video.play?.().catch(() => {}); else video.pause?.();
  }, { rootMargin: '30% 0px' }).observe(section);

  return {
    pin(gsap, ScrollTrigger) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        io.disconnect();
        section.classList.add('is-pinned');
        const st = ScrollTrigger.create({
          trigger: document.getElementById('timer-pin'), pin: true, start: 'top top', end: '+=220%', scrub: .6,
          snap: { snapTo: 1 / (STEPS.length - 1), duration: { min: .2, max: .6 }, ease: 'power2.inOut', delay: .05 },
          onUpdate: (self) => set(self.progress * 72 * (STEPS.length - 1)),
        });
        return () => { st.kill(); section.classList.remove('is-pinned'); steps.forEach((s) => io.observe(s)); };
      });
    },
  };
}
