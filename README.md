# Cassie's Element

Personal portfolio at https://cassieselement.com. Static HTML, CSS, and JavaScript; no build step or third-party animation runtime.

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Umami only loads on `cassieselement.com` and `www.cassieselement.com`.

## The interactive world

- `index.html`: real, accessible text, navigation, and résumé content.
- `css/site.css`: composition, responsive layouts, three locally hosted font families, and a money-sprayer cursor.
- `js/world.js`: one shared animation loop for parallax, spring movement, and floating toys; finite money rain and aimed sprays use Web Animations.
- `assets/marble-world.webp`: clean scenery without baked-in text, toys, or money.
- `assets/toy-{white,pink,sunglasses}.webp`: three distinct transparent character images, rendered independently at different depths.
- `assets/bear-{curious,wave,lounge,walking}.webp`: four new poses, including small open eyes, a true reclining sunglasses pose, and a tiny walking profile.
- `assets/bear-{curious,wave,lounge,sunglasses,walking}-worn.webp`: the previous five poses, with worn velour, fuzzy crochet, tiny eyes, short legs, and small feet. The pink bear sits; the sunglasses bear tucks its feet close to its belly.
- `assets/bear-{curious,wave,lounge,sunglasses}-reference.webp`: four reference-matched poses, more closely matched to the supplied floating bear and heavenly scene: tiny stitched eyes, softer cheeks, relaxed limbs, and worn plush while retaining the existing tan, lavender, and dusty-pink palette.
- `assets/bear-{pillar-peek,seated-smile,foreground-shades,foreground-dreamer}.webp`: four additional poses that give all eight hero bears different appearances, including a shy pillar peek, closed-eye smile, sunglasses close-up, and a back-facing foreground portrait.
- `assets/cassie-kwong-brush.webp`: brush-lettered name artwork reconstructed from the hero reference, with the crown and heart. The semantic H1 remains accessible as text.
- `assets/bear-walking-worn.webp`: the existing miniature walking pose retained between experience entries.
- `assets/money-sprayer-cursor.svg`: the locally drawn cursor, with its hotspot at the nozzle.
- `assets/dollar-bill.webp`: a transparent photographic bill used for money rain and directed sprays.

This is a layered 2.5D scene, not a rotatable mesh-based 3D model. Hover approaches gently repel the toys. No dollars appear on load. Clicking **Spawn money** rains bills in front of the page and loads the sprayer. After that, clicking or tapping a bear sprays bills toward it; desktop users can hold the pointer down in the hero to keep spraying. Keyboard activation also works. Sprays are bounded and cleaned up; they stop on release, pointer cancellation, leaving the hero, losing focus, pausing, or hiding the tab. Clouds, water reflections, light, and toy shadows move independently. Seated and reclining bears barely move at rest, while the sky bear floats and the pillar bear peeks gently. Desktop bear anchors project from the background image coordinates to keep paws aligned with the marble across screen sizes. A matching scenery layer hides part of the pillar bear; foreground portraits are cropped by the viewport and softly blurred for depth.

The marble setting continues through the résumé, projects, toolkit, education, and contact sections. Small bear links connect chapters. At most one tiny bear walks in a visible gap between experience entries; it never crosses the text. The sticky chapter bar keeps work and the original résumé PDF accessible, with no C’E monogram.

The fixed motion control pauses ambient movement and moving bills. Reduced-motion preferences are respected from load; manually requested money appears as stationary bills that fade. Hero animation stops offscreen, walkers only run in visible lanes, and all ambient motion pauses when the tab is hidden. The 20 original experience bullets (including all six Gopuff bullets), complete skills, consulting descriptions, education, leadership, and PDF are preserved verbatim from the supplied résumé.

Fonts are DM Sans, Fraunces, and Caveat, with SIL Open Font Licenses in `assets/fonts/`. Asset prompts and generation details are in `docs/asset-prompts.md`.

Push to `main` to publish through the existing GitHub Pages deployment. Keep `CNAME` intact.
