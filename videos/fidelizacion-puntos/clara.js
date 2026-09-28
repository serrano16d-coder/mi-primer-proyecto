// Clara, la clienta: personaje de cuerpo entero estilo cartoon (contorno negro, color plano y una sombra suave).
// Se dibuja con los pies en (fx, fy) y altura h. Usa el mismo `pose` que las mascotas del motor:
// { armL, armR (grados, + = levantar), walk (fase), hop (px), sx, sy, rot, flip, look:[dx,dy], eyes:'happy'|'wide'|'closed'|'dot', mouth:'open' }
import * as L from './engine/lib.js';

export const LOOK = {
  skin: '#F3C9A8', hair: '#2A2230', top: '#D380EB', pants: '#2B2B33', shoe: '#141414', ink: '#161616', blush: '#F39AB8',
};
const shadeOf = c => L.mix(c, '#3A2448', 0.28);

// relleno con sombra suave: el color base se desplaza hacia arriba-izquierda y deja la sombra abajo-derecha
export function cel(ctx, p, base, { dx = -12, dy = -10, shade = null, lw = 8, ink = LOOK.ink, stroke = true } = {}) {
  ctx.fillStyle = shade || shadeOf(base); ctx.fill(p);
  ctx.save(); ctx.clip(p); ctx.translate(dx, dy); ctx.fillStyle = base; ctx.fill(p); ctx.restore();
  if (stroke) { ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.lineJoin = ctx.lineCap = 'round'; ctx.stroke(p); }
}

