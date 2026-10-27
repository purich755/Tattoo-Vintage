// Качает фото галереи Яндекс.Карт (raw/ya-urls.txt — базовые URL без размера) в raw/ya/ya<NNN>.jpg,
// пробуя orig → XXXL → XXL_height → XXL.   node tools/ya-fetch.mjs
import fs from 'node:fs';
const SIZES = ['orig', 'XXXL', 'XXL_height', 'XXL'];
const urls = fs.readFileSync('raw/ya-urls.txt', 'utf8').split(/\r?\n/).filter(Boolean);
fs.mkdirSync('raw/ya', { recursive: true });
const list = urls.map((base, i) => ({ n: i + 1, base }));
await Promise.all(Array.from({ length: 6 }, async (_, w) => {
  for (let i = w; i < list.length; i += 6) {
    const p = list[i];
    const dest = `raw/ya/ya${String(p.n).padStart(3, '0')}.jpg`;
    for (const s of SIZES) {
      try {
        const r = await fetch(p.base + s, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!r.ok) continue;
        const b = Buffer.from(await r.arrayBuffer());
        if (b.length < 10000) continue;
        fs.writeFileSync(dest, b); p.size = s; break;
      } catch {}
    }
  }
}));
fs.writeFileSync('raw/ya-photos.json', JSON.stringify(list, null, 1));
console.log(list.reduce((a, p) => ((a[p.size || 'нет'] = (a[p.size || 'нет'] || 0) + 1), a), {}));
