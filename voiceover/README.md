# Automatic Voiceover (British English, open-source)

The video's narration is generated automatically, every time it
renders, using Piper — a free, open-source text-to-speech engine. It
runs entirely inside GitHub's own servers during the render. No
account, no API key, no card, nothing to sign up for.

The voice used is en_GB-alan-medium — a natural-sounding British
English voice.

## How it works (nothing you need to do)

1. The workflow downloads the voice model from Hugging Face (a public,
   free model repository).
2. It reads voiceover/script.txt - one line per scene - and turns
   each line into a short audio clip.
3. voiceover/build_audio.py stitches those clips together with short
   pauses between them, matching the pacing of the video, and saves
   the result as public/voiceover.mp3.
4. The video renders with that narration included.

This all happens automatically on every push - there's nothing to set
up.

## Changing the words

Open voiceover/script.txt and edit the lines directly - it's plain
text, one line per scene, in the same order the scenes appear in the
video. Save and commit; the next render will use your updated
wording.

## Changing the voice

Piper has several other British voices. To switch, open
.github/workflows/render.yml and replace every instance of
en_GB-alan-medium (there are a few) with one of these:

- en_GB-jenny_dioco-medium - female voice
- en_GB-southern_english_female-low - female voice
- en_GB-northern_english_male-medium - male voice, Northern English accent

Each voice also needs its download URL updated to match - the pattern
is:
https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/VOICE-NAME/QUALITY/en_GB-VOICE-NAME-QUALITY.onnx

Tell me which voice you'd like and I'll make the change for you.

## If the narration feels out of sync with the visuals

Once you hear the finished video, if the pacing feels off, tell me
which part and roughly how much it drifts by. Two things can be
adjusted:
- The pause lengths between lines, in voiceover/build_audio.py (the
  GAPS_MS list, in milliseconds).
- The on-screen scene durations, in src/FahmidAdvert.tsx.
