# Get the Value of Merged Cells in SpreadJS

This example demonstrates how to correctly retrieve cell values from merged ranges in SpreadJS. In SpreadJS, only the top-left cell of a merged range stores the actual value; other cells within the merged block return `null`. This guide provides a helper method to resolve the value of the top-left cell using coordinates from any arbitrary cell within that merged range.

---

## Core Scenarios & Solutions

When working with merged cells in SpreadJS, developers often face the following issues:

- Accessing non-top-left cells inside a merged range using standard `getValue()` returns `null`, even though the value is visually displayed.
- Retrieving cell values requires manual checks to verify if coordinates belong to a merged range.
- Batch processing or exporting requires a consistent method to resolve the actual values of cells.

This example solves these issues by providing a helper function that checks if a cell is merged and automatically resolves its actual value.

---

## Implementation Details

### 1. Initialize Merged Ranges

Create merged cell ranges using the `addSpan()` method and apply values:

```javascript
// Create a merged range starting at (0,0) spanning 5 rows and 5 columns
sheet.addSpan(0, 0, 5, 5);
sheet.setText(0, 0, "grapecity");
sheet.getCell(0, 0).backColor("lightblue");

// Create a second merged range starting at (7,7) spanning 2 rows and 2 columns
sheet.addSpan(7, 7, 2, 2);
sheet.setText(7, 7, "spreadjs");
sheet.getCell(7, 7).backColor("#cccc66");
```

`addSpan(row, col, rowCount, colCount)` parameters:

- `row`: Start row index.
- `col`: Start column index.
- `rowCount`: Number of rows to merge.
- `colCount`: Number of columns to merge.

### 2. Detect Merged Cells

Check if a cell is part of a merged range using the `getSpan()` method:

```javascript
function myGetValue(sheet, row, col) {
  let spanInfo = sheet.getSpan(row, col);
  if (spanInfo) {
    // If the cell is merged, return the value of the top-left cell
    return sheet.getValue(spanInfo.row, spanInfo.col);
  } else {
    // If the cell is not merged, return the value of the cell itself
    return sheet.getValue(row, col);
  }
}
```

`getSpan()` return values:

- Returns an object containing the coordinates (`row`, `col`, `rowCount`, `colCount`) if the cell is inside a merged range.
- Returns `null` if the cell is not merged.

### 3. Handle UI Interaction

Create inputs and button click listeners to test the helper function:

```javascript
document.getElementById("get_value").onclick = () => {
  let row = parseInt(document.getElementById("row").value);
  let col = parseInt(document.getElementById("col").value);
  if (!isNaN(row) && !isNaN(col)) {
    alert(myGetValue(sheet, row, col));
  } else {
    alert("Please input a valid row index and column index.");
  }
};
```

---

## Technology Stack

- **SpreadJS v15.0.0**: Core spreadsheet components.
- **SystemJS v0.19.22**: JavaScript module loading.
- **TypeScript v4.1.2**: Script build compiler configurations.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. Two merged ranges will be displayed:
   - Range 1: cells `(0,0)` to `(4,4)` displaying "grapecity" with a light blue background.
   - Range 2: cells `(7,7)` to `(8,8)` displaying "spreadjs" with a yellow background.
2. Enter a row index (e.g. `2`) in the input box.
3. Enter a column index (e.g. `3`) in the input box.
4. Click **Get Value**. An alert will display the value of the cell.
5. Testing recommendations:
   - Entering coordinates within the first merged range (e.g. row 2, col 3) will return `"grapecity"`.
   - Entering coordinates outside the merged ranges (e.g. row 10, col 10) will return the cell value or `null`.
   - Entering coordinates within the second merged range (e.g. row 7, col 8) will return `"spreadjs"`.

---

## Features & Recommendations

### Pros

- **Clean Implementation**: The helper function `myGetValue()` is short and easy to maintain.
- **Universal Application**: Works for any cell coordinates, automatically handling both merged and unmerged cells.
- **Non-intrusive**: Integrates into existing projects without modifying built-in SpreadJS APIs.
- **Optimal Performance**: Leverages the native `getSpan()` method to avoid manual cell traversal.

### Recommendations for Production

- **Batch Processing**: Extend the helper function to query ranges of cells.
- **Formula Cells**: Add checks to resolve formulas inside merged cells using `getFormula()`.
- **Custom Utility Plugin**: Package this method inside a helper utility class to easily reuse it across different projects.

---

## Key Code Snippets

### Core Value Resolution Logic

```javascript
/**
 * Resolves the actual value of a cell, handling merged ranges automatically.
 * @param {Worksheet} sheet - The SpreadJS Worksheet instance
 * @param {number} row - The row index
 * @param {number} col - The column index
 * @returns {*} The actual cell value
 */
function myGetValue(sheet, row, col) {
  // Check if the coordinate lies inside a merged cell span
  let spanInfo = sheet.getSpan(row, col);

  if (spanInfo) {
    // If it is merged, return the value from the top-left cell of the span
    return sheet.getValue(spanInfo.row, spanInfo.col);
  } else {
    // If it is not merged, return the value of the cell itself
    return sheet.getValue(row, col);
  }
}
```

---

## Summary

This case study shows how to get cell values from merged ranges in SpreadJS. Key takeaways:

1. Understanding SpreadJS's merged cell data storage (where only the top-left cell holds the value).
2. Using the `addSpan()` and `getSpan()` APIs.
3. Writing a helper function to resolve cell values.
4. Customizing styling and background colors for merged cells.

This approach is highly useful for exporting data, validating cells, and processing sheet inputs.
