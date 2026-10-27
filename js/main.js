// Точка входа: данные → разметка, шапка и часы, меню, курсор-фонарь, «набор плотности»,
// затем GSAP + ScrollTrigger + Flip + Lenis (грузятся после load) — пины, скрабы, свет в футере.
import { STUDIO, LINKS, CONTACT_ROWS, MASTERS, FEARS, QUOTES, SERVICES, PHOTOS } from './data.js';
import { pic, mid, reduced, fine } from './pic.js';
import { initDevelop } from './develop.js';
import { initSheet, Viewer } from './contact-sheet.js';
import { initDrying } from './drying-line.js';
import { initTimer } from './timer.js';
import { initCompare } from './compare.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lenisRef = { current: null };
const ext = (url) => /^https?:/.test(url);

/* ── данные → ссылки и факты ─────────────────────── */
const FACTS = { ...STUDIO, ...STUDIO.address, phoneText: LINKS.phoneText };
$$('[data-link]').forEach((a) => { const u = LINKS[a.dataset.link]; if (u) a.href = u; });
$$('[data-fact]').forEach((el) => { const v = FACTS[el.dataset.fact]; if (typeof v === 'string') el.textContent = v; });
$('#amen').textContent = `Ост. ${STUDIO.stop} · ${STUDIO.amenities.join(' · ')}`;

/* ── живые часы (Europe/Moscow), двоеточие мигает. Статус «открыто/закрыто» не считаем ── */
const fmt = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const clocks = $$('[data-clock]');
let lastClock = '';
function tickClock() {
  const parts = fmt.formatToParts(new Date());
  const h = parts.find((p) => p.type === 'hour').value, m = parts.find((p) => p.type === 'minute').value;
  if (h + m !== lastClock) { lastClock = h + m; clocks.forEach((c) => { c.innerHTML = `${h}<span class="colon">:</span>${m}`; }); }
}
tickClock();
setInterval(tickClock, 1000);

/* ── перфорация между кадрами ───────────────────── */
$$('.perf').forEach((p) => { p.innerHTML = Array(14).fill(`<span>VINTAGE 888 · SAFETY FILM · ${p.dataset.perf} ▸</span>`).join(''); });
const heroPerf = $('#hero-perf');
heroPerf.innerHTML = Array.from({ length: 36 }, (_, i) => `<span>◂ ${String((i % 36) + 1).padStart(2, '0')}A</span>`).join('');

/* ── 01A проявка ─────────────────────────────────── */
initDevelop($('#hero-photo'), $('#hero-img'));

/* ── 03 мастера ──────────────────────────────────── */
$('#masters-film').innerHTML = `<div class="film">${MASTERS.map((m) => `<figure class="mframe" data-look>
<div class="mframe-pic">${pic(m.photo, { sizes: '(min-width: 1024px) 26vw, (min-width: 768px) 45vw, 90vw', alt: `${PHOTOS[m.photo].alt}. ${m.name}, мастер Tattoo Vintage` })}
<span class="mframe-no mono" aria-hidden="true">▸ ${m.frame}A</span><span class="mframe-note mono">Портрет — в полной версии</span></div>
<figcaption class="mframe-name">${m.name.toUpperCase()}</figcaption>
<blockquote class="mquote"><p>«${m.quote.text}»</p><cite class="mono">${m.quote.author} · ${m.quote.date}</cite></blockquote>
</figure>`).join('')}<span class="film-edge mono" aria-hidden="true">TATTOO VINTAGE 888 · 2 КАДРА · ОДНА ПЛЁНКА</span></div>`;
if (!fine()) {
  const io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-pos'); io.unobserve(en.target); } }), { threshold: .6 });
  $$('.mframe').forEach((f) => io.observe(f));
}

/* ── 04–07 ───────────────────────────────────────── */
const viewer = new Viewer(lenisRef);
initSheet(viewer);
const drying = initDrying(viewer);
initCompare();
const timer = initTimer();

/* ── 08 первый раз ───────────────────────────────── */
$('#fears').innerHTML = FEARS.map((f, i) => `<li class="fear"><button class="fear-btn" type="button" aria-expanded="false">
<span class="fear-neg"><b>${f.q}</b><span aria-hidden="true">Негатив №${i + 1} · проявить</span></span>
<span class="fear-pos"><span class="fp-a">${f.a}</span><span class="fp-q">«${f.quote.text}»<span class="fp-c">${f.quote.author} · ${f.quote.date}</span></span></span>
</button></li>`).join('');
$('#fears').addEventListener('click', (e) => {
  const b = e.target.closest('.fear-btn');
  if (b) b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true'));
});
const strip = (list) => list.map((q) => `<figure class="q"><p>«${q.text}»</p><cite>${q.author} · ${q.date}</cite></figure>`).join('');
const half = Math.ceil(QUOTES.length / 2);
for (const [id, list] of [['#strip-a', QUOTES.slice(0, half)], ['#strip-b', QUOTES.slice(half)]]) {
  $(id).innerHTML = `<div class="strip-set" style="display:contents">${strip(list)}</div><div class="strip-set" style="display:contents" aria-hidden="true">${strip(list)}</div>`;
}

