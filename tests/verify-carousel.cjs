// Start the static server, then run: node tests/verify-carousel.cjs [origin]
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('@playwright/test');

const origin = process.argv[2] || 'http://127.0.0.1:4175/';
const output = path.resolve(__dirname, '../.local');
fs.mkdirSync(output, { recursive: true });

async function expectActive(page, name) {
  await page.waitForFunction(expected => document.querySelector('.project-slide[data-position="active"] h3')?.textContent.trim() === expected, name);
  const active = page.locator('.project-slide[data-position="active"]');
  assert.equal(await active.count(), 1);
  assert.equal(await active.locator('h3').innerText(), name);
  assert.equal(await active.evaluate(slide => slide.inert), false);
  assert.equal(await page.locator('.project-slide[aria-hidden="true"]').count(), 2);
  assert.equal(await page.locator('.project-slide').evaluateAll(slides => slides.filter(slide => slide.inert).length), 2);
  assert.equal(await page.locator('.project-dots [aria-pressed="true"]').count(), 1);
  assert.ok((await page.locator('.project-status').innerText()).includes(name));
}

async function dragCard(page, deltaX, deltaY = 0) {
  const face = page.locator('.project-slide[data-position="active"] .project-face');
  await face.scrollIntoViewIfNeeded();
  const box = await face.boundingBox();
  const x = box.x + box.width * 0.65;
  const y = box.y + box.height * 0.35;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + deltaX, y + deltaY, { steps: 8 });
  await page.mouse.up();
}

