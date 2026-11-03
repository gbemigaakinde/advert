# Grammar Short

56-second 9:16 video: four common mistakes (your/you're, could of, less/fewer, Me and Tola), told by one mascot, Amina, over a class group chat.

- Words and timing: `narration/grammar.json` (change a line, then re-run the workflow)
- Scenes and mascots: `src/grammar/Grammar.tsx`, `src/grammar/Mascots.tsx`
- Run on GitHub: Actions > "Render Grammar Short" > Run workflow. It also runs by itself whenever these files change. The MP4 and a `.srt` caption file appear under Releases (tag `grammar-latest`) and as a run artifact.
- If the voice service is unreachable, the workflow still makes a video (sound effects only) so you are never left with nothing.
- Locally: `python3 narration/build_grammar_audio.py && npm run build:grammar`
- Preview: `npx remotion studio src/grammar/index.ts`
- Lip-sync: Amina's mouth follows the real narration. `build_grammar_audio.py` measures the voice frame by frame and saves `open` / `wide` values in `public/grammar/timing.json`; the video reads them. Change a line in `grammar.json` and the mouth re-syncs automatically on the next build.
