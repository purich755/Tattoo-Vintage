// Сборка фото сайта: AVIF + WebP + JPG в ширинах 640 / 1200 / 2000 (без увеличения), assets/img/manifest.json,
// OG-картинка 1200×630, видео процесса. Цвет не трогаем — обесцвечивание только в эффектах.
//   node tools/build-images.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ya = JSON.parse(fs.readFileSync('raw/ya-photos.json', 'utf8'));
const tgPosts = JSON.parse(fs.readFileSync('raw/tg-posts.json', 'utf8'));
const src = (id) => {
  if (id.startsWith('ya')) return { file: `raw/ya/${id}.jpg`, source: 'Яндекс Карты', url: ya[Number(id.slice(2)) - 1].base + 'orig' };
  if (id.startsWith('tg')) { const post = Number(id.slice(2, 5)); return { file: `raw/tg/${id}.jpg`, source: 'Telegram', url: `https://t.me/tattoovintage888/${post}` }; }
  if (id.startsWith('v')) { const post = Number(id.slice(1).split('-')[0]); return { file: `raw/vframes/${id}.jpg`, source: 'Telegram (кадр видео)', url: `https://t.me/tattoovintage888/${post}` }; }
};

// [имя, исходник, зона, alt, crop (доли x, y, w, h) | null]
const PHOTOS = [
  // хиро
  ['hero', 'ya051', 'hero', 'Чёрно-серый рукав с ангелами на фоне оливковой стены студии, Tattoo Vintage', [0, 0.07, 1, 0.93]],
  // контактный лист
  ['sleeve-scandi', 'ya010', 'sleeves', 'Чёрно-серый рукав в скандинавском стиле, Tattoo Vintage', null],
  ['sleeve-faith', 'ya034', 'sleeves', 'Чёрно-серый рукав с портретом и облаками, Tattoo Vintage', null],
  ['sleeve-dragon', 'ya043', 'sleeves', 'Рукав с драконом в чёрно-сером, Tattoo Vintage', null],
  ['sleeve-full', 'ya044', 'sleeves', 'Полный рукав, чёрно-серый реализм, Tattoo Vintage', null],
  ['sleeve-lilies', 'ya045', 'sleeves', 'Женский рукав с цветами и драконом, Tattoo Vintage', null],
  ['sleeve-samurai', 'ya054', 'sleeves', 'Рукав с самураем, чёрный и красный, Tattoo Vintage', null],
  ['sleeve-olive', 'ya035', 'sleeves', 'Женский рукав на фоне оливковой стены, Tattoo Vintage', null],
  ['forearm-madonna', 'ya041', 'sleeves', 'Реалистичный портрет с чётками на предплечье, Tattoo Vintage', null],
  ['back-gta', 'ya001', 'backs', 'Чёрно-серая татуировка на всю спину на тему GTA, Tattoo Vintage', null],
  ['back-angels', 'ya023', 'backs', 'Чёрно-серая татуировка на спине с ангелами и надписью, Tattoo Vintage', null],
  ['leg-portraits', 'ya026', 'legs', 'Нога с женскими портретами и орнаментом, Tattoo Vintage', null],
  ['leg-caesar', 'ya048', 'legs', 'Статуя в чёрно-сером на икре, Tattoo Vintage', null],
  ['leg-familia', 'ya016', 'legs', 'Надпись Familia и компас на голени, Tattoo Vintage', [0, 0.04, 1, 0.92]],
  ['leg-red', 'ya030', 'legs', 'Татуировка с красными акцентами на голени, Tattoo Vintage', [0, 0.05, 1, 0.9]],
  ['small-hands', 'ya038', 'small', 'Молитвенные руки и надпись «Спаси и сохрани» на кисти, Tattoo Vintage', null],
  ['small-script', 'ya042', 'small', 'Надпись Until the very end под ключицей, Tattoo Vintage', [0, 0.25, 1, 0.75]],
  ['small-dagger', 'ya047', 'small', 'Кинжал с надписью вдоль предплечья, Tattoo Vintage', null],
  ['small-ankh', 'ya056', 'small', 'Маленький анх на шее, файнлайн, Tattoo Vintage', null],
  ['small-lilies', 'ya039', 'small', 'Лилии под ключицей, файнлайн, Tattoo Vintage', [0, 0.18, 1, 0.82]],
  ['small-thorns', 'ya063', 'small', 'Графичный орнамент вдоль предплечья, Tattoo Vintage', null],
  ['cover-dragon', 'ya021', 'covers', 'Перекрытие старой татуировки драконом на груди, Tattoo Vintage', null],
  ['cover-clown', 'tg320-2', 'covers', 'Перекрытие старой работы: новый эскиз на предплечье, Tattoo Vintage', null],
  // сушка (крупные)
  ['dry-leg', 'tg330-1', 'drying', 'Нога в чёрно-сером после первого дня работы, Tattoo Vintage', null],
  ['dry-sleeve', 'tg331-1', 'drying', 'Законченный внешний рукав, Tattoo Vintage', null],
  ['dry-black-dragon', 'ya065', 'drying', 'Дракон в чёрно-сером на плече и руке, Tattoo Vintage', null],
  ['dry-red-sleeve', 'ya029', 'drying', 'Рукав в японском стиле с красным, Tattoo Vintage', null],
  // до / после
  // пары кадрированы так, чтобы татуировки легли друг на друга (пост 138 — руки по разным диагоналям, не совместить)
  ['pair1-before', 'tg320-1', 'pairs', 'Старая татуировка на предплечье до перекрытия', [.25, .15, .5, .75]],
  ['pair1-after', 'tg320-2', 'pairs', 'То же предплечье после перекрытия, Tattoo Vintage', [.21, .13, .5, .75]],
  ['pair2-before', 'tg294-2', 'pairs', 'Расплывшиеся птицы на запястье до исправления', [.25, .25, .55, .6]],
  ['pair2-after', 'tg294-1', 'pairs', 'Птицы на запястье после исправления, Tattoo Vintage', [.30, .20, .495, .6]],
  // мастера и процесс
  ['hands-1', 'v304-t3', 'masters', 'Руки мастера с машинкой над переведённым эскизом', null],
  ['hands-2', 'v162-t1', 'masters', 'Руки мастера в чёрных перчатках, сеанс на предплечье', null],
  ['process', 'v280-t3', 'process', 'Процесс: заливка чёрных полос на руке', null],
  // услуги
  ['piercing', 'tg194-1', 'services', 'Пирсинг уха: индастриал и кольца', [0, 0, 1, 0.8]],
];

