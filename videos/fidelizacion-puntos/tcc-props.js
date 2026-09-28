// Objetos del mundo, dibujados como el personaje: contorno negro, color plano, sombra suave.
import * as L from './engine/lib.js';
import { cel } from './clara.js';
import { BRAND } from './styles/tcc.js';

const O = { lw: 7 };
const rr = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
const circ = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, 7); return p; };
export function starPath(x, y, r, inner = 0.48) { const p = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * inner : r; p.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } p.closePath(); return p; }
export function star(K, x, y, r, color = BRAND.lila, rot = 0) { const c = K.ctx; c.save(); c.translate(x, y); c.rotate(rot); cel(c, starPath(0, 0, r), color, { lw: Math.max(4, r * 0.12), dx: -r * 0.12, dy: -r * 0.12 }); c.restore(); }

// píldora "PASO n"
export function kicker(K, str, x, y, p, { bg = BRAND.negro, fg = BRAND.blanco } = {}) {
  if (p <= 0) return; const c = K.ctx, e = L.E.back(L.clamp(p)); c.save(); c.font = K.S.type.label(40); c.letterSpacing = '4px';
  const w = c.measureText(str).width + 56; c.translate(x, y + 34); c.scale(e, e); c.translate(-x, -(y + 34));
  c.fillStyle = bg; c.beginPath(); c.roundRect(x, y, w, 68, 34); c.fill(); c.fillStyle = fg; c.fillText(str, x + 28, y + 48); c.restore();
}

// fachada de tienda con toldo a rayas
export function storefront(K, floor, t) {
  const c = K.ctx, x0 = 60, x1 = 1020, top = 760;
  const wall = rr(x0, top, x1 - x0, floor - top + 20, 0); cel(c, wall, BRAND.gris, { ...O, dx: -24 });
  const win = rr(120, 1010, 380, 330, 18); cel(c, win, '#EAF1FA', O);
  c.save(); c.clip(win); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 26; c.beginPath(); c.moveTo(180, 1360); c.lineTo(420, 1000); c.stroke(); c.restore();
  // estantes con productos dentro de la ventana
  [[1120, ['#D380EB', '#FFFFFF', '#141414', '#D380EB']], [1240, ['#FFFFFF', '#D380EB', '#B1BDCE', '#FFFFFF']]].forEach(([y, cols]) => { cols.forEach((col, i) => cel(c, rr(150 + i * 84, y - 70, 60, 70, 8), col, { lw: 5 })); const sh = rr(135, y, 350, 14, 4); cel(c, sh, '#8A93A3', { lw: 5 }); });
  const door = rr(600, 1060, 300, floor - 1060, 14); cel(c, door, BRAND.blanco, O);
  const glass = rr(632, 1100, 236, 250, 10); cel(c, glass, '#EAF1FA', { lw: 5 });
  cel(c, rr(830, 1330, 20, 70, 10), BRAND.negro, { lw: 4 });
  // toldo: rayas lila/blanco con borde festoneado que ondea
  const aw = new Path2D(), n = 8, sw = (x1 - x0 + 40) / n, ay = 880;
  aw.moveTo(x0 - 20, 800); aw.lineTo(x1 + 20, 800); aw.lineTo(x1 + 20, ay);
  for (let i = n - 1; i >= 0; i--) { const xa = x0 - 20 + i * sw; aw.quadraticCurveTo(xa + sw / 2, ay + 50 + Math.sin(t * 5 + i) * 4, xa, ay); }
  aw.closePath();
  c.save(); c.clip(aw); for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? BRAND.blanco : BRAND.lila; c.fillRect(x0 - 20 + i * sw, 780, sw, 200); } c.restore();
  c.strokeStyle = BRAND.negro; c.lineWidth = 7; c.lineJoin = 'round'; c.stroke(aw);
  // letrero
  const sign = rr(330, 690, 420, 110, 22); cel(c, sign, BRAND.negro, { lw: 7, shade: '#000' });
  L.text(c, 'TU TIENDA', 540, 765, { font: K.S.type.display(62), color: BRAND.blanco, align: 'center' });
  // acera
  c.fillStyle = '#8A93A3'; c.fillRect(0, floor, K.W, K.H - floor); c.fillStyle = BRAND.negro; c.fillRect(0, floor - 4, K.W, 8);
}

// bolsa de compra que cuelga de una mano (hx, hy)
export function bag(K, hx, hy, s = 1, sway = 0) {
  const c = K.ctx; c.save(); c.translate(hx, hy); c.rotate(sway); c.scale(s, s);
  const handle = new Path2D(); handle.moveTo(-40, 40); handle.quadraticCurveTo(0, -30, 40, 40); c.strokeStyle = BRAND.negro; c.lineWidth = 9; c.stroke(handle);
  // productos que asoman
  cel(c, rr(-58, 10, 40, 70, 8), BRAND.blanco, { lw: 6 }); cel(c, circ(20, 30, 26), '#7FC37A', { lw: 6 });
  const b = new Path2D(); b.moveTo(-80, 40); b.lineTo(80, 40); b.lineTo(70, 190); b.lineTo(-70, 190); b.closePath(); cel(c, b, BRAND.gris, { lw: 8, dx: -14 });
  c.save(); c.clip(b); star(K, 0, 118, 34, BRAND.lila); c.restore();
  c.restore();
}

