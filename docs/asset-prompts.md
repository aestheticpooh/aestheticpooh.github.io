# Scene assets

Created with the built-in image generation tool from Cassie's approved `heavenly bears.png` reference. These are generated 2D images, not scanned 3D models. The three toys and the dollar bill have real alpha transparency. WebP conversion preserves that alpha. The reference itself is not used as a flattened website screenshot.

The generated scenery is 1536 × 1024. Each toy master is 1254 × 1254 and is served at 1000 × 1000. The bill master is 1900 × 828 and is served at 650 pixels wide. Text and controls remain real HTML at every screen size.

## Environment — `assets/marble-world.webp`

Reference: the approved hero image.

> Use case: precise-object-edit. Asset type: high-resolution environment-only background plate for an interactive website. Edit the attached definitive reference artwork, preserving its precise camera perspective, framing, sunlit cream/pink marble architecture, tall arch opening onto blue sky and a distant Mediterranean waterfront/mountains, reflective shallow water pool at bottom right, round marble plinths left and right, and warm diagonal sunlight. REMOVE ALL stuffed bears/toys, ALL dollar bills, ALL lettering/name/navigation/UI/labels/icons/crown/heart. Seamlessly restore the architecture/scenery behind every removed item. This must be a clean empty environment with the same rich photorealistic materials and photographic depth, no characters and no text. Retain calm light areas on the left, center column and right wall for real HTML typography later. Match the reference composition exactly and preserve its 3:2 aspect ratio. Produce the highest practical resolution, ideally 3072x2048. Do not produce a screenshot or redesign.

## White shirt — `assets/toy-white.webp`

Reference: the approved hero image.

> Use case: background-extraction. Asset type: single transparent plush character PNG for interactive website, not a website mockup. The attached image is the subject identity reference. Extract and faithfully reconstruct ONLY the seated small tan vintage plush bear in a white tee on the round plinth in the LOWER LEFT MIDDLE of the reference (around x=450 y=630 in the 1536x1024 composition). He has a lavender handmade crocheted bucket hat, short warm tan worn velour fur, gently closed embroidered eyes/eyebrows, dark brown round nose, short rounded muzzle, distinctive slightly uneven well-loved toy proportions, small seated legs with round paws, and a white t-shirt reading 'hugs & kisses' in small pink letters. NO SUNGLASSES for this version. Preserve this exact toy's look and the photoreal soft warm natural sunlight. Show one complete isolated seated toy in a front 3/4 pose facing slightly toward viewer, uncropped, centered and filling 85% of a square canvas. Remove the plinth, all architecture, all text outside the shirt, all money and all other characters. Genuine transparent alpha background with clean soft plush edges, no checkerboard baked into pixels, no ground plane, no background, no extra accessories. This is a faithful asset extraction from the user's reference, not a generic teddy redesign.

## Pink sweater — `assets/toy-pink.webp`

References: approved hero image, then the generated white-shirt toy for consistent identity.

> Use case: background-extraction. Asset type: single transparent plush character PNG for interactive website. Image 1 is the definitive scene and wardrobe reference. Image 2 is a supporting subject identity reference for the SAME toy. Create ONLY the small tan vintage plush bear wearing a handmade dusty pink crocheted sweater and lavender crocheted bucket hat, as seen peeking beside the central column near the upper middle-left of image 1. Keep the same exact small dark brown round nose, gently closed embroidered eyes, short slightly uneven well-loved body, warm tan short velour plush texture, and face as in the references. Photoreal soft warm sunlight. One complete bear only, seated or gently floating with paws visible, facing viewer with a playful slight head tilt. Show full body uncropped, centered, fills 85% of a square canvas. PINK CROCHET SWEATER version; no white shirt and no sunglasses. Genuine transparent alpha background, clean plush edges; remove ALL scenery, ground, plinths, shadows on ground, money, text and other characters. Do not redesign the toy as a generic bear. No checkerboard baked into the image.

## Sunglasses — `assets/toy-sunglasses.webp`

References: approved hero image, then the generated white-shirt toy for consistent identity.

> Use case: background-extraction. Asset type: single transparent plush character PNG for interactive website. Image 1 is definitive scene and wardrobe reference. Image 2 is supporting identity reference of same user's bear. Extract/reconstruct ONLY the floating bear in the TOP RIGHT of image 1 wearing round dark sunglasses with a thin gold frame, lavender handmade crochet bucket hat, and white hugs & kisses t-shirt. Preserve the specific tan plush face and short rounded muzzle, little dark brown nose, well-loved velour texture, small rounded paws and body proportions. The toy must look like the same actual reference plush, not a different generic teddy. Pose upright floating, feet slightly apart and dangling, arms lightly out, a charming slight head tilt, in a full front three-quarter view. Photoreal warm natural sunlight. Exactly ONE complete isolated character centered on a square canvas, uncropped with hat and feet fully visible, fills 85%. Genuine transparent alpha background with clean plush edges. Remove ALL other characters, scenery, ground, money, plinths and text except small shirt lettering. No checkerboard, no shadow rectangle or opaque backdrop. Keep sunglasses and lavender hat.

## Dollar bill — `assets/dollar-bill.webp`

Reference: the approved hero image.

> Use case: background-extraction. Asset type: transparent isolated dollar bill sprite for a website's playful floating-money animation. Use the realistic dollar bills in the attached scene as the precise style reference: aged cream paper, muted sage/olive green intricate engraved patterns, detailed central oval portrait, decorative border and US dollar denominations, warm sunlight. Create ONE complete realistic US one-dollar banknote floating horizontally, front face visible, very gentle physical wave/curl along its long axis, with near-rectangular proportions around 2.35:1. It should be recognizable photographic dollar currency at a glance, not a generic green rectangle or giant dollar symbol. Keep the entire bill fully visible with a narrow margin around it. Landscape canvas around 1536x640. Genuine transparent alpha background, no other objects, no hands, no scene, no floor, no background shadow or checkerboard. This will be rendered small in the interactive scene; prioritize convincing printed banknote detail and paper texture.

## Fonts

The three variable font families are hosted in `assets/fonts/` and subset to the Latin characters used by the site. Originals: https://github.com/google/fonts/tree/main/ofl/caveat, https://github.com/google/fonts/tree/main/ofl/dmsans, and https://github.com/google/fonts/tree/main/ofl/fraunces. Their SIL Open Font Licenses are included beside the fonts.
