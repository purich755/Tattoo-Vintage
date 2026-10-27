// Разметка <picture> (AVIF → WebP → JPG) и вспомогательные функции для фото из PHOTOS.
import { PHOTOS } from './data.js';

export const photo = (name) => PHOTOS[name];
const set = (p, ext) => p.w.map((w) => `${p.src}-${w}.${ext} ${w}w`).join(', ');
export const largest = (name, ext = 'webp') => { const p = PHOTOS[name]; return `${p.src}-${p.w[p.w.length - 1]}.${ext}`; };
export const mid = (name, ext = 'webp') => { const p = PHOTOS[name]; const w = p.w.find((x) => x >= 1200) || p.w[p.w.length - 1]; return `${p.src}-${w}.${ext}`; };
export const small = (name, ext = 'webp') => `${PHOTOS[name].src}-${PHOTOS[name].w[0]}.${ext}`;

export function pic(name, { sizes = '100vw', lazy = true, alt, cls = '' } = {}) {
  const p = PHOTOS[name];
  if (!p) return '';
  const w0 = p.w[0];
  const h0 = Math.round(w0 * p.ratio);
  return `<picture${cls ? ` class="${cls}"` : ''}>
<source type="image/avif" srcset="${set(p, 'avif')}" sizes="${sizes}">
<source type="image/webp" srcset="${set(p, 'webp')}" sizes="${sizes}">
<img src="${p.src}-${w0}.jpg" srcset="${set(p, 'jpg')}" sizes="${sizes}" width="${w0}" height="${h0}" alt="${(alt ?? p.alt).replace(/"/g, '&quot;')}"${lazy ? ' loading="lazy"' : ''} decoding="async">
</picture>`;
}

export const pad = (n) => String(n).padStart(2, '0');
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
