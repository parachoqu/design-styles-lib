#!/usr/bin/env node
'use strict';

// Run with Node and Playwright installed locally or in the supplied NVM runtime.
// MIXER_TEST_URL optionally replaces the default file:// combinador.html target.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
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

const target = new URL(process.env.MIXER_TEST_URL || pathToFileURL(path.join(__dirname, '..', 'combinador.html')));
target.search = '';
target.hash = '';
const catalogTarget = new URL('index.html', target);
const STYLE_TOTAL = 59;
const CATEGORY_TOTAL = 20;
const VISUAL_STYLE_TOTAL = 24;
const NEW_STYLE_SLUGS = [
  'grid-layout', 'horizontal-layout', 'modular-layout', 'grunge',
  'scroll-effects', 'typographic', 'narrow-layout', 'bold',
  'futuristic', 'pixel-art', 'glitch', 'fun',
];
const browserErrors = [];
let browser;
let currentPage;
let completed = 0;

function mixerURL(slugs = [], preview = 'components') {
  const url = new URL(target);
  if (slugs.length) url.searchParams.set('base', slugs[0]);
  slugs.slice(1).forEach(slug => url.searchParams.append('influence', slug));
  if (preview !== 'components') url.searchParams.set('preview', preview);
  return url.href;
}

async function openPage({ width = 1440, height = 900, url = target.href, reducedMotion = 'reduce', mixer = true } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
  // Local functionality must not depend on remote font availability.
  await context.route('**/*', route => {
    const requestURL = new URL(route.request().url());
    const external = /^https?:$/.test(requestURL.protocol) && requestURL.origin !== new URL(url).origin;
    return external ? route.abort() : route.continue();
  });
  const page = await context.newPage();
  currentPage = page;
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => browserErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/Failed to load resource: net::ERR_FAILED/.test(message.text())) {
      browserErrors.push(message.text());
    }
  });
  const response = await page.goto(url, { waitUntil: 'load' });
  assert(response?.ok(), `Document must load: ${url}`);
  if (mixer) await page.waitForFunction(total => window.MixerEngine?.profiles.length === total, STYLE_TOTAL);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function run(name, action) {
  await action();
  completed += 1;
  console.log(`PASS ${name}`);
}

async function selected(page, slugs) {
  await page.waitForFunction(expected => {
    const slots = [...document.querySelectorAll('#mixer-slots [data-remove]')].map(button => button.dataset.remove);
    return JSON.stringify(slots) === JSON.stringify(expected);
  }, slugs);
  assert.deepEqual(await page.locator('#mixer-slots [data-remove]').evaluateAll(buttons => buttons.map(button => button.dataset.remove)), slugs);
  assert.deepEqual((await page.locator('#mixer-options [aria-pressed="true"]').evaluateAll(buttons => buttons.map(button => button.dataset.style))).sort(), [...slugs].sort());
  assert.equal(await page.locator('#mixer-result').isVisible(), slugs.length > 0);
  assert.equal(await page.locator('#mixer-empty').isVisible(), slugs.length === 0);
  if (slugs.length) assert.equal(await page.locator('#mixer-result').getAttribute('data-base'), slugs[0]);
  const url = new URL(page.url());
  assert.equal(url.searchParams.get('base'), slugs[0] || null);
  assert.deepEqual(url.searchParams.getAll('influence'), slugs.slice(1));
}

async function choose(page, slug) {
  await page.locator(`#mixer-options [data-style="${slug}"]`).click();
}

async function previewIs(page, kind) {
  assert.equal(await page.locator('#mixer-components').isVisible(), kind === 'components');
  assert.equal(await page.locator('#mixer-landing').isVisible(), kind === 'landing');
  assert.equal(await page.locator(`[data-preview="${kind}"]`).getAttribute('aria-pressed'), 'true');
}

async function noOverflow(page, label) {
  const box = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(box.scrollWidth <= box.width + 1, `${label}: horizontal overflow (${box.scrollWidth}px at ${box.width}px)`);
}

