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

# Total video length (see Root.tsx: FPS * DURATION_IN_SECONDS). Used as the
# fallback silent track's length if narration couldn't be generated at all,
# so the composition's <Audio> element always has a valid file to load.
FALLBACK_SILENCE_MS = 30_000

part_files = sorted(PARTS_DIR.glob("*.wav"))

OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

if not part_files:
    # The Piper step can fail line-by-line (bad model download, a transient
    # network hiccup, etc.) without necessarily crashing the workflow - see
    # the "Generate voiceover lines" step in render.yml, which now logs
    # warnings instead of aborting. If NOTHING was generated, don't take the
    # whole video down with it: fall back to a silent track so the render
    # still produces a finished (just unnarrated) video, and flag it loudly
    # so it's obvious in the workflow logs that narration is missing.
    print(
        "::warning::No voiceover parts found in voiceover/parts/ - the "
        "Piper generation step likely failed. Falling back to a silent "
        f"{FALLBACK_SILENCE_MS / 1000:.0f}s track so the video still renders "
        "without narration."
    )
    combined = AudioSegment.silent(duration=FALLBACK_SILENCE_MS)
else:
    combined = AudioSegment.empty()
    for i, part_file in enumerate(part_files):
        combined += AudioSegment.from_wav(part_file)
        gap = GAPS_MS[i] if i < len(GAPS_MS) else 500
        if gap:
            combined += AudioSegment.silent(duration=gap)

    expected_lines = len(GAPS_MS)
    if len(part_files) < expected_lines:
        print(
            f"::warning::Only {len(part_files)}/{expected_lines} voiceover "
            "lines were generated - narration will be incomplete."
        )

combined.export(OUTPUT_PATH, format="mp3")
print(f"Wrote {OUTPUT_PATH} ({len(combined) / 1000:.1f}s)")
