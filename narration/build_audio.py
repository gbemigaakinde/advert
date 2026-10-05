#!/usr/bin/env python3
"""
Builds every sound the Parent Portal Guide needs, into public/audio/:
  - narration: one MP3 per spoken line (edge-tts, Nigerian English voice)
  - durations.json: how long each line is, so the video syncs to the voice
  - music.mp3: a soft, original background pad (synthesised, no licensing)
  - tap.mp3 / chime.mp3 / swish.mp3: quiet interface sounds

Usage:
  python3 narration/build_audio.py            # real narration (needs internet + edge-tts)
  python3 narration/build_audio.py --silent   # offline test: silent placeholder narration
  python3 narration/build_audio.py --no-voice # music + effects only, video falls back to estimated timing
Edit narration/script.json to change the words; re-run; re-render.
"""
import json, os, subprocess, sys, asyncio, math, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "audio")
os.makedirs(os.path.join(OUT, "narr"), exist_ok=True)
SR = 44100
VOICE = os.environ.get("NARRATION_VOICE", "en-NG-EzinneNeural")
RATE = os.environ.get("NARRATION_RATE", "-8%")
script = json.load(open(os.path.join(HERE, "script.json"), encoding="utf-8"))


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def to_mp3(samples, path, gain=1.0):
    samples = np.clip(samples * gain, -1, 1)
    tmp = path + ".wav"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((samples * 32767).astype(np.int16).tobytes())
    run(["ffmpeg", "-y", "-i", tmp, "-codec:a", "libmp3lame", "-b:a", "128k", path])
    os.remove(tmp)


# ── Narration ────────────────────────────────────────────────────────────
async def speak(text, path):
    import edge_tts
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(path)


def build_narration(mode):
    durs = {}
    for sc in script:
        for k, text in enumerate(sc["lines"]):
            key = f"{sc['id']}_{k}"
            path = os.path.join(OUT, "narr", key + ".mp3")
            if mode == "silent":
                secs = max(1.5, len(text.split()) / 2.4)
                run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=24000:cl=mono", "-t", f"{secs:.2f}", "-codec:a", "libmp3lame", path])
            else:
                for attempt in range(3):
                    try:
                        asyncio.run(speak(text, path)); break
                    except Exception as e:
                        if attempt == 2: raise
            durs[key] = round(duration(path), 3)
            print("  narration", key, durs[key], "s")
    return durs


# ── Music: warm, slow pad + soft pluck, fully synthesised ────────────────
def note(freq, dur, attack, release, vol, kind="pad"):
    n = int(dur * SR); t = np.arange(n) / SR
    if kind == "pad":
        w = (np.sin(2*np.pi*freq*t) + 0.5*np.sin(2*np.pi*freq*2*t + 0.3) + 0.25*np.sin(2*np.pi*freq*3*t)
             + 0.35*np.sin(2*np.pi*freq*1.003*t)) / 2.1
        env = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    else:
        w = np.sin(2*np.pi*freq*t) + 0.3*np.sin(2*np.pi*freq*2*t)
        env = np.minimum(1, t / 0.01) * np.exp(-t * 2.8)
    return w * np.clip(env, 0, 1) * vol


def build_music(seconds=96):
    f = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]]  # C, Am, F, G
    arps = [[72, 76, 79, 76], [69, 72, 76, 72], [65, 69, 72, 69], [67, 71, 74, 71]]
    beat = 60 / 72; bar = beat * 4
    out = np.zeros(int(seconds * SR))
    bars = int(seconds // bar)
    for b in range(bars):
        t0 = b * bar; ci = b % 4
        for m in chords[ci]:
            s = note(f(m), bar + 1.6, 1.4, 1.8, 0.07)
            i = int(t0 * SR); out[i:i + len(s)] += s[:len(out) - i]
        for k, m in enumerate(arps[ci] * 2):
            s = note(f(m), 1.6, 0, 0, 0.05, "pluck")
            i = int((t0 + k * beat / 2) * SR)
            if i < len(out): out[i:i + len(s)] += s[:len(out) - i]
    out = np.convolve(out, np.exp(-np.arange(0, 3000) / 900) / 900, mode="same") * 0.6 + out * 0.4  # soften
    out /= max(1e-6, np.abs(out).max()); return out * 0.8


def fx_tap():
    t = np.arange(int(0.09 * SR)) / SR
    return (np.sin(2*np.pi*880*t) * np.exp(-t*60) * 0.5 + np.random.RandomState(1).randn(len(t)) * np.exp(-t*220) * 0.12)


def fx_chime():
    out = np.zeros(int(0.9 * SR)); t = np.arange(len(out)) / SR
    for off, fr in [(0, 784), (0.12, 1175)]:
        i = int(off * SR); tt = t[:len(out) - i]
        out[i:] += np.sin(2*np.pi*fr*tt) * np.exp(-tt*5) * 0.35
    return out


def fx_swish():
    n = int(0.55 * SR); t = np.arange(n) / SR
    x = np.random.RandomState(2).randn(n)
    k = np.ones(40) / 40; x = np.convolve(x, k, mode="same")
    return x * np.sin(np.pi * t / t[-1]) ** 2 * 0.35


if __name__ == "__main__":
    mode = "voice"
    if "--silent" in sys.argv: mode = "silent"
    if "--no-voice" in sys.argv: mode = "none"
    durs = {} if mode == "none" else build_narration(mode)
    print("  music"); to_mp3(build_music(), os.path.join(OUT, "music.mp3"))
    to_mp3(fx_tap(), os.path.join(OUT, "tap.mp3")); to_mp3(fx_chime(), os.path.join(OUT, "chime.mp3")); to_mp3(fx_swish(), os.path.join(OUT, "swish.mp3"))
    json.dump({"voice": mode == "voice", "narration": mode != "none", "lines": durs, "music": True, "sfx": True},
              open(os.path.join(OUT, "durations.json"), "w"), indent=1)
    print("Audio ready in", os.path.abspath(OUT))
