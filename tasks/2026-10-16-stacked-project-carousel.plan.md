# Swipeable square project stack

## Scope and assumptions
- Convert the three featured projects into a user-controlled card stack; keep the eight-project archive unchanged.
- Each visual card is square, with its full description and existing links below. This preserves readable mobile content without squeezing text into a fixed-height square.
- Previous/next cards sit slightly behind the selected card. Swiping/dragging, arrow buttons, dots, and keyboard navigation change the selected project. No autoplay.
- Preserve the KEAM artwork, identity marquee, sharp buttons, all project destinations, and legacy anchors.
- User steering: restore the original boxed, numbered skills columns, with sharp outer corners. Apply zero-radius corners to all interactive elements, including contact tiles/fields; version CSS/JS URLs to avoid stale cached styles.

## Contracts and boundaries
- `index.html`: progressive-enhancement carousel region, three articles, square faces, descriptions/links, hidden-until-ready controls, and polite current-project status.
- `css/style.css`: default stacked list without JavaScript; enhanced grid overlays equal-size square faces, with transforms/opacity creating the deck transition. Only the active description is visible. Keep rear cards inert and avoid page overflow. Reduced-motion users receive an immediate state change.
- `js/project-carousel.js`: isolated controller owns active index, wraparound selection, control state, swipe intent, drag feedback, keyboard events, and deep links. No dependencies or network requests. Vertical touch scrolling remains native; buttons/links do not start drags.
- `tests/verify-carousel.cjs`: verify navigation, real pointer drags and cancellation, active links/inert state, wraparound, square geometry, reduced motion, responsive overflow, and no-JS fallback.
- Update earlier verification selectors only where the approved carousel changes their layout assumptions.
- No endpoints, data models, external services, deployment, or commits.

## Pre-decisions
- Square means the artwork/title face, not the entire text-heavy article. Descriptions remain directly below the active card.
- Use CSS grid layering rather than absolute-positioned variable-height articles: hidden descriptions reserve space so navigation does not make the page jump.
- Use Pointer Events with horizontal intent detection and `touch-action: pan-y`; capture only deliberate horizontal drags. Short/vertical/cancelled gestures do not change slides.
- Inactive slides use `inert` plus `aria-hidden`; controls and a polite status remain accessible.
- Default HTML remains fully readable if JavaScript fails or is disabled. Enable the deck only after successful controller initialization.

## Checkpoints and acceptance
1. Markup: all three names, descriptions, artwork, and original links remain present; archive unchanged.
2. Interaction: buttons/dots/Arrow keys/Home/End work; swipes switch left/right; vertical and small drags do not; mouse clicks on links are not swallowed.
3. Layout: square front faces and visible rear edges at 360, 390, 768, 1024, 1440px, no horizontal page overflow or clipped active links.
4. Accessibility: only the active slide is announced/focusable, status describes current selection, reduced motion suppresses transitions, and no-JS shows all articles without dead controls.
5. Run prior tests, new feature tests, desktop/mobile accessibility scans, visual screenshots, and independent review; fix concrete findings and re-run.

## Execution and rollback
Main agent: plan → markup/styles → dedicated controller → verification → review/fixes. Read-only independent review follows the code-quality skill. Changes are localized static files and can be reverted independently without migrations; retain all earlier uncommitted portfolio work.

## Verification results
- `node tests/verify-carousel.cjs`: passed. Covers five responsive widths, true square geometry, sharp corners on every interactive element, numbered skills boxes, wraparound buttons/dots/keyboard, real mouse drags, real emulated touch swipes, native vertical touch scrolling, short/cancelled gestures, original destinations, legacy deep links, reduced motion and no-JS fallback.
- `node tests/verify-polish.cjs`: both earlier polish and artwork/marquee suites pass. Updated the former layout's active-link selector, and allowed a 0.01px tolerance for floating-point differences in transformed marquee rectangles.
- Real touch testing exposed a capture-transfer bug: descendant `lostpointercapture` bubbled to the stage and prematurely reset the gesture. Runtime event logs confirmed it; cleanup now checks the capture target and active pointer ID. The same real-touch scenario passes after the fix.
- Independent review: SHIP-WITH-FIXES for that same touch issue; addressed and verified.
- Automated WCAG A/AA scans: no violations for each of the three active projects at 1440px and 390px.
- Desktop/mobile deck screenshots and restored boxed-skills screenshot visually inspected.
- No deployment or commits performed.
