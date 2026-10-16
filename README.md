# Portfolio Site — Muhammed Rinshid V P

**Live:** https://rinshid-portfolio.vercel.app/ · Articles now live separately at https://rinshid-note.vercel.app/ ([source](https://github.com/rinshidvp/rinshid-note))

A static, single-page portfolio built with HTML + Tailwind CSS (via CDN). No build step required.

## Structure

```
index.html      - all page content (Hero, Selected Work, About, Experience, Skills, Education & Certifications, Contact)
Rinshid_CV.html - the CV, linked from the "View My CV" button in About
css/style.css   - custom styles beyond Tailwind utility classes
js/main.js      - mobile menu, identity motion, and contact form
js/project-carousel.js - swipeable featured-project deck
images/         - photographs, product screenshots, and legacy project graphics
tests/verify-polish.cjs - responsive layout and interaction checks
tests/verify-carousel.cjs - square cards, gestures, controls, and skills checks
```

The homepage features BlinkBreak, CosmIQ Sync, and CosmIQ KEAM Predictor in a swipeable square-card stack. Drag/swipe left or right, use the arrow buttons or project dots, or focus the gallery and use Arrow keys/Home/End. The selected card comes forward while the others move behind it; its full description and links remain below the square. There is no autoplay. Without JavaScript, all three projects remain readable in a list.

Eight additional projects are available in the native “Explore more projects” disclosure; the detailed journey is also expandable.

There is no separate “Proof of Work” repository strip; source links remain with their projects and in the contact/footer profiles.

## Remaining TODOs

- [ ] **Project links** - AI Content Factory still displays “DEMO — COMING SOON”. Replace the label with a real demo link when it is available.
- [ ] **Domain-dependent SEO** - once this site has a fixed production domain, add: `<link rel="canonical">` in `index.html` `<head>`, a `sitemap.xml`, and a `Sitemap:` line in `robots.txt`.
- [ ] **CV updates** - if you update `Rinshid_CV.html` later, keep the About/Experience/Projects sections in `index.html` in sync manually (they're not generated from the CV file).

## Contact form

The form in `#contact` builds a `mailto:` link from the name/email/message fields and opens the visitor's default email client with the message prefilled (see `js/main.js`) — no backend service required. If you'd rather collect submissions server-side instead, swap this out for a service like [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com): set the form's `action`/`method` to their endpoint and replace the `mailto:` logic in `js/main.js`'s submit handler.

## Deploying

No build step needed — this is a static site. Options:

- **Netlify / Vercel**: drag-and-drop the project folder onto their dashboard, or connect the git repo.
- **GitHub Pages**: push this folder to a repo and enable Pages on the `main` branch.

## Preview images

The featured previews combine authentic interface captures with clearly labelled project artwork:
- `preview-blinkbreak.jpg`: exported from the BlinkBreak repository’s `docs/screenshots/app-light.png`.
- `preview-sync.jpg`: public CosmIQ Sync landing page, captured on 15 October 2026 without creating a session.
- `keam-illustration.svg`: original campus-and-wayfinding artwork created for this portfolio. It is a project illustration, not a product screenshot or an admissions prediction; it replaces the earlier screenshot preview.

The identity strip uses compact 22–32px name typography, smaller supporting text, a subtle frame, edge fades, and a keyboard-operable “Pause motion” toggle. Each repeated group covers the viewport for a seamless loop. It stays static without JavaScript or with reduced motion enabled, with no faded/clipped text in that fallback. All interactive controls use sharp, zero-radius corners. The boxed, numbered skills grid is retained, also with square outer corners; photographs keep their existing shapes.

## Local verification

The site itself has no build step. Browser checks require Node.js, Chrome, and `@playwright/test` (install locally with `npm install --no-save @playwright/test` if needed).

Start `python -m http.server 4175 --bind 127.0.0.1` from the repository, then run `node tests/verify-polish.cjs` in another terminal. The check covers 360–1440px layouts, hero hierarchy, previews, the keyboard-operable project archive, preserved links, mobile navigation, focus, marquee movement/pause/resume, reduced-motion and no-JavaScript fallbacks, and sharp button corners. Screenshots are saved under `.local/`.

Run `node tests/verify-carousel.cjs` for the square-card stack, wraparound controls, keyboard navigation, mouse/touch gestures, cancellation, real destination links, deep links, restored skills boxes, reduced-motion behavior, and the no-JavaScript fallback.

Fonts and Tailwind still load from their existing CDNs, so accurate visual verification needs network access.
