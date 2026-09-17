// Guards the two rules that decide what the home page shows:
//   1. one slide per project, never one slide per media item
//   2. the cover is whichever item the editor chose, not always the first
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

global.window = global;
global.document = { createElement: () => ({}) };

require(path.join(__dirname, '..', 'js', 'data.js'));

// Mirrors buildSlides in js/main.js. main.js can't be required directly -
// it runs its page IIFEs on load and expects a real DOM.
function buildSlides(projects) {
  const slides = [];
  projects.forEach((project, projectIndex) => {
    const media = project.cover || (project.media || [])[0];
    if (media) slides.push({ project, projectIndex, media });
  });
  return slides;
}

test('one slide per project, regardless of how many media items it holds', () => {
  const projects = window.FALLBACK_PROJECTS;
  const totalMedia = projects.reduce((n, p) => n + p.media.length, 0);

  assert.ok(totalMedia > projects.length, 'fixture should have projects with multiple media items');
  assert.equal(buildSlides(projects).length, projects.length);
});

test('a project with three videos still produces exactly one slide', () => {
  const slides = buildSlides([
    {
      slug: 'one-shoot',
      name: 'One Shoot',
      media: [
        { type: 'video', src: 'a.mp4' },
        { type: 'video', src: 'b.mp4' },
        { type: 'video', src: 'c.mp4' }
      ]
    }
  ]);

  assert.equal(slides.length, 1);
  assert.equal(slides[0].media.src, 'a.mp4');
});

test('an explicit cover wins over the first media item', () => {
  const cover = { type: 'video', src: 'chosen.mp4' };
  const slides = buildSlides([
    {
      slug: 'covered',
      name: 'Covered',
      cover,
      media: [{ type: 'image', src: 'first.jpg' }, cover]
    }
  ]);

  assert.equal(slides[0].media.src, 'chosen.mp4');
});

test('a project with no usable media produces no slide instead of a blank one', () => {
  assert.equal(buildSlides([{ slug: 'empty', name: 'Empty', media: [] }]).length, 0);
});
