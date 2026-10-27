// Проявка хиро: WebGL-канвас поверх <img> (img остаётся для SEO, LCP и фолбэка).
// Тёмные участки проявляются первыми, как на настоящей бумаге; от курсора по «раствору» идёт рябь.
// Фолбэк (нет WebGL, телефоны, reduced-motion) — CSS-переход фильтра на самом <img> (body.dev в css/sections.css).

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * .5 + .5, .5 - aPos.y * .5);
  gl_Position = vec4(aPos, 0., 1.);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uMouse;
uniform float uProgress;
uniform float uTime;
uniform float uRipple;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  // рябь раствора от курсора (расстояние с поправкой на пропорции канваса)
  vec2 dv = (uv - uMouse) * vec2(uRes.x / uRes.y, 1.);
  float d = length(dv);
  uv += normalize(uv - uMouse + 1e-5) * sin(d * 60.0 - uTime * 6.0) * 0.004 * uRipple * smoothstep(0.35, 0.0, d);
  // cover-подгонка: object-fit: cover; object-position: 50% 22%
  float sc = max(uRes.x / uImg.x, uRes.y / uImg.y);
  vec2 size = uImg * sc;
  vec2 off = (uRes - size) * vec2(.5, .22);
  vec2 tuv = (uv * uRes - off) / size;
  vec3 col = texture2D(uTex, tuv).rgb;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  // тёмные участки проявляются первыми
  float t = smoothstep(1.0 - uProgress * 1.25, 1.0 - uProgress * 1.25 + 0.25, 1.0 - lum);
  vec3 paper = vec3(0.925, 0.922, 0.906);
  vec3 outc = mix(paper, col, t);
  outc += (hash(vUv * 731.0 + fract(uTime * 0.37) * 97.0) - 0.5) * 0.06; // зерно
  float v = smoothstep(0.9, 0.3, length(vUv - 0.5)); // виньетка
  gl_FragColor = vec4(outc * mix(0.75, 1.0, v), 1.0);
}`;

export function initDevelop(box, img) {
  const ok = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok || !box || !img) return null;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  for (const n of ['uTex', 'uRes', 'uImg', 'uMouse', 'uProgress', 'uTime', 'uRipple']) U[n] = gl.getUniformLocation(prog, n);

  const tex = gl.createTexture();
  let ready = false, inView = true, raf = 0, last = 0;
  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };
  let rippleAt = -1e9;
  const DPR = Math.min(devicePixelRatio || 1, 1.5);

  function size() {
    const r = box.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(r.width * DPR));
    canvas.height = Math.max(2, Math.round(r.height * DPR));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
  }

  const source = new Image();
  source.crossOrigin = 'anonymous';
  source.decoding = 'async';
  source.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    gl.uniform1i(U.uTex, 0);
    gl.uniform2f(U.uImg, source.naturalWidth, source.naturalHeight);
    box.insertBefore(canvas, box.querySelector('.hero-veil'));
    size();
    ready = true;
    frame(performance.now());
    box.classList.add('gl');
    loop();
  };
  // тот же файл, что выбрал браузер для <img>; currentSrc поправлен на плотность — берём новый Image
  const pick = () => { source.src = img.currentSrc || img.src; };
  if (img.complete && img.currentSrc) pick(); else img.addEventListener('load', pick, { once: true });

  function progress(now) {
    if (window.__devStart == null) return 0;
    return Math.min(1, (now - window.__devStart) / 2500);
  }

  function frame(now) {
    mouse.x += (mouse.tx - mouse.x) * .12;
    mouse.y += (mouse.ty - mouse.y) * .12;
    const since = (now - rippleAt) / 1200;
    const ripple = since < 1 ? 1 - since * since * (3 - 2 * since) : 0; // плавное затухание за 1,2 с
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uProgress, progress(now));
    gl.uniform1f(U.uTime, now / 1000);
    gl.uniform1f(U.uRipple, ripple);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function loop() {
    cancelAnimationFrame(raf);
    const tick = (now) => {
      if (!inView || document.hidden) { raf = 0; return; }
      const busy = progress(now) < 1 || now - rippleAt < 1300;
      // после проявки и без ряби хватает 24 кадров в секунду на дрожь зерна
      if (busy || now - last > 41) { frame(now); last = now; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  box.addEventListener('pointermove', (e) => {
    const r = box.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = (e.clientY - r.top) / r.height;
    rippleAt = performance.now();
  });
  new ResizeObserver(() => { if (ready) { size(); frame(performance.now()); } }).observe(box);
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView && ready && !raf) loop(); }).observe(box);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && inView && ready && !raf) loop(); });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); box.classList.remove('gl'); cancelAnimationFrame(raf); });
  return { canvas };
}
