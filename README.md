# SpreadJS Practice Samples

This repository collects selected SpreadJS practice demos in a local, easy-to-browse code layout. The catalog follows the public GrapeCity demo menu so users can quickly find the matching online example:

https://demo.grapecity.com.cn/spreadjs/practice/welcome

The goal is to make practical SpreadJS examples easy to find, run, study, and reuse in real projects.

中文说明见 [README.zh-CN.md](README.zh-CN.md).

## What Is Here

- `samples/` organizes examples by category and demo slug.
- `docs/demo-catalog.md` lists the available examples and links to their online counterparts.
- `samples/_template/` shows the recommended shape for a runnable local demo.

## Quick Start

1. Find a demo in `docs/demo-catalog.md`.
2. Open the matching folder under `samples/<category>/<demo-slug>/`.
3. Read that demo's `README.md`.
4. Run the demo according to its local instructions.

Some folders may initially contain only an online demo link while the local code is being organized.

## Demo Rules

Each completed demo should include:

- `README.md` with purpose, source link, files, how to run, and implementation notes.
- `index.html` for the runnable browser entry when the demo is static.
- `src/app.js` or equivalent source files.
- `src/styles.css` when the demo needs custom styling.
- `assets/` for local data, images, workbooks, fonts, or other required files.

Keep folder names aligned with the source URL slug. If a source slug has a typo, keep it for traceability and mention the corrected wording in the demo README.

## SpreadJS License

SpreadJS is a commercial product from GrapeCity. This repository should not commit private license keys or proprietary assets that are not allowed to be redistributed. Prefer documenting required setup in the relevant demo README.
