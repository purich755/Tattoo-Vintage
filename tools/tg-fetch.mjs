// Качает фото постов из raw/tg-posts.json в raw/tg/ (tg<пост>-<n>.jpg) и превью видео в raw/tg-thumbs/.
//   node tools/tg-fetch.mjs
import fs from 'node:fs';
const posts = JSON.parse(fs.readFileSync('raw/tg-posts.json', 'utf8'));
fs.mkdirSync('raw/tg', { recursive: true });
fs.mkdirSync('raw/tg-thumbs', { recursive: true });
const jobs = [];
for (const p of posts) {
  p.photos.forEach((u, i) => jobs.push([u, `raw/tg/tg${String(p.id).padStart(3, '0')}-${i + 1}.jpg`]));
  p.thumbs.forEach((u, i) => jobs.push([u, `raw/tg-thumbs/tg${String(p.id).padStart(3, '0')}-v${i + 1}.jpg`]));
}
let ok = 0, bad = 0;
await Promise.all(Array.from({ length: 6 }, async (_, w) => {
  for (let i = w; i < jobs.length; i += 6) {
    const [u, dest] = jobs[i];
    if (fs.existsSync(dest)) { ok++; continue; }
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://t.me/' } });
      if (!r.ok) { bad++; continue; }
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); ok++;
    } catch { bad++; }
  }
}));
console.log('ok', ok, 'bad', bad, 'из', jobs.length);
