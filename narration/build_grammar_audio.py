#!/usr/bin/env python3
"""
Builds the voice track for the Grammar Short.
  python3 narration/build_grammar_audio.py            # real voices (edge-tts, needs internet)
  python3 narration/build_grammar_audio.py --silent   # no voice: only timing + sound effects (offline test)
Writes public/grammar/voice.mp3 (when voiced), sfx are mixed in, public/grammar/timing.json,
and out/grammar-subtitles.srt. Edit narration/grammar.json to change the words.

Lip-sync: when the voice is built, the real audio is analysed frame by frame (30 fps) and the result
is stored in timing.json as "open" (how wide the mouth is open, 0..1) and "wide" (0 = round "oo/oh"
sounds, 1 = wide "ee/s" sounds). The video reads these values, so the mouth follows the actual speech.
"""
import json, os, subprocess, sys, asyncio, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "public", "grammar")
LINES = os.path.join(OUT, "lines")
os.makedirs(LINES, exist_ok=True)
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
SR = 44100
VOICES = {"amina": os.environ.get("AMINA_VOICE", "en-NG-EzinneNeural"),
          "tobi": os.environ.get("TOBI_VOICE", "en-NG-AbeoNeural")}
RATE = {"amina": "-4%", "tobi": "+0%"}
PITCH = {"amina": "+0Hz", "tobi": "-2Hz"}
silent = "--silent" in sys.argv
data = json.load(open(os.path.join(HERE, "grammar.json"), encoding="utf-8"))


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def dur(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


async def speak(text, who, path):
    import edge_tts
    last = None
    for _ in range(3):
        try:
            await edge_tts.Communicate(text, VOICES[who], rate=RATE[who], pitch=PITCH[who]).save(path)
            return
        except Exception as e:  # transient network errors: retry
            last = e
            await asyncio.sleep(2)
    raise RuntimeError(f"Narration failed for: {text!r}: {last}")


def sfx_wave(kind):
    t = np.linspace(0, 0.35, int(SR * 0.35), endpoint=False)
    if kind == "pop":
        f = 520 + 700 * np.exp(-t * 30)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)
    else:  # ding
        s = (np.sin(2 * np.pi * 988 * t) + 0.5 * np.sin(2 * np.pi * 1480 * t)) * np.exp(-t * 9)
    return (s * 0.25).astype(np.float32)



