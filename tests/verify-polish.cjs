// Start a static server, then run: node tests/verify-polish.cjs [origin]
// Requires @playwright/test and Chrome. Also exports verifyPage for browser harnesses.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

async function settleResize(page, width, height = 1000) {
  await page.setViewportSize({ width, height });
  // Media-query styles can settle after setViewportSize resolves.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function verifyPage(page, origin = 'http://127.0.0.1:4175/') {
  const errors = [];
  const output = path.resolve(__dirname, '../.local');
  fs.mkdirSync(output, { recursive: true });
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.featured-projects')).display === 'grid');
  await page.evaluate(() => document.fonts.ready);

  // The changed hierarchy and compact hero must be visible, not merely present.
  assert.deepEqual(await page.locator('main > section').evaluateAll(sections => sections.slice(0, 3).map(section => section.id)), ['', 'projects', 'about']);
  assert.equal(await page.locator('.hero-actions a').count(), 2);
  assert.equal(await page.locator('.hero-actions .button-primary').getAttribute('href'), '#projects');
  assert.equal(await page.locator('.hero-actions .button-secondary').getAttribute('href'), '#contact');
  assert.match(await page.locator('h1').innerText(), /Software that makes\s+work easier\./);
  assert.deepEqual(await page.locator('#projects > article h3, .featured-projects h3').allTextContents(), ['BlinkBreak', 'CosmIQ Sync', 'CosmIQ KEAM Predictor']);

  const archive = page.locator('.project-archive');
  const archiveSummary = archive.locator('summary');
  const archivedProject = page.locator('#os-title');
  assert.equal(await archivedProject.isVisible(), false);
  await archiveSummary.focus();
  await page.keyboard.press('Enter');
  assert.equal(await archivedProject.isVisible(), true);
  assert.equal(await archive.locator('.archive-grid > article, .archive-grid > div').count(), 8);
  await page.keyboard.press('Enter');
  assert.equal(await archivedProject.isVisible(), false);

  // The résumé, legacy anchors, project destinations, and form survive the reordering.
  for (const id of ['about', 'projects', 'experience', 'skills', 'education', 'contact', 'journey', 'foss']) {
    assert.equal(await page.locator(`[id="${id}"]`).count(), 1, `Unique legacy anchor: ${id}`);
  }
  for (const [title, links] of Object.entries({
    'blinkbreak-title': ['https://github.com/rinshidvp/blinkbreak/releases/latest', 'https://github.com/rinshidvp/blinkbreak'],
    'sync-title': ['https://cosmiq-sync.vercel.app/', 'https://github.com/rinshidvp/cosmiq-sync'],
    'keam-title': ['https://cosmiq-keam-predictor.vercel.app/', 'https://github.com/rinshidvp/cosmiq-keam-predictor'],
  })) {
    assert.deepEqual(await page.locator(`article[aria-labelledby="${title}"] a`).evaluateAll(items => items.map(link => link.href)), links);
  }
  assert.equal(await page.locator('#about a[href="Rinshid_CV.html"]').count(), 1);
  assert.equal((await page.request.get(new URL('Rinshid_CV.html', origin).href)).status(), 200);
  assert.equal(await page.locator('#contact form, #contact-success').count(), 0);
  assert.deepEqual(await page.locator('.contact-links a').evaluateAll(links => links.map(link => link.getAttribute('href'))), [
    'mailto:muhammedrinshidvpr@gmail.com', 'https://wa.me/917594827429',
    'https://linkedin.com/in/rinshidrazaq', 'https://github.com/rinshidvp',
  ]);
  assert.equal(await page.locator('.service-link[href="#contact"]').count(), 3);
  assert.equal(await page.getByText('PROOF OF WORK', { exact: true }).count(), 0);
  assert.equal(await page.getByRole('heading', { name: 'Open on GitHub', exact: true }).count(), 0);
  assert.equal(await page.locator('#education').getByRole('heading', { name: 'Certifications', exact: true }).count(), 1);
  assert.equal(await page.locator('footer a[href="https://github.com/rinshidvp"]').count(), 1);

  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await settleResize(page, width);
    await page.evaluate(() => scrollTo(0, 0));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}px`);
    const { description, actions } = await page.evaluate(() => ({
      description: document.querySelector('.hero-description').getBoundingClientRect().toJSON(),
      actions: document.querySelector('.hero-actions').getBoundingClientRect().toJSON(),
    }));
    assert.ok(description.y + description.height <= actions.y, `Introduction precedes actions at ${width}px`);
    assert.ok(actions.y + actions.height < (width < 768 ? 650 : 800), `Hero actions are not buried at ${width}px`);
    const title = await page.locator('h1').boundingBox();
    const lineHeight = await page.locator('h1').evaluate(element => parseFloat(getComputedStyle(element).lineHeight));
    assert.ok(title.height / lineHeight <= 4.1, `Headline is at most four lines at ${width}px`);
    await page.locator('.featured-projects').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#projects > article img, .featured-projects img')].every(image => image.complete && image.naturalWidth > 0));
    if ([390, 1440].includes(width)) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `polish-${width}.png`), fullPage: true });
    }
  }

  await settleResize(page, 390, 844);
  await page.evaluate(() => scrollTo(0, 0));
  const menu = page.locator('#menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('#mobile-nav a').first().evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await menu.evaluate(element => element === document.activeElement), true);
  await menu.click();
  await page.locator('#mobile-nav a[href="#projects"]').click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(new URL(page.url()).hash, '#projects');
  await menu.click();
  await settleResize(page, 1440);
  await page.waitForFunction(() => document.querySelector('#menu-toggle').getAttribute('aria-expanded') === 'false');
  assert.equal(await page.locator('#mobile-nav').isVisible(), false);
  await settleResize(page, 390, 844);
  assert.equal(await page.locator('#mobile-nav').isVisible(), false);

  await page.goto(new URL('#journey', origin).href);
  await page.waitForFunction(() => {
    const summary = document.querySelector('#journey > summary').getBoundingClientRect();
    const header = document.querySelector('nav[aria-label="Primary navigation"]').getBoundingClientRect();
    return summary.top >= header.bottom && summary.bottom < innerHeight;
  });

  await page.locator('.project-dots button').last().focus();
  await page.keyboard.press('Tab');
  assert.equal(await archiveSummary.evaluate(element => element === document.activeElement), true);
  assert.notEqual(await archiveSummary.evaluate(element => getComputedStyle(element).outlineStyle), 'none');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.deepEqual(errors, [], 'No runtime errors');
  return 'PASS: responsive hero, selected work, loaded previews, keyboard archive, preserved links, résumé, direct contact, mobile menu, focus and reduced motion.';
}

async function sampleMarqueeMovement(page) {
  return page.locator('.identity-track').evaluate(async track => {
    function position() {
      const transform = getComputedStyle(track).transform;
      return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
    }
    const before = position();
    await new Promise(resolve => {
      let frames = 0;
      function nextFrame() {
        if (++frames >= 8) resolve();
        else requestAnimationFrame(nextFrame);
      }
      requestAnimationFrame(nextFrame);
    });
    return position() - before;
  });
}

async function verifyArtworkAndMotion(page, origin = 'http://127.0.0.1:4175/') {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(origin, { waitUntil: 'networkidle' });
  const illustration = page.locator('.project-preview-keam img');
  assert.equal(await illustration.getAttribute('src'), 'images/keam-illustration.svg');
  await illustration.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const image = document.querySelector('.project-preview-keam img');
    return image.complete && image.naturalWidth === 1200;
  });

  const strip = page.locator('.identity-strip');
  const pause = page.getByRole('button', { name: 'Pause scrolling text' });
  assert.equal(await page.locator('.identity-toggle').count(), 0, 'No separate visible pause button');
  await strip.scrollIntoViewIfNeeded();
  assert.equal(await pause.isVisible(), true);
  assert.ok(await sampleMarqueeMovement(page) < -0.5, 'Identity text visibly travels left');
  const groupWidths = await page.locator('.identity-group').evaluateAll(groups => groups.map(group => group.getBoundingClientRect().width));
  // Transformed rectangles can differ by a fraction of a device subpixel.
  assert.ok(Math.abs(groupWidths[0] - groupWidths[1]) < 0.01, 'Loop groups have equal widths');
  assert.equal(await page.locator('.identity-viewport').getAttribute('aria-hidden'), 'true');

  await pause.focus();
  await page.keyboard.press('Enter');
  assert.equal(await pause.getAttribute('aria-pressed'), 'true');
  // CSS pause can remain pending until the next animation frame commits it.
  await page.locator('.identity-track').evaluate(track => Promise.all(track.getAnimations().map(animation => animation.ready)));
  assert.ok(Math.abs(await sampleMarqueeMovement(page)) < 0.01, 'Pause actually stops the animation');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('.identity-strip').dataset.animated === 'false');
  assert.equal(await pause.isVisible(), false);
  assert.equal(await page.locator('.identity-track').evaluate(element => getComputedStyle(element).animationName), 'none');
  assert.equal(await page.locator('.identity-group').nth(1).isVisible(), false);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('.identity-strip').dataset.animated === 'true');
  assert.equal(await pause.getAttribute('aria-pressed'), 'true', 'Manual pause survives motion-preference changes');
  await page.locator('.identity-track').evaluate(track => Promise.all(track.getAnimations().map(animation => animation.ready)));
  assert.ok(Math.abs(await sampleMarqueeMovement(page)) < 0.01);
  await pause.click();
  assert.equal(await pause.getAttribute('aria-pressed'), 'false');
  assert.ok(await sampleMarqueeMovement(page) < -0.5, 'Toggle resumes movement');

  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await settleResize(page, width);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Marquee does not cause page overflow at ${width}px`);
    const stripMetrics = await page.locator('.identity-strip').evaluate(strip => ({
      groupWidth: strip.querySelector('.identity-group').getBoundingClientRect().width,
      viewportWidth: strip.querySelector('.identity-viewport').clientWidth,
      nameSize: parseFloat(getComputedStyle(strip.querySelector('.identity-name')).fontSize),
      craftSize: parseFloat(getComputedStyle(strip.querySelector('.identity-craft')).fontSize),
    }));
    assert.ok(stripMetrics.groupWidth >= stripMetrics.viewportWidth, `Loop covers the viewport at ${width}px`);
    assert.ok(stripMetrics.nameSize <= 32 && stripMetrics.nameSize >= 22, `Restrained identity text size at ${width}px`);
    assert.ok(stripMetrics.craftSize <= 12 && stripMetrics.craftSize < stripMetrics.nameSize, `Supporting text has a clear hierarchy at ${width}px`);
    const radii = await page.locator('button[type], .button-primary, .button-secondary, nav[aria-label="Primary navigation"] a[href="#contact"]').evaluateAll(buttons => buttons.map(button => {
      const style = getComputedStyle(button);
      return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomLeftRadius, style.borderBottomRightRadius];
    }));
    assert.ok(radii.every(corners => corners.every(radius => radius === '0px')), `Button corners are sharp at ${width}px`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Static identity strip fits at ${width}px`);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }

  const noScript = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  try {
    const fallback = await noScript.newPage();
    await fallback.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(await fallback.locator('.identity-window').getAttribute('role'), null);
    assert.equal(await fallback.locator('.identity-track').evaluate(element => getComputedStyle(element).animationName), 'none');
    assert.equal(await fallback.locator('.identity-group').nth(1).isVisible(), false);
    const staticGroup = fallback.locator('.identity-group').first();
    assert.match(await staticGroup.innerText(), /MUHAMMED RINSHID V P/);
    assert.ok(await staticGroup.evaluate(element => element.scrollWidth <= element.clientWidth), 'No-JS identity remains readable without clipping');
    assert.ok(await staticGroup.evaluate(element => element.getBoundingClientRect().width <= element.parentElement.clientWidth + 1), 'No-JS group fits the strip viewport');
  } finally {
    await noScript.close();
  }
  return 'PASS: KEAM illustration loads, text strip itself pauses/resumes, reduced-motion and no-JS fallbacks work, and all button corners are sharp at seven widths.';
}

module.exports = { verifyPage, verifyArtworkAndMotion };

if (require.main === module) {
  (async () => {
    const { chromium } = require('@playwright/test');
    const browser = await chromium.launch({ channel: 'chrome' });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      console.log(await verifyPage(page, process.argv[2]));
      console.log(await verifyArtworkAndMotion(page, process.argv[2]));
    } finally {
      await browser.close();
    }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
