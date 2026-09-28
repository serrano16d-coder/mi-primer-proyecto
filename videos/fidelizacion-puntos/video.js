// Tutorial para clientes: cómo funciona una campaña de fidelización por puntos (≤ 30 s, 9:16, sin voz).
// Personaje continuo (Clara) en modo historia. Colores de marca: lila #D380EB y gris #B1BDCE; blanco y negro de apoyo.
import * as L from './engine/lib.js';
import { confetti } from './props.js';
import { BRAND } from './styles/tcc.js';
import { kicker, storefront, bag, product, checkout, ticket, pointsCard, gift, prize, sparkles, star } from './tcc-props.js';

const W = 1080, FLOOR = 1560;
const TITLE = { x: 70, y: 240, w: 940, h: 380 };
const walk = (t, k = 14) => ({ walk: t * k, armL: 10 + 6 * Math.sin(t * k), armR: 14 - 14 * Math.sin(t * k), hop: Math.abs(Math.sin(t * k / 2)) * 10 });
const H = (K, s, h, str, at, o = {}) => { h.cue('title', at); K.S.headline(K, str, o.box || TITLE, h.A(at, 0.7), s, o); };
// mano izquierda de Clara (pies en fx,fy; altura hh; brazo levantado deg): para lanzar cosas desde la mano
const handL = (fx, fy, hh, deg) => { const s = hh / 1060, a = (8 + deg) * Math.PI / 180, sx = fx - 132 * s, sy = fy - 688 * s, r = 316 * s; return [sx - Math.sin(a) * r, sy + Math.cos(a) * r]; };

