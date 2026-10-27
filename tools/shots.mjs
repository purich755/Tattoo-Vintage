// Скриншоты кадров и базовые проверки: ошибки консоли, горизонтальный скролл, внешние хотлинки.
//   node tools/shots.mjs [ширина=1440] [высота=900]   → raw/shots/<w>-<кадр>.jpg
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || (W < 768 ? 844 : 900));
const URL = process.env.URL || 'http://localhost:8888/';
const mobile = W < 768;
fs.mkdirSync('raw/shots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, locale: 'ru-RU' });
await ctx.addInitScript(() => { try { sessionStorage.setItem('tv-pre', '1'); } catch {} });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('requestfailed', (r) => errors.push('failed: ' + r.url()));
await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(3200);
await page.screenshot({ path: `raw/shots/${W}-01-hero.jpg`, quality: 70, type: 'jpeg' });
const ids = ['fix', 'masters', 'works', 'drying', 'retake', 'process', 'first', 'more', 'night', 'foot'];
const go = (y) => page.evaluate((y) => { if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }, y);
for (const [i, id] of ids.entries()) {
  const y = await page.evaluate((id) => {
    const el = document.getElementById(id);
    const sp = el.closest('.pin-spacer');
    return (sp || el).getBoundingClientRect().top + scrollY;
  }, id);
  // плавно, шагами — чтобы ленивые картинки и IO успели сработать
  const cur = await page.evaluate(() => scrollY);
  for (let s = 1; s <= 6; s++) { await go(cur + ((y - cur) * s) / 6); await page.waitForTimeout(120); }
  await go(y + (id === 'drying' && !mobile ? 0 : 0));
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `raw/shots/${W}-${String(i + 2).padStart(2, '0')}-${id}.jpg`, quality: 70, type: 'jpeg' });
}
// середина пинов
for (const [id, frac] of [['drying', .6], ['process', .55]]) {
  const y = await page.evaluate(([id, frac]) => { const el = document.getElementById(id); const sp = el.querySelector('.pin-spacer') || el.closest('.pin-spacer') || el; const r = sp.getBoundingClientRect(); return r.top + scrollY + (r.height - innerHeight) * frac; }, [id, frac]);
  await go(y); await page.waitForTimeout(1400);
  await page.screenshot({ path: `raw/shots/${W}-pin-${id}.jpg`, quality: 70, type: 'jpeg' });
}
const audit = await page.evaluate(() => ({
  innerWidth, docWidth: document.documentElement.scrollWidth,
  hot: [...document.querySelectorAll('[src],[href],[srcset]')].map((e) => e.getAttribute('src') || e.getAttribute('href') || e.getAttribute('srcset')).filter((u) => /mds\.yandex|userapi|telesco/.test(u)),
  h1: document.querySelectorAll('h1').length,
  noAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
  height: document.body.scrollHeight,
  fonts: [...new Set([...document.querySelectorAll('h1,h2,p,.mono')].map((e) => getComputedStyle(e).fontFamily.split(',')[0]))],
}));
console.log(JSON.stringify(audit));
console.log(errors.length ? errors.join('\n') : 'консоль чистая');
await browser.close();