// productos del súper
export function product(K, kind, x, y, s = 1) {
  const c = K.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  if (kind === 'leche') { const b = new Path2D(); b.moveTo(-40, 0); b.lineTo(40, 0); b.lineTo(40, -120); b.lineTo(20, -150); b.lineTo(-20, -150); b.lineTo(-40, -120); b.closePath(); cel(c, b, BRAND.blanco, O); cel(c, rr(-40, -95, 80, 40, 4), BRAND.lila, { lw: 5 }); }
  if (kind === 'pan') { const b = new Path2D(); b.ellipse(0, -40, 90, 40, 0, 0, 7); cel(c, b, '#E7B36A', O); c.strokeStyle = BRAND.negro; c.lineWidth = 6; c.beginPath(); for (const k of [-45, 0, 45]) { c.moveTo(k - 14, -60); c.lineTo(k + 14, -26); } c.stroke(); }
  if (kind === 'manzana') { cel(c, circ(0, -52, 52), '#E8505B', O); c.strokeStyle = BRAND.negro; c.lineWidth = 7; c.beginPath(); c.moveTo(0, -100); c.lineTo(6, -128); c.stroke(); const lf = new Path2D(); lf.ellipse(26, -118, 20, 10, -0.5, 0, 7); cel(c, lf, '#7FC37A', { lw: 5 }); }
  if (kind === 'caja') { cel(c, rr(-52, -170, 104, 170, 8), BRAND.lila, O); cel(c, rr(-36, -130, 72, 60, 30), BRAND.blanco, { lw: 5 }); star(K, 0, -100, 20, BRAND.lila); }
  c.restore();
}

// caja registradora + banda
export function checkout(K, floor, beltShift) {
  const c = K.ctx;
  cel(c, rr(-30, 1300, 1140, floor - 1300 + 30, 0), BRAND.blanco, { ...O, dx: 0, dy: -18 });
  const belt = rr(-30, 1270, 1140, 50, 14); cel(c, belt, BRAND.negro, { lw: 7, shade: '#000' });
  c.save(); c.clip(belt); c.strokeStyle = '#3A3A44'; c.lineWidth = 6; for (let x = -200 + (beltShift % 60); x < 1200; x += 60) { c.beginPath(); c.moveTo(x, 1270); c.lineTo(x - 20, 1320); c.stroke(); } c.restore();
  // registradora a la derecha
  cel(c, rr(760, 1060, 260, 210, 20), BRAND.negro, { lw: 7, shade: '#000' });
  cel(c, rr(790, 1090, 200, 90, 12), '#9BE3C4', { lw: 5 });
  cel(c, rr(740, 1030, 300, 40, 12), BRAND.gris, O);
}
// ticket que sale de la registradora (p 0→1), con "+ PUNTOS"
export function ticket(K, x, yTop, p) {
  if (p <= 0) return; const c = K.ctx, h = 330 * L.E.out(L.clamp(p)), y = yTop - h;
  const t = new Path2D(); t.moveTo(x - 90, yTop); t.lineTo(x - 90, y); for (let i = 0; i < 6; i++) { t.lineTo(x - 90 + i * 30 + 15, y - 14); t.lineTo(x - 90 + (i + 1) * 30, y); } t.lineTo(x + 90, yTop); t.closePath();
  cel(c, t, BRAND.blanco, O);
  c.save(); c.clip(t); c.fillStyle = '#C9CFD9'; for (let i = 0; i < 4; i++) c.fillRect(x - 60, y + 40 + i * 40, 90 + (i % 2) * 30, 14);
  star(K, x, y + 230, 36, BRAND.lila); L.text(c, '+ PUNTOS', x, y + 300, { font: K.S.type.label(30), color: BRAND.negro, align: 'center' }); c.restore();
}

