# Portfolio Site — Muhammed Rinshid V P

**Live:** https://rinshid-portfolio.vercel.app/ · Articles now live separately at https://rinshid-note.vercel.app/ ([source](https://github.com/rinshidvp/rinshid-note))

A static, single-page portfolio built with HTML + locally compiled Tailwind CSS. No runtime CDN required.

## Structure

```
index.html      - all page content (Hero, Selected Work, About, Experience, Skills, Education & Certifications, Contact)
Rinshid_CV.html - the CV, linked from the "View My CV" button in About
css/style.css   - custom styles beyond Tailwind utility classes
css/tailwind.css / tailwind.config.cjs / css/utilities.css - local Tailwind source, config, and committed compiled utilities
js/main.js      - mobile menu and clickable identity strip
js/project-carousel.js - swipeable featured-project deck
images/icons.svg - local decorative icon sprite (no icon-font dependency)
images/         - photographs, product screenshots, and legacy project graphics
tests/verify-polish.cjs - responsive layout and interaction checks
tests/verify-carousel.cjs - square cards, gestures, controls, and skills checks
tests/verify-editorial.cjs - one-time headline reveal and numbered section labels
tests/verify-mobile.cjs - phone layout with every external request blocked
```

The homepage features BlinkBreak, CosmIQ Sync, and CosmIQ KEAM Predictor in a swipeable square-card stack. Drag/swipe left or right, click/tap the front card, use the small dots below, or focus the gallery and use Arrow keys/Home/End. The selected card comes forward while the others move behind it; its full description and links remain below the square. Dragging never triggers an extra click. There is no autoplay. Without JavaScript, all three projects remain readable in a list.

Eight additional projects are available in the native “Explore more projects” disclosure; the detailed journey is also expandable.

There is no separate “Proof of Work” repository strip; source links remain with their projects and in the contact/footer profiles.

## Remaining TODOs

- [ ] **Project links** - AI Content Factory still displays “DEMO — COMING SOON”. Replace the label with a real demo link when it is available.
- [ ] **Domain-dependent SEO** - once this site has a fixed production domain, add: `<link rel="canonical">` in `index.html` `<head>`, a `sitemap.xml`, and a `Sitemap:` line in `robots.txt`.
- [ ] **CV updates** - if you update `Rinshid_CV.html` later, keep the About/Experience/Projects sections in `index.html` in sync manually (they're not generated from the CV file).

## Contact

There is no contact form. The section is a short invitation with primary Email and WhatsApp actions, plus quieter LinkedIn/GitHub links. All contact URLs are unchanged.

## Deploying

The compiled `css/utilities.css` is committed, so deployment serves local files only. If you change Tailwind classes, rebuild it with the pinned CLI:

```
node ..\cosmiq-sync\node_modules\tailwindcss\lib\cli.js -c tailwind.config.cjs -i css/tailwind.css -o css/utilities.css --minify
```

Options:

- **Netlify / Vercel**: drag-and-drop the project folder onto their dashboard, or connect the git repo.
- **GitHub Pages**: push this folder to a repo and enable Pages on the `main` branch.

## Preview images

The featured previews combine authentic interface captures with clearly labelled project artwork:
- `preview-blinkbreak.jpg`: exported from the BlinkBreak repository’s `docs/screenshots/app-light.png`.
- `preview-sync.jpg`: public CosmIQ Sync landing page, captured on 15 October 2026 without creating a session.
- `keam-illustration.svg`: original campus-and-wayfinding artwork created for this portfolio. It is a project illustration, not a product screenshot or an admissions prediction; it replaces the earlier screenshot preview.

The identity strip uses compact 22–32px name typography, smaller supporting text, a subtle frame, and edge fades. Click/tap the strip, or press Space/Enter on it, to pause or resume; there is no separate pause button. Each repeated group covers the viewport for a seamless loop. It stays static without JavaScript or with reduced motion enabled, with no faded/clipped text in that fallback. All interactive controls use sharp, zero-radius corners. The boxed, numbered skills grid is retained, also with square outer corners; photographs keep their existing shapes.

The hero headline has a subtle, one-time staggered entrance. It is immediately visible without JavaScript or with reduced motion; changing that preference during the entrance finishes it without replaying. Six numbered editorial labels organize the main sections, with decorative numbers hidden from assistive technology.

## Local verification

The site itself serves committed CSS/JS with no runtime build. Browser checks require Node.js, Chrome, and `@playwright/test` (install locally with `npm install --no-save @playwright/test` if needed).

Start `python -m http.server 4175 --bind 127.0.0.1` from the repository, then run `node tests/verify-polish.cjs` in another terminal. The check covers 320–1440px layouts, hero hierarchy, previews, the keyboard-operable project archive, preserved links, mobile navigation, focus, strip click/pause/resume, reduced-motion and no-JavaScript fallbacks, and sharp button corners. Screenshots are saved under `.local/`.

Run `node tests/verify-carousel.cjs` for the square-card stack, wraparound controls, keyboard navigation, mouse/touch gestures, cancellation, real destination links, deep links, restored skills boxes, reduced-motion behavior, and the no-JavaScript fallback.

Run `node tests/verify-editorial.cjs` to verify the single-run headline entrance, section numbering, preference changes, and text visibility with reduced motion or JavaScript disabled.

Run `node tests/verify-mobile.cjs` for the phone layout with every external request blocked, local icon verification, and the styled no-JS fallback.

Display fonts still load from Google Fonts when available, with system fallbacks otherwise.
