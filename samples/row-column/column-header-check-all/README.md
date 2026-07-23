# Add a "Select All" Checkbox to Column Headers in SpreadJS

This example demonstrates how to add a custom checkbox to a column header in SpreadJS to implement a "Select All" / "Deselect All" function for that column. By creating a custom `CellType` subclass that inherits from the built-in `CheckBox` type and overriding its rendering and mouse interaction behaviors, we achieve a bidirectional sync between the header checkbox and the data row checkboxes.

This design pattern is commonly used in tabular interfaces requiring bulk actions, such as task checklists, permission grids, or data management wizards.

---

## Core Scenarios & Solutions

- **Batch Execution Efficiency**: Users can select or deselect an entire column of checkboxes in a single click, eliminating the need to click checkboxes row by row.
- **State Synchronization**: The header checkbox dynamically updates its checked state based on the status of data checkboxes (all checked, none checked, or partially checked).
- **Custom Cell Type Development**: Demonstrates how to inherit from SpreadJS's built-in CellType configurations to write custom interactions.

---

## Implementation Details

### 1. Extend the Checkbox Cell Type

Define a custom `MyCheckBoxCellType` constructor inheriting from `GC.Spread.Sheets.CellTypes.CheckBox` to manage column header checkboxes:

```javascript
function MyCheckBoxCellType() {
  GC.Spread.Sheets.CellTypes.CheckBox.apply(this);
  this.caption("All");
}
MyCheckBoxCellType.prototype = new GC.Spread.Sheets.CellTypes.CheckBox();
```

**Key Points:**

- Invoke the parent constructor to initialize checkbox states.
- Set the checkbox label caption to `"All"` to represent the "Select All" function.
- Establish prototype inheritance to reuse parent methods.

### 2. Override paint to Draw Checked State

Override the `paint` method so that the checkbox display state is controlled by the cell's `tag` property instead of its `value`:

```javascript
var basePaint = GC.Spread.Sheets.CellTypes.CheckBox.prototype.paint;
MyCheckBoxCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  width,
  height,
  style,
  context,
) {
  var tag = context.sheet.getTag(context.row, context.col, context.sheetArea);
  if (tag !== true) {
    tag = false;
  }
  basePaint.apply(this, [ctx, tag, x, y, width, height, style, context]);
};
```

**Key Actions:**

- Save a reference to the parent `paint` implementation.
- Retrieve the checkbox state from the cell's `tag`.
- Pass the `tag` state to the parent painter for rendering.

### 3. Handle Clicks to Select/Deselect All Rows

Override the `processMouseUp` method to detect when the header checkbox is clicked. This loops through all checkboxes in the column and updates their values to match:

```javascript
MyCheckBoxCellType.prototype.processMouseUp = function (hitInfo) {
  var sheet = hitInfo.sheet,
    row = hitInfo.row,
    col = hitInfo.col,
    sheetArea = hitInfo.sheetArea;

  // Check sheet protection
  if (
    sheet.getCell(0, 0, GC.Spread.Sheets.SheetArea.colHeader).locked() &&
    sheet.options.isProtected
  ) {
    return;
  }

  // Toggle tag status
  var tag = sheet.getTag(row, col, sheetArea);
  if (tag === undefined || tag === null) {
    sheet.setTag(row, col, true, sheetArea);
  } else {
    sheet.setTag(row, col, !tag, sheetArea);
  }

  // Update all row checkboxes in this column
  tag = sheet.getTag(row, col, sheetArea);
  sheet.suspendPaint();
  for (var i = 0; i < sheet.getRowCount(); i++) {
    var cell = sheet.getCell(i, col);
    if (cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
      cell.value(tag);
    }
  }
  sheet.resumePaint();
};
```

**Key Actions:**

- Suspend sheet painting using `suspendPaint()` to optimize bulk updates.
- Loop through rows, updating cell values if they use the `CheckBox` cell type.
- Maintain the header's selection state within the cell's `tag` property.

