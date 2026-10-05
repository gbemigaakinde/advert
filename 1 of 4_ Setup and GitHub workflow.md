# Part 1 of 4: Setup, project settings and the GitHub workflow

Start here. These five files wire the new **Parent Portal Guide** video into your existing `advert` project. Your current advert video and its workflow are not touched.

---

## `package.json`

**REPLACE (whole file)** this file in your `advert` repository. Adds the new tools and four new `npm run` shortcuts. Your existing `start` and `build` commands are kept.

```json
{
  "name": "fahmid-school-advert",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "remotion studio src/index.ts",
    "build": "remotion render src/index.ts FahmidAdvert out/fahmid-advert.mp4",
    "capture": "node portal-capture/capture.mjs",
    "audio": "python3 narration/build_audio.py",
    "build:guide": "remotion render src/index.ts ParentPortalGuide out/fahmid-parent-portal-guide.mp4 --crf=18",
    "start:guide": "remotion studio src/index.ts"
  },
  "dependencies": {
    "@remotion/cli": "4.0.526",
    "@remotion/transitions": "4.0.526",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "remotion": "4.0.526"
  },
  "devDependencies": {
    "@fontsource/dm-sans": "^5.3.0",
    "@fontsource/dm-serif-display": "^5.3.0",
    "@fontsource/plus-jakarta-sans": "^5.3.0",
    "@phosphor-icons/web": "^2.1.2",
    "@sparticuz/chromium": "^153.0.0",
    "@types/react": "18.3.1",
    "lucide": "^0.469.0",
    "puppeteer-core": "^24.43.1",
    "typescript": "5.5.4"
  }
}
```

---

## `src/Root.tsx`

**REPLACE (whole file)** this file in your `advert` repository. Keeps `FahmidAdvert` exactly as it was and adds a second video, `ParentPortalGuide` (1920x1080).

```tsx
import React from "react";
import { Composition } from "remotion";
import { FahmidAdvert } from "./FahmidAdvert";
import { PortalGuide } from "./guide/PortalGuide";
import { buildPlan, FPS as GUIDE_FPS, GuidePlan } from "./guide/plan";

const FPS = 30;
const DURATION_IN_SECONDS = 30;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="FahmidAdvert"
        component={FahmidAdvert}
        durationInFrames={FPS * DURATION_IN_SECONDS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      {/* Parent Portal Guide: 16:9 explainer. Length follows the narration automatically. */}
      <Composition
        id="ParentPortalGuide"
        component={PortalGuide as any}
        durationInFrames={GUIDE_FPS * 300}
        fps={GUIDE_FPS}
        width={1920}
        height={1080}
        defaultProps={{ plan: { scenes: [], total: 1, narration: false, music: false, sfx: false } as GuidePlan }}
        calculateMetadata={async () => {
          const plan = await buildPlan();
          return { durationInFrames: plan.total, props: { plan } };
        }}
      />
    </>
  );
};
```

---

## `.gitignore`

**REPLACE (whole file)** this file in your `advert` repository. Stops the automatically generated screenshots and sounds from being saved into the repository.

```
node_modules
out
.DS_Store
# Generated fresh by the workflow every time (see README-GUIDE.md):
public/portal
public/audio
```

---

## `.github/workflows/render-guide.yml`

**ADD (new file)** this file in your `advert` repository. The new "Render Parent Portal Guide" button in the Actions tab. Your old `render.yml` stays as it is.

```yaml
name: Render Parent Portal Guide

# Builds the 16:9 "Parent Portal Guide" explainer video.
#   1. Checks out this repo AND the school portal repo (the source of truth for the interface)
#   2. Photographs the real portal pages with fictional demo data
#   3. Records the narration, music and sound effects
#   4. Renders the MP4 with Remotion
#
# Run it by hand from the Actions tab ("Run workflow"), or let it run when the
# narration, the demo data, or the video code changes. The existing "Render Fahmid
# Advert" workflow is untouched and keeps working.
on:
  workflow_dispatch:
    inputs:
      school_ref:
        description: "Branch or tag of the fahmidschool repo to photograph"
        default: "main"
        required: false
      voice:
        description: "Narration voice (edge-tts name)"
        default: "en-NG-EzinneNeural"
        required: false
  push:
    branches: [main]
    paths:
      - "src/guide/**"
      - "narration/**"
      - "portal-capture/**"
      - ".github/workflows/render-guide.yml"
  repository_dispatch:
    types: [portal-updated]   # optional: lets the school repo trigger a fresh video after a portal change

jobs:
  render:
    runs-on: ubuntu-latest
    timeout-minutes: 90
    steps:
      - name: Check out the video project
        uses: actions/checkout@v4

      - name: Check out the school portal (source of truth for the interface)
        uses: actions/checkout@v4
        with:
          repository: gbemigaakinde/fahmidschool
          ref: ${{ github.event.inputs.school_ref || 'main' }}
          path: fahmidschool-src

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          npm install
          pip install edge-tts numpy
          sudo apt-get update -y && sudo apt-get install -y ffmpeg

      - name: Install Chrome headless shell (needed by Remotion)
        run: npx remotion browser ensure

      - name: Photograph the real portal screens
        env:
          FAHMID_SCHOOL_DIR: ${{ github.workspace }}/fahmidschool-src
          CHROME_PATH: /usr/bin/google-chrome
        run: npm run capture

      - name: Record narration, music and sound effects
        env:
          NARRATION_VOICE: ${{ github.event.inputs.voice || 'en-NG-EzinneNeural' }}
        run: |
          # If the voice service is unreachable, fall back to music + effects only
          # so a video is still produced (timing then follows reading speed).
          python3 narration/build_audio.py || python3 narration/build_audio.py --no-voice

      - name: Render the video
        run: npx remotion render src/index.ts ParentPortalGuide out/fahmid-parent-portal-guide.mp4 --crf=18

      - name: Upload the finished video
        uses: actions/upload-artifact@v4
        with:
          name: fahmid-parent-portal-guide
          path: out/fahmid-parent-portal-guide.mp4
          retention-days: 30

      - name: Upload the captured screens (for checking)
        uses: actions/upload-artifact@v4
        with:
          name: captured-portal-screens
          path: public/portal
          retention-days: 7
```

---

## `README-GUIDE.md`

**ADD (new file)** this file in your `advert` repository. Plain-English instructions for regenerating the video later.

````markdown
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
````

---