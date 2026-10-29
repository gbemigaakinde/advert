# Grammar Short

57-second 9:16 video: four common mistakes (your/you're, could of, then/than, lose/loose), told as a class group chat between Tobi and Amina.

- Words and timing: `narration/grammar.json` (change a line, re-run the workflow)
- Scenes and mascots: `src/grammar/Grammar.tsx`, `src/grammar/Mascots.tsx`
- Run on GitHub: Actions > "Render Grammar Short" > Run workflow. The MP4 and a `.srt` caption file appear under Releases (tag `grammar-latest`) and as a run artifact.
- Locally: `python3 narration/build_grammar_audio.py && npm run build:grammar`
- Preview: `npx remotion studio src/grammar/index.ts`