export function clara(ctx, fx, fy, h, pose = {}, look = LOOK) {
  const P = pose || {}, s = h / 1060, C = look;
  const toCanvas = (x, y) => { const m = ctx.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
  ctx.save();
  ctx.translate(fx, fy - (P.hop || 0)); ctx.rotate(P.rot || 0); ctx.scale(s * (P.sx || 1) * (P.flip ? -1 : 1), s * (P.sy || 1));
  ctx.lineJoin = ctx.lineCap = 'round';
  const O = { lw: 9, ink: C.ink };

  // piernas (el pantalón llega al tobillo) + zapatos; al caminar se levantan alternadas
  for (const [sx, k] of [[-50, 0], [50, 1]]) {
    const lift = P.walk !== undefined ? Math.max(0, Math.sin(P.walk + k * Math.PI)) * 34 : 0;
    ctx.save(); ctx.translate(sx, -400 - lift);
    const leg = new Path2D(); leg.roundRect(-38, 0, 76, 372, 30); cel(ctx, leg, C.pants, O);
    const shoe = new Path2D(); shoe.ellipse(sx < 0 ? -10 : 10, 378, 56, 28, 0, 0, 7); cel(ctx, shoe, C.shoe, { ...O, shade: '#000' });
    ctx.restore();
  }
  // brazos: se dibujan después del torso para que se vean al levantarlos
  const arm = (side, deg) => {
    const px = side * 132, py = -688, a = (8 + (deg || 0)) * Math.PI / 180 * -side;
    ctx.save(); ctx.translate(px, py); ctx.rotate(a);
    const skinArm = new Path2D(); skinArm.roundRect(-28, 0, 56, 300, 28); cel(ctx, skinArm, C.skin, O);
    const sleeve = new Path2D(); sleeve.roundRect(-36, -16, 72, 150, 32); cel(ctx, sleeve, C.top, O);
    const hand = new Path2D(); hand.arc(0, 312, 38, 0, 7); cel(ctx, hand, C.skin, O);
    const pt = toCanvas(0, 316); ctx.restore(); return pt;
  };
  // cuello, torso (blusa) y escote
  const neck = new Path2D(); neck.roundRect(-34, -790, 68, 90, 20); cel(ctx, neck, C.skin, O);
  const torso = new Path2D();
  torso.moveTo(-122, -722); torso.quadraticCurveTo(-170, -560, -158, -380); torso.quadraticCurveTo(0, -352, 158, -380);
  torso.quadraticCurveTo(170, -560, 122, -722); torso.quadraticCurveTo(0, -756, -122, -722); torso.closePath();
  cel(ctx, torso, C.top, { ...O, dx: -18, dy: -8 });
  const vneck = new Path2D(); vneck.moveTo(-46, -736); vneck.lineTo(0, -672); vneck.lineTo(46, -736); vneck.closePath(); cel(ctx, vneck, C.skin, O);
  const belt = new Path2D(); belt.moveTo(-150, -420); belt.quadraticCurveTo(0, -396, 150, -420); ctx.strokeStyle = shadeOf(C.top); ctx.lineWidth = 6; ctx.stroke(belt);
  const hL = arm(-1, P.armL), hR = arm(1, P.armR);

  // cabeza: pelo de atrás + moño, orejas, cara, flequillo
  const hairBack = new Path2D(); hairBack.ellipse(0, -892, 146, 150, 0, 0, 7); cel(ctx, hairBack, C.hair, O);
  const bun = new Path2D(); bun.arc(0, -1030, 58, 0, 7); cel(ctx, bun, C.hair, O);
  for (const ex of [-124, 124]) { const ear = new Path2D(); ear.ellipse(ex, -868, 24, 32, 0, 0, 7); cel(ctx, ear, C.skin, O); }
  const face = new Path2D(); face.ellipse(0, -868, 126, 136, 0, 0, 7); cel(ctx, face, C.skin, { ...O, dx: -14, dy: -12 });
  const fringe = new Path2D();
  fringe.moveTo(-132, -872); fringe.bezierCurveTo(-146, -1012, 146, -1030, 132, -872);
  fringe.bezierCurveTo(112, -948, 44, -968, 6, -940); fringe.bezierCurveTo(-40, -972, -112, -952, -132, -872); fringe.closePath();
  cel(ctx, fringe, C.hair, O);
  const shine = new Path2D(); shine.moveTo(-70, -980); shine.quadraticCurveTo(-30, -1000, 10, -992); ctx.strokeStyle = L.mix(C.hair, '#FFFFFF', 0.35); ctx.lineWidth = 7; ctx.stroke(shine);

  // rasgos
  const lk = P.look || [0, 0], es = P.eyes || 'dot', ex = lk[0] * 7, ey = lk[1] * 6;
  ctx.fillStyle = C.blush; ctx.globalAlpha = 0.65; for (const bx of [-80, 80]) { ctx.beginPath(); ctx.ellipse(bx, -812, 22, 12, 0, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink;
  for (const cx of [-48, 48]) {
    ctx.beginPath();
    if (es === 'happy') { ctx.lineWidth = 8; ctx.moveTo(cx - 15 + ex, -862 + ey); ctx.quadraticCurveTo(cx + ex, -882 + ey, cx + 15 + ex, -862 + ey); ctx.stroke(); continue; }
    if (es === 'closed') { ctx.lineWidth = 8; ctx.moveTo(cx - 14, -866); ctx.lineTo(cx + 14, -866); ctx.stroke(); continue; }
    const r = es === 'wide' ? 1.35 : 1; ctx.ellipse(cx + ex, -866 + ey, 11 * r, 15 * r, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx + ex - 4, -872 + ey, 4 * r, 0, 7); ctx.fill(); ctx.fillStyle = C.ink;
  }
  // lentes redondos (guiño a la referencia) y cejas
  ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(-48, -866, 38, 0, 7); ctx.moveTo(86, -866); ctx.arc(48, -866, 38, 0, 7); ctx.moveTo(-10, -870); ctx.quadraticCurveTo(0, -878, 10, -870); ctx.stroke();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-74, -924); ctx.quadraticCurveTo(-48, -938, -22, -928); ctx.moveTo(22, -928); ctx.quadraticCurveTo(48, -938, 74, -924); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-4, -836); ctx.quadraticCurveTo(8, -826, 12, -838); ctx.stroke();
  if (P.mouth === 'open') { const m = new Path2D(); m.moveTo(-40, -800); m.quadraticCurveTo(0, -738, 40, -800); m.closePath(); cel(ctx, m, '#8A2B4E', { ...O, lw: 7, shade: '#6A1F3B' }); }
  else { ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-36, -798); ctx.quadraticCurveTo(0, -768, 36, -798); ctx.stroke(); }

  ctx.restore();
  // anclas para colgar objetos en las manos (coordenadas de canvas)
  L.MLAST.handL = hL; L.MLAST.handR = hR; L.MLAST.top = [fx, fy - h]; L.MLAST.center = [fx, fy - h / 2]; L.MLAST.s = s;
}
