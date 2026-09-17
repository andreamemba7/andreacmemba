# Andrea — Portfolio

A static site. No framework, no build step. The HTML, CSS and JS in this
directory are exactly what gets served. Content comes from Sanity at runtime
over the Query API, with `js/data.js` as a demo fallback.

## Deploying to Vercel

Import this repo, then set exactly this:

| Setting | Value |
| --- | --- |
| Framework Preset | **Other** |
| Root Directory | **`./`** (repo root) |
| Build Command | **leave empty** / Override off |
| Output Directory | **`.`** |
| Install Command | **leave empty** |

`vercel.json` already sets `buildCommand: null` and `outputDirectory: "."`,
so if the dashboard and the file disagree, clear the dashboard overrides.

Do **not** point Root Directory at `studio/` — that is a separate Sanity
project with its own deploy (`npx sanity deploy`) and is excluded here via
`.vercelignore`.

## Required after deploying: Sanity CORS

The browser fetches `https://ed20a4ra.api.sanity.io/...` directly from the
visitor's machine. Sanity will block that with a CORS error unless the new
Vercel domain is on the allow list. Every new deployment URL needs adding.

1. https://sanity.io/manage → project `ed20a4ra` → **API** → **CORS origins**
2. Add `https://<your-project>.vercel.app` — **Allow credentials: off**
3. Add any custom domain too
4. Optionally add `http://localhost:8099` for local work

Symptom if you skip this: the site loads but shows the four demo projects
(Lululemon / Nike) instead of real work, and the console logs
`Sanity fetch failed, using demo data instead`.

## Local development

```bash
npm run dev     # serves this directory
npm test        # runs tests/
```

## Content model note: covers

The home slider and the Index grid show **one item per project** — the
cover. Which item that is comes from a `coverIndex` field on the project
document (1-based, defaults to the first item).

Add this to `schemaTypes/project.js` in the Studio:

```js
{
  name: 'coverIndex',
  title: 'Cover (position in Media, 1 = first)',
  type: 'number',
  initialValue: 1,
  validation: Rule => Rule.min(1).integer()
}
```

Until that field exists, `coverIndex` reads as undefined and the first
media item is used — same behaviour as before, no breakage.

## Diagnosing "one slide per video" on the home page

If the home page shows a slide per *video* rather than a slide per
*project*, the cause is in the content, not this code. Run in the console
on the live site:

```js
window.loadProjects().then(p => {
  console.table(p.map(x => ({
    title: x.name,
    slug: x.slug,
    mediaCount: (x.media || []).length,
    types: (x.media || []).map(m => m.type).join(", ")
  })));
  console.log("projects:", p.length, "| slides:", p.filter(x => x.cover || (x.media || [])[0]).length);
});
```

- One row per video, each `mediaCount: 1` → you created a separate project
  document per video in Studio. Merge them into one project's Media array.
- Correct rows but the page still splits them → stale JS cached; hard-refresh.
- Titles repeating → drafts leaking through (already filtered in the GROQ
  query here, so this should no longer happen).