/* ── 09 ещё в студии ─────────────────────────────── */
$('#svc').innerHTML = SERVICES.map((s) => `<li data-photo="${s.photo || ''}"><div class="svc-row"><h3 class="svc-name">${s.name}</h3><p class="svc-detail mono">${s.detail}</p></div></li>`).join('');
if (fine() && !reduced()) {
  const peek = $('#svc-peek');
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false;
  const loop = () => { x += (tx - x) * .14; y += (ty - y) * .14; peek.style.transform = `translate(${x + 28}px, ${y - 140}px) rotate(-2deg)`; raf = on || Math.abs(tx - x) > .5 ? requestAnimationFrame(loop) : 0; };
  $('#svc').addEventListener('pointerover', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const p = li.dataset.photo;
    peek.innerHTML = p ? `<img src="${mid(p)}" alt="">` : '<div class="blank">Кадр не проявлен<br>фото — в полной версии</div>';
    if (!on) { x = tx = e.clientX; y = ty = e.clientY; }
    on = true; peek.classList.add('is-on');
    if (!raf) raf = requestAnimationFrame(loop);
  });
  $('#svc').addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
  $('#svc').addEventListener('pointerleave', () => { on = false; peek.classList.remove('is-on'); });
}

/* ── 10 ночная смена ─────────────────────────────── */
$('#rows').innerHTML = CONTACT_ROWS.map((r) => {
  const url = LINKS[r.key];
  return `<li><a href="${url}"${ext(url) ? ' target="_blank" rel="noopener"' : ''}><span class="row-label">${r.label}</span><span class="row-note mono">${r.note}</span><span class="row-arr" aria-hidden="true">${ext(url) ? '↗' : '→'}</span></a></li>`;
}).join('');
const map = $('#map'), sketch = $('#map-sketch');
new IntersectionObserver(async ([en], io) => {
  if (!en.isIntersecting) return;
  io.disconnect();
  try { sketch.innerHTML = await (await fetch('assets/svg/map.svg')).text(); } catch { return; }
  new IntersectionObserver(([e2], io2) => { if (e2.isIntersecting) { requestAnimationFrame(() => map.classList.add('is-drawn')); io2.disconnect(); } }, { threshold: .35 }).observe(sketch);
}, { rootMargin: '60% 0px' }).observe(map);
$('#map-btn').addEventListener('click', (e) => {
  sketch.innerHTML = `<iframe src="${LINKS.map}" title="Карта: Tattoo Vintage, ${STUDIO.address.street}" loading="lazy" allowfullscreen></iframe>`;
  e.currentTarget.hidden = true;
});

/* ── 11 футер ────────────────────────────────────── */
$('#foot-contacts').innerHTML = [['Telegram', LINKS.telegram], ['WhatsApp', LINKS.whatsapp], [LINKS.phoneText, LINKS.phone], ['ВКонтакте', LINKS.vk], ['MAX', LINKS.max]]
  .map(([t, u]) => `<a href="${u}"${ext(u) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`).join('<span aria-hidden="true">·</span>');

/* ── шапка: прячется вниз, показывается вверх; полоса прогресса; мобильная плашка ── */
const hdr = $('#hdr'), progress = $('#progress'), dock = $('#dock'), night = $('#night'), heroEl = $('#top');
let lastY = scrollY, ticking = false;
function onScroll() {
  ticking = false;
  const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
  if (!document.body.classList.contains('menu-open')) {
    if (y > lastY + 4 && y > 300) hdr.classList.add('is-up');
    else if (y < lastY - 4 || y < 300) hdr.classList.remove('is-up');
  }
  hdr.classList.toggle('is-solid', y > 40);
  progress.style.transform = `scaleX(${H > 0 ? Math.min(1, y / H) : 0})`;
  heroPerf.style.transform = `translateY(${(-y * .35).toFixed(1)}px)`;
  const nightTop = night.getBoundingClientRect().top;
  dock.classList.toggle('is-on', y > heroEl.offsetHeight * .8 && nightTop > innerHeight * .6);
  lastY = y;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* ── меню ────────────────────────────────────────── */
const burger = $('#burger'), menu = $('#menu');
function setMenu(open) {
  menu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Меню');
  if (open) { hdr.classList.remove('is-up'); lenisRef.current?.stop(); menu.querySelector('a')?.focus(); }
  else lenisRef.current?.start();
}
burger.addEventListener('click', () => setMenu(menu.hidden));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

/* ── якоря ───────────────────────────────────────── */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const el = id === '#top' ? document.body : $(id);
  if (!el) return;
  e.preventDefault();
  if (!menu.hidden) setMenu(false);
  if (lenisRef.current) lenisRef.current.scrollTo(id === '#top' ? 0 : el, { duration: 1.4 });
  else (id === '#top' ? scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }) : el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }));
  if (id !== '#top') { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
});