export default {
  style: 'tcc', format: '9:16', fps: 30, camera: true, chrome: false, captions: false,
  person: false, mascot: 'none', actor: { x: 540, y: FLOOR, h: 560 },
  beats: 'audio/beats.json',
  scenes: [
    // 1 · HOOK: Clara llega a su tienda de siempre con la bolsa
    { type: 'story', dur: 3.0, bg: BRAND.blanco,
      render(K, s, h) { storefront(K, FLOOR, s.t); H(K, s, h, 'Tu compra de siempre *ahora suma*', 0.12, { box: { x: 70, y: 130, w: 940, h: 520 } }); h.cue('pop', 1.8); },
      actor(t) {
        const q = L.clamp(t / 1.6), x = L.lerp(-140, 540, L.E.out(q));
        const pose = t < 1.6 ? walk(t) : { armL: 10, armR: 115 + 18 * Math.sin((t - 1.6) * 12), eyes: t > 1.8 ? 'happy' : 'dot', look: [0.3, 0] };
        return { x, y: FLOOR, h: 560, pose, after: (K, m) => bag(K, m.handL[0], m.handL[1], 0.75, t < 1.6 ? Math.sin(t * 14) * 0.08 : 0) };
      } },

    // 2 · PASO 1: pasa sus productos por caja y sale el ticket con puntos
    { type: 'story', dur: 4.5, bg: BRAND.gris, trans: { type: 'pan', dur: 0.6 },
      render(K, s, h) {
        const c = K.ctx, t = s.t;
        kicker(K, 'PASO 1', 70, 150, h.A(0.1, 0.4)); H(K, s, h, '*Compra*\ncomo siempre', 0.2);
        checkout(K, FLOOR, -t * 200);
        const items = ['leche', 'pan', 'manzana', 'caja'];
        c.save(); c.beginPath(); c.rect(0, 0, 770, K.H); c.clip();
        items.forEach((k, i) => { const t0 = 0.7 + i * 0.5, q = (t - t0) / 0.9; if (q < 0 || q > 1.2) return; h.cue('pop', t0); product(K, k, L.lerp(330, 860, L.E.inOut(L.clamp(q))), 1270, 1.2); });
        c.restore();
        items.forEach((_, i) => { const ta = 1.6 + i * 0.5, q = (t - ta) / 0.7; if (q < 0 || q > 1) return; h.cue('enter', ta); c.save(); c.globalAlpha = 1 - q; star(K, 890, 1040 - q * 140, 30 + q * 8, BRAND.lila); c.restore(); });
        ticket(K, 890, 1034, (t - 3.0) / 0.7); h.cue('impact', 3.6);
      },
      actor(t) {
        const bump = [0.7, 1.2, 1.7, 2.2].reduce((m, t0) => Math.max(m, Math.sin(L.clamp((t - t0 + 0.2) / 0.4) * Math.PI)), 0);
        return { x: 200, y: FLOOR, h: 560, pose: { armL: 10, armR: 20 + 55 * bump, look: [1, 0.2], eyes: t > 3.6 ? 'happy' : 'dot' } };
      } },

    // 3 · PASO 2: cada compra lanza estrellas a su tarjeta de puntos
    { type: 'story', dur: 5.0, bg: BRAND.lila, trans: { type: 'drop', dur: 0.6 },
      render(K, s, h) {
        const t = s.t, N = 8, T0 = 0.8, GAP = 0.32, FLY = 0.45;
        kicker(K, 'PASO 2', 70, 150, h.A(0.1, 0.4)); H(K, s, h, '*Suma* puntos\ncon cada compra', 0.2, { emBg: BRAND.blanco });
        let filled = 0; for (let i = 0; i < N; i++) filled += L.clamp((t - (T0 + i * GAP + FLY)) / 0.25);
        const tEnd = T0 + (N - 1) * GAP + FLY, glow = L.clamp((t - tEnd) / 0.3) * (0.6 + 0.4 * Math.sin(t * 8));
        const slots = pointsCard(K, { x: 70, y: 680, w: 620, h: 600 }, filled, N, glow);
        const [ox, oy] = handL(880, FLOOR, 500, 110);
        for (let i = 0; i < N; i++) { const t0 = T0 + i * GAP, q = (t - t0) / FLY; if (q < 0 || q >= 1) continue; const [tx, ty] = slots[i], e = L.E.inOut(q);
          star(K, L.lerp(ox, tx, e), L.lerp(oy, ty, e) - Math.sin(q * Math.PI) * 180, 34, BRAND.blanco, q * 6); }
        for (let i = 0; i < N; i++) h.cue('pop', T0 + i * GAP + FLY);
        h.cue('impact', tEnd + 0.1);
        if (t > tEnd) sparkles(K, 380, 980, t, 380, 8);
      },
      actor(t) {
        const tEnd = 0.8 + 7 * 0.32 + 0.45, throwing = t > 0.6 && t < tEnd;
        return { x: 880, y: FLOOR, h: 500, pose: t > tEnd ? { armL: 140, armR: 140, hop: Math.abs(Math.sin((t - tEnd) * 9)) * 40, eyes: 'happy', mouth: 'open' } : { armL: throwing ? 110 + 10 * Math.sin(t * 20) : 30, armR: 15, look: [-1, -0.3] } };
      } },

    // 4 · PASO 3: abre el regalo y salen los premios
    { type: 'story', dur: 5.0, bg: BRAND.blanco, trans: { type: 'iris', dur: 0.6, x: 880 / 1080, y: (FLOOR - 250) / 1920 },
      render(K, s, h) {
        const t = s.t, sh = t > 0.4 && t < 1.35 ? Math.sin(t * 42) * 0.05 * Math.sin((t - 0.4) / 0.95 * Math.PI) : 0, open = L.E.out(L.clamp((t - 1.35) / 0.6));
        if (t > 1.35) { K.ctx.save(); K.ctx.beginPath(); K.ctx.rect(0, 660, K.W, K.H); K.ctx.clip(); confetti(K, t, 1.35, [BRAND.lila, BRAND.gris, BRAND.negro], { n: 45, strips: true }); K.ctx.restore(); }
        kicker(K, 'PASO 3', 70, 150, h.A(0.1, 0.4)); H(K, s, h, '*Canjea* tus puntos\npor premios', 0.2);
        K.ctx.fillStyle = '#EEF1F6'; K.ctx.beginPath(); K.ctx.ellipse(440, 1500, 330, 50, 0, 0, 7); K.ctx.fill();
        [['maleta', 170, 980, -0.15], ['cascos', 430, 830, 0], ['sarten', 650, 1010, Math.PI - 0.5]].forEach(([k, x, y, r], i) => {
          const t0 = 1.5 + i * 0.22, q = L.clamp((t - t0) / 0.55); if (q <= 0) return; h.cue('pop', t0);
          const e = L.E.out(q); prize(K, k, L.lerp(440, x, e), L.lerp(1200, y, e) - Math.sin(q * Math.PI) * 120 + Math.sin(t * 3 + i) * 8, 0.3 + 0.7 * L.E.back(q), r * e); });
        gift(K, 440, 1500, 420, open, sh);
        h.cue('impact', 1.35);
        if (t > 2.2) sparkles(K, 440, 920, t, 330, 7);
      },
      actor(t) {
        const party = t > 1.4;
        return { x: 880, y: FLOOR, h: 500, pose: party ? { armL: 145, armR: 145, hop: Math.abs(Math.sin((t - 1.4) * 8)) * 45, eyes: 'happy', mouth: 'open' } : { armL: 40, armR: 10, look: [-1, 0.4], eyes: 'wide' } };
      } },

    // 5 · VENTAJAS para el cliente
    { type: 'story', dur: 4.5, bg: BRAND.negro, trans: { type: 'whip', dur: 0.5 },
      render(K, s, h) {
        const c = K.ctx, t = s.t;
        kicker(K, 'VENTAJAS', 70, 150, h.A(0.1, 0.4), { bg: BRAND.lila, fg: BRAND.negro });
        H(K, s, h, '¿Por qué\n*te conviene?*', 0.2, { color: BRAND.blanco, box: { x: 70, y: 240, w: 940, h: 340 } });
        ['Sin cambiar tus hábitos', 'Cada compra suma', 'Premios que te encantan'].forEach((it, i) => {
          const t0 = 0.8 + i * 0.6, p = h.A(t0, 0.45), y = 700 + i * 170; if (p <= 0) return; h.cue('enter', t0);
          c.save(); c.globalAlpha = L.clamp(p * 2); c.translate((1 - L.E.out(p)) * -60, 0);
          c.fillStyle = BRAND.lila; c.beginPath(); c.arc(130, y + 42, 46 * L.E.back(p), 0, 7); c.fill();
          c.strokeStyle = BRAND.negro; c.lineWidth = 12; c.lineCap = c.lineJoin = 'round'; const q = L.clamp((t - t0 - 0.15) / 0.3);
          if (q > 0) { c.beginPath(); c.moveTo(108, y + 44); c.lineTo(124, y + 60); if (q > 0.4) c.lineTo(L.lerp(124, 156, (q - 0.4) / 0.6), L.lerp(y + 60, y + 24, (q - 0.4) / 0.6)); c.stroke(); }
          L.text(c, it, 210, y + 64, { font: K.S.type.display(66), color: BRAND.blanco });
          c.restore();
        });
        c.fillStyle = BRAND.lila; c.beginPath(); c.arc(820, 1600, 250 * L.E.out(h.A(0.1, 0.6)), 0, 7); c.fill();
        c.fillStyle = '#2A2A30'; c.beginPath(); c.ellipse(820, 1760, 200, 34, 0, 0, 7); c.fill();
      },
      actor(t) {
        const pt = [0.8, 1.4, 2.0].reduce((m, t0) => Math.max(m, Math.sin(L.clamp((t - t0) / 0.5) * Math.PI)), 0);
        return { x: 820, y: 1760, h: 460, pose: { armL: 30 + 90 * pt, armR: 12, look: [-1, -0.6], eyes: t > 2.6 ? 'happy' : 'dot' } };
      } },

    // 6 · CTA + logo TCC
    { type: 'story', dur: 4.0, bg: BRAND.lila, trans: { type: 'sweep', dur: 0.55, color: BRAND.blanco }, images: ['assets/logo-tcc.png'],
      render(K, s, h) {
        const c = K.ctx, t = s.t;
        H(K, s, h, 'Empieza a\n*sumar* hoy', 0.1, { align: 'center', box: { x: 70, y: 170, w: 940, h: 420 }, emBg: BRAND.blanco });
        const bp = L.E.back(h.A(0.7, 0.5)); h.cue('impact', 0.7);
        if (bp > 0) { c.save(); c.translate(540, 680); c.scale(bp, bp); c.fillStyle = BRAND.negro; c.beginPath(); c.roundRect(-330, -58, 660, 116, 58); c.fill();
          L.text(c, 'Pregunta en tu tienda', 0, 20, { font: K.S.type.label(52), color: BRAND.blanco, align: 'center' }); c.restore(); }
        [[170, 900, 0], [930, 860, 1], [200, 1250, 2], [900, 1300, 3]].forEach(([x, y, i]) => { const p = h.A(1.0 + i * 0.12, 0.4); if (p > 0) star(K, x, y + Math.sin(t * 3 + i) * 14, 34 * L.E.back(p), i % 2 ? BRAND.blanco : BRAND.negro, t * 0.5 + i); });
        // logo: si existe assets/logo-tcc.png se usa; si no, un hueco marcado (no se inventa el logo)
        const lp = h.A(1.3, 0.5), img = K.images['assets/logo-tcc.png'];
        if (lp > 0) { c.save(); c.globalAlpha = lp;
          if (img) { const hh = 130, ww = img.width * hh / img.height; c.drawImage(img, 540 - ww / 2, 1720, ww, hh); }
          else { c.fillStyle = BRAND.blanco; c.beginPath(); c.roundRect(360, 1710, 360, 140, 24); c.fill(); c.setLineDash([14, 10]); c.strokeStyle = BRAND.negro; c.lineWidth = 4; c.stroke();
            L.text(c, 'LOGO TCC', 540, 1798, { font: K.S.type.label(48), color: BRAND.negro, align: 'center' }); }
          c.restore(); }
      },
      actor(t) { return { x: 540, y: 1600, h: 600, pose: { armL: 10, armR: 115 + 18 * Math.sin(t * 11), eyes: 'happy' }, after: (K, m) => bag(K, m.handL[0], m.handL[1], 0.8, 0) }; } },
  ],
};