const ONLY = process.argv[2];
const W = [640, 1200, 2000];
fs.mkdirSync('assets/img', { recursive: true });
const old = ONLY && fs.existsSync('assets/img/manifest.json') ? JSON.parse(fs.readFileSync('assets/img/manifest.json', 'utf8')) : [];
const manifest = [];
for (const [name, id, zone, alt, crop] of PHOTOS) {
  if (ONLY && !name.startsWith(ONLY)) { const o = old.find((p) => p.name === name); if (o) manifest.push(o); continue; }
  const s = src(id);
  let base = sharp(s.file).rotate();
  const meta = await sharp(await base.clone().toBuffer()).metadata();
  if (crop) {
    const [x, y, w, h] = crop;
    base = sharp(await base.toBuffer()).extract({ left: Math.round(x * meta.width), top: Math.round(y * meta.height), width: Math.round(w * meta.width), height: Math.round(h * meta.height) });
  }
  const buf = await base.toBuffer();
  const m = await sharp(buf).metadata();
  const widths = [...new Set(W.map((w) => Math.min(w, m.width)))];
  const files = {};
  for (const w of widths) {
    const p = sharp(buf).resize({ width: w, withoutEnlargement: true });
    const stem = `assets/img/${name}-${w}`;
    await p.clone().avif({ quality: 52, effort: 5 }).toFile(`${stem}.avif`);
    await p.clone().webp({ quality: 80, effort: 5 }).toFile(`${stem}.webp`);
    await p.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${stem}.jpg`);
    files[w] = stem;
  }
  const h = Math.round((m.height / m.width) * 1000) / 1000;
  manifest.push({ name, file: `assets/img/${name}`, widths, source: s.source, url: s.url, raw: id, zone, alt, width: m.width, height: m.height, ratio: h });
  console.log(name.padEnd(18), id.padEnd(9), `${m.width}x${m.height}`, widths.join('/'));
}
fs.writeFileSync('assets/img/manifest.json', JSON.stringify(manifest, null, 1));
if (ONLY) { console.log('✓ частично', ONLY); process.exit(0); }

// Open Graph: геройский кадр справа + знак и имя на --ink
{
  const hero = await sharp('raw/ya/ya051.jpg').rotate().resize(520, 630, { fit: 'cover', position: 'top' }).toBuffer();
  const svg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0C0B0A"/>
  <g transform="translate(80 120)" fill="none" stroke="#C4261C" stroke-width="3"><circle r="34" cx="34" cy="34"/><circle r="22" cx="34" cy="34"/><circle r="10" cx="34" cy="34"/></g>
  <text x="80" y="300" font-family="Georgia, serif" font-size="96" fill="#ECEBE7">Tattoo</text>
  <text x="150" y="400" font-family="Georgia, serif" font-style="italic" font-size="96" fill="#ECEBE7">Vintage</text>
  <text x="80" y="500" font-family="Courier New, monospace" font-size="22" letter-spacing="4" fill="#C8C5BE">КРАСНОДАР · ЧЁРНО-СЕРЫЙ РЕАЛИЗМ</text>
  <rect x="680" y="0" width="520" height="630" fill="#C4261C" opacity=".06"/>
</svg>`);
  await sharp(svg).composite([{ input: hero, left: 680, top: 0 }]).jpeg({ quality: 82, mozjpeg: true }).toFile('assets/img/og.jpg');
}

// Видео процесса для фона таймера: 8 с, без звука, 540 px по ширине
fs.mkdirSync('assets/video', { recursive: true });
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
ff(['-ss', '1', '-t', '8', '-i', 'raw/tgvid/v280.mp4', '-an', '-vf', 'scale=540:-2,fps=24', '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'assets/video/process.mp4']);
ff(['-ss', '1', '-t', '8', '-i', 'raw/tgvid/v280.mp4', '-an', '-vf', 'scale=540:-2,fps=24', '-c:v', 'libvpx-vp9', '-crf', '42', '-b:v', '0', 'assets/video/process.webm']);
for (const f of ['process.mp4', 'process.webm']) console.log(f, (fs.statSync(`assets/video/${f}`).size / 1024).toFixed(0), 'КБ');

// Источники
const lines = ['# Источники фото', '', 'Все файлы скачаны локально. Яндекс Карты — галерея организации (https://yandex.ru/maps/org/tattoo_vintage/115039352448/gallery/), Telegram — публичное превью канала https://t.me/s/tattoovintage888.', '', '| Файл | Зона | Источник | Оригинал |', '|---|---|---|---|'];
for (const p of manifest) lines.push(`| ${p.file} | ${p.zone} | ${p.source} (${p.raw}) | ${p.url} |`);
lines.push('| assets/video/process.* | process | Telegram (видео) | https://t.me/tattoovintage888/280 |');
fs.writeFileSync('assets/img/SOURCES.md', lines.join('\n') + '\n');
console.log('✓', manifest.length);
void tgPosts;
