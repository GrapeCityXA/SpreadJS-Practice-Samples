# ElementUI-Style Custom Cells in SpreadJS

This example demonstrates how to build custom interactive cell types in SpreadJS styled similarly to ElementUI components. By extending built-in cell configurations, we implement features like mouse-hover color shifts, cursor pointers, and click execution triggers to simulate standard ElementUI buttons.

By inheriting from `GC.Spread.Sheets.CellTypes.Text` and overriding key lifecycle methods, this example implements custom cell rendering, mouse event handling, and visual feedback, offering developers a clean template to insert action buttons directly within cell grids.

---

## Core Scenarios & Solutions

- **Inline Action Buttons**: Spreadsheet rows often require inline buttons like "Edit" or "Delete". Standard hyperlinks or button styles can look disjointed inside cell borders.
- **Unified Design Theme**: Keeps interactive cells consistent with modern web design frameworks (like ElementUI).
- **Responsive Feedback**: Provides a complete interactive experience, including hover state color changes, cursor pointer switches, and click handlers.

---

## Implementation Details

### 1. Extend the Text Cell Type

Subclass the built-in `GC.Spread.Sheets.CellTypes.Text` to preserve standard text cell features while adding custom interactions:

```javascript
function HyperLinkCellType() {
  // Initialize custom cell type attributes
  this._width = 0;
}

HyperLinkCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

### 2. Custom paint (Rendering) Logic

Override the `paint` method to center-align the cell content and save the cell width for coordinate hit testing:

```javascript
HyperLinkCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
  // Center-align the text by default
  style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
  style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
  this._width = w;
  // Call the parent paint logic
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.call(
    this,
    ctx,
    value,
    x,
    y,
    w,
    h,
    style,
    context,
  );
};
```

### 3. Establish the Click Target Area

Implement `getHitInfo` to determine if a mouse action falls within the cell's boundaries:

```javascript
HyperLinkCellType.prototype.getHitInfo = function (
  x,
  y,
  cellStyle,
  cellRect,
  context,
) {
  var info = {
    x: x,
    y: y,
    row: context.row,
    col: context.col,
    cellStyle: cellStyle,
    cellRect: cellRect,
    sheetArea: context.sheetArea,
  };
  // Check if the coordinates fall within the cell dimensions
  if (
    x >= cellRect.x &&
    x <= cellRect.x + this._width &&
    y >= cellRect.y &&
    y <= cellRect.y + cellRect.height
  ) {
    info.isReservedLocation = true; // Mark coordinate as target area
  }
  return info;
};
```

### 4. Manage Mouse Events

Implement three mouse event handlers to provide visual feedback:

**Mouse Move (Hover State):** Update text colors and change the cursor style to a pointer.

```javascript
HyperLinkCellType.prototype.processMouseMove = function (hitInfo) {
  var { sheet, row, col } = hitInfo;
  sheet.getCell(row, col).foreColor("#66b1ff"); // Hover blue
  var div = sheet.getParent().getHost();
  var canvasId = div.id + "vp_vp";
  var canvas = document.getElementById(canvasId);
  if (sheet && hitInfo.isReservedLocation) {
    canvas.style.cursor = "pointer";
    return true;
  } else {
    canvas.style.cursor = "default";
  }
  return false;
};
```

**Mouse Up (Click Action):** Trigger action callbacks when clicking the cell.

```javascript
HyperLinkCellType.prototype.processMouseUp = function (hitInfo) {
  var sheet = hitInfo.sheet;
  if (sheet && hitInfo.isReservedLocation) {
    var { row, col } = hitInfo;
    // Execute cell actions here (e.g. edit, delete data)
    alert(`You clicked the cell at row: ${row}, col: ${col}`);
    return true;
  }
  return false;
};
```

**Mouse Leave (Restore State):** Revert text colors when the cursor leaves the cell.

```javascript
HyperLinkCellType.prototype.processMouseLeave = function (hitInfo) {
  var sheet = hitInfo.sheet;
  if (sheet && hitInfo.isReservedLocation) {
    var { row, col } = hitInfo;
    sheet.getCell(row, col).foreColor("#409eff"); // Standard brand blue
    return true;
  }
  return false;
};
```

### 5. Apply the Cell Type

Instantiate and map the custom cell type to the sheet range:

```javascript
let linkCell = new HyperLinkCellType();

let sheet = spread.getActiveSheet();
sheet.defaults.rowHeight = 40;
sheet
  .getRange(0, 0, 3, 3)
  .cellType(linkCell)
  .value("Edit")
  .foreColor("#409eff");
```

---

## Technology Stack

- **SpreadJS 15.0.0**: Core spreadsheet components.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Script build compiler configurations.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` using a local development web server (e.g. Live Server).

### Steps to Test

1. Open `index.html` in your browser.
2. The sheet will display "Edit" links in the first 3 rows and columns.
3. Hover your cursor over the "Edit" cells. The text color will change from `#409eff` to `#66b1ff`, and the cursor will change to a pointer.
4. Click an "Edit" cell. A popup will show the row and column coordinates of the clicked cell.
5. Move the cursor away from the cell. The text color will revert to the standard `#409eff` blue.

---

## Features & Recommendations

### Pros

- **Interactive Feedback**: Implements hover, click, and leave event handlers to provide a smooth user experience.
- **Cohesive Design**: Uses ElementUI's blue color scheme (`#409eff` and `#66b1ff`) to blend in with modern web applications.
- **Highly Extensible**: Extend `processMouseUp` to perform actions like editing records or opening dialog modals.
- **Optimal Performance**: Leverages hit-testing coordinate checks to prevent unnecessary redrawing.

### Recommendations for Production

- **Backend Integration**: Replace the alert popup inside `processMouseUp` with actual CRUD logic (e.g. triggering API requests).
- **Varying Action Types**: Differentiate between actions (e.g. edit, view, delete) using cell values or custom metadata properties.
- **Vector Icons**: Use the Canvas API to draw SVG icons alongside text inside the cells.
- **Disabled State**: Control whether cells are interactive based on user roles and permissions.

---

## Key Code Snippets

### Color Code References

This template uses standard ElementUI brand colors:

```javascript
// Idle State Color
sheet.getRange(0, 0, 3, 3).foreColor("#409eff");

// Hover State Color
sheet.getCell(row, col).foreColor("#66b1ff");

// Restore State Color
sheet.getCell(row, col).foreColor("#409eff");
```

### Pointer Styling

Access and change the cursor style of the sheet's canvas wrapper element:

```javascript
var div = sheet.getParent().getHost();
var canvasId = div.id + "vp_vp";
var canvas = document.getElementById(canvasId);
if (sheet && hitInfo.isReservedLocation) {
  canvas.style.cursor = "pointer";
} else {
  canvas.style.cursor = "default";
}
```

---

## Summary

This case study shows how to build custom cells in SpreadJS by inheriting from `Text` and overriding lifecycle methods like `paint`, `getHitInfo`, and mouse event handlers. Key takeaways:

1. Creating custom cell types.
2. Customizing cell rendering using the `paint` method.
3. Managing interactions with hover, click, and leave handlers.
4. Styling the parent canvas wrapper cursor.

This pattern is highly useful for building action buttons, interactive links, and custom cell controls.
