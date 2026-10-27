// Переносит список фото из assets/img/manifest.json в js/data.js (между маркерами photos:start / photos:end).
//   node tools/sync-photos.mjs
import fs from 'node:fs';
const manifest = JSON.parse(fs.readFileSync('assets/img/manifest.json', 'utf8'));
const rows = manifest.map((p) => `  '${p.name}': { src: '${p.file}', w: [${p.widths.join(', ')}], ratio: ${p.ratio}, zone: '${p.zone}', alt: ${JSON.stringify(p.alt)} },`);
const block = `/* photos:start */\nexport const PHOTOS = {\n${rows.join('\n')}\n};\n/* photos:end */`;
let js = fs.readFileSync('js/data.js', 'utf8');
const a = js.indexOf('/* photos:start */'), b = js.indexOf('/* photos:end */') + '/* photos:end */'.length;
js = js.slice(0, a) + block + js.slice(b);
fs.writeFileSync('js/data.js', js);
console.log('✓ PHOTOS', manifest.length);