// tarjeta de puntos con casillas de estrella; filled = cuántas llenas (puede ser fraccional para la última)
export function pointsCard(K, box, filled, n = 8, glow = 0) {
  const c = K.ctx, { x, y, w, h } = box;
  if (glow > 0) { c.save(); c.globalAlpha = glow * 0.6; c.fillStyle = BRAND.blanco; c.beginPath(); c.roundRect(x - 30, y - 30, w + 60, h + 60, 60); c.fill(); c.restore(); }
  const card = rr(x, y, w, h, 40); cel(c, card, BRAND.blanco, { lw: 9, dx: -16, dy: -14 });
  cel(c, rr(x, y, w, 110, [40, 40, 0, 0]), BRAND.negro, { lw: 9, shade: '#000' });
  L.text(c, 'MIS PUNTOS', x + 44, y + 74, { font: K.S.type.display(54), color: BRAND.blanco });
  star(K, x + w - 70, y + 55, 30, BRAND.lila);
  const cols = 4, rows = Math.ceil(n / cols), cw = (w - 80) / cols, ch = (h - 250) / rows;
  const slots = [];
  for (let i = 0; i < n; i++) {
    const cx = x + 40 + cw * (i % cols) + cw / 2, cy = y + 150 + ch * Math.floor(i / cols) + ch / 2; slots.push([cx, cy]);
    const r = Math.min(cw, ch) * 0.36; c.save(); c.setLineDash([10, 10]); c.strokeStyle = '#B9C0CC'; c.lineWidth = 5; c.stroke(starPath(cx, cy, r)); c.restore();
    const f = L.clamp(filled - i); if (f > 0) { const e = L.E.back(f); star(K, cx, cy, r * e, BRAND.lila, (1 - f) * 0.8); }
  }
  // barra de progreso
  const bx = x + 44, by = y + h - 76, bw = w - 88; cel(c, rr(bx, by, bw, 40, 20), '#E6E9EF', { lw: 6 });
  const fw = bw * L.clamp(filled / n); if (fw > 24) cel(c, rr(bx, by, fw, 40, 20), BRAND.lila, { lw: 6 });
  return slots;
}

// caja de regalo con tapa que salta (open 0→1); (x,y) = centro de la base
export function gift(K, x, y, w, open, shake = 0) {
  const c = K.ctx, h = w * 0.7; c.save(); c.translate(x, y); c.rotate(shake);
  const box = rr(-w / 2, -h, w, h, 16); cel(c, box, BRAND.lila, { lw: 9, dx: -20 });
  cel(c, rr(-w * 0.08, -h, w * 0.16, h, 4), BRAND.blanco, { lw: 6 });
  const lo = L.clamp(open); c.save(); c.globalAlpha = 1 - L.clamp((lo - 0.35) / 0.5); c.translate(-w / 2 - 20, -h - lo * w * 1.1); c.rotate(-lo * 0.5);
  const lid = rr(0, -w * 0.2, w + 40, w * 0.2, 14); cel(c, lid, BRAND.lila, { lw: 9 });
  cel(c, rr((w + 40) / 2 - w * 0.08, -w * 0.2, w * 0.16, w * 0.2, 4), BRAND.blanco, { lw: 6 });
  const bow = new Path2D(); bow.ellipse((w + 40) / 2 - 44, -w * 0.26, 46, 26, -0.4, 0, 7); const bow2 = new Path2D(); bow2.ellipse((w + 40) / 2 + 44, -w * 0.26, 46, 26, 0.4, 0, 7);
  cel(c, bow, BRAND.blanco, { lw: 6 }); cel(c, bow2, BRAND.blanco, { lw: 6 });
  c.restore(); c.restore();
}

// premios genéricos (sin marcas): maleta, sartén, auriculares
export function prize(K, kind, x, y, s = 1, rot = 0) {
  const c = K.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (kind === 'maleta') { const hd = rr(-40, -120, 80, 40, 16); c.strokeStyle = BRAND.negro; c.lineWidth = 12; c.stroke(hd); cel(c, rr(-90, -95, 180, 190, 24), BRAND.gris, { ...O, dx: -16 }); c.strokeStyle = BRAND.negro; c.lineWidth = 6; c.beginPath(); c.moveTo(-40, -80); c.lineTo(-40, 80); c.moveTo(40, -80); c.lineTo(40, 80); c.stroke(); }
  if (kind === 'sarten') { cel(c, rr(60, -16, 150, 32, 16), BRAND.negro, { lw: 6, shade: '#000' }); cel(c, circ(0, 0, 90), '#3A3A44', { lw: 8, shade: '#22222A' }); cel(c, circ(0, 0, 64), '#55555F', { lw: 5, stroke: false }); }
  if (kind === 'cascos') { const band = new Path2D(); band.arc(0, 0, 90, Math.PI * 1.05, Math.PI * 1.95); c.strokeStyle = BRAND.negro; c.lineWidth = 30; c.lineCap = 'round'; c.stroke(band); c.strokeStyle = BRAND.lila; c.lineWidth = 16; c.stroke(band); cel(c, rr(-120, -20, 60, 100, 26), BRAND.lila, O); cel(c, rr(60, -20, 60, 100, 26), BRAND.lila, O); }
  c.restore();
}
// destellos alrededor de un punto
export function sparkles(K, x, y, t, r = 160, n = 6) { for (let i = 0; i < n; i++) { const a = i / n * 6.283 + t * 0.6, q = (Math.sin(t * 6 + i * 2) + 1) / 2; star(K, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, 10 + q * 14, i % 2 ? BRAND.blanco : BRAND.lila); } }
