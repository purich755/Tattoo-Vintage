// Проверка интерактива: прелоадер → проявка, вкладки (Flip), лупа, просмотрщик, до/после, негативы, карта, меню.
//   node tools/interact.mjs [1440|390]   → ✓/✗ по пунктам и кадры raw/shots/i-<w>-*.jpg
import { chromium } from 'playwright-core';
const W = Number(process.argv[2] || 1440), mobile = W < 768;
const URL = process.env.URL || 'http://localhost:8888/';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: W, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const res = [];
const ok = (name, cond, extra = '') => { res.push(`${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`); };
const shot = (n) => p.screenshot({ path: `raw/shots/i-${W}-${n}.jpg`, type: 'jpeg', quality: 70 });
const go = async (sel, off = 0) => {
  const y = await p.evaluate(([s, off]) => { const el = document.querySelector(s); return el.getBoundingClientRect().top + scrollY + off; }, [sel, off]);
  await p.evaluate((y) => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y), y);
  await p.waitForTimeout(700);
};

await p.goto(URL, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(500);
ok('прелоадер виден в первый визит', await p.evaluate(() => !document.getElementById('pre').hidden && getComputedStyle(document.getElementById('pre')).display !== 'none'));
await shot('pre');
await p.waitForTimeout(1500);
await shot('develop-mid');
await p.waitForTimeout(2600);
ok('прелоадер ушёл ≤ 2.4 с', await p.evaluate(() => document.getElementById('pre').hidden));
ok('проявка запущена', await p.evaluate(() => document.body.classList.contains('dev')));
if (!mobile) ok('WebGL-канвас проявки', await p.evaluate(() => document.getElementById('hero-photo').classList.contains('gl')));
else ok('без WebGL на телефоне', await p.evaluate(() => !document.querySelector('#hero-photo canvas')));
await shot('develop-end');
await p.waitForTimeout(1200);
ok('GSAP и Lenis загружены', await p.evaluate(() => !!(window.gsap && window.ScrollTrigger && window.Flip && (window.__lenis || matchMedia('(prefers-reduced-motion: reduce)').matches))));

// повторный визит — без прелоадера
await p.reload({ waitUntil: 'load' });
ok('повторный визит без прелоадера', await p.evaluate(() => !document.documentElement.hasAttribute('data-pre')));
await p.waitForTimeout(1500);

// вкладки
await go('#works');
const before = await p.evaluate(() => document.querySelectorAll('.fr:not(.is-hidden)').length);
await p.click('.tab[data-zone="backs"]');
await p.waitForTimeout(1100);
const after = await p.evaluate(() => [...document.querySelectorAll('.fr:not(.is-hidden)')].map((f) => f.dataset.zone));
ok('вкладка «Спины» фильтрует', after.length > 0 && after.length < before && after.every((z) => z === 'backs'), `${before} → ${after.length}`);
ok('после фильтра высота листа не нулевая', await p.evaluate(() => document.getElementById('sheet-grid').offsetHeight > 100));
await shot('tab-backs');
await p.click('.tab[data-zone="all"]');
await p.waitForTimeout(1100);
ok('вкладка «Все» возвращает все кадры', await p.evaluate(() => document.querySelectorAll('.fr:not(.is-hidden)').length) === before);
ok('пустых вкладок нет', await p.evaluate(() => [...document.querySelectorAll('.tab sup')].every((s) => +s.textContent > 0)));

// лупа (десктоп)
if (!mobile) {
  const r = await p.evaluate(() => { const b = document.querySelector('.fr-btn').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  await p.mouse.move(r.x - 30, r.y - 30); await p.mouse.move(r.x, r.y, { steps: 6 });
  await p.waitForTimeout(500);
  ok('лупа появляется над кадром', await p.evaluate(() => document.getElementById('loupe').classList.contains('is-on') && /\.webp/.test(document.getElementById('loupe').style.backgroundImage)));
  await shot('loupe');
}

// просмотрщик
await p.evaluate(() => document.querySelectorAll('.fr-btn')[4].click());
await p.waitForTimeout(900);
ok('просмотрщик открыт', await p.evaluate(() => document.getElementById('viewer').open));
const cap1 = await p.textContent('#viewer-cap');
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(600);
const cap2 = await p.textContent('#viewer-cap');
ok('стрелка → листает', cap1 !== cap2, `${cap1} → ${cap2}`);
ok('подпись и счётчик', /КАДР \d+A · /.test(cap2) && /\d\d \/ \d\d/.test(await p.textContent('#viewer-count')));
ok('лента миниатюр', await p.evaluate(() => document.querySelectorAll('#viewer-thumbs button').length) >= 18);
await shot('viewer');
await p.keyboard.press('Escape');
await p.waitForTimeout(400);
ok('Esc закрывает', await p.evaluate(() => !document.getElementById('viewer').open));

// сушка: отпечатки и клик
await go('#drying', mobile ? 0 : 200);
ok('отпечатки на верёвке', await p.evaluate(() => document.querySelectorAll('.print').length) >= 5);
ok('верёвка нарисована', await p.evaluate(() => (document.querySelector('#rope path').getAttribute('d') || '').length > 40));
const sw = await p.evaluate(() => getComputedStyle(document.querySelector('.print')).transform);
await p.waitForTimeout(500);
ok('отпечатки покачиваются', await p.evaluate((sw) => getComputedStyle(document.querySelector('.print')).transform !== sw, sw));

// до/после
await go('#retake', 100);
await p.waitForTimeout(2800);
const cmp = await p.evaluate(() => { const r = document.getElementById('cmp').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
await p.mouse.click(cmp.x + cmp.w * .2, cmp.y + cmp.h * .5);
await p.waitForTimeout(200);
ok('до/после: клик двигает ручку', Math.abs(+(await p.getAttribute('.cmp-handle', 'aria-valuenow')) - 20) <= 2);
await p.focus('.cmp-handle'); await p.keyboard.press('ArrowRight');
ok('до/после: клавиша →', +(await p.getAttribute('.cmp-handle', 'aria-valuenow')) >= 24);
await p.click('.pairs-nav button[data-i="1"]');
ok('переключение пары', await p.evaluate(() => /pair2/.test(document.querySelector('.cmp-after img').currentSrc || document.querySelector('.cmp-after img').src)));

// таймер
await go('#process');
await p.evaluate(() => window.__lenis ? window.__lenis.scrollTo(scrollY + innerHeight * 1.2, { immediate: true, force: true }) : scrollBy(0, innerHeight * 1.2));
await p.waitForTimeout(1500);
ok('таймер: шаг сменился', await p.evaluate(() => [...document.querySelectorAll('.step')].findIndex((s) => s.classList.contains('on'))) > 0);
await shot('timer');

// первый раз
await go('#first', 200);
await p.click('.fear-btn');
ok('негатив проявляется по тапу/клику', await p.getAttribute('.fear-btn', 'aria-expanded') === 'true');
await p.waitForTimeout(1000);
await shot('fear');

// карта
await go('#night', 300);
await p.waitForTimeout(1500);
ok('схема карты нарисована', await p.evaluate(() => !!document.querySelector('#map-sketch svg') && document.getElementById('map').classList.contains('is-drawn')));
await p.click('#map-btn');
ok('кнопка подгружает iframe Яндекс Карт', await p.evaluate(() => /map-widget/.test(document.querySelector('#map-sketch iframe')?.src || '')));

// ссылки
const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ h: a.getAttribute('href'), t: a.target, r: a.rel })));
const bad = links.filter((l) => /^https?:/.test(l.h) && (l.t !== '_blank' || !/noopener/.test(l.r)));
ok('внешние ссылки target=_blank rel=noopener', !bad.length, bad.map((l) => l.h).join(' '));
const need = ['https://t.me/tattoovintage888', 'https://wa.me/79965052031', 'tel:+79965052031', 'https://vk.ru/tattoo5632', 'https://max.ru/join/'];
ok('все CTA на месте', need.every((n) => links.some((l) => l.h.startsWith(n))));
ok('нет якорей в никуда', await p.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every((a) => a.getAttribute('href') === '#top' || document.querySelector(a.getAttribute('href')))));

