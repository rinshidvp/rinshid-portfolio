# KEAM illustration, identity marquee, and sharp buttons

## Scope and decisions
- Replace only the featured KEAM preview with an original, locally authored SVG illustration. It is a project illustration, not a fabricated application screenshot or an admissions claim.
- Add a subtle horizontally looping identity strip between the hero and selected work. Use the owner's name and existing areas of work; no new claims.
- Interpret “square” as sharp, zero-radius button corners, retaining comfortable rectangular button dimensions.
- Keep existing project URLs, content, card corners, and contact behavior. No deployment, framework changes, or external image service.

## Contracts and behavior
- `images/keam-illustration.svg`: self-contained accessible vector artwork, 1200×750, with no scripts, remote fonts, or external assets.
- `index.html`: replace the KEAM image source/alt text and insert a labelled strip outside the section hierarchy. Repeated visual text is hidden from assistive technology; provide one readable description.
- `css/style.css`: clip overflow within the strip, animate equal-width repeated groups for a seamless loop, preserve sharp button corners, and keep the strip static under reduced motion or without JavaScript.
- `js/main.js`: enable motion only after initialization, expose a keyboard-operable pause toggle, and respond to reduced-motion changes. Pause preference survives media-query changes within the page; no persistence required.
- `tests/verify-polish.cjs`: retain existing regression checks, add illustration loading/source, sharp corners, looping motion, pause/resume, reduced-motion changes, no-JS fallback, and overflow coverage.

## Verification checkpoints
1. Inspect rendered illustration on desktop/mobile; confirm it is clearly illustrative and not clipped.
2. Check actual animation movement over frames, then pause/resume and OS preference changes. Confirm repeated content is not announced multiple times.
3. Run responsive checks at 360–1440px and inspect computed button radii.
4. Run automated accessibility scans and independent code-quality review, then fix concrete findings.

## Acceptance criteria
- Featured KEAM card shows the new illustration and retains existing destinations.
- Text scrolls horizontally with normal motion settings; a visible control can stop/resume it.
- With reduced motion or no JavaScript, readable static text remains and no unusable pause control appears.
- All primary/secondary/header/download/submit buttons have zero-radius corners.
- No horizontal page overflow; existing navigation, project archive, and hero verification still pass.

## Rollback and execution
Main agent implements artwork → markup/styles/behavior → browser tests; separate read-only review follows the code-quality skill. Changes are additive/localized and can be reverted without migrations. Preserve all earlier portfolio polish and unrelated user work.

## Results
- `node tests/verify-polish.cjs`: both the earlier polish checks and the new artwork/motion/corners checks pass across five widths (360–1440px).
- Confirmed actual leftward movement, frozen position while paused, resume, remembered pause after preference changes, and static wrapping without JavaScript.
- Preference-change assertions wait for the media-query event: runtime inspection showed CSS stops animation immediately and the control updates on the next rendering frame.
- Automated WCAG A/AA scans at 1440px and 390px: no violations.
- Desktop artwork/card and identity strip screenshots visually inspected; the SVG fills its preview with no screenshot frame padding.
- Independent code-quality review: SHIP, no findings.
- No deployment or commits performed.