def decode_mono(path, sr):
    """Decode any audio file to mono float32 at sample-rate sr."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def mouth_track(placed, total_s, fps):
    """placed: [(start_seconds, mp3_path)]. Returns (open, wide): one 0..1 value per video frame.
    Built from the voice lines only (no sound effects), placed exactly where adelay puts them in the mix."""
    asr = 16000
    bed = np.zeros(int(total_s * asr) + asr, dtype=np.float32)
    for at, path in placed:
        a = decode_mono(path, asr)
        i = int(int(at * 1000) / 1000 * asr)  # same millisecond rounding as the adelay filter
        bed[i:i + len(a)] += a[: max(0, len(bed) - i)]
    nfr = int(round(total_s * fps))
    half = int(asr / fps)  # window = 2 video frames, centred on the middle of each frame
    win = np.hanning(2 * half)
    rms = np.zeros(nfr); cen = np.zeros(nfr)
    freqs = np.fft.rfftfreq(2048, 1 / asr)
    for f in range(nfr):
        c = int((f + 0.5) / fps * asr)
        seg = bed[max(0, c - half): c + half]
        if len(seg) < 2 * half:
            seg = np.pad(seg, (0, 2 * half - len(seg)))
        seg = seg * win
        rms[f] = np.sqrt(np.mean(seg ** 2) / np.mean(win ** 2))
        mag = np.abs(np.fft.rfft(seg, 2048))
        cen[f] = (freqs * mag).sum() / (mag.sum() + 1e-9)
    voiced = rms[rms > 0.003]
    peak = np.percentile(voiced, 95) if len(voiced) else 1.0
    rel = rms / (peak + 1e-9)
    db = 20 * np.log10(rel + 1e-6)
    raw = np.clip((db + 30) / 30, 0, 1) ** 0.9            # -30 dB (shut) .. 0 dB (fully open)
    raw[rel < 0.03] = 0.0                                   # gaps between words and sentences: lips closed
    wide_raw = np.clip((cen - 900) / (2600 - 900), 0, 1)    # low sound = round mouth, high sound = wide mouth
    op, wd = np.zeros(nfr), np.zeros(nfr)
    po, pw = 0.0, 0.5
    for f in range(nfr):
        k = 0.85 if raw[f] > po else 0.5                    # quick to open, a little slower to close
        po = po + (raw[f] - po) * k
        op[f] = po if po > 0.06 else 0.0
        if raw[f] > 0:
            pw = pw + (wide_raw[f] - pw) * 0.5
        wd[f] = pw
    return [round(float(x), 2) for x in op], [round(float(x), 2) for x in wd]

timing, inputs, filters, labels = {}, [], [], []
placed = []  # (start seconds, mp3 path) of each real voice line, for lip-sync analysis
srt = []
n = 0
for sc in data["scenes"]:
    for k, ln in enumerate(sc["say"]):
        key = f"{sc['id']}_{k}"
        at = sc["start"] + ln["at"]
        nxt = sc["say"][k + 1]["at"] if k + 1 < len(sc["say"]) else sc["dur"] - 0.35
        room = sc["start"] + nxt - at - 0.15
        if silent:
            d = max(1.0, len(ln["text"].split()) / 2.6)
        else:
            p = os.path.join(LINES, key + ".mp3")
            asyncio.run(speak(ln["text"], ln["who"], p))
            d = dur(p)
            if d > room:
                ratio = d / room
                if ratio > 1.35:
                    # too long for its slot: the video would drift, so stop instead of shipping a bad cut
                    print(f"ERROR: {key} too long", file=sys.stderr)
                    print(f"WARNING: {key} is {d:.1f}s but only {room:.1f}s fits. Shorten the line.", file=sys.stderr)
                ratio = min(ratio, 1.35)
                q = p + ".fast.mp3"
                run(["ffmpeg", "-y", "-i", p, "-filter:a", f"atempo={ratio:.3f}", q])
                os.replace(q, p)
                d = dur(p)
            inputs += ["-i", p]
            placed.append((at, p))
            ms = int(at * 1000)
            filters.append(f"[{n}:a]adelay={ms}|{ms},volume=1.0[a{n}]"); labels.append(f"[a{n}]"); n += 1
        timing[key] = {"at": at, "dur": round(d, 3), "who": ln["who"]}
        def ts(x):
            h, m, s = int(x // 3600), int(x % 3600 // 60), x % 60
            return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")
        srt.append(f"{len(srt)+1}\n{ts(at)} --> {ts(at + d)}\n{ln['text']}\n")

# sound effects (pop when a message lands, ding when the fix appears)
sfx_times = []
for sc in data["scenes"]:
    if sc["id"].startswith("m"):
        fx = sc["say"][1]["at"] - 0.3
        sfx_times += [(sc["start"] + 0.2, "pop"), (sc["start"] + fx, "ding"), (sc["start"] + fx + 0.5, "pop")]
    elif sc["id"] == "hook":
        sfx_times += [(sc["start"] + t, "pop") for t in (0.8, 1.6)]
total = data["total"]
bed = np.zeros(int(SR * total), dtype=np.float32)
for t0, kind in sfx_times:
    w = sfx_wave(kind); i = int(t0 * SR); bed[i:i + len(w)] += w[: len(bed) - i]
sfx_path = os.path.join(OUT, "sfx.wav")
with wave.open(sfx_path, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(bed, -1, 1) * 32767).astype(np.int16).tobytes())

final = os.path.join(OUT, "voice.mp3")
if silent:
    run(["ffmpeg", "-y", "-i", sfx_path, "-codec:a", "libmp3lame", "-b:a", "128k", final])
else:
    inputs += ["-i", sfx_path]
    labels.append(f"[{n}:a]"); n += 1
    graph = ";".join(filters) + (";" if filters else "") + "".join(labels) + \
        f"amix=inputs={n}:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=9,apad[out]"
    run(["ffmpeg", "-y", *inputs, "-filter_complex", graph, "-map", "[out]", "-t", str(total),
         "-codec:a", "libmp3lame", "-b:a", "160k", final])

out_timing = {"built": True, "voiced": not silent, "lines": timing}
if not silent:
    out_timing["open"], out_timing["wide"] = mouth_track(placed, total, 30)
json.dump(out_timing, open(os.path.join(OUT, "timing.json"), "w"), indent=1)
open(os.path.join(ROOT, "out", "grammar-subtitles.srt"), "w", encoding="utf-8").write("\n".join(srt))
print("done:", "voiced" if not silent else "silent timing only", f"({len(timing)} lines)")
