// Схема квартала из геометрии OSM (raw/osm.json): улицы линиями, дома — бледными контурами,
// ул. Петра Метальникова светлее, красная точка — студия. Выход: assets/svg/map.svg (JS вставляет инлайном).
//   node tools/build-map.mjs
import fs from 'node:fs';
const ORG = [39.005532, 45.095541];
const W = 800, H = 640;
const kx = Math.cos((ORG[1] * Math.PI) / 180) * 111320, ky = 110540;
const S = 1.05; // px на метр
const OX = W * 0.56, OY = H * 0.5;
const pr = ([lon, lat]) => [OX + (lon - ORG[0]) * kx * S, OY - (lat - ORG[1]) * ky * S];
const r1 = (v) => Math.round(v * 10) / 10;
const osm = JSON.parse(fs.readFileSync('raw/osm.json', 'utf8'));
const MAIN = 'улица Петра Метальникова';
const roads = [], main = [], houses = [];
const BIG = /^(primary|secondary|tertiary)$/;
const big = [];
for (const el of osm.elements) {
  if (!el.geometry) continue;
  const pts = el.geometry.map((g) => pr([g.lon, g.lat]));
  if (pts.every(([x, y]) => x < -80 || x > W + 80 || y < -80 || y > H + 80)) continue;
  const d = 'M' + pts.map((p) => p.map(r1).join(',')).join('L');
  if (el.tags.building) houses.push(d + 'Z');
  else if (el.tags.name === MAIN) main.push({ d, pts });
  else if (BIG.test(el.tags.highway)) big.push(d);
  else roads.push(d);
}
// подпись главной улицы — по самому длинному видимому отрезку, слева направо
let best = null, bl = 0;
for (const s of main) {
  const inside = s.pts.filter(([x, y]) => x > 40 && x < W - 40 && y > 40 && y < H - 40);
  const L = inside.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - inside[i - 1][0], p[1] - inside[i - 1][1]) : 0), 0);
  if (L > bl) { bl = L; best = inside; }
}
if (best && best[0][0] > best[best.length - 1][0]) best = [...best].reverse();
const labelD = best ? 'M' + best.map((p) => p.map(r1).join(',')).join('L') : '';
const svg = `<svg class="map-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="map-t" preserveAspectRatio="xMidYMid slice">
<title id="map-t">Схема: Tattoo Vintage на улице Петра Метальникова, 28, Краснодар</title>
<g class="m-houses">${houses.map((d) => `<path d="${d}"/>`).join('')}</g>
<g class="m-roads">${roads.map((d) => `<path pathLength="1" d="${d}"/>`).join('')}</g>
<g class="m-big">${big.map((d) => `<path pathLength="1" d="${d}"/>`).join('')}</g>
<g class="m-main">${main.map((s) => `<path pathLength="1" d="${s.d}"/>`).join('')}</g>
${labelD ? `<path id="m-lbl" d="${labelD}" fill="none" stroke="none"/><text class="m-label"><textPath href="#m-lbl" startOffset="8%">УЛ. ПЕТРА МЕТАЛЬНИКОВА</textPath></text>` : ''}
<g class="m-org" transform="translate(${r1(OX)} ${r1(OY)})"><circle class="m-pulse" r="22"/><circle class="m-ring" r="13"/><circle r="5.5"/><text x="20" y="-18">28 · ВХОД 2 · ЦОКОЛЬ</text></g>
</svg>`;
fs.mkdirSync('assets/svg', { recursive: true });
fs.writeFileSync('assets/svg/map.svg', svg);
console.log('map.svg', (svg.length / 1024).toFixed(1), 'КБ · дома', houses.length, 'улицы', roads.length, 'крупные', big.length, 'главная', main.length);
