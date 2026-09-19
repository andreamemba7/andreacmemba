// Loads each real HTML page in a DOM and runs the real scripts against it.
// This exists because an album branch was once spliced into the wrong IIFE:
// every file parsed, every unit test passed, and photography.html rendered
// a blank black page because an undefined variable threw at runtime. Only
// executing the page catches that.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..');

async function runPage(file, search = '') {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => errors.push(e));
  virtualConsole.on('error', (...a) => errors.push(new Error(a.join(' '))));

  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, file), 'utf8'), {
    url: 'https://example.test/' + file + search,
    runScripts: 'dangerously',
    resources: undefined,
    virtualConsole,
    pretendToBeVisual: true
  });

  // jsdom implements no layout engine, so these browser APIs are absent.
  // Stub them, otherwise every failure is a jsdom gap rather than a real
  // bug on the page and the suite tells us nothing.
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.scrollTo = () => {};
  w.Element.prototype.scrollIntoView = function () {};
  // jsdom's play() returns undefined; real browsers return a Promise.
  w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  w.HTMLMediaElement.prototype.pause = function () {};
  w.IntersectionObserver = class {
    observe() {} unobserve() {} disconnect() {}
  };
  w.ResizeObserver = class {
    observe() {} unobserve() {} disconnect() {}
  };
  if (!w.Element.prototype.animate) {
    w.Element.prototype.animate = function () {
      const a = { onfinish: null, cancel() {}, finish() {} };
      setTimeout(() => a.onfinish && a.onfinish(), 0);
      return a;
    };
  }

  // The page's own <script src> tags aren't fetched by jsdom without a
  // resource loader, so execute them in order against this document.
  for (const src of ['js/sanity-config.js', 'js/data.js', 'js/sanity-client.js', 'js/main.js']) {
    dom.window.eval(fs.readFileSync(path.join(ROOT, src), 'utf8'));
  }

  // Let the async IIFEs settle.
  await new Promise((r) => setTimeout(r, 120));
  return { dom, errors };
}

test('photography.html renders album covers and throws nothing', async () => {
  const { dom, errors } = await runPage('photography.html');
  assert.deepEqual(errors.map(String), [], 'page threw at runtime');

  const grid = dom.window.document.getElementById('photoGrid');
  assert.ok(grid.classList.contains('album-index'), 'index mode not applied');
  assert.ok(grid.querySelectorAll('a.album-card').length > 0, 'no album covers rendered');
});

test('photography.html?album=… renders that album and throws nothing', async () => {
  const { dom: probe } = await runPage('photography.html');
  const first = probe.window.document.querySelector('a.album-card').getAttribute('href');
  const search = first.slice(first.indexOf('?'));

  const { dom, errors } = await runPage('photography.html', search);
  assert.deepEqual(errors.map(String), [], 'album page threw at runtime');

  const grid = dom.window.document.getElementById('photoGrid');
  assert.ok(grid.classList.contains('album-sheet'), 'sheet mode not applied');
  assert.ok(grid.querySelectorAll('a').length > 0, 'no frames rendered');
  assert.equal(dom.window.document.getElementById('albumMasthead').hidden, false);
});

for (const page of ['index.html', 'project.html', 'info.html', 'archive.html', 'photo-viewer.html']) {
  test(page + ' throws nothing at runtime', async () => {
    const { errors } = await runPage(page);
    assert.deepEqual(errors.map(String), [], page + ' threw at runtime');
  });
}
