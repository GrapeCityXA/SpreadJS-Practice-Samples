# Render HTML Content Inside Cells in SpreadJS

This example demonstrates how to create a custom cell type in SpreadJS to render HTML content directly inside cells. By subclassing `GC.Spread.Sheets.CellTypes.Text` and overriding the `paint` method, it leverages the SVG `<foreignObject>` element to convert HTML strings into images, which are then painted onto the Canvas. This allows you to display rich text formatting (such as headings, superscripts, strikethroughs, colors, and shadows) in spreadsheet cells.

This design is suitable for scenarios requiring complex text styling, math formulas, multi-level headers, or styled rich text inside specific cells.

---

## Core Scenarios & Solutions

- **Rich Text Rendering**: Standard cell types do not support HTML tags and CSS styles out of the box. This custom cell type enables HTML rendering inside cells.
- **Styling Variety**: Supports standard HTML styling attributes (font weight, color, strike, superscript/subscript, text shadow) to accommodate complex styling rules.
- **Canvas Rendering Workaround**: The HTML5 Canvas API does not support direct HTML rendering. The SVG + `<foreignObject>` technical workaround elegantly bridges this gap.

---

## Implementation Details

### 1. Define Custom Cell Type

Subclass `GC.Spread.Sheets.CellTypes.Text` using prototype chain inheritance to build `HTMLCellType`:

```javascript
function HTMLCellType() {}
HTMLCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

This inherits the default features of a text cell type while allowing us to override the `paint` method to inject custom rendering behaviors.

### 2. Convert HTML to SVG and to Image

Wrap the HTML contents inside an SVG `<foreignObject>` element, convert the SVG XML string to a Blob URL, and load it into a browser `Image` object:

```javascript
var svgPattern =
  '<svg xmlns="http://www.w3.org/2000/svg" width="{0}" height="{1}">' +
  '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="font:{2}">{3}</div></foreignObject></svg>';

var data = svgPattern
  .replace("{0}", w)
  .replace("{1}", h)
  .replace("{2}", style.font)
  .replace("{3}", value);
var doc = document.implementation.createHTMLDocument("");
doc.write(data);
data = new XMLSerializer().serializeToString(doc.body.children[0]);

img = new Image();
var svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
var url = DOMURL.createObjectURL(svg);
img.src = url;
```

This compiles the HTML string into a well-formed SVG. Using `createHTMLDocument` and `XMLSerializer` guarantees correct markup parsing before turning the content into an image object.

### 3. Caching and Asynchronous Repainting

Store the loaded `Image` reference in the cell's `tag` property to avoid redundant processing on subsequent repaints:

```javascript
var cell = context.sheet.getCell(context.row, context.col);
var img = cell.tag();
if (img) {
  try {
    ctx.save();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, x + 2, y + 2);
    ctx.restore();
    cell.tag(null);
    return;
  } catch (err) {
    // Error handling logic
  }
}
```

Once the image finishes loading, trigger a localized `repaint()` command to draw the image onto the Canvas:

```javascript
img.onload = function () {
  context.sheet.repaint(new GC.Spread.Sheets.Rect(x, y, w, h));
};
```

---

## Technology Stack

- **SpreadJS 15.0.0**: Core spreadsheet component.
- **SystemJS**: Module loader.
- **TypeScript 4.1.2**: Compilation script language.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. Cell `B2` (row index 1, column index 1) displays text formatted with various HTML styles.
2. The cell contains: an `<h1>` header with a strikethrough, a math formula with superscript (`E=mc²`), colored italicized text, and text styled with a drop shadow.
3. The cell automatically handles scaling and drawing of the compiled image based on the row heights and column widths.

---

## Features & Recommendations

### Pros

- **High Flexibility**: Supports standard HTML and inline CSS styles, allowing unlimited formatting combinations.
- **Performance Optimized**: Caches converted image objects in the cell's `tag` state to avoid rendering overhead.
- **Standard-compliant**: Utilizes standard browser SVG, Blob, and HTML5 Canvas features.

### Limitations & Recommendations for Production

- **Async Image Loading Delay**: The first paint triggers an async loading process, which can cause a brief visual flicker or blank cell.
- **Non-interactive Content**: The cell content is painted as a static image. As a result, users cannot select text, double-click to edit the HTML source inside the cell, or trigger mouse hover events on inline links.
- **Recommendations**:
  - Show a placeholder or loading status while the image loads.
  - For cells requiring complex user interaction, consider using floating DOM overlays instead of Canvas painting.
  - Implement a fallback mechanism to render plain text if the browser does not support SVG serialization.

---

## Key Code Snippets

### Configuring the Worksheet Cell

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
  sheetCount: 1,
});
var sheet = spread.getActiveSheet();
sheet.setColumnWidth(1, 300);
sheet.setRowHeight(1, 150);
sheet
  .getCell(1, 1)
  .cellType(new HTMLCellType())
  .value(
    '<h1 style="text-decoration: line-through;">Hello SpreadJS!</h1><h3>E=mc<sup>2</sup></h3><h2><em style="color:red">I</em> like ' +
      '<span style="color:white; text-shadow:0 0 2px blue;">' +
      "Javascript</span></h2><p>aaaa</p>",
  )
  .wordWrap(true);
```

This initializes the workbook, sets cell sizes, instantiates `HTMLCellType`, and updates the cell value with the raw HTML markup.

---

## Summary

This case study shows how to extend SpreadJS cell behaviors. Key learning points:

1. Subclassing built-in cell types to override `paint` hooks.
2. Serializing XML using `XMLSerializer` and utilizing SVG `<foreignObject>` for rendering.
3. Managing rendering queues in Canvas using caching strategies.
4. Handling asynchronous repaints.

This architecture is useful for applications requiring advanced text layout, nested scripts, or styled labels within the grid system.
