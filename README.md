# Portfolio Site — Muhammed Rinshid V P

**Live:** https://rinshid-portfolio.vercel.app/ · Articles now live separately at https://rinshid-note.vercel.app/ ([source](https://github.com/rinshidvp/rinshid-note))

A static, single-page portfolio built with HTML + Tailwind CSS (via CDN). No build step required.

## Structure

```
index.html      - all page content (Hero, About, Projects, Experience, Skills, Education & Certifications, Contact)
Rinshid_CV.html - the CV, linked from the "Download CV" button in About
css/style.css   - custom styles beyond Tailwind utility classes
js/main.js      - mobile menu toggle + contact form handler
images/         - placeholder SVGs (hero, portrait, 6 project cards)
```

Content (name, bio, experience, all 6 projects, skills, education, certifications, contact details) has already been filled in from the CV. What's left is below.

## Remaining TODOs

- [ ] **Photos** - `images/hero.svg` and `images/portrait.svg` are still gradient placeholders. Swap in a real photo/screenshot and update the `src` in `index.html` (or keep the filenames and just replace the files if you convert to `.jpg`/`.png`). Once a real photo exists, also add an `og:image` meta tag in `index.html` `<head>` (a PNG/JPG — most social crawlers don't render SVG for link previews).
- [ ] **Project links** - two project cards currently show a muted "COMING SOON" label instead of a link, because the CV didn't have a live URL for them yet:
  - **AI Content Factory** (Demo)
  - **Pragathi KEAM Portal** (Live — the GitHub link is already real)

  Once each is deployed/public, swap the `<span>...COMING SOON</span>` back to an `<a href="...">` in the Projects section of `index.html`.
- [ ] **Domain-dependent SEO** - once this site has a fixed production domain, add: `<link rel="canonical">` in `index.html` `<head>`, a `sitemap.xml`, and a `Sitemap:` line in `robots.txt`.
- [ ] **CV updates** - if you update `Rinshid_CV.html` later, keep the About/Experience/Projects sections in `index.html` in sync manually (they're not generated from the CV file).

## Contact form

The form in `#contact` builds a `mailto:` link from the name/email/message fields and opens the visitor's default email client with the message prefilled (see `js/main.js`) — no backend service required. If you'd rather collect submissions server-side instead, swap this out for a service like [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com): set the form's `action`/`method` to their endpoint and replace the `mailto:` logic in `js/main.js`'s submit handler.

## Deploying

No build step needed — this is a static site. Options:

- **Netlify / Vercel**: drag-and-drop the project folder onto their dashboard, or connect the git repo.
- **GitHub Pages**: push this folder to a repo and enable Pages on the `main` branch.