async function captureCopies(page) {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    window.mixerCopies = [];
    document.addEventListener('copy', event => {
      // Capture a real browser-generated copy event; do not mock execCommand.
      const active = document.activeElement;
      const text = active instanceof HTMLTextAreaElement
        ? active.value.slice(active.selectionStart, active.selectionEnd)
        : window.getSelection().toString();
      event.clipboardData.setData('text/plain', text);
      event.preventDefault();
      window.mixerCopies.push({ text: event.clipboardData.getData('text/plain'), trusted: event.isTrusted });
    });
  });
}

async function visibleMixerSlugs(page) {
  return page.locator('#mixer-options [data-style]:visible').evaluateAll(buttons => buttons.map(button => button.dataset.style));
}

async function assertMixerFacetCounts(page) {
  const mismatches = await page.evaluate(() => {
    const engine = window.MixerEngine;
    const norm = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const category = document.getElementById('mixer-category').value;
    const visualStyle = document.getElementById('mixer-visual-style').value;
    const group = document.getElementById('mixer-group').value;
    const query = norm(document.getElementById('mixer-search').value.trim());
    const taxonomyTerms = (map, ids) => ids.flatMap(id => [id, map[id].label].concat(map[id].aliases || []));
    const matchesSearch = profile => norm([
      profile.slug, profile.name, profile.tags, engine.groups[profile.group],
      ...taxonomyTerms(engine.categories, profile.categories),
      ...taxonomyTerms(engine.visualStyles, profile.visualStyles),
    ].join(' ')).includes(query);
    const base = profile => matchesSearch(profile) && (group === 'all' || profile.group === group);
    const categorySource = engine.profiles.filter(profile => base(profile) && (visualStyle === 'all' || profile.visualStyles.includes(visualStyle)));
    const styleSource = engine.profiles.filter(profile => base(profile) && (category === 'all' || profile.categories.includes(category)));
    const check = (selector, source, key) => [...document.querySelector(selector).options].map(option => {
      const expected = option.value === 'all' ? source.length : source.filter(profile => profile[key].includes(option.value)).length;
      return { selector, value: option.value, expected, actual: Number(option.dataset.count) };
    }).filter(result => result.actual !== result.expected);
    return check('#mixer-category', categorySource, 'categories').concat(check('#mixer-visual-style', styleSource, 'visualStyles'));
  });
  assert.deepEqual(mismatches, [], 'Mixer facet option counts reflect the other active filters');
}

function luminance(color) {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color.trim());
  const rgb = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*1)?\s*\)$/i.exec(color.trim());
  assert(hex || rgb, `Semantic colors must be opaque hex or RGB: ${color}`);
  const channels = hex
    ? (hex[1].length === 3 ? [...hex[1]].map(c => c + c) : hex[1].match(/../g)).map(c => parseInt(c, 16))
    : rgb.slice(1, 4).map(Number);
  const linear = channels.map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (values[1] + 0.05) / (values[0] + 0.05);
}

