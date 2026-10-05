# Parent Portal Guide video

A 16:9 (1920x1080) tutorial for parents, built next to the existing 9:16 advert. The advert
(`FahmidAdvert`, `.github/workflows/render.yml`) is unchanged.

## Make or update the video (normal way)
GitHub > Actions > **Render Parent Portal Guide** > **Run workflow**. When it finishes, download
`fahmid-parent-portal-guide` from the run page. Run it again whenever the portal changes.

## What it does
1. `portal-capture/` opens the REAL portal pages (login, loading, pupil portal, report card,
   receipt) from the `fahmidschool` repo in a headless browser and photographs them. A tiny
   stand-in for the database supplies the fictional pupil from `portal-capture/demo-data.mjs`
   (Aisha Ibrahim, ADM-2026-001). No real records are ever read.
2. `narration/build_audio.py` records the voice from `narration/script.json`, plus a soft
   original music bed and quiet tap sounds.
3. `src/guide/` (Remotion) animates those screenshots inside a phone frame. The video length
   follows the narration automatically.

## Things you can change
- **Words spoken:** `narration/script.json` (each line is timed to what is on screen).
- **Demo pupil, fees, tests, results:** `portal-capture/demo-data.mjs`.
- **Web address shown in the browser scene:** `GUIDE_URL` in `src/guide/plan.ts`.
- **Voice:** run the workflow with a different voice name (e.g. `en-NG-AbeoNeural`, `en-GB-SoniaNeural`).

## Run on your own computer (optional)
```
npm install && pip install edge-tts numpy
FAHMID_SCHOOL_DIR=../fahmidschool npm run capture
npm run audio            # or: python3 narration/build_audio.py --silent  (quick test, no internet)
npm run start:guide      # preview in the browser
npm run build:guide      # writes out/fahmid-parent-portal-guide.mp4
```
