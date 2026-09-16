#!/usr/bin/env node
'use strict';

// Run with Node and Playwright installed locally or in the supplied NVM runtime.
// NAV_TEST_URL overrides the local index.html; NAV_BASELINE enables preservation checks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  ({ chromium } = require('/home/https/.config/nvm/versions/node/v24.14.0/lib/node_modules/playwright'));
}

const target = new URL(process.env.NAV_TEST_URL || pathToFileURL(path.join(__dirname, '..', 'index.html')));
target.hash = '';
const baseline = process.env.NAV_BASELINE && path.resolve(process.env.NAV_BASELINE);
const browserErrors = [];
const sourceByPage = new WeakMap();
let browser;
let currentPage;
let completed = 0;

async function openPage(width = 1280, height = 800, hash = '', url = target.href, trackErrors = true, reducedMotion = 'reduce') {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
  // Compare deterministic local rendering, without depending on third-party font services.
  await context.route('**/*', route => {
    const requestURL = new URL(route.request().url());
    const isExternal = /^https?:$/.test(requestURL.protocol) && requestURL.origin !== new URL(url).origin;
    return isExternal ? route.abort() : route.continue();
  });
  const page = await context.newPage();
  currentPage = page;
  page.setDefaultTimeout(10000);
  if (trackErrors) page.on('pageerror', error => browserErrors.push(error.message));
  const response = await page.goto(url + hash, { waitUntil: 'load' });
  assert(response, 'The document must load');
  assert(response.ok(), `Document request failed: ${response.status()}`);
  sourceByPage.set(page, await response.text());
  await page.waitForFunction(() => document.querySelectorAll('#catGrid .card').length === 47);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function visibleCount(page, selector, expected) {
  await page.waitForFunction(({ selector, expected }) =>
    [...document.querySelectorAll(selector)].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').length === expected,
  { selector, expected });
  assert.equal(await page.locator(selector + ':visible').count(), expected, `${selector}: visible count`);
}

async function hashIs(page, hash) {
  await page.waitForFunction(expected => location.hash === expected, hash);
  assert.equal(new URL(page.url()).hash, hash);
}

async function catalog(page, count = 47) {
  await visibleCount(page, '#cat', 1);
  await visibleCount(page, '.lab-section', 0);
  await visibleCount(page, '.lab-group', 0);
  await visibleCount(page, '#catGrid .card', count);
}

async function focused(page, slug) {
  await hashIs(page, '#style=' + slug);
  await visibleCount(page, '.lab-section', 1);
  await visibleCount(page, '#cat', 0);
  const detail = await page.locator('#' + slug).evaluate(section => {
    const demo = section.querySelector('.frame');
    const head = section.querySelector('.lab-head');
    const demoRect = demo.getBoundingClientRect();
    const headRect = head.getBoundingClientRect();
    return {
      name: section.dataset.name,
      demoFirst: Boolean(demo.compareDocumentPosition(head) & Node.DOCUMENT_POSITION_FOLLOWING),
      demoBottom: demoRect.bottom,
      headTop: headRect.top,
      demoWidth: demoRect.width,
    };
  });
  assert(detail.demoFirst, `${slug}: demo must precede its documentation in DOM order`);
  assert(detail.demoWidth > 0 && detail.demoBottom <= detail.headTop + 1, `${slug}: demo must be visually above its documentation`);
  assert((await page.title()).includes(detail.name), `${slug}: document title must identify the style`);
  for (const id of ['viewBack', 'viewPrev', 'viewNext', 'viewPosition']) {
    assert(await page.locator('#' + id).isVisible(), `${id} must be visible in detail view`);
  }
}

async function run(name, action) {
  await action();
  completed += 1;
  console.log(`PASS ${name}`);
}

async function continuous(page, slug) {
  await hashIs(page, '#' + slug);
  await visibleCount(page, '.lab-section', 47);
  await visibleCount(page, '#cat', 1);
  await visibleCount(page, '#viewBack', 0);
  await page.waitForFunction(id => {
    const rect = document.getElementById(id).getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0 && window.scrollY > 0;
  }, slug);
  assert(await page.locator('#' + slug).evaluate(section => {
    const head = section.querySelector('.lab-head');
    const demo = section.querySelector('.frame');
    return Boolean(head.compareDocumentPosition(demo) & Node.DOCUMENT_POSITION_FOLLOWING);
  }), 'Continuous document keeps the original head-before-demo order');
}

async function mobileSnapshot(page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await settle(page);
  return page.evaluate(() => {
    const properties = ['display', 'position', 'flexDirection', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginBottom', 'gap', 'fontSize', 'lineHeight', 'borderRadius', 'maxWidth'];
    const box = el => {
      const rect = el.getBoundingClientRect();
      const css = getComputedStyle(el);
      return {
        x: Math.round(rect.x * 100) / 100,
        y: Math.round((rect.y + scrollY) * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
        css: Object.fromEntries(properties.map(key => [key, css[key]])),
      };
    };
    return [...document.querySelectorAll('.lab-section')].map(section => ({
      slug: section.dataset.slug,
      order: [...section.children].map(el => el.className),
      section: box(section),
      head: box(section.querySelector('.lab-head')),
      demo: box(section.querySelector('.frame')),
    }));
  });
}

(async () => {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  console.log(`Navigation target: ${target.href}`);

  await run('desktop catalog, accent-insensitive combined filters, reset and filtered detail boundaries', async () => {
    const page = await openPage();
    const originalTitle = await page.title();
    assert.equal(await page.locator('.lab-section').count(), 47);
    assert.equal(await page.locator('.lab-section .frame').count(), 47);
    await catalog(page);
    assert(await page.locator('#catGrid .card').evaluateAll(cards => cards.every(card =>
      card.tagName === 'A' && /^#style=.+/.test(card.getAttribute('href')))), 'Desktop cards must be real links');

    await page.locator('#q').fill('SUICO');
    await visibleCount(page, '#catGrid .card', 1);
    assert.equal(await page.locator('#catGrid .card:visible').getAttribute('href'), '#style=estilo-suico');
    await page.locator('.chip[data-value="A"]').click();
    await visibleCount(page, '#catGrid .card', 1);
    await page.locator('.chip[data-value="B"]').click();
    await visibleCount(page, '#catGrid .card', 0);
    assert(await page.locator('.cat__empty').isVisible(), 'No matches should show the empty state');
    await page.locator('#clearFilters').click();
    await catalog(page);
    assert.equal(await page.locator('#q').inputValue(), '');
    assert.equal(await page.locator('.chip.is-on').getAttribute('data-value'), 'all');

    await page.locator('.chip[data-value="A"]').click();
    await page.locator('#q').fill('  GrID  ');
    await visibleCount(page, '#catGrid .card', 2);
    assert.deepEqual(await page.locator('#catGrid .card:visible').evaluateAll(cards => cards.map(card => card.getAttribute('href'))),
      ['#style=minimalismo', '#style=estilo-suico']);
    await page.locator('.card[href="#style=minimalismo"]').click();
    await focused(page, 'minimalismo');
    assert(await page.locator('#viewPrev').isDisabled(), 'Previous is disabled at the first matching result');
    assert(!(await page.locator('#viewNext').isDisabled()));
    assert.match(await page.locator('#viewPosition').innerText(), /1\s*(?:\/|de)\s*2/);
    await page.locator('#viewNext').click();
    await focused(page, 'estilo-suico');
    assert(await page.locator('#viewNext').isDisabled(), 'Next is disabled at the last matching result');
    assert.match(await page.locator('#viewPosition').innerText(), /2\s*(?:\/|de)\s*2/);
    await page.locator('#viewPrev').click();
    await focused(page, 'minimalismo');
    await page.locator('#viewBack').click();
    await catalog(page, 2);
    assert.equal(await page.title(), originalTitle, 'Catalog restores its document title');
    assert.equal(await page.locator('#q').inputValue(), '  GrID  ');
    await page.context().close();
  });

  await run('browser Back/Forward preserve search, group, catalog scroll and originating card focus', async () => {
    const page = await openPage(1280, 460);
    await page.locator('.chip[data-value="F"]').click();
    await page.locator('#q').fill('a');
    const card = page.locator('#catGrid .card:visible').last();
    const href = await card.getAttribute('href');
    const slug = href.slice('#style='.length);
    const expectedCount = await page.locator('#catGrid .card:visible').count();
    await card.scrollIntoViewIfNeeded();
    await card.focus();
    const scroll = await page.evaluate(() => window.scrollY);
    assert(scroll > 0, 'The test must exercise a scrolled catalog');
    await card.click();
    await focused(page, slug);
    await page.goBack();
    await catalog(page, expectedCount);
    await page.waitForFunction(({ href, scroll }) =>
      document.activeElement?.getAttribute('href') === href && Math.abs(scrollY - scroll) <= 2, { href, scroll });
    assert.equal(await page.locator('#q').inputValue(), 'a');
    assert.equal(await page.locator('.chip.is-on').getAttribute('data-value'), 'F');
    await page.goForward();
    await focused(page, slug);
    await page.goBack();
    await catalog(page, expectedCount);
    await page.waitForFunction(({ href, scroll }) =>
      document.activeElement?.getAttribute('href') === href && Math.abs(scrollY - scroll) <= 2, { href, scroll });
    await page.context().close();
  });

  await run('keyboard search and Escape, detail filters keep focus, and demo anchors preserve the focused route', async () => {
    const page = await openPage(1280, 800, '#style=minimalismo');
    await focused(page, 'minimalismo');
    const detailURL = page.url();
    const historyLength = await page.evaluate(() => history.length);
    await page.locator('#minimalismo .frame__body a[href="#minimalismo"]').first().click();
    await settle(page);
    assert.equal(page.url(), detailURL, 'A demo anchor must not leave the focused route');
    assert.equal(await page.evaluate(() => history.length), historyLength, 'Demo anchors must not add history entries');
    await focused(page, 'minimalismo');

    await page.keyboard.press('/');
    assert(await page.locator('#q').evaluate(input => document.activeElement === input), 'Slash focuses search');
    await page.keyboard.type('suico');
    await catalog(page, 1);
    assert.equal(await page.locator('#catGrid .card:visible').getAttribute('href'), '#style=estilo-suico');
    assert(await page.locator('#q').evaluate(input => document.activeElement === input), 'Typing from detail keeps focus in search after returning to catalog');
    await page.keyboard.press('Escape');
    await catalog(page);
    assert.equal(await page.locator('#q').inputValue(), '');
    assert(await page.locator('#q').evaluate(input => document.activeElement === input), 'Desktop Escape clears search without losing keyboard focus');

    await page.locator('.card[href="#style=minimalismo"]').focus();
    await page.keyboard.press('Enter');
    await focused(page, 'minimalismo');
    const chip = page.locator('.chip[data-value="B"]');
    await chip.focus();
    await page.keyboard.press('Enter');
    await catalog(page, 6);
    assert.equal(await chip.getAttribute('aria-pressed'), 'true');
    assert(await chip.evaluate(button => document.activeElement === button), 'Changing a detail filter keeps keyboard focus on its chip');
    assert(await page.locator('#catGrid .card:visible .card__g').evaluateAll(labels => labels.every(label => label.textContent === 'B')));
    await page.context().close();
  });

  await run('palette hex and CSS recipe copy the exact content and preserve the detail route', async () => {
    const page = await openPage(1280, 800, '#style=minimalismo');
    await focused(page, 'minimalismo');
    const useBrowserClipboard = /^https?:$/.test(target.protocol) && await page.evaluate(() => isSecureContext && Boolean(navigator.clipboard?.readText));
    if (useBrowserClipboard) {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    } else {
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
        window.navigationCopies = [];
        document.addEventListener('copy', event => {
          // execCommand fires a real browser copy event. Capture the selected
          // textarea contents through ClipboardData, without mocking execCommand.
          const selected = document.activeElement;
          const text = selected instanceof HTMLTextAreaElement
            ? selected.value.slice(selected.selectionStart, selected.selectionEnd)
            : window.getSelection().toString();
          event.clipboardData.setData('text/plain', text);
          event.preventDefault();
          window.navigationCopies.push({ text: event.clipboardData.getData('text/plain'), trusted: event.isTrusted });
        });
      });
    }
    async function assertCopied(expected, count) {
      if (useBrowserClipboard) {
        await page.waitForFunction(async expected => (await navigator.clipboard.readText()) === expected, expected);
        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
      } else {
        const copies = await page.evaluate(() => window.navigationCopies);
        assert.equal(copies.length, count, 'Each click must dispatch one copy event');
        assert.deepEqual(copies[count - 1], { text: expected, trusted: true });
      }
      await hashIs(page, '#style=minimalismo');
    }
    const swatch = page.locator('#minimalismo .sw[data-hex]').first();
    const expectedHex = await swatch.getAttribute('data-hex');
    await swatch.click();
    await assertCopied(expectedHex, 1);
    assert(await swatch.evaluate(button => document.activeElement === button), 'Copying a swatch retains focus on its button');
    await page.locator('#minimalismo .recipe summary').click();
    const expectedRecipe = await page.locator('#minimalismo .recipe__code').textContent();
    assert(expectedRecipe.length > 100, 'Exercise a multiline recipe, not an empty copy');
    const copyRecipe = page.locator('#minimalismo .recipe__copy');
    await copyRecipe.click();
    await assertCopied(expectedRecipe, 2);
    assert(await copyRecipe.evaluate(button => document.activeElement === button), 'Copying a recipe retains focus on its button');
    console.log(`  Clipboard verification: ${useBrowserClipboard ? 'browser Clipboard API' : 'trusted copy events and ClipboardData fallback'}`);
    await page.context().close();
  });

  await run('motion runs only in the focused section and stops when returning to the catalog', async () => {
    const page = await openPage(1280, 800, '#style=cinetico', target.href, true, 'no-preference');
    await focused(page, 'cinetico');
    await page.waitForFunction(() => {
      const live = document.querySelectorAll('.lab-section.is-live');
      return live.length === 1 && live[0].id === 'cinetico';
    });
    const movingTransform = await page.locator('#cinetico [data-marquee]').first().evaluate(el => el.style.transform);
    await page.waitForFunction(before => document.querySelector('#cinetico [data-marquee]').style.transform !== before, movingTransform);
    await page.locator('#viewNext').click();
    await focused(page, 'blackletter');
    await page.waitForFunction(() => {
      const live = document.querySelectorAll('.lab-section.is-live');
      return live.length === 1 && live[0].id === 'blackletter';
    });
    const stoppedTransform = await page.locator('#cinetico [data-marquee]').first().evaluate(el => el.style.transform);
    await settle(page);
    assert.equal(await page.locator('#cinetico [data-marquee]').first().evaluate(el => el.style.transform), stoppedTransform, 'Hidden kinetic demo stops its animation loop');
    await page.locator('#viewBack').click();
    await catalog(page);
    await settle(page);
    assert.equal(await page.locator('.lab-section.is-live').count(), 0, 'No hidden demos animate in the catalog');
    assert.equal(await page.locator('#cinetico [data-marquee]').first().evaluate(el => el.style.transform), stoppedTransform);
    await page.context().close();
  });

  await run('direct focus links, legacy anchors, invalid-route notification and 1024px breakpoint', async () => {
    const page = await openPage(1024, 768, '#style=estilo-suico');
    await focused(page, 'estilo-suico');
    assert.match(await page.locator('#viewPosition').innerText(), /3\s*(?:\/|de)\s*47/);
    await page.locator('#viewBack').focus();
    await page.keyboard.press('Enter');
    await catalog(page);
    await page.waitForFunction(() => document.activeElement.id === 'catTitle');
    await page.goto(target.href + '#luxo');
    await continuous(page, 'luxo');
    await page.goto(target.href + '#style=style-that-does-not-exist');
    await catalog(page);
    await page.waitForFunction(() => [...document.querySelectorAll('[role="status"], [role="alert"], [aria-live="polite"], [aria-live="assertive"]')].some(node => {
      const message = node.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return /nao.*encontr|inval|desconhecid|not found/.test(message) && node.getClientRects().length && Number(getComputedStyle(node).opacity) > 0;
    }));
    assert(!new URL(page.url()).hash.includes('style-that-does-not-exist'), 'Invalid focused routes must normalize to the catalog');
    await page.goto(target.href + '#style=toString');
    await catalog(page);
    assert.equal(new URL(page.url()).hash, '', 'Object prototype names must normalize as invalid styles');
    await page.context().close();
  });

  await run('mobile continuous page, legacy card links, focus-link normalization and resize restoration', async () => {
    const page = await openPage(390, 844);
    await visibleCount(page, '.lab-section', 47);
    assert(await page.locator('#catGrid .card').evaluateAll(cards => cards.every(card =>
      card.tagName === 'A' && /^#[^=]+$/.test(card.getAttribute('href')))), 'Mobile cards must use legacy anchors');
    await visibleCount(page, '#clearFilters', 0);
    await page.locator('.card[href="#estilo-suico"]').click();
    await continuous(page, 'estilo-suico');
    await page.goto(target.href + '#style=bauhaus');
    await continuous(page, 'bauhaus');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(target.href + '#style=minimalismo');
    await focused(page, 'minimalismo');
    await page.setViewportSize({ width: 1023, height: 768 });
    await continuous(page, 'minimalismo');
    assert.equal(await page.locator('.card').first().getAttribute('href'), '#minimalismo');
    await page.context().close();
  });

  if (baseline) {
    await run('all 47 source sections are unchanged; mobile DOM and computed layout match the baseline', async () => {
      const baselineSource = fs.readFileSync(baseline, 'utf8');
      for (const width of [390, 1023]) {
        const page = await openPage(width, 844);
        const sections = await page.evaluate(({ before, after }) => {
          const extract = html => [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('.lab-section')].map(section => section.outerHTML);
          return { before: extract(before), after: extract(after) };
        }, { before: baselineSource, after: sourceByPage.get(page) });
        assert.equal(sections.before.length, 47);
        assert.deepEqual(sections.after, sections.before, 'Source markup of every original section must be preserved');
        const reference = await openPage(width, 844, '', pathToFileURL(baseline).href, false);
        assert.deepEqual(await mobileSnapshot(page), await mobileSnapshot(reference), `Mobile section layout changed at ${width}px`);
        await page.context().close();
        await reference.context().close();
      }
    });
  } else {
    console.log('SKIP baseline preservation comparison (set NAV_BASELINE to the original index.html)');
  }

  assert.deepEqual(browserErrors, [], 'No uncaught browser JavaScript errors');
  console.log(`PASS ${completed} navigation scenarios; no uncaught browser errors`);
})().catch(async error => {
  console.error(error.stack || error);
  if (currentPage && !currentPage.isClosed()) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'design-styles-navigation-'));
    const screenshot = path.join(directory, 'failure.png');
    await currentPage.screenshot({ path: screenshot }).then(() => console.error(`Failure screenshot: ${screenshot}`)).catch(() => {});
  }
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
});
