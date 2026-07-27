# Highlight Selected Row and Column

## What It Shows

- A custom SpreadJS Designer command to toggle cross-row/column highlighting.
- Adds a ribbon button under `View` for `Highlight Rows and Columns`.
- Draws transparent overlay elements for the active selection area.
- Keeps highlight behavior in sync with selection changes, scrolling, zoom, row/column resize, and sheet switches.

## Files

- `index.html`: static browser entry for the demo.
- `package.json`: local runtime dependencies.
- `src/app.js`: designer initialization and custom command registration.
- `src/crossHighlight.js`: cross highlight rendering and event handling.
- `cross.png`: custom command icon.

## Run

1. Install dependencies from this demo folder or repository root:

   ```bash
   npm install
   ```

2. Serve the repository root or the `samples/` directory with a static server.

3. Open the demo in your browser:

   ```text
   http://localhost:8080/samples/row-column/highlight-selected-row-col/index.html
   ```

> The demo uses `systemjs.config.js` and loads Grapecity SpreadJS packages from `node_modules`.

## Implementation Notes

- The demo uses `@grapecity-software/spread-sheets`, `spread-sheets-designer`, `spread-sheets-tablesheet`, `spread-excelio`, `spread-sheets-charts`, `spread-sheets-print`, `spread-sheets-pdf`, `spread-sheets-barcode`, `spread-sheets-languagepackages`, `spread-sheets-shapes`, `spread-sheets-pivot-addon`, and designer resource packages.
- `src/app.js` creates a ribbon command named `highLightRowsAndColumns` and toggles highlight behavior on click.
- `src/crossHighlight.js` binds to SpreadJS events and renders absolute-positioned overlay divs around the current selection.
- License keys are placeholders in `src/app.js`; replace with valid keys for production or licensed use.
- This demo reuses shared runtime configuration from `samples/shared/systemjs.config.js`.