/* ── курсор-фонарь ───────────────────────────────── */
if (fine()) {
  const lamp = $('.lamp'), glow = $('.lamp-glow'), dot = $('.lamp-dot'), label = dot.firstElementChild;
  let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my, dx = mx, dy = my, raf = 0;
  const loop = () => {
    gx += (mx - gx) * .08; gy += (my - gy) * .08; dx += (mx - dx) * .35; dy += (my - dy) * .35;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    dot.style.transform = `translate(${dx}px, ${dy}px)`;
    raf = Math.abs(mx - gx) + Math.abs(my - gy) > .3 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const look = e.target.closest('[data-look]');
    const link = e.target.closest('a, button, [role="slider"]');
    lamp.classList.toggle('is-look', !!look);
    lamp.classList.toggle('is-big', !!(look || link));
    label.textContent = look ? 'СМОТРЕТЬ' : link?.target === '_blank' ? '↗' : '';
  });
  document.documentElement.addEventListener('pointerleave', () => lamp.classList.add('is-hidden'));
  document.documentElement.addEventListener('pointerenter', () => lamp.classList.remove('is-hidden'));
}

/* ── «набор плотности»: contrast(.4) brightness(1.6) blur(6px) → норма за 0,9 с + y 24px ── */
if (!reduced()) {
  const dense = $$('.dense, .svc li, .rows li, .descent, .fear, .gift-text, .envelope, .masters-film, .compare-wrap');
  const io = new IntersectionObserver((ens) => ens.forEach((en) => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    en.target.animate([
      { filter: 'contrast(.4) brightness(1.6) blur(6px)', translate: '0 24px' },
      { filter: 'contrast(1) brightness(1) blur(0px)', translate: '0 0' },
    ], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)', delay: (en.target.dataset.d || 0) * 1 });
  }), { rootMargin: '0px 0px -8% 0px' });
  // только то, что ниже первого экрана: видимое при загрузке не мигает
  dense.forEach((el, i) => { if (el.getBoundingClientRect().top > innerHeight) { el.dataset.d = (i % 4) * 70; io.observe(el); } });
}

/* ── 02 слова манифеста: разбиваем на слова (только обычные пробелы — &nbsp; держит пару) ── */
const words = $('[data-words]');
(function split(node) {
  for (const n of [...node.childNodes]) {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
        if (!part) return;
        if (/^[ \t\n\r]+$/.test(part)) frag.append(' ');
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s); }
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) n.classList.add('w');
  }
})(words);

/* ── библиотеки после load: GSAP, ScrollTrigger, Flip, Lenis ── */
const LIBS = [
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js',
  'https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js',
];
function loadLibs() {
  return Promise.all(LIBS.map((src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = false; s.onload = res; s.onerror = rej;
    document.head.append(s);
  })));
}

function initScroll() {
  const { gsap, ScrollTrigger, Flip, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger, Flip);
  if (!reduced() && Lenis) {
    const lenis = new Lenis({ lerp: .1 });
    lenisRef.current = lenis;
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  }
  // пины — первыми, чтобы остальные триггеры учитывали их длину
  drying.pin?.(gsap, ScrollTrigger);
  timer.pin?.(gsap, ScrollTrigger);

  if (!reduced()) {
    gsap.fromTo(words.querySelectorAll('.w'), { opacity: .15, filter: 'blur(3px)' }, {
      opacity: 1, filter: 'blur(0px)', stagger: .12, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: words, start: 'top bottom', end: 'bottom 52%', scrub: .6 },
    });
  }
  // футер: красный гаснет, включают белый свет
  const foot = $('#foot');
  gsap.fromTo(foot, { '--fbg': '#0C0B0A', '--ftx': '#C8C5BE' }, {
    '--fbg': '#ECEBE7', '--ftx': '#0C0B0A', ease: 'none',
    scrollTrigger: { trigger: foot, start: 'top 90%', end: 'top 30%', scrub: true, onUpdate: (s) => document.body.classList.toggle('lights-on', s.progress > .5) },
  });

  // одна перестройка, когда высота страницы действительно изменилась (шрифты, картинки)
  let h = document.body.scrollHeight, t = 0;
  new ResizeObserver(() => {
    const nh = document.body.scrollHeight;
    if (Math.abs(nh - h) < 2) return;
    h = nh; clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 200);
  }).observe(document.body);
}

const boot = () => loadLibs().then(initScroll).catch(() => {
  // без библиотек страница работает: обычный скролл, без пинов; футер включает свет по пересечению
  new IntersectionObserver(([en]) => { $('#foot').classList.toggle('is-lit', en.isIntersecting); }, { threshold: .3 }).observe($('#foot'));
});
if (document.readyState === 'complete') boot(); else addEventListener('load', boot, { once: true });
