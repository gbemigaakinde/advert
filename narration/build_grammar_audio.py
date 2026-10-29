#!/usr/bin/env python3
"""
Builds the voice track for the Grammar Short.
  python3 narration/build_grammar_audio.py            # real voices (edge-tts, needs internet)
  python3 narration/build_grammar_audio.py --silent   # no voice: only timing + sound effects (offline test)
Writes public/grammar/voice.mp3 (when voiced), sfx are mixed in, public/grammar/timing.json,
and out/grammar-subtitles.srt. Edit narration/grammar.json to change the words.
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


timing, inputs, filters, labels = {}, [], [], []
srt = []
n = 0
for sc in data["scenes"]:
    for k, ln in enumerate(sc["say"]):
        key = f"{sc['id']}_{k}"
        at = sc["start"] + ln["at"]
        nxt = sc["say"][k + 1]["at"] if k + 1 < len(sc["say"]) else sc["dur"] - 0.2
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
                    print(f"WARNING: {key} is {d:.1f}s but only {room:.1f}s fits. Shorten the line.", file=sys.stderr)
                ratio = min(ratio, 1.35)
                q = p + ".fast.mp3"
                run(["ffmpeg", "-y", "-i", p, "-filter:a", f"atempo={ratio:.3f}", q])
                os.replace(q, p)
                d = dur(p)
            inputs += ["-i", p]
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
        sfx_times += [(sc["start"] + 1.5, "pop"), (sc["start"] + 3.4, "ding"), (sc["start"] + 4.4, "pop")]
    elif sc["id"] == "hook":
        sfx_times += [(sc["start"] + t, "pop") for t in (2.2, 2.7, 3.2, 3.7)]
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
        f"amix=inputs={n}:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=9[out]"
    run(["ffmpeg", "-y", *inputs, "-filter_complex", graph, "-map", "[out]", "-t", str(total),
         "-codec:a", "libmp3lame", "-b:a", "160k", final])

json.dump({"built": True, "voiced": not silent, "lines": timing}, open(os.path.join(OUT, "timing.json"), "w"), indent=1)
open(os.path.join(ROOT, "out", "grammar-subtitles.srt"), "w", encoding="utf-8").write("\n".join(srt))
print("done:", "voiced" if not silent else "silent timing only", f"({len(timing)} lines)")