(async () => {
  browser = await chromium.launch({ executablePath: chromiumPath, headless: true, args: ['--no-sandbox'] });
  console.log(`Mixer target: ${target.href}`);

  await run('catalog entry point, taxonomy and all 59 profiles match the library', async () => {
    const catalog = await openPage({ url: catalogTarget.href, mixer: false });
    await catalog.waitForFunction(total => document.querySelectorAll('.lab-section').length === total && [...document.querySelectorAll('.lab-section')].every(section => section.hasAttribute('data-categories') && section.hasAttribute('data-visual-styles')), STYLE_TOTAL);
    assert.equal(await catalog.locator('.lab-section').count(), STYLE_TOTAL);
    const original = await catalog.locator('.lab-section').evaluateAll(sections => sections.map(section => ({
      slug: section.dataset.slug,
      name: section.dataset.name,
      group: section.dataset.group,
      tags: section.dataset.tags.split(',').map(tag => tag.trim()),
      palette: [...section.querySelectorAll('.lab-palette .sw[data-hex]')].map(button => button.dataset.hex.toLowerCase()),
      categories: section.dataset.categories.trim().split(/\s+/).filter(Boolean),
      visualStyles: section.dataset.visualStyles.trim().split(/\s+/).filter(Boolean),
    })));
    const link = catalog.locator('a[href="combinador.html"]').first();
    assert(await link.isVisible(), 'Catalog exposes a visible relative link to the mixer');
    await link.click();
    await catalog.waitForFunction(total => window.MixerEngine?.profiles.length === total, STYLE_TOTAL);
    assert.equal(new URL(catalog.url()).pathname, target.pathname);
    const actual = await catalog.evaluate(() => window.MixerEngine.profiles.map(profile => ({
      slug: profile.slug,
      name: profile.name,
      group: profile.group,
      tags: Array.isArray(profile.tags) ? profile.tags : profile.tags.split(',').map(tag => tag.trim()),
      palette: profile.palette.map(color => color.toLowerCase()),
      categories: profile.categories,
      visualStyles: profile.visualStyles,
    })));
    assert.deepEqual(actual, original, 'Curated profiles preserve the catalog metadata and palette');
    assert.equal(new Set(actual.map(profile => profile.slug)).size, STYLE_TOTAL);
    assert.equal(await catalog.locator('#mixer-options [data-style]').count(), STYLE_TOTAL);
    assert(await catalog.locator('a[href="index.html"]').first().isVisible(), 'Mixer has a visible return link');
    const taxonomy = await catalog.evaluate(() => {
      const engine = window.MixerEngine;
      return {
        categories: engine.categories,
        visualStyles: engine.visualStyles,
        profileTaxonomy: engine.profiles.map(profile => ({ slug: profile.slug, categories: profile.categories, visualStyles: profile.visualStyles })),
        categoryOptions: [...document.querySelector('#mixer-category').options].map(option => ({ value: option.value, label: option.textContent.trim(), count: option.dataset.count })),
        visualOptions: [...document.querySelector('#mixer-visual-style').options].map(option => ({ value: option.value, label: option.textContent.trim(), count: option.dataset.count })),
      };
    });
    assert.equal(Object.keys(taxonomy.categories).length, CATEGORY_TOTAL);
    assert.equal(Object.keys(taxonomy.visualStyles).length, VISUAL_STYLE_TOTAL);
    assert.equal(taxonomy.categoryOptions.length, CATEGORY_TOTAL + 1);
    assert.equal(taxonomy.visualOptions.length, VISUAL_STYLE_TOTAL + 1);
    for (const [id, item] of Object.entries({ ...taxonomy.categories, ...taxonomy.visualStyles })) {
      assert.equal(typeof item.label, 'string', `${id} has a Portuguese label`);
      assert(item.label.length > 0 && Array.isArray(item.aliases) && item.aliases.length > 0, `${id} has searchable aliases`);
    }
    for (const option of taxonomy.categoryOptions.concat(taxonomy.visualOptions)) {
      assert.match(option.label, /\(\d+\)$/, `${option.value} labels its current result count`);
      assert.match(option.count, /^\d+$/, `${option.value} records its current result count`);
    }
    const categoryCoverage = new Set();
    const visualCoverage = new Set();
    for (const profile of taxonomy.profileTaxonomy) {
      assert(profile.categories.length >= 2 && profile.categories.length <= 5, `${profile.slug} has curated project categories`);
      profile.categories.forEach(id => { assert(id in taxonomy.categories, `${profile.slug} uses known category ${id}`); categoryCoverage.add(id); });
      profile.visualStyles.forEach(id => { assert(id in taxonomy.visualStyles, `${profile.slug} uses known visual style ${id}`); visualCoverage.add(id); });
    }
    assert.deepEqual([...categoryCoverage].sort(), Object.keys(taxonomy.categories).sort(), 'Every category has profile coverage');
    assert.deepEqual([...visualCoverage].sort(), Object.keys(taxonomy.visualStyles).sort(), 'Every visual style has profile coverage');
    for (const slug of NEW_STYLE_SLUGS) {
      const profile = taxonomy.profileTaxonomy.find(item => item.slug === slug);
      assert(profile && profile.visualStyles.length > 0, `New ${slug} profile has a direct visual-style facet`);
    }
    await selected(catalog, []);
    await catalog.context().close();
  });

  await run('one, two and three styles, fourth-choice limit, toggle removal, base promotion and reset', async () => {
    const page = await openPage();
    const historyLength = await page.evaluate(() => history.length);
    await selected(page, []);
    await choose(page, 'minimalismo');
    await selected(page, ['minimalismo']);
    const baseTokens = await page.locator('#mixer-tokens').textContent();
    await choose(page, 'glassmorphism');
    await selected(page, ['minimalismo', 'glassmorphism']);
    assert.notEqual(await page.locator('#mixer-tokens').textContent(), baseTokens, 'The second style changes the system');
    await choose(page, 'neobrutalismo');
    await selected(page, ['minimalismo', 'glassmorphism', 'neobrutalismo']);
    assert.equal(await page.locator('#mixer-options [data-style]:disabled').count(), STYLE_TOTAL - 3);
    assert(!(await page.locator('#mixer-options [data-style="minimalismo"]').isDisabled()), 'Selected options remain removable at capacity');
    await choose(page, 'neobrutalismo');
    await selected(page, ['minimalismo', 'glassmorphism']);
    assert.equal(await page.locator('#mixer-options [data-style]:disabled').count(), 0);
    await choose(page, 'neobrutalismo');
    await page.locator('#mixer-slots [data-remove="minimalismo"]').click();
    await selected(page, ['glassmorphism', 'neobrutalismo']);
    assert.equal(await page.locator('#mixer-status').getAttribute('role'), 'status');
    assert((await page.locator('#mixer-status').textContent()).trim().length > 0, 'Removal/promotion is announced');
    assert.equal(await page.evaluate(() => history.length), historyLength, 'Editing a combination does not add history entries');
    await page.locator('#mixer-reset').click();
    await selected(page, []);
    await page.context().close();
  });

  await run('search aliases, group/category/style AND filters, dynamic counts and selection preservation', async () => {
    const page = await openPage({ url: mixerURL(['minimalismo']) });
    await page.locator('#mixer-search').fill('  SUICO  ');
    assert.equal(await page.locator('#mixer-options [data-style]:visible').count(), 1);
    assert.equal(await page.locator('#mixer-options [data-style]:visible').getAttribute('data-style'), 'estilo-suico');
    await page.locator('#mixer-group').selectOption('A');
    assert.equal(await page.locator('#mixer-options [data-style]:visible').count(), 1);
    await page.locator('#mixer-group').selectOption('B');
    assert.equal(await page.locator('#mixer-options [data-style]:visible').count(), 0);
    await selected(page, ['minimalismo']);
    await page.locator('#mixer-search').fill('');
    assert.equal(await page.locator('#mixer-options [data-style]:visible').count(), 8);
    await page.locator('#mixer-group').selectOption('all');
    await page.locator('#mixer-search').fill('minimal');
    assert.deepEqual(await visibleMixerSlugs(page), ['minimalismo'], 'The English minimal alias finds Minimalismo');
    await page.locator('#mixer-search').fill('illustrative');
    assert((await visibleMixerSlugs(page)).includes('flat-organica'), 'The English illustrative alias finds Ilustração Flat Orgânica');
    await page.locator('#mixer-search').fill('');
    await page.locator('#mixer-visual-style').selectOption('retro-vintage');
    assert.deepEqual((await visibleMixerSlugs(page)).sort(), ['neo-70s', 'vaporwave', 'y2k'], 'Retro & Vintage is a filter alias, not duplicate profiles');
    await assertMixerFacetCounts(page);
    await page.locator('#mixer-category').selectOption('portfolio');
    await assertMixerFacetCounts(page);
    assert((await visibleMixerSlugs(page)).every(slug => ['y2k', 'vaporwave'].includes(slug)), 'Category and visual style filters combine with AND semantics');
    const filterURL = new URL(page.url());
    assert.equal(filterURL.searchParams.has('category'), false, 'Category filters remain local UI state');
    assert.equal(filterURL.searchParams.has('visual-style'), false, 'Visual-style filters remain local UI state');
    await page.locator('#mixer-category').selectOption('all');
    await page.locator('#mixer-visual-style').selectOption('all');
    await page.locator('#mixer-group').selectOption('A');
    await page.locator('#mixer-search').fill('gRiD');
    const gridMatches = await visibleMixerSlugs(page);
    assert(gridMatches.includes('estilo-suico') && gridMatches.includes('grid-layout'), 'Search indexes names, tags and visual-style aliases');
    await selected(page, ['minimalismo']);
    await page.context().close();
  });

  await run('valid deep links, duplicate/excess/invalid parameters and strict base validation', async () => {
    const page = await openPage({ url: mixerURL(['minimalismo', 'glassmorphism', 'neobrutalismo'], 'landing') });
    await selected(page, ['minimalismo', 'glassmorphism', 'neobrutalismo']);
    await previewIs(page, 'landing');
    const bad = new URL(target);
    bad.search = '?base=minimalismo&influence=minimalismo&influence=missing&influence=glassmorphism&influence=glassmorphism&influence=neobrutalismo&influence=luxo&preview=invalid&extra=discard';
    await page.goto(bad.href);
    await selected(page, ['minimalismo', 'glassmorphism', 'neobrutalismo']);
    await previewIs(page, 'components');
    assert.equal(new URL(page.url()).searchParams.get('extra'), null);
    assert(!new URL(page.url()).search.includes('invalid'));
    for (const query of ['?base=unknown&influence=glassmorphism', '?influence=minimalismo', '?base=toString&influence=minimalismo', '?base=__proto__']) {
      await page.goto(target.href + query);
      await selected(page, []);
    }
    await page.context().close();
  });

  await run('preview switching, reload and Back/Forward restore the same combination and exported tokens', async () => {
    const page = await openPage({ url: mixerURL(['minimalismo', 'glassmorphism']) });
    await selected(page, ['minimalismo', 'glassmorphism']);
    const tokens = await page.locator('#mixer-tokens').textContent();
    await previewIs(page, 'components');
    await page.locator('[data-preview="landing"]').click();
    await previewIs(page, 'landing');
    assert.equal(await page.locator('#mixer-tokens').textContent(), tokens);
    assert.equal(new URL(page.url()).searchParams.get('preview'), 'landing');
    await page.reload();
    await selected(page, ['minimalismo', 'glassmorphism']);
    await previewIs(page, 'landing');
    assert.equal(await page.locator('#mixer-tokens').textContent(), tokens);
    await page.evaluate(url => {
      history.pushState(null, '', url);
      dispatchEvent(new PopStateEvent('popstate'));
    }, mixerURL(['bauhaus', 'luxo', 'cinetico']));
    await selected(page, ['bauhaus', 'luxo', 'cinetico']);
    await previewIs(page, 'components');
    await page.goBack();
    await selected(page, ['minimalismo', 'glassmorphism']);
    await previewIs(page, 'landing');
    await page.goForward();
    await selected(page, ['bauhaus', 'luxo', 'cinetico']);
    await previewIs(page, 'components');
    await page.context().close();
  });

  await run('CSS and URL fallback copies use trusted copy events and keep focus', async () => {
    const page = await openPage({ url: mixerURL(['minimalismo', 'glassmorphism', 'neobrutalismo']) });
    await captureCopies(page);
    await page.evaluate(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }));
    const css = await page.locator('#mixer-tokens').textContent();
    for (const marker of [':root', '--ds-color-bg', '--ds-font-', '--ds-space-', '--ds-radius', '--ds-shadow']) {
      assert(css.includes(marker), `Export includes ${marker}`);
    }
    await page.locator('#mixer-copy').click();
    await page.waitForFunction(() => window.mixerCopies.length === 1);
    assert.deepEqual(await page.evaluate(() => window.mixerCopies[0]), { text: css, trusted: true });
    assert(await page.locator('#mixer-copy').evaluate(button => document.activeElement === button));
    const url = page.url();
    await page.locator('#mixer-share').click();
    await page.waitForFunction(() => window.mixerCopies.length === 2);
    assert.deepEqual(await page.evaluate(() => window.mixerCopies[1]), { text: url, trusted: true });
    assert(await page.locator('#mixer-share').evaluate(button => document.activeElement === button));
    await selected(page, ['minimalismo', 'glassmorphism', 'neobrutalismo']);
    await page.context().close();
  });

  await run('native sharing passes the result URL; cancellation does not silently copy', async () => {
    const page = await openPage({ url: mixerURL(['bauhaus']) });
    await captureCopies(page);
    await page.evaluate(() => {
      window.mixerShares = [];
      Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.mixerShares.push(data); } });
    });
    await page.locator('#mixer-share').click();
    await page.waitForFunction(() => window.mixerShares.length === 1);
    assert.equal((await page.evaluate(() => window.mixerShares[0])).url, page.url());
    assert.deepEqual(await page.evaluate(() => window.mixerCopies), []);
    await page.evaluate(() => Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => { throw new DOMException('Share cancelled', 'AbortError'); },
    }));
    await page.locator('#mixer-share').click();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.deepEqual(await page.evaluate(() => window.mixerCopies), [], 'Cancelling native sharing does not change the clipboard');
    await page.context().close();
  });

  await run('deterministic engine, normalized inputs and readable colors for every base and varied combinations', async () => {
    const page = await openPage();
    const results = await page.evaluate(() => {
      const engine = window.MixerEngine;
      const sets = engine.profiles.map(profile => [profile.slug]);
      engine.profiles.forEach(profile => sets.push(engine.normalize([profile.slug, 'glassmorphism', 'neobrutalismo'])));
      sets.push(['terminal-ascii', 'material-you', 'bauhaus'], ['luxo', 'claymorphic', 'punk-fanzine'], ['brutalismo-radical', 'liquid-glass', 'cinetico'], ['neumorfismo', 'dados-densos', 'blackletter']);
      return {
        normalized: engine.normalize(['missing', 'minimalismo', 'minimalismo', 'glassmorphism', '__proto__', 'neobrutalismo', 'luxo']),
        empty: engine.compose([]),
        pairs: sets.map(slugs => ({ first: engine.compose(slugs), repeated: engine.compose(slugs) })),
      };
    });
    assert.deepEqual(results.normalized, ['minimalismo', 'glassmorphism', 'neobrutalismo']);
    assert.equal(results.empty, null);
    for (const { first: system, repeated } of results.pairs) {
      assert.deepEqual(system, repeated, 'The same ordered styles always produce the same system');
      assert(system.name && system.slugs.length > 0 && system.slugs.length <= 3);
      assert(system.origins && system.principles && system.adjustments, 'Result explains its provenance and adjustments');
      for (const text of ['--ds-color-text', '--ds-color-muted']) {
        for (const background of ['--ds-color-bg', '--ds-color-surface']) {
          const ratio = contrast(system.tokens[text], system.tokens[background]);
          assert(ratio >= 4.5, `${system.slugs.join(' + ')}: ${text}/${background} contrast ${ratio.toFixed(3)} < 4.5`);
        }
      }
      const ratio = contrast(system.tokens['--ds-color-on-accent'], system.tokens['--ds-color-accent']);
      assert(ratio >= 4.5, `${system.slugs.join(' + ')}: button contrast ${ratio.toFixed(3)} < 4.5`);
    }
    await page.goto(mixerURL(['minimalismo', 'glassmorphism', 'neobrutalismo']));
    const applied = await page.locator('#mixer-preview').evaluate(element => {
      const tokens = window.MixerEngine.compose(['minimalismo', 'glassmorphism', 'neobrutalismo']).tokens;
      const computed = getComputedStyle(element);
      return Object.entries(tokens).filter(([key]) => key.startsWith('--ds-')).map(([key, value]) => ({ key, expected: String(value), actual: computed.getPropertyValue(key).trim() }));
    });
    assert(applied.length >= 10, 'The generated system has usable CSS custom properties');
    for (const token of applied) assert.equal(token.actual, token.expected, `Preview applies exported token ${token.key}`);
    console.log(`  Contrast verification: ${results.pairs.length} systems, five text/background pairs each`);
    await page.context().close();
  });

  await run('keyboard activation, focus visibility and accessible selection/removal', async () => {
    const page = await openPage();
    const option = page.locator('#mixer-options [data-style="minimalismo"]');
    assert.equal(await option.evaluate(button => button.tagName), 'BUTTON');
    await option.focus();
    await page.keyboard.press('Enter');
    await selected(page, ['minimalismo']);
    const focused = await page.evaluate(() => ({
      tag: document.activeElement.tagName,
      outline: getComputedStyle(document.activeElement).outlineStyle,
      width: parseFloat(getComputedStyle(document.activeElement).outlineWidth),
      shadow: getComputedStyle(document.activeElement).boxShadow,
    }));
    assert.notEqual(focused.tag, 'BODY', 'Selection must retain meaningful keyboard focus');
    assert((focused.outline !== 'none' && focused.width > 0) || focused.shadow !== 'none', 'Keyboard focus has a visible outline or ring');
    const remove = page.locator('#mixer-slots [data-remove="minimalismo"]');
    const name = await remove.evaluate(button => button.getAttribute('aria-label') || button.textContent.trim());
    assert.match(name, /minimalismo/i, 'Remove buttons identify the style accessibly');
    await remove.focus();
    await page.keyboard.press('Enter');
    await selected(page, []);
    assert.notEqual(await page.evaluate(() => document.activeElement.tagName), 'BODY', 'Removing the final style restores meaningful focus');
    await page.context().close();
  });

  await run('responsive previews at 1440, 768 and 390 pixels and reduced motion', async () => {
    for (const width of [1440, 768, 390]) {
      const page = await openPage({ width, height: 900, url: mixerURL(['bauhaus', 'liquid-glass', 'cinetico']) });
      await selected(page, ['bauhaus', 'liquid-glass', 'cinetico']);
      await noOverflow(page, `${width}px components`);
      await page.locator('[data-preview="landing"]').click();
      await previewIs(page, 'landing');
      await noOverflow(page, `${width}px landing`);
      const running = await page.locator('#mixer-preview').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => {
        const timing = animation.effect.getComputedTiming();
        return animation.playState === 'running' && (timing.iterations === Infinity || timing.duration > 1);
      }).length);
      assert.equal(running, 0, 'Reduced motion suppresses nonessential animation');
      await page.locator('#mixer-reset').click();
      await selected(page, []);
      await noOverflow(page, `${width}px empty state`);
      await page.context().close();
    }
  });

  assert.deepEqual(browserErrors, [], 'No uncaught JavaScript errors or unexpected console errors');
  console.log(`PASS ${completed} mixer scenarios; no browser errors`);
})().catch(async error => {
  console.error(error.stack || error);
  if (currentPage && !currentPage.isClosed()) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'design-styles-mixer-'));
    const screenshot = path.join(directory, 'failure.png');
    await currentPage.screenshot({ path: screenshot }).then(() => console.error(`Failure screenshot: ${screenshot}`)).catch(() => {});
  }
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
});
