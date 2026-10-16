# Restrained headline reveal and editorial section labels

## Scope and decisions
- Add the two recommended improvements only: a one-time, gently staggered hero headline reveal and numbered section labels (01–06).
- Keep wording, typography scale, existing marquee, square project deck, boxed skills, and sharp controls unchanged.
- Do not add another looping effect, cursor gimmick, or invented before/after case study.
- Changes are local; this follow-up does not automatically repeat the previous push operation.

## Contracts
- `index.html`: split the existing headline into two semantic text spans; add consistently styled, decorative section numbers to Work, About, Services/Experience, Skills, Education, and Contact. Keep existing headings and IDs.
- `css/style.css`: animate opacity and a small vertical translation only when explicitly enabled by JavaScript and motion preference allows it. All text is visible by default. Use one reusable section-label treatment.
- `js/main.js`: initialize the headline once per document load, remove animation state after completion/cancellation, and finish immediately if reduced motion becomes enabled. No replay on scroll, resize, or preference toggling.
- Existing browser verification gains assertions for the six section labels, actual single-run animation, final visible state, live reduced-motion cancellation, and no-JavaScript visibility.
- No dependencies, endpoints, models, or API changes. Update asset revision URLs for correct local preview.

## Verification and acceptance
1. Six labels appear in document order; original heading text/anchors remain and numbers are hidden from screen readers.
2. Normal preference: two headline spans animate once and settle visibly; navigation/resize does not replay them.
3. Reduced motion and no JavaScript: headline is immediately readable, without hidden text. Enabling reduced motion mid-reveal finishes it without later replay.
4. Responsive layout, square controls, marquee, carousel gestures, and previous suites still pass. Inspect desktop/mobile layout and accessibility scans.
5. Independent scoped review; fix concrete findings and re-run verification. Do not commit/push unless separately requested for this follow-up.

## Execution and rollback
Main agent implements markup/styles/controller and tests, then obtains a read-only review per the code-quality skill. Static localized changes can be reverted independently; preserve earlier committed work.

## User steering: cleaner controls and mobile alignment
- Remove the visible pause button. Keep accessible persistent pause/resume by clicking/tapping the text strip or using Space/Enter; remove that interactive behavior when reduced motion is enabled. Decorative text stays hidden from assistive technology.
- Remove the visible project counter, previous/next arrows, and gesture instruction. Retain an offscreen live status and only small selection dots below the cards; swipe/drag/keyboard still work.
- Improve 320–430px layouts: equal-width hero actions, restrained mobile headline size, reduced top spacing, slightly wider square cards with shallower rear-card offsets, and centred mobile portrait.
- Extend responsive verification to 320 and 430px, adapt gesture/control tests, inspect mobile/desktop screenshots, and run accessibility scans before reporting completion.

## Confirmed mobile reliability issue
- A real phone-sized browser run produced `tailwind is not defined`, unstyled navigation/skills, and raw icon names when third-party CSS/font requests were unavailable. The layout currently depends on a runtime CDN script.
- Replace that script/inline configuration with committed, locally compiled Tailwind 3 CSS. Keep a small source stylesheet and configuration; regeneration uses the pinned CLI only during development, not on page load. No framework migration or runtime dependencies are added.
- Replace icon-font ligatures with a local SVG sprite so icons also work when Google Fonts is unavailable. Optional display fonts retain sensible system fallbacks.
- Verify the page with all non-local network requests blocked: layout, mobile menu, icon assets, project gestures, and readable text must still work. Default HTML/CSS must work with JavaScript disabled as well.

## Additional steering: card clicks and direct contact
- Clicking the front square card on a laptop advances one project. A drag must not also trigger a second click navigation; links below the card retain their destinations. Provide an invisible, labelled full-face button for keyboard access without adding visible arrows.
- Remove the contact form, its submit handler, and obsolete success UI/styles. Replace the four equal-weight tiles with a short invitation, primary Email/WhatsApp actions, and quieter LinkedIn/GitHub links. Keep actual contact URLs unchanged.
