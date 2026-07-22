# Contribution Guide / 示例补充指南

## Process

1. Pick one item from `docs/demo-catalog.md`.
2. Open the matching folder under `samples/`.
3. Copy `samples/_template/` into the demo folder if implementation files are still missing.
4. Add the runnable demo code and assets.
5. Update that demo's `README.md`.
6. Run the demo locally and record the verification result in the README.

## Required Demo README Sections

Each demo README should include:

- Title in Chinese and English when practical.
- Online demo link.
- What the demo shows.
- Files in this demo.
- How to run it locally.
- Key APIs or concepts.
- Notes for license, assets, browser compatibility, or known limitations.

## Naming

Use the source category and demo slug in paths:

```text
samples/<source-category-slug>/<source-demo-slug>/
```

This makes it easy to compare a local demo with:

```text
https://demo.grapecity.com.cn/spreadjs/practice/<source-category-slug>/<source-demo-slug>
```

## Preservation

Generated catalog files can be refreshed by maintainers. Demo source files and hand-written README content should be preserved. The sync script does not overwrite existing demo README files unless `-Force` is passed.