// футер — свет
await p.evaluate(() => window.__lenis ? window.__lenis.scrollTo(document.body.scrollHeight, { immediate: true, force: true }) : scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(1200);
ok('в футере включён свет', await p.evaluate(() => { const c = getComputedStyle(document.getElementById('foot')).backgroundColor; return /236, 235, 231|rgb\(2[0-3]\d/.test(c); }), await p.evaluate(() => getComputedStyle(document.getElementById('foot')).backgroundColor));

// меню (телефон)
if (mobile) {
  await p.evaluate(() => window.__lenis ? window.__lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0));
  await p.waitForTimeout(500);
  await p.click('#burger');
  ok('бургер открывает меню', await p.evaluate(() => !document.getElementById('menu').hidden));
  await shot('menu');
  await p.click('.menu-list a[href="#night"]');
  await p.waitForTimeout(1800);
  ok('пункт меню закрывает меню и ведёт к кадру', await p.evaluate(() => document.getElementById('menu').hidden && Math.abs(document.getElementById('night').getBoundingClientRect().top) < 120));
  ok('тап-зоны ≥ 44 px', await p.evaluate(() => [...document.querySelectorAll('.btn, .burger, .tab, .pairs-nav button')].filter((e) => e.offsetParent).every((e) => e.getBoundingClientRect().height >= 43.5)));
  ok('текст ≥ 15 px', await p.evaluate(() => [...document.querySelectorAll('p:not(.mono), li, .lead')].filter((e) => e.offsetParent && e.textContent.trim().length > 40).every((e) => parseFloat(getComputedStyle(e).fontSize) >= 15)));
}
ok('нет горизонтального скролла', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
ok('консоль без ошибок', !errs.length, errs.join(' | '));
console.log(res.join('\n'));
console.log(`${res.filter((r) => r.startsWith('✓')).length}/${res.length}`);
await b.close();
