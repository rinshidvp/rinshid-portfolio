// Start the static server, then run: node tests/verify-editorial.cjs [origin]
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const origin = process.argv[2] || 'http://127.0.0.1:4175/';

async function recordEntrance(page) {
  await page.addInitScript(() => {
    window.heroEntranceEvents = [];
    document.addEventListener('animationstart', event => {
      if (event.animationName === 'hero-title-enter') {
        heroEntranceEvents.push({ text: event.target.textContent, delay: getComputedStyle(event.target).animationDelay });
      }
    });
  });
}

async function assertReadableHeadline(page) {
  assert.equal((await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim(), 'Software that makes work easier.');
  const lines = await page.locator('.hero-title-line').evaluateAll(elements => elements.map(element => ({
    opacity: getComputedStyle(element).opacity,
    transform: getComputedStyle(element).transform,
  })));
  assert.equal(lines.length, 2);
  assert.ok(lines.every(line => line.opacity === '1' && line.transform === 'none'));
}

async function verify() {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const normal = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const page = await normal.newPage();
    await recordEntrance(page);
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => heroEntranceEvents.length === 2 && !document.querySelector('.hero').hasAttribute('data-intro-ready'));
    const entrances = await page.evaluate(() => heroEntranceEvents);
    assert.deepEqual(entrances.map(event => event.text), ['Software that makes', 'work easier.']);
    assert.ok(parseFloat(entrances[1].delay) > parseFloat(entrances[0].delay), 'Second phrase is gently staggered');
    await assertReadableHeadline(page);

    assert.deepEqual(await page.locator('.section-index').allTextContents(), ['01', '02', '03', '04', '05', '06']);
    assert.deepEqual(await page.locator('.section-index').evaluateAll(numbers => numbers.map(number => number.closest('section').id)), ['projects', 'about', 'experience', 'skills', 'education', 'contact']);
    assert.ok(await page.locator('.section-index').evaluateAll(numbers => numbers.every(number => number.getAttribute('aria-hidden') === 'true')));

    await page.goto(new URL('#projects', origin).href);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => heroEntranceEvents.length), 2, 'Scrolling, resizing and preference toggling do not replay the intro');
    await assertReadableHeadline(page);

    const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const reducedPage = await reduced.newPage();
    await recordEntrance(reducedPage);
    await reducedPage.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(await reducedPage.evaluate(() => heroEntranceEvents.length), 0);
    await assertReadableHeadline(reducedPage);

    const interrupted = await normal.newPage();
    await recordEntrance(interrupted);
    await interrupted.goto(origin, { waitUntil: 'domcontentloaded' });
    await interrupted.waitForFunction(() => heroEntranceEvents.length > 0);
    await interrupted.emulateMedia({ reducedMotion: 'reduce' });
    await interrupted.waitForFunction(() => !document.querySelector('.hero').hasAttribute('data-intro-ready'));
    await assertReadableHeadline(interrupted);
    const count = await interrupted.evaluate(() => heroEntranceEvents.length);
    await interrupted.emulateMedia({ reducedMotion: 'no-preference' });
    await interrupted.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await interrupted.evaluate(() => heroEntranceEvents.length), count, 'Cancelled entrance is not replayed');
    await assertReadableHeadline(interrupted);

    const noScript = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const fallback = await noScript.newPage();
    await fallback.goto(origin, { waitUntil: 'networkidle' });
    await assertReadableHeadline(fallback);
    assert.equal(await fallback.locator('.section-index').count(), 6);

    console.log('PASS: one-time staggered headline entrance, no replay, six ordered editorial labels, live reduced-motion cancellation, and readable reduced-motion/no-JS fallbacks.');
  } finally { await browser.close(); }
}

verify().catch(error => { console.error(error); process.exitCode = 1; });
