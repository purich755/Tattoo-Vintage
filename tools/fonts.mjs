// Скачивает шрифты с Google Fonts сабсетом под сайт (полный русский и латинский алфавит, цифры, пунктуация)
// в assets/fonts/ и пишет @font-face в css/fonts.css. Сайт не ходит на fonts.googleapis.com —
// первая отрисовка не ждёт чужой CSS, а один woff2 на начертание легче пары latin+cyrillic.
//   node tools/fonts.mjs
import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const ru = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const lat = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const misc = '0123456789 .,:;!?-–—«»„“”"\'’()[]/·•×→←↓↑↗+%№&@#*°′″±₽';
const TEXT = ru + lat + misc;
const HAND = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяGTAДОПСЛЕ0123456789 .,:;!?-–—±↗«»';
const FACES = [
  ['Cormorant Garamond', 'cormorant-500', 'ital,wght@0,500', 'normal', 500],
  ['Cormorant Garamond', 'cormorant-500i', 'ital,wght@1,500', 'italic', 500],
  ['Cormorant Garamond', 'cormorant-600', 'ital,wght@0,600', 'normal', 600],
  ['IBM Plex Mono', 'plex-mono-400', 'wght@400', 'normal', 400],
  ['IBM Plex Mono', 'plex-mono-500', 'wght@500', 'normal', 500],
  ['Manrope', 'manrope-400', 'wght@400', 'normal', 400],
  ['Manrope', 'manrope-500', 'wght@500', 'normal', 500],
  ['Manrope', 'manrope-700', 'wght@700', 'normal', 700],
  ['Caveat', 'caveat-500', 'wght@500', 'normal', 500, HAND],
];
let css = '/* Сгенерировано tools/fonts.mjs — сабсеты Google Fonts (OFL) */\n';
for (const [family, file, axis, style, weight, text = TEXT] of FACES) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:${axis}&text=${encodeURIComponent(text)}&display=swap`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(family + ' ' + res.status);
  const src = (await res.text()).match(/url\((https:[^)]+)\)/)[1];
  const buf = Buffer.from(await (await fetch(src, { headers: { 'User-Agent': UA } })).arrayBuffer());
  fs.writeFileSync(`assets/fonts/${file}.woff2`, buf);
  css += `@font-face { font-family: '${family}'; font-style: ${style}; font-weight: ${weight}; font-display: swap; src: url('../assets/fonts/${file}.woff2') format('woff2'); }\n`;
  console.log(file.padEnd(18), (buf.length / 1024).toFixed(1), 'КБ');
}
fs.writeFileSync('css/fonts.css', css);
