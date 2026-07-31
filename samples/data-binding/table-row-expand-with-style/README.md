# Auto-Expand Table Rows and Copy Styles in SpreadJS

This example demonstrates how to automatically expand a table area in SpreadJS during data binding while maintaining style consistency for cells outside the table bounds. When binding data to a worksheet using `CellBindingSource`, the table automatically expands its row count. The system then copies the styles of the cells outside the table bounds row-by-row, ensuring a unified visual layout across the entire worksheet.

This solution is useful for scenarios requiring dynamic data binding while keeping the styling of surrounding worksheet areas consistent as the table grows.

---

## Core Scenarios & Solutions

In web spreadsheets, dynamic data binding often introduces the following layout issues:

- When a table automatically expands its row bounds to fit a dataset, newly inserted rows can disrupt the surrounding sheet styles.
- Cell styles outside the table area are not automatically copied or expanded along with the table, creating inconsistent visual gaps in adjacent columns.
- Manually adjusting styles after a table expands increases development overhead.

This example solves these issues by enabling automatic row expansion on the table and automatically copying unbound region styles after data binding completes.

---

## Implementation Details

### 1. Enable Table Auto-Expansion

Call `expandBoundRows(true)` on the table instance to allow the table to dynamically insert rows to fit the bound dataset:

```javascript
let table1 = sheet.tables.findByName("gcTable0");
// Allow auto-expansion
table1.expandBoundRows(true);
```

This API configures the table to automatically add or remove rows based on the size of the bound dataset.

### 2. Bind the Data Source

Wrap your raw JSON data inside a `CellBindingSource` and bind it to the worksheet using `setDataSource`:

```javascript
let data = {
  test: [
    { one: 1, two: 2, three: 3, four: 4 },
    { one: 1, two: 2, three: 3, four: 4 },
    { one: 1, two: 2, three: 3, four: 4 },
    { one: 1, two: 2, three: 3, four: 4 },
    { one: 1, two: 2, three: 3, four: 4 },
  ],
};
let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
sheet.setDataSource(source);
```

The `test` property of the data object maps to the table's `bindingPath`, allowing SpreadJS to map each object in the array to a table row.

### 3. Copy Styles for Unbound Columns

After binding data, call the custom `copyTableStyle` helper function to copy styles down column-by-column for cells outside the table bounds:

```javascript
function copyTableStyle(sheet, table) {
  let range = table.dataRange();
  let tableCols = isTableArea(range);
  sheet.suspendPaint();
  for (let i = 0; i < range.rowCount - 1; i++) {
    for (let j = 0; j < sheet.getColumnCount(); j++) {
      // Check if the column is outside the table bounds
      if (tableCols.indexOf(j) === -1) {
        sheet.copyTo(
          range.row + i,
          range.row + i + 1,
          j,
          j,
          1,
          1,
          GC.Spread.Sheets.CopyToOptions.style,
        );
      }
    }
  }
  sheet.resumePaint();
}
```

**Key Points:**

- Retrieves the data range boundaries of the target table.
- Suspends repainting using `suspendPaint()` to optimize rendering performance.
- Iterates through the expanded rows. For columns outside the table's column range, it copies cell styles from the previous row to the current row using `copyTo()`.
- Resumes repainting using `resumePaint()`.

### 4. Detect Table Columns

Use the helper function `isTableArea` to generate an array of column indices occupied by the table. This is used to skip copying styles inside the table area:

```javascript
function isTableArea(range) {
  let cols = [];
  for (let i = 0; i < range.colCount; i++) {
    cols.push(range.col + i);
  }
  return cols;
}
```

---

## Technology Stack

- **@grapecity-software/spread-sheets**: 15.0.0 (Core Engine).
- **SystemJS**: 0.19.22 (Module Loader).
- **TypeScript**: 4.1.2.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open `index.html` in your browser. The page will load a worksheet containing a predefined table.
2. Click **Bind Data** at the top of the page.
3. Observe the table automatically expand to display the bound dataset. The styles of the cells adjacent to the table will copy downward, keeping the layout consistent.

---

## Features & Recommendations

### Pros

- **Automation**: Data binding and style copying run automatically, removing the need to manually recalculate sheet dimensions.
- **Performance**: Suspending repainting using `suspendPaint()` and `resumePaint()` minimizes layout reflows.
- **Consistent Layout**: Ensures adjacent columns expand their styles along with the table.

### Recommendations for Production

- **Alternating Rows**: If your worksheet uses alternating row colors (e.g. zebra striping) outside the table, update the `copyTableStyle` logic to apply styles conditionally based on row index parity.
- **Multiple Tables**: If your worksheet contains multiple tables, call the style copying logic for each table separately.
- **Custom Plugin**: Package this utility as a custom SpreadJS plugin to easily reuse it across different projects.

---

## Summary

This case study shows how to expand table rows and maintain style consistency in SpreadJS. Key takeaways:

1. Enabling dynamic row expansion using `expandBoundRows`.
2. Mapping datasets to tables using `CellBindingSource`.
3. Copying cell styles programmatically using `copyTo`.
4. Optimizing rendering performance using `suspendPaint` and `resumePaint`.

This approach is highly useful for corporate report builders, invoice generators, and data entry templates where table growth must not break surrounding sheet designs.

---
