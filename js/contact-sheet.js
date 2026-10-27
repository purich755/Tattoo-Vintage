// Кадр 04: контактный лист — вкладки (GSAP Flip), лупа, карандашные кружки и просмотрщик «Увеличитель».
import { PHOTOS, SHEET, ZONES, MARKS } from './data.js';
import { pic, largest, mid, small, pad, reduced, fine } from './pic.js';

const zoneShort = Object.fromEntries(ZONES.map((z) => [z.key, z.short]));

// Неровный карандашный кружок: начало и конец заходят друг за друга. viewBox 80×100 под рамку 3:4 с полями.
function pencilPath(seed) {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const a0 = -1.9 + rnd() * .8, turns = Math.PI * 2 + .45 + rnd() * .35;
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const a = a0 + (turns * i) / 64;
    const wob = 1 + (rnd() - .5) * .05 + Math.sin(a * 3 + seed) * .025;
    const drift = (i / 64) * (2.2 + rnd() * 1.4); // виток уходит наружу — второй заход ложится не в след
    pts.push([40 + Math.cos(a) * (35 + drift) * wob, 50 + Math.sin(a) * (45 + drift) * wob]);
  }
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L');
}

export class Viewer {
  constructor(lenisRef) {
    this.lenisRef = lenisRef;
    this.dlg = document.getElementById('viewer');
    this.img = document.getElementById('viewer-img');
    this.stage = document.getElementById('viewer-stage');
    this.cap = document.getElementById('viewer-cap');
    this.count = document.getElementById('viewer-count');
    this.thumbs = document.getElementById('viewer-thumbs');
    this.items = []; this.i = 0; this.zoom = 1; this.pan = { x: 0, y: 0 };
    document.getElementById('viewer-x').addEventListener('click', () => this.close());
    document.getElementById('viewer-prev').addEventListener('click', () => this.go(-1));
    document.getElementById('viewer-next').addEventListener('click', () => this.go(1));
    this.dlg.addEventListener('close', () => this.onClose());
    this.dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); }
    });
    this.dlg.addEventListener('click', (e) => { if (e.target === this.stage) this.close(); });
    this.gestures();
  }
  open(items, i, origin) {
    this.items = items; this.origin = origin; this.i = i;
    this.thumbs.innerHTML = items.map((it, k) => `<button type="button" aria-label="Кадр ${it.no}"><img src="${small(it.name)}" alt="" loading="lazy"></button>`).join('');
    [...this.thumbs.children].forEach((b, k) => b.addEventListener('click', () => this.show(k)));
    this.dlg.showModal();
    this.lenisRef.current?.stop();
    document.documentElement.style.overflow = 'hidden';
    this.show(i, origin);
  }
  show(i, origin) {
    const n = this.items.length;
    this.i = (i + n) % n;
    const it = this.items[this.i];
    this.setZoom(1);
    this.cap.textContent = `КАДР ${it.no} · ${it.label}`;
    this.count.textContent = `${pad(this.i + 1)} / ${pad(n)}`;
    [...this.thumbs.children].forEach((b, k) => b.setAttribute('aria-current', k === this.i ? 'true' : 'false'));
    this.thumbs.children[this.i]?.scrollIntoView({ block: 'nearest', inline: 'center' });
    const img = this.img;
    img.classList.add('is-raw');
    img.alt = PHOTOS[it.name].alt;
    img.onload = null;
    const reveal = () => {
      img.onload = null;
      if (origin && window.gsap && !reduced()) {
        // кадр вырастает из миниатюры
        const a = origin.getBoundingClientRect(), b = img.getBoundingClientRect();
        if (b.width) window.gsap.fromTo(img, { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scale: a.width / b.width },
          { x: 0, y: 0, scale: 1, duration: .55, ease: 'expo.out', clearProps: 'transform' });
      }
      requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove('is-raw')));
    };
    img.src = mid(it.name);
    if (img.complete && img.naturalWidth) reveal(); else img.onload = reveal;
    // предзагрузка соседних кадров
    for (const d of [1, -1]) { const nb = this.items[(this.i + d + n) % n]; if (nb) new Image().src = mid(nb.name); }
  }
  go(d) { this.show(this.i + d); }
  close() { if (this.dlg.open) this.dlg.close(); }
  onClose() {
    this.lenisRef.current?.start();
    document.documentElement.style.overflow = '';
    this.origin?.focus?.({ preventScroll: true });
  }
  setZoom(z) {
    this.zoom = z; if (z === 1) this.pan = { x: 0, y: 0 };
    this.img.style.transform = z === 1 ? '' : `translate(${this.pan.x}px, ${this.pan.y}px) scale(${z})`;
    this.stage.style.cursor = z === 1 ? '' : 'grab';
  }
  gestures() {
    let sx = 0, sy = 0, px = 0, py = 0, down = false, lastTap = 0;
    this.stage.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; sy = e.clientY; px = this.pan.x; py = this.pan.y; });
    addEventListener('pointermove', (e) => {
      if (!down || this.zoom === 1) return;
      this.pan = { x: px + e.clientX - sx, y: py + e.clientY - sy };
      this.setZoom(this.zoom);
    });
    addEventListener('pointerup', (e) => {
      if (!down) return; down = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (this.zoom === 1) {
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) this.go(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) this.close();
      }
      // двойной тап — зум ×2
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && e.pointerType !== 'mouse') {
        const now = performance.now();
        if (now - lastTap < 300) { this.setZoom(this.zoom === 1 ? 2 : 1); lastTap = 0; } else lastTap = now;
      }
    });
    this.stage.addEventListener('dblclick', () => this.setZoom(this.zoom === 1 ? 2 : 1));
  }
}

