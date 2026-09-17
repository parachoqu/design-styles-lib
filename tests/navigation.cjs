#!/usr/bin/env node
'use strict';

// Run with Node and Playwright installed locally or in the supplied NVM runtime.
// NAV_TEST_URL overrides the local index.html; NAV_BASELINE enables preservation checks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
let chromium;
const playwrightFallback = process.env.PLAYWRIGHT_PATH || '/home/https/.config/nvm/versions/node/v24.14.0/lib/node_modules/playwright';
try {
  ({ chromium } = require('playwright'));
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND' || !fs.existsSync(playwrightFallback)) throw error;
  ({ chromium } = require(playwrightFallback));
}
const chromiumPath = process.env.CHROMIUM_PATH || (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/usr/bin/chromium');

const target = new URL(process.env.NAV_TEST_URL || pathToFileURL(path.join(__dirname, '..', 'index.html')));
target.hash = '';
const baseline = process.env.NAV_BASELINE && path.resolve(process.env.NAV_BASELINE);
const STYLE_TOTAL = 59;
const ORIGINAL_STYLE_TOTAL = 47;
const NEW_STYLE_SLUGS = [
  'grid-layout', 'horizontal-layout', 'modular-layout', 'grunge',
  'scroll-effects', 'typographic', 'narrow-layout', 'bold',
  'futuristic', 'pixel-art', 'glitch', 'fun',
];
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
  await page.waitForFunction(total => document.querySelectorAll('#catGrid .card').length === total, STYLE_TOTAL);
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

async function catalog(page, count = STYLE_TOTAL) {
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
  await visibleCount(page, '.lab-section', STYLE_TOTAL);
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

async function visibleCatalogSlugs(page) {
  return page.locator('#catGrid .card:visible').evaluateAll(cards => cards.map(card => card.getAttribute('href').replace(/^#style=/, '').replace(/^#/, '')));
}

async function assertCatalogFacetCounts(page) {
  const mismatches = await page.evaluate(() => {
    const sections = [...document.querySelectorAll('.lab-section')];
    const group = document.querySelector('.chip.is-on')?.dataset.value || 'all';
    const category = document.getElementById('categoryFilter').value;
    const visualStyle = document.getElementById('styleFilter').value;
    const values = (section, key) => (section.dataset[key] || '').trim().split(/\s+/).filter(Boolean);
    const inGroup = section => group === 'all' || section.dataset.group === group;
    const categorySource = sections.filter(section => inGroup(section) && (visualStyle === 'all' || values(section, 'visualStyles').includes(visualStyle)));
    const styleSource = sections.filter(section => inGroup(section) && (category === 'all' || values(section, 'categories').includes(category)));
    const check = (selector, source, key) => [...document.querySelector(selector).options].map(option => {
      const expected = option.value === 'all' ? source.length : source.filter(section => values(section, key).includes(option.value)).length;
      return { selector, value: option.value, expected, actual: Number(option.dataset.count) };
    }).filter(result => result.actual !== result.expected);
    return check('#categoryFilter', categorySource, 'categories').concat(check('#styleFilter', styleSource, 'visualStyles'));
  });
  assert.deepEqual(mismatches, [], 'Facet option counts reflect the other active filters');
}

(async () => {
  browser = await chromium.launch({ executablePath: chromiumPath, headless: true, args: ['--no-sandbox'] });
  console.log(`Navigation target: ${target.href}`);

  await run('desktop catalog, accent-insensitive combined filters, reset and filtered detail boundaries', async () => {
    const page = await openPage();
    const originalTitle = await page.title();
    assert.equal(await page.locator('.lab-section').count(), STYLE_TOTAL);
    assert.equal(await page.locator('.lab-section .frame').count(), STYLE_TOTAL);
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
    const filtered = await page.locator('#catGrid .card:visible').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
    assert(filtered.length >= 2, 'The grid search exposes a navigable filtered sequence');
    assert(filtered.includes('#style=grid-layout'), 'The new Grid Layout demo participates in search');
    const firstSlug = filtered[0].slice('#style='.length);
    const secondSlug = filtered[1].slice('#style='.length);
    await page.locator('#catGrid .card:visible').first().click();
    await focused(page, firstSlug);
    assert(await page.locator('#viewPrev').isDisabled(), 'Previous is disabled at the first matching result');
    assert(!(await page.locator('#viewNext').isDisabled()));
    assert.match(await page.locator('#viewPosition').innerText(), new RegExp('1\\s*(?:/|de)\\s*' + filtered.length));
    await page.locator('#viewNext').click();
    await focused(page, secondSlug);
    for (let index = 2; index < filtered.length; index += 1) await page.locator('#viewNext').click();
    await focused(page, filtered[filtered.length - 1].slice('#style='.length));
    assert(await page.locator('#viewNext').isDisabled(), 'Next is disabled at the last matching result');
    assert.match(await page.locator('#viewPosition').innerText(), new RegExp(filtered.length + '\\s*(?:/|de)\\s*' + filtered.length));
    await page.locator('#viewPrev').click();
    await focused(page, filtered[filtered.length - 2].slice('#style='.length));
    await page.locator('#viewBack').click();
    await catalog(page, filtered.length);
    assert.equal(await page.title(), originalTitle, 'Catalog restores its document title');
    assert.equal(await page.locator('#q').inputValue(), '  GrID  ');
    await page.context().close();
  });

  await run('project categories and visual styles are complete, searchable, combinable and counted dynamically', async () => {
    const page = await openPage();
    await page.waitForFunction(() => document.querySelectorAll('#categoryFilter option').length === 21 && document.querySelectorAll('#styleFilter option').length === 25);
    const taxonomy = await page.evaluate(newSlugs => {
      const options = selector => [...document.querySelector(selector).options].map(option => ({
        value: option.value, label: option.textContent.trim(), count: option.dataset.count,
      }));
      const categoryOptions = options('#categoryFilter');
      const visualOptions = options('#styleFilter');
      const categoryIds = new Set(categoryOptions.map(option => option.value));
      const visualIds = new Set(visualOptions.map(option => option.value));
      const sections = [...document.querySelectorAll('.lab-section')].map(section => ({
        slug: section.dataset.slug,
        group: section.dataset.group,
        categories: (section.dataset.categories || '').split(/\s+/).filter(Boolean),
        visualStyles: (section.dataset.visualStyles || '').split(/\s+/).filter(Boolean),
        demo: section.querySelector('.frame__body')?.dataset.demo,
      }));
      return { categoryOptions, visualOptions, categoryIds: [...categoryIds], visualIds: [...visualIds], sections, newSlugs };
    }, NEW_STYLE_SLUGS);
    assert.equal(taxonomy.categoryOptions.length, 21, 'Twenty project categories plus the all option are exposed');
    assert.equal(taxonomy.visualOptions.length, 25, 'Twenty-four visual styles plus the all option are exposed');
    for (const option of taxonomy.categoryOptions.concat(taxonomy.visualOptions)) {
      assert.match(option.label, /\(\d+\)$/, `${option.value} exposes its dynamic result count`);
      assert.match(option.count, /^\d+$/, `${option.value} stores its dynamic result count`);
    }
    const categoryIds = new Set(taxonomy.categoryIds);
    const visualIds = new Set(taxonomy.visualIds);
    const coveredCategories = new Set();
    const coveredVisualStyles = new Set();
    for (const section of taxonomy.sections) {
      assert(section.categories.length >= 2 && section.categories.length <= 5, `${section.slug} has 2–5 curated project categories`);
      section.categories.forEach(id => { assert(categoryIds.has(id), `${section.slug} uses a known category ${id}`); coveredCategories.add(id); });
      section.visualStyles.forEach(id => { assert(visualIds.has(id), `${section.slug} uses a known visual style ${id}`); coveredVisualStyles.add(id); });
    }
    assert.deepEqual([...coveredCategories].sort(), [...categoryIds].filter(id => id !== 'all').sort(), 'Every category has real catalog coverage');
    assert.deepEqual([...coveredVisualStyles].sort(), [...visualIds].filter(id => id !== 'all').sort(), 'Every visual style has real catalog coverage');
    for (const slug of NEW_STYLE_SLUGS) {
      const section = taxonomy.sections.find(item => item.slug === slug);
      assert(section, `New style ${slug} is a catalog section`);
      assert.equal(section.demo, slug, `New style ${slug} owns its demo root`);
      assert(section.visualStyles.length >= 1, `New style ${slug} has a direct visual-style facet`);
    }

    await page.locator('#q').fill('minimal');
    assert.deepEqual(await visibleCatalogSlugs(page), ['minimalismo'], 'The English minimal alias finds Minimalismo');
    await page.locator('#q').fill('illustrative');
    assert((await visibleCatalogSlugs(page)).includes('flat-organica'), 'The English illustrative alias finds Ilustração Flat Orgânica');
    await page.locator('#q').fill('');
    await page.locator('#styleFilter').selectOption('retro-vintage');
    assert.deepEqual((await visibleCatalogSlugs(page)).sort(), ['neo-70s', 'vaporwave', 'y2k'], 'Retro & Vintage is an alias facet, not a duplicate demo');
    await assertCatalogFacetCounts(page);

    const targetFilters = await page.evaluate(() => {
      const section = document.getElementById('grid-layout');
      return {
        group: section.dataset.group,
        category: section.dataset.categories.split(/\s+/)[0],
        visualStyle: 'grid-layout',
      };
    });
    await page.locator('.chip[data-value="' + targetFilters.group + '"]').click();
    await page.locator('#categoryFilter').selectOption(targetFilters.category);
    await page.locator('#styleFilter').selectOption(targetFilters.visualStyle);
    await assertCatalogFacetCounts(page);
    const combined = await page.locator('#catGrid .card:visible').evaluateAll(cards => cards.map(card => {
      const section = document.getElementById(card.getAttribute('href').replace('#style=', ''));
      return { slug: section.dataset.slug, group: section.dataset.group, categories: section.dataset.categories, visualStyles: section.dataset.visualStyles };
    }));
    assert(combined.some(item => item.slug === 'grid-layout'), 'The new Grid Layout demo survives an AND filter built from its taxonomy');
    assert(combined.every(item => item.group === targetFilters.group && item.categories.split(/\s+/).includes(targetFilters.category) && item.visualStyles.split(/\s+/).includes(targetFilters.visualStyle)), 'Group, category and visual style filters combine with AND semantics');
    await page.context().close();
  });

  await run('browser Back/Forward preserve search, group, taxonomy filters, catalog scroll and originating card focus', async () => {
    const page = await openPage(1280, 420);
    await page.locator('.chip[data-value="G"]').click();
    await page.locator('#categoryFilter').selectOption('personal');
    await page.locator('#styleFilter').selectOption('retro-vintage');
    await page.locator('#q').fill('vintage');
    const card = page.locator('#catGrid .card:visible').last();
    const href = await card.getAttribute('href');
    const slug = href.slice('#style='.length);
    const expectedCount = await page.locator('#catGrid .card:visible').count();
    assert(expectedCount >= 2, 'The history scenario needs a filtered result sequence');
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
    assert.equal(await page.locator('#q').inputValue(), 'vintage');
    assert.equal(await page.locator('.chip.is-on').getAttribute('data-value'), 'G');
    assert.equal(await page.locator('#categoryFilter').inputValue(), 'personal');
    assert.equal(await page.locator('#styleFilter').inputValue(), 'retro-vintage');
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
    await catalog(page, 8);
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
    const swissPosition = await page.evaluate(() => [...document.querySelectorAll('.lab-section')].findIndex(section => section.id === 'estilo-suico') + 1);
    assert.match(await page.locator('#viewPosition').innerText(), new RegExp(swissPosition + '\\s*(?:/|de)\\s*' + STYLE_TOTAL));
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
    await visibleCount(page, '.lab-section', STYLE_TOTAL);
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
    await run('the 47 legacy slugs remain available beside the 12 additions', async () => {
      const baselineSource = fs.readFileSync(baseline, 'utf8');
      const page = await openPage(390, 844);
      const sections = await page.evaluate(({ before, after }) => {
        const extract = html => [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('.lab-section')].map(section => section.dataset.slug);
        return { before: extract(before), after: extract(after) };
      }, { before: baselineSource, after: sourceByPage.get(page) });
      assert.equal(sections.before.length, ORIGINAL_STYLE_TOTAL);
      assert.equal(await page.locator('.lab-section').count(), STYLE_TOTAL);
      assert.equal(new Set(sections.after).size, STYLE_TOTAL, 'The expanded source keeps slugs unique');
      assert(sections.before.every(slug => sections.after.includes(slug)), 'Every legacy route remains available');
      await page.context().close();
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
