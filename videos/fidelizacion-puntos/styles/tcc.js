// TCC cartoon: fondos planos de marca (lila #D380EB, gris #B1BDCE, blanco, negro), contorno negro grueso,
// color plano con una sombra suave. Tipografía de marca Neue Plak si está en assets/fonts/; si no, Barlow como sustituta.
import * as L from '../engine/lib.js';
import { title, para } from '../engine/base.js';
import { clara } from '../clara.js';

export const BRAND = { lila: '#D380EB', gris: '#B1BDCE', blanco: '#FFFFFF', negro: '#141414' };
export let FONT_OK = 'Barlow';

async function tryFace(family, weight, bases) {
  for (const b of bases) for (const ext of ['otf', 'woff2', 'ttf', 'woff']) {
    try { const f = new FontFace(family, `url(${b}.${ext})`, { weight: String(weight) }); await f.load(); document.fonts.add(f); return true; } catch {}
  }
  return false;
}

export default {
  id: 'tcc', name: 'TCC cartoon',
  palette: { bg: BRAND.blanco, ink: BRAND.negro, accent: BRAND.lila, muted: '#4E5664', panel: BRAND.blanco, line: 'rgba(20,20,20,.12)', mascot: BRAND.lila },
  type: { display: s => `800 ${s}px Marca`, em: s => `800 ${s}px Marca`, body: s => `500 ${s}px Marca`, bodyEm: s => `700 ${s}px Marca`, label: s => `700 ${s}px Marca`, mono: s => `700 ${s}px Marca` },
  fonts: null, fontLoads: [], // nada de Google Fonts: todo local
  ls: -0.01, lh: 1.02,
  sfx: 'pop', transDur: 0.5, push: 0.02, beatBump: 1.2,
  async setup() {
    // Neue Plak (archivos de la marca) → si no están, Barlow empaquetada en el proyecto
    const np = await tryFace('Marca', 800, ['assets/fonts/NeuePlak-Black', 'assets/fonts/NeuePlak-ExtraBold', 'assets/fonts/NeuePlak-Bold']);
    if (np) { await tryFace('Marca', 700, ['assets/fonts/NeuePlak-Bold', 'assets/fonts/NeuePlak-SemiBold']); await tryFace('Marca', 500, ['assets/fonts/NeuePlak-Regular', 'assets/fonts/NeuePlak-Medium']); FONT_OK = 'Neue Plak'; }
    else { await tryFace('Marca', 800, ['assets/fonts/barlow-latin-800-normal']); await tryFace('Marca', 700, ['assets/fonts/barlow-latin-700-normal']); await tryFace('Marca', 500, ['assets/fonts/barlow-latin-400-normal']); }
    await Promise.all(['800 60px Marca', '700 60px Marca', '500 60px Marca'].map(f => document.fonts.load(f).catch(() => {})));
    window.FONT_OK = FONT_OK;
  },
  background(K, s) { const { ctx, W, H } = K; ctx.fillStyle = s.d.bg || BRAND.blanco; ctx.fillRect(0, 0, W, H); },
  headline(K, str, box, p, s, o = {}) {
    title(K, str.replace(/\*([^*]+)\*/g, (m, a) => '*' + a.replace(/ /g, '\u00A0') + '*'), box, L.E.out(L.clamp(p)), { align: o.align || 'left', max: o.max || 170, color: o.color || BRAND.negro, emColor: o.emColor || BRAND.negro, emStyle: 'highlight', emBg: o.emBg || BRAND.lila, reveal: 'rise', valign: o.valign || 'top' });
  },
  text(K, str, box, p, role, s, o = {}) { para(K, str, box, p, { color: BRAND.negro, max: 54, align: 'left', ...o }); },
  mascot(K, box, p, s, mood) {
    if (p <= 0) return; const P = L.POSE || {}, br = Math.sin(K.t * 3.2) * 0.008;
    clara(K.ctx, box.x + box.w / 2, box.y + box.h, box.h, { ...P, sy: (P.sy || 1) * (1 + br), sx: (P.sx || 1) * (1 - br * 0.5) });
  },
  caption() {},
  transition(K, A, B, p) { const c = K.ctx; c.drawImage(A, 0, 0); c.globalAlpha = p; c.drawImage(B, 0, 0); c.globalAlpha = 1; },
};
