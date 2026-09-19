# Cassie's Element

Personal portfolio at https://cassieselement.com. Static HTML, CSS, and JavaScript; no build step or third-party animation runtime.

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Umami only loads on `cassieselement.com` and `www.cassieselement.com`.

## The interactive world

- `index.html`: real, accessible text, navigation, and résumé content.
- `css/site.css`: composition, responsive layouts, three locally hosted font families, and the finger cursor.
- `js/world.js`: one shared animation loop for parallax, spring movement, floating toys and bills; finite money showers use Web Animations.
- `assets/marble-world.webp`: clean scenery without baked-in text, toys, or money.
- `assets/toy-{white,pink,sunglasses}.webp`: three distinct transparent character images, rendered independently at different depths.
- `assets/bear-{curious,wave,lounge,walking}.webp`: four new poses, including small open eyes, a true reclining sunglasses pose, and a tiny walking profile.
- `assets/dollar-bill.webp`: a transparent photographic bill used for both ambient money and showers.

This is a layered 2.5D scene, not a rotatable mesh-based 3D model. Hover approaches gently repel the toys; clicks, taps, and keyboard activation trigger mini animations. The separate money button creates a shower behind the text. Ambient bills avoid the measured text areas. Clouds, water reflections, light, and toy shadows move independently.

The marble setting continues through the résumé, projects, toolkit, education, and contact sections. Small bear links connect chapters. At most one tiny bear walks in a visible gap between experience entries; it never crosses the text. The sticky chapter bar keeps work and the original résumé PDF accessible.

The fixed motion control pauses the entire site, including CSS and Web Animations. Reduced-motion preferences are respected from load. Hero animation stops offscreen, walkers only run in visible lanes, and all ambient motion pauses when the tab is hidden. The 20 original experience bullets (including all six Gopuff bullets), complete skills, consulting descriptions, education, leadership, and PDF are preserved verbatim from the supplied résumé.

Fonts are DM Sans, Fraunces, and Caveat, with SIL Open Font Licenses in `assets/fonts/`. Asset prompts and generation details are in `docs/asset-prompts.md`.

Push to `main` to publish through the existing GitHub Pages deployment. Keep `CNAME` intact.
