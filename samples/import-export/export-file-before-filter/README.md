# Export Original Unfiltered Data in SpreadJS

This example demonstrates how to export a spreadsheet as an Excel workbook containing its complete, unfiltered data, even if row filters have been applied by the user in the UI. By creating an in-memory duplicate of the active workbook and resetting its filters before export, the system downloads the full dataset without affecting the user's active screen state.

---

## Core Scenarios & Solutions

In web-based spreadsheet applications, developers often encounter the following requirements:

- The user has applied row filters to focus on a subset of the grid data.
- During export, the system is expected to download the complete dataset rather than just the filtered rows.
- The user's screen layout and filter selections must remain completely untouched during the export process.

This example solves this by copying the workbook state to an in-memory replica, clearing the filters on the replica, and triggering the file download from it.

---

## Implementation Details

### 1. Duplicate the Active Workbook

Use `toJSON()` and `fromJSON()` to create an in-memory duplicate of the active workbook. This duplicates all styles, values, and settings without linking them to the screen renderer:

```javascript
// Create an in-memory workbook duplicate
let tempSpread = new GC.Spread.Sheets.Workbook();
tempSpread.fromJSON(spread.toJSON());
```

This ensures that modifications on `tempSpread` do not affect the user interface.

### 2. Reset Filters Across All Sheets

Iterate through the worksheets in the duplicate workbook and reset the active row filters:

```javascript
let count = tempSpread.getSheetCount();
// Loop through sheets to clear filters
for (let i = 0; i < count; i++) {
  let tempSheet = tempSpread.getSheet(i);
  var rowFilter = tempSheet.rowFilter();
  if (rowFilter != null) {
    rowFilter.reset();
  }
}
```

The `rowFilter.reset()` method clears row exclusions, causing all hidden rows to reappear before the export is executed.

### 3. Export the Duplicate Workbook

Invoke the `export()` API on the replica workbook to generate a file Blob, using FileSaver.js to save it locally:

```javascript
// Save the replica workbook
tempSpread.export(
  function (blob) {
    saveAs(blob, "export.xlsx");
  },
  function (e) {
    // Error handling
    console.log(e);
  },
);
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **@grapecity-software/spread-sheets-io 19.0.3**: Excel file import/export handlers.
- **FileSaver.js 2.0.0**: Client-side download assistant.
- **SystemJS 0.19.22**: JavaScript module loading.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Launch the page in your browser. The sheet will display numbers 1 to 7 with row filtering applied.
2. Adjust the column filter using the header dropdowns if desired.
3. Click the **Export Unfiltered File** (or "导出筛选原文件") button.
4. The browser will download `export.xlsx`.
5. Open the downloaded file to verify it contains the full dataset (all numbers 1 to 7) while the browser grid maintains its filtered view.

---

## Features & Recommendations

### Pros

- **Preserves UI State**: Does not alter the user's active filter configuration.
- **Ensures Data Integrity**: Guarantees that exported Excel workbooks contain the complete datasets.
- **Simple & Maintainable**: Implemented using less than 20 lines of clean code.
- **Multi-sheet Support**: Recursively applies filter resets across all tabs inside the workbook.

### Recommendations for Production

- **Provide Export Choices**: Add radio buttons to let users choose between exporting the "Filtered View" or the "Unfiltered Original Data".
- **Confirmation Prompts**: Add a modal confirmation stating that the full dataset will be exported.
- **Support Additional Formats**: Extend the same duplicate workbook approach to export PDF or CSV formats.

---

## Key Code Snippets

### Setting Up Sample Data and Filters

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

// Populate cells
sheet.setValue(1, 0, 1);
sheet.setValue(2, 0, 2);
// ... populate rows 3 through 7

// Establish row filter bounds
let range = new GC.Spread.Sheets.Range(1, 0, 7, 1);
let rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);
```

### Main Export Process

```javascript
document.getElementById("exportFile").onclick = function () {
  // Duplicate workbook and clear filters
  let tempSpread = new GC.Spread.Sheets.Workbook();
  tempSpread.fromJSON(spread.toJSON());

  let count = tempSpread.getSheetCount();
  for (let i = 0; i < count; i++) {
    let tempSheet = tempSpread.getSheet(i);
    var rowFilter = tempSheet.rowFilter();
    if (rowFilter != null) {
      rowFilter.reset();
    }
  }

  // Trigger download
  tempSpread.export(
    function (blob) {
      saveAs(blob, "export.xlsx");
    },
    function (e) {
      console.log(e);
    },
  );
};
```

---

## Summary

This case study shows how to export unfiltered data in SpreadJS using in-memory replication. Key takeaways:

1. Using `toJSON()` and `fromJSON()` to clone workbooks.
2. Iterating through sheet indices inside the workbook.
3. Resetting filters using `rowFilter.reset()`.
4. Triggering client-side file downloads.
5. Preserving the active user interface state during background export tasks.

This approach is highly useful for report generation, inventory spreadsheets, and databases where users work on filtered rows but need to export complete logs.
