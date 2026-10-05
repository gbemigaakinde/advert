# Updated workflow: direct MP4 download

**REPLACE (whole file)** `.github/workflows/render-guide.yml` in your `advert` repository with the code below.

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

# Needed so the workflow can publish the finished video on the Releases page.
permissions:
  contents: write

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

      - name: Make a smaller copy for WhatsApp and slow connections
        run: |
          ffmpeg -y -i out/fahmid-parent-portal-guide.mp4 \
            -vf "scale=1280:720" -c:v libx264 -preset slow -crf 31 \
            -c:a aac -b:a 96k -movflags +faststart \
            out/fahmid-parent-portal-guide-small.mp4
          ls -lh out/*.mp4

      - name: Publish the videos on the Releases page (direct MP4 download, no zip)
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          TAG=guide-latest
          # Replace the previous release so the link below always points at the newest video.
          gh release delete "$TAG" --cleanup-tag --yes || true
          gh release create "$TAG" \
            out/fahmid-parent-portal-guide.mp4 \
            out/fahmid-parent-portal-guide-small.mp4 \
            --title "Parent Portal Guide video" \
            --notes "Built on $(date -u +'%d %B %Y at %H:%M UTC'). Full quality: fahmid-parent-portal-guide.mp4. Smaller copy for WhatsApp and slow connections: fahmid-parent-portal-guide-small.mp4." \
            --latest

      - name: Keep a backup copy as a run artifact
        uses: actions/upload-artifact@v4
        with:
          name: fahmid-parent-portal-guide
          path: out/*.mp4
          retention-days: 30

      - name: Upload the captured screens (for checking)
        uses: actions/upload-artifact@v4
        with:
          name: captured-portal-screens
          path: public/portal
          retention-days: 7
```