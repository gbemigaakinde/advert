# Voiceover Script — Fahmid Advert

Timed to when each scene appears (30fps, 30 seconds total). Read at a
natural, unhurried pace — there's room to breathe between lines.

0:00 | Logo
"Fahmid Nursery and Primary School."

0:03 | Est. 2007 / Location
"Established in 2007, in Alagbado, Lagos."

0:05 | Tagline
"Where every child discovers their best."

0:09 | Stats
"Eighteen years of excellence. Over one hundred and fifty pupils. A ninety-eight percent pass rate."

0:14 | Values
"Built on love, respect, integrity, and discipline."

0:17 | Testimonial
"I saw an improvement in my child since she began attending. Her character and behaviour changed greatly too. — a parent, Primary 3."

0:21 | Programs
"From nursery through to Primary 6, we prepare every child for what comes next."

0:24 | Call to action
"Admissions are open now. Visit fahmidschool dot com dot n-g, or call zero-eight-zero-six, one-four-two, seven-two-nine-seven."

## How to add it once you have the recording

1. Record the lines above (a phone voice memo is fine, export as .mp3).
2. Add the file to the repo at the path public/voiceover.mp3 (same way
   you added the logo — Add file then Upload files).
3. Open src/FahmidAdvert.tsx and find this line near the top:

   VOICEOVER LINE (currently commented out):
   <Audio src={staticFile("voiceover.mp3")} />

   It is wrapped in a comment like this in the file:
   { /* <Audio src={staticFile("voiceover.mp3")} /> */ }

   Remove the comment markers around it so the Audio line is active
   on its own, not wrapped in comment symbols.

4. Commit. The next automatic render will include your voice track.

If your recording runs a little long or short, tell me the actual length
and I will adjust each scene's duration in src/FahmidAdvert.tsx so the
visuals stay in sync with your voice.