### 4. Sync Header State from Row Clicks

Bind an event handler to the `ButtonClicked` event. When a user clicks a checkbox in the grid body, scan the column to update the header checkbox state dynamically:

```javascript
spread.bind(GC.Spread.Sheets.Events.ButtonClicked, function (e, args) {
  var sheet = args.sheet,
    row = args.row,
    col = args.col;
  var cellType = sheet.getCellType(row, col);
  if (cellType instanceof GC.Spread.Sheets.CellTypes.CheckBox) {
    var colHeaderCell = sheet.getCell(
      0,
      col,
      GC.Spread.Sheets.SheetArea.colHeader,
    );
    if (colHeaderCell.cellType() instanceof MyCheckBoxCellType) {
      var checkStatus = true;
      for (var i = 0; i < sheet.getRowCount(); i++) {
        var cell = sheet.getCell(i, col);
        if (
          cell.cellType() instanceof GC.Spread.Sheets.CellTypes.CheckBox &&
          !cell.value()
        ) {
          checkStatus = false;
          break;
        }
      }
      colHeaderCell.tag(checkStatus);
      sheet.repaint();
    }
  }
});
```

**Key Actions:**

- If any checkbox in the column is unchecked, the header checkbox tag is set to `false`.
- The header is marked as checked (`tag = true`) only when every checkbox in the column is checked.
- Trigger `sheet.repaint()` to update the header checkbox rendering.

---

## Technology Stack

- **SpreadJS 16.0.1**: Core spreadsheet component.
- **jQuery 3.3.1**: Helper library for DOM utilities.
- **SystemJS**: Module loader.
- **TypeScript 4.1.2**: Script configurations.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Load the page in your browser. You will see a table with 8 checkboxes in the first column.
2. Click the `"All"` checkbox in the column header. All checkboxes in the column will be checked.
3. Click the `"All"` checkbox again. All checkboxes in the column will be unchecked.
4. Toggle individual checkboxes in the column body. Note how the header checkbox checked state automatically toggles to match.

---

## Features & Recommendations

### Pros

- **Bidirectional Sync**: Automatically syncs state changes in both directions (header to rows, rows to header).
- **Optimized Rendering**: Uses `suspendPaint()` and `resumePaint()` to prevent rendering lags during bulk updates.
- **Highly Extensible**: Subclassing standard cell types serves as a base pattern for other custom cell elements.

### Limitations & Recommendations for Production

- **Column Restriction**: The current implementation handles a single target column. For multiple columns, update the script to map indexes dynamically.
- **Indeterminate State**: Consider adding an indeterminate state (dash icon) in the header when only some rows are selected, matching Excel's behavior.

---

## Key Code Snippets

### Disable Header Cell Editing

```javascript
MyCheckBoxCellType.prototype.createEditorElement = function () {
  return null;
};
```

By returning `null`, we prevent the column header checkbox from entering edit mode, ensuring it functions strictly as a controller button.

### Hit Testing Configuration

```javascript
MyCheckBoxCellType.prototype.getHitInfo = function (
  x,
  y,
  cellStyle,
  cellRect,
  context,
) {
  if (context) {
    return {
      x: x,
      y: y,
      row: context.row,
      col: context.col,
      cellRect: cellRect,
      sheetArea: context.sheetArea,
      isReservedLocation: true,
      sheet: context.sheet,
    };
  }
  return null;
};
```

Specifying `isReservedLocation: true` ensures that click coordinates are correctly routed to our overridden `processMouseUp` handler.

---

## Summary

This case study shows how to build custom cell interactions by subclassing built-in classes. Key lessons:

1. Subclassing and extending existing SpreadJS CellTypes.
2. Utilizing the cell `tag` property to manage custom component states.
3. Creating bidirectional listeners to link UI elements.
4. Tuning performance using `suspendPaint()` and `resumePaint()`.