export function initSheet(viewer) {
  const grid = document.getElementById('sheet-grid');
  const tabsEl = document.getElementById('tabs');
  const sheet = document.getElementById('sheet');
  if (!grid) return;

  const frames = SHEET.filter((n) => PHOTOS[n]).map((name, k) => ({ name, zone: PHOTOS[name].zone, no: `${12 + k}A` }));
  grid.innerHTML = frames.map((f, k) => {
    const m = MARKS[f.name];
    const pencil = m ? `<svg class="pencil" viewBox="0 0 80 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${pencilPath(m.circle + 3)}" style="transition-delay:${(.15 * (m.circle + 1)).toFixed(2)}s"/></svg>` : '';
    const note = m?.note ? `<span class="note" aria-hidden="true">${m.note}</span>` : '';
    return `<div class="fr" role="listitem" data-zone="${f.zone}" data-i="${k}">
<button class="fr-btn" type="button" data-look aria-label="Открыть кадр ${f.no}: ${PHOTOS[f.name].alt}">${pic(f.name, { sizes: '(min-width: 1024px) 16vw, (min-width: 768px) 30vw, 46vw', alt: '' })}</button>
<span class="fr-no" aria-hidden="true">▸ ${f.no}</span><span class="fr-zone" aria-hidden="true">${zoneShort[f.zone] || ''}</span>${pencil}${note}</div>`;
  }).join('');
  const els = [...grid.children];

  // вкладки: пустая зона — без вкладки
  const counts = frames.reduce((a, f) => ((a[f.zone] = (a[f.zone] || 0) + 1), a), {});
  const zones = ZONES.filter((z) => z.key === 'all' || counts[z.key]);
  tabsEl.innerHTML = zones.map((z, i) => `<button class="tab" role="tab" type="button" data-zone="${z.key}" aria-selected="${i === 0}" aria-controls="sheet-grid">${z.label}<sup>${z.key === 'all' ? frames.length : counts[z.key]}</sup></button>`).join('')
    + '<svg class="tab-line" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 7 C 18 3, 34 10, 51 6 S 80 3, 98 7.5"/></svg>';
  const line = tabsEl.querySelector('.tab-line');
  const linePath = line.querySelector('path');
  const placeLine = (btn, draw) => {
    line.style.width = btn.offsetWidth + 'px';
    line.style.transform = `translateX(${btn.offsetLeft}px) translateY(${btn.offsetTop + btn.offsetHeight - 30}px)`;
    if (draw && window.gsap && !reduced()) window.gsap.fromTo(linePath, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .7, ease: 'power3.out' });
  };
  requestAnimationFrame(() => placeLine(tabsEl.querySelector('[aria-selected="true"]'), false));
  addEventListener('resize', () => placeLine(tabsEl.querySelector('[aria-selected="true"]'), false));
  document.fonts?.ready.then(() => placeLine(tabsEl.querySelector('[aria-selected="true"]'), false));

  let flipping = null;
  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn || btn.getAttribute('aria-selected') === 'true') return;
    tabsEl.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t === btn)));
    placeLine(btn, true);
    const zone = btn.dataset.zone;
    const { gsap, Flip, ScrollTrigger } = window;
    flipping?.progress(1);
    if (!gsap || !Flip || reduced()) {
      els.forEach((el) => el.classList.toggle('is-hidden', zone !== 'all' && el.dataset.zone !== zone));
      window.ScrollTrigger?.refresh();
      return;
    }
    const h0 = grid.offsetHeight;
    const state = Flip.getState(els);
    els.forEach((el) => el.classList.toggle('is-hidden', zone !== 'all' && el.dataset.zone !== zone));
    const h1 = grid.offsetHeight;
    // держим высоту листа, пока кадры absolute, — иначе лист схлопнется и пины ниже съедут
    grid.style.height = h0 + 'px';
    gsap.to(grid, { height: h1, duration: .6, ease: 'power3.out' });
    flipping = Flip.from(state, {
      duration: .6, ease: 'power3.out', stagger: .02, absolute: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .5 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: .92, duration: .35 }),
      onComplete: () => { grid.style.height = ''; ScrollTrigger?.refresh(); },
    });
  });
  tabsEl.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const tabs = [...tabsEl.querySelectorAll('.tab')];
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus(); next.click();
  });

  // карандаш рисуется при появлении листа
  new IntersectionObserver(([en], io) => { if (en.isIntersecting) { sheet.classList.add('is-drawn'); io.disconnect(); } }, { threshold: .18 }).observe(sheet);

  // клик — просмотрщик по видимым кадрам
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.fr-btn');
    if (!btn) return;
    const visible = els.filter((el) => !el.classList.contains('is-hidden'));
    const items = visible.map((el) => { const f = frames[+el.dataset.i]; return { name: f.name, no: f.no, label: zoneShort[f.zone] || '' }; });
    viewer.open(items, visible.indexOf(btn.parentElement), btn);
  });

  // лупа: круг 180 px, увеличение ×2.5 от версии 2000 px
  if (!fine()) return;
  const loupe = document.getElementById('loupe');
  const Z = 2.5, R = 90;
  let cur = null, tx = 0, ty = 0, x = 0, y = 0, raf = 0, rect = null;
  const loop = () => {
    x += (tx - x) * .2; y += (ty - y) * .2;
    loupe.style.transform = `translate(${x}px, ${y}px)`;
    if (rect) loupe.style.backgroundPosition = `${-((x - rect.left) * Z - R)}px ${-((y - rect.top) * Z - R)}px`;
    raf = cur || Math.abs(tx - x) > .5 ? requestAnimationFrame(loop) : 0;
  };
  grid.addEventListener('pointerover', (e) => {
    const btn = e.target.closest('.fr-btn');
    if (!btn || btn === cur) return;
    const f = frames[+btn.parentElement.dataset.i];
    if (!cur) { x = tx = e.clientX; y = ty = e.clientY; }
    cur = btn;
    rect = btn.getBoundingClientRect();
    loupe.style.backgroundImage = `url("${largest(f.name)}")`;
    loupe.style.backgroundSize = `${rect.width * Z}px ${rect.height * Z}px`;
    loupe.classList.add('is-on');
    document.body.classList.add('loupe-on');
    if (!raf) raf = requestAnimationFrame(loop);
  });
  grid.addEventListener('pointermove', (e) => {
    if (!cur) return;
    tx = e.clientX; ty = e.clientY;
    rect = cur.getBoundingClientRect();
    if (!raf) raf = requestAnimationFrame(loop);
  });
  grid.addEventListener('pointerout', (e) => {
    if (!cur || (e.relatedTarget && cur.contains(e.relatedTarget))) return;
    const to = e.relatedTarget?.closest?.('.fr-btn');
    if (to) return;
    cur = null; rect = null;
    loupe.classList.remove('is-on');
    document.body.classList.remove('loupe-on');
  });
}
