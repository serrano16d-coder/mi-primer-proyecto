"""Música sintetizada por código (sin samples): pop alegre a 120 BPM, progresión C–G–Am–F.
Cada escena dura un múltiplo de medio compás, así que los cortes caen en golpe.
Uso: python music.py audio/music.wav [segundos]"""
import sys, wave
import numpy as np

SR, BPM = 44100, 120
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 26.0
B = 60 / BPM                     # 0.5 s por tiempo
N = int((DUR + 2) * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(4)
f = lambda m: 440 * 2 ** ((m - 69) / 12)

def add(sig, t, pan=0.0, g=1.0):
    s = int(t * SR); e = min(N, s + len(sig))
    if s >= N: return
    L[s:e] += sig[:e - s] * g * (1 - pan) ** 0.5 * 1.0; R[s:e] += sig[:e - s] * g * (1 + pan) ** 0.5 * 1.0

def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def kick():
    t = np.arange(int(0.35 * SR)) / SR; ph = 2 * np.pi * np.cumsum(45 + 90 * np.exp(-t / 0.04)) / SR
    return np.sin(ph) * np.exp(-t / 0.16)
def clap():
    n = int(0.22 * SR); x = rng.standard_normal(n); X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR); X[(fr < 900) | (fr > 6000)] = 0
    x = np.fft.irfft(X, n); t = np.arange(n) / SR; e = np.exp(-t / 0.07) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03))
    return x / np.abs(x).max() * e
def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); x = rng.standard_normal(n); x = np.diff(np.concatenate([[0], x]))
    return x / np.abs(x).max() * np.exp(-np.arange(n) / SR / (0.06 if open_ else 0.012))
def pluck(m, d=0.22):
    n = int(0.5 * SR); t = np.arange(n) / SR; fr = f(m)
    x = sum(np.sin(2 * np.pi * fr * k * t) / k ** 1.6 for k in range(1, 6))
    return x * env(n, 0.003, d)
def bass(m, d=0.2):
    n = int(0.25 * SR); t = np.arange(n) / SR; fr = f(m)
    x = np.sin(2 * np.pi * fr * t) + 0.35 * np.sin(2 * np.pi * 2 * fr * t) + 0.15 * np.sign(np.sin(2 * np.pi * fr * t))
    return x * env(n, 0.004, d)
def pad(ms, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for det in (-0.08, 0.08): x += np.sin(2 * np.pi * f(m + det) * t)
    a = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3); return x * a / len(ms)
def bell(m):
    n = int(1.2 * SR); t = np.arange(n) / SR; fr = f(m)
    return (np.sin(2 * np.pi * fr * t) + 0.4 * np.sin(2 * np.pi * fr * 2.76 * t) * np.exp(-t / 0.2)) * env(n, 0.002, 0.45)

CH = [(48, [60, 64, 67, 72]), (43, [59, 62, 67, 71]), (45, [60, 64, 69, 72]), (41, [60, 65, 69, 72])]  # C G Am F
bars = int(np.ceil(DUR / (4 * B)))
for bar in range(bars):
    t0 = bar * 4 * B; root, tones = CH[bar % 4]; last = bar == bars - 1
    if last: root, tones = 48, [60, 64, 67, 72]
    add(pad(tones, 4 * B), t0, 0, 0.10)
    for beat in range(4):
        tb = t0 + beat * B
        if last and beat > 0: break
        add(kick(), tb, 0, 0.9)
        if beat in (1, 3): add(clap(), tb, 0.1, 0.35)
        add(hat(beat == 3 and bar % 2 == 1), tb + B / 2, 0.3, 0.12)
        add(hat(), tb, 0.3, 0.06)
        for k in range(2): add(bass(root + (12 if k else 0)), tb + k * B / 2, 0, 0.32)
        for k in range(4):  # arpegio en semicorcheas
            m = tones[(beat * 4 + k) % 4] + (12 if (beat + bar) % 2 and k == 3 else 0)
            add(pluck(m), tb + k * B / 4, -0.35 + 0.7 * (k % 2), 0.10)
    if last:
        for m in tones: add(bell(m + 12), t0, 0, 0.12)
# acentos de melodía en los cambios de escena (3, 7.5, 12.5, 17.5, 22 s)
for tc, m in [(0.0, 84), (3.0, 79), (7.5, 81), (12.5, 84), (17.5, 86), (22.0, 84)]:
    if tc < DUR: add(bell(m), tc, 0.2, 0.10)

mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix /= np.abs(mix).max() / 0.89
fade = int(1.5 * SR); end = int((DUR + 1.5) * SR); mix = mix[:end]; mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('música', sys.argv[1], f'{DUR:.1f}s')
