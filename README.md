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
- `assets/dollar-bill.webp`: a transparent photographic bill used for both ambient money and showers.

This is a layered 2.5D scene, not a rotatable mesh-based 3D model. Hover approaches gently repel the toys; clicks, taps, and keyboard activation trigger mini animations. The separate money button creates a shower. Motion can be paused, respects reduced-motion preferences, and stops when the hero is offscreen or the tab is hidden.

Fonts are DM Sans, Fraunces, and Caveat, with SIL Open Font Licenses in `assets/fonts/`. Asset prompts and generation details are in `docs/asset-prompts.md`.

Push to `main` to publish through the existing GitHub Pages deployment. Keep `CNAME` intact.