async function verify() {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('.project-carousel').dataset.ready === 'true');
    await page.evaluate(() => document.fonts.ready);
    const carousel = page.getByRole('region', { name: 'Featured projects' });
    const next = page.getByRole('button', { name: 'Next project' });
    const previous = page.getByRole('button', { name: 'Previous project' });

    await expectActive(page, 'BlinkBreak');
    await next.click();
    await expectActive(page, 'CosmIQ Sync');
    await previous.click();
    await expectActive(page, 'BlinkBreak');
    await previous.click();
    await expectActive(page, 'CosmIQ KEAM Predictor');
    await next.click();
    await expectActive(page, 'BlinkBreak');
    await page.getByRole('button', { name: 'Show CosmIQ KEAM Predictor' }).click();
    await expectActive(page, 'CosmIQ KEAM Predictor');

    await carousel.focus();
    await page.keyboard.press('Home');
    await expectActive(page, 'BlinkBreak');
    await page.keyboard.press('ArrowRight');
    await expectActive(page, 'CosmIQ Sync');
    await page.keyboard.press('End');
    await expectActive(page, 'CosmIQ KEAM Predictor');
    await page.keyboard.press('ArrowLeft');
    await expectActive(page, 'CosmIQ Sync');

    await dragCard(page, -200);
    await expectActive(page, 'CosmIQ KEAM Predictor');
    await dragCard(page, 200);
    await expectActive(page, 'CosmIQ Sync');
    await dragCard(page, 18);
    await expectActive(page, 'CosmIQ Sync');
    await dragCard(page, 12, 100);
    await expectActive(page, 'CosmIQ Sync');

    const face = page.locator('.project-slide[data-position="active"] .project-face');
    await face.scrollIntoViewIfNeeded();
    const bounds = await face.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 80);
    await page.mouse.down();
    await page.mouse.move(bounds.x + 80, bounds.y + 80, { steps: 5 });
    assert.equal(await page.locator('.project-stage').getAttribute('data-dragging'), 'true');
    await page.locator('.project-stage').dispatchEvent('pointercancel');
    await page.mouse.up();
    await expectActive(page, 'CosmIQ Sync');
    assert.equal(await page.locator('.project-stage').getAttribute('data-dragging'), 'false');

    // Clicking a real project destination must not be mistaken for a swipe.
    const source = page.locator('.project-slide[data-position="active"] a').last();
    await context.route('https://github.com/rinshidvp/cosmiq-sync', route => route.fulfill({ body: 'Project destination verified', contentType: 'text/plain' }));
    const popupPromise = page.waitForEvent('popup');
    await source.click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    assert.equal(popup.url(), 'https://github.com/rinshidvp/cosmiq-sync');
    await popup.close();
    await expectActive(page, 'CosmIQ Sync');

    await page.goto(new URL('#foss', origin).href);
    await expectActive(page, 'BlinkBreak');
    await page.goto(new URL('#keam-title', origin).href);
    await expectActive(page, 'CosmIQ KEAM Predictor');

    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      for (const dot of await page.locator('[data-project-to]').all()) {
        await dot.click();
        const geometry = await page.locator('.project-slide[data-position="active"] .project-face').evaluate(element => ({ width: element.offsetWidth, height: element.offsetHeight }));
        assert.ok(Math.abs(geometry.width - geometry.height) <= 1, `Square card at ${width}px`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No deck overflow at ${width}px`);
      }
      assert.ok(await page.locator('button, a, input, textarea, summary').evaluateAll(elements => elements.every(element => {
        const style = getComputedStyle(element);
        return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomLeftRadius, style.borderBottomRightRadius].every(radius => radius === '0px');
      })), `All interactive corners are sharp at ${width}px`);
      const skillCard = page.locator('#skills .hover-lift').first();
      assert.notEqual(await skillCard.evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)');
      assert.equal(await skillCard.locator('span[aria-hidden="true"]').first().isVisible(), true, 'Numbered skills cards are restored');
      if ([390, 1440].includes(width)) {
        await carousel.screenshot({ path: path.join(output, `project-stack-${width}.png`) });
      }
    }

    assert.equal(await page.locator('.project-stage').evaluate(element => getComputedStyle(element).touchAction), 'pan-y');
    assert.ok(await face.evaluate(element => parseFloat(getComputedStyle(element).transitionDuration) < 0.001), 'Reduced motion disables card transitions');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    assert.ok(await face.evaluate(element => parseFloat(getComputedStyle(element).transitionDuration) >= 0.4), 'Normal motion has a deliberate transition');
    await page.getByRole('button', { name: 'Show BlinkBreak' }).click();
    assert.ok(await page.locator('.project-face').evaluateAll(faces => faces.some(element => element.getAnimations().some(animation => animation.playState === 'running'))), 'Changing slides actually animates');
    assert.deepEqual(errors, []);

    const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    try {
      const fallback = await noScript.newPage();
      await fallback.goto(origin, { waitUntil: 'networkidle' });
      assert.equal(await fallback.locator('.project-navigation').isVisible(), false);
      assert.equal(await fallback.locator('.project-slide').count(), 3);
      for (const article of await fallback.locator('.project-slide').all()) {
        assert.equal(await article.locator('.project-info').isVisible(), true);
        assert.equal(await article.evaluate(element => element.inert), false);
      }
    } finally { await noScript.close(); }

    const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    try {
      const touchPage = await touchContext.newPage();
      await touchPage.goto(origin, { waitUntil: 'networkidle' });
      const touchFace = touchPage.locator('.project-slide[data-position="active"] .project-face');
      await touchFace.scrollIntoViewIfNeeded();
      const client = await touchContext.newCDPSession(touchPage);
      async function touchSwipe(deltaX, deltaY) {
        const box = await touchFace.boundingBox();
        const x = box.x + box.width * 0.7;
        const y = box.y + box.height * 0.5;
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let step = 1; step <= 8; step++) {
          await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + deltaX * step / 8, y: y + deltaY * step / 8 }] });
        }
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      await touchSwipe(-150, 0);
      await expectActive(touchPage, 'CosmIQ Sync');
      await touchFace.scrollIntoViewIfNeeded();
      const beforeScroll = await touchPage.evaluate(() => scrollY);
      await touchSwipe(0, -120);
      await expectActive(touchPage, 'CosmIQ Sync');
      assert.ok(await touchPage.evaluate(() => scrollY) > beforeScroll, 'Vertical touch gestures keep native page scrolling');
    } finally { await touchContext.close(); }

    console.log('PASS: square deck, wraparound buttons/dots/keyboard, mouse drag and real touch swipe, native vertical scrolling, short/cancelled gestures, real links, deep links, reduced motion, no-JS fallback, restored skills cards and sharp controls at five widths.');
  } finally { await browser.close(); }
}

verify().catch(error => { console.error(error); process.exitCode = 1; });
