// Verify the phone layout without any external CDN/font requests.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('@playwright/test');
const origin = process.argv[2] || 'http://127.0.0.1:4175/';
const output = path.resolve(__dirname, '../.local');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(origin).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('script[src*="cdn.tailwindcss.com"]').count(), 0);
    assert.equal(await page.locator('.material-symbols-outlined').count(), 0);
    const sprite = await page.request.get(new URL('images/icons.svg', origin).href);
    const spriteText = await sprite.text();
    const symbols = new Set([...spriteText.matchAll(/<symbol id="([^"]+)"/g)].map(match => match[1]));
    const referenced = await page.locator('svg.icon use').evaluateAll(uses => uses.map(use => use.getAttribute('href').split('#')[1]));
    assert.ok(referenced.length > 20 && referenced.every(id => symbols.has(id)), 'All local icons reference real symbols');

    for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(() => scrollTo(0, 0));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow without external assets at ${width}px`);
      assert.equal(await page.locator('#skills > .grid').evaluate(element => getComputedStyle(element).display), 'grid');
      if (width < 640) {
        assert.ok(await page.evaluate(() => {
          const nav = document.querySelector('nav').getBoundingClientRect();
          const hero = document.querySelector('.hero-copy').getBoundingClientRect();
          return hero.top >= nav.bottom - 4;
        }), 'Hero content clears the fixed header');
        assert.equal(await page.locator('#menu-toggle').isVisible(), true);
        const actions = await page.locator('.hero-actions a').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON()));
        assert.ok(Math.abs(actions[0].width - actions[1].width) < 1);
        assert.equal(actions[0].y, actions[1].y);
      }
      if (width === 390) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(output, 'mobile-final-hero.png') });
        for (const [selector, name] of [['.project-carousel', 'projects'], ['#skills', 'skills'], ['#contact', 'contact']]) {
          await page.locator(selector).screenshot({ path: path.join(output, `mobile-final-${name}.png`), style: 'nav[aria-label="Primary navigation"] { visibility: hidden; }' });
        }
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('#menu-toggle').tap();
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#menu-toggle use').getAttribute('href'), 'images/icons.svg#close');
    await page.locator('#mobile-nav a[href="#contact"]').tap();
    assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(new URL(page.url()).hash, '#contact');
    assert.equal(await page.locator('#contact form').count(), 0);
    assert.deepEqual(errors, []);

    const fallbackContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await fallbackContext.route('**/*', route => new URL(route.request().url()).origin === new URL(origin).origin ? route.continue() : route.abort());
    const fallback = await fallbackContext.newPage();
    await fallback.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(await fallback.locator('#skills > .grid').evaluate(element => getComputedStyle(element).display), 'grid');
    assert.equal(await fallback.locator('.site-links').first().isVisible(), false);
    assert.ok(await fallback.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    console.log('PASS: responsive layout and local icons with every external request blocked, native phone menu, direct contact, and fully styled no-JS fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
