"""
Stitches the individual Piper-generated voice lines (voiceover/parts/*.wav)
into one finished narration track at public/voiceover.mp3, inserting a
short pause after each line so the pacing matches the video's scenes.
"""
from pathlib import Path
from pydub import AudioSegment

PARTS_DIR = Path("voiceover/parts")
OUTPUT_PATH = Path("public/voiceover.mp3")

# Gap, in milliseconds, inserted AFTER each line (matches the pacing of
# the on-screen scenes - see voiceover/README.md to adjust).
GAPS_MS = [900, 600, 900, 700, 700, 700, 700, 0]

part_files = sorted(PARTS_DIR.glob("*.wav"))

if not part_files:
    raise SystemExit(
        "No voiceover parts found in voiceover/parts/ - did the Piper "
        "generation step run successfully?"
    )

combined = AudioSegment.empty()
for i, part_file in enumerate(part_files):
    combined += AudioSegment.from_wav(part_file)
    gap = GAPS_MS[i] if i < len(GAPS_MS) else 500
    if gap:
        combined += AudioSegment.silent(duration=gap)

OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
combined.export(OUTPUT_PATH, format="mp3")
print(f"Wrote {OUTPUT_PATH} ({len(combined) / 1000:.1f}s)")
