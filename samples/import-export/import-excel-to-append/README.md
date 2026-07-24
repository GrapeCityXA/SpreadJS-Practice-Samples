# Append Imported Excel Files in SpreadJS Designer

This example demonstrates how to implement an append-import feature in SpreadJS Designer for Excel spreadsheets. When a user opens a new Excel file, a confirmation dialog prompts them to choose "File Append Mode". If selected, the workbook appends all worksheets from the newly opened file to the active workbook instead of overwriting the existing content. This solution is ideal for business workflows requiring the consolidation of multiple Excel files into a single workbook.

---

## Core Scenarios & Solutions

This example addresses the following common spreadsheet processing requirements:

- **Workbook Consolidation**: Gathering and combining sheets from multiple independent Excel files into a single workbook for aggregated analysis.
- **Data Protection**: Traditional file imports completely replace the current workspace; append mode preserves the existing tabs.
- **Interactive Choice**: Employs user prompts to dynamically decide between overwrite or append actions.

---

## Implementation Details

### 1. Intercept File Opening Event

Intercept the file opening pipeline inside the Designer by listening to the `FileLoading` event, allowing custom procedures to execute prior to rendering:

```javascript
designer.bind(GC.Spread.Sheets.Designer.Events.FileLoading, (event, args) => {
  let isAdd = confirm("Do you want to use File Append Mode?");
  if (isAdd) {
    // Custom append logic
    args.cancel = true; // Intercept and cancel default open behavior
    designer.setData("FileMenu_show", false);
  }
});
```

### 2. Intermediate Workbook Transfer

Use a temporary `midSpread` workbook container to stage the imported file data, then clone the sheets sequentially into the active workbook:

```javascript
let midSpread = new GC.Spread.Sheets.Workbook();

midSpread.fromJSON(args.data);
for (let i = 0; i < midSpread.getSheetCount(); i++) {
  let sheet = new GC.Spread.Sheets.Worksheet("newsheet");
  sheet.fromJSON(midSpread.getSheet(i).toJSON());
  spread.addSheet(0, sheet);
}
```

This procedure performs deep cloning of worksheets through JSON serialization and deserialization, preserving structural integrity.

### 3. Initialize Source Worksheet Data

Populate the workbook with a template sheet named "Source Data" during initialization to facilitate user testing:

```javascript
let spread = designer.getWorkbook();
let activeSheet = spread.getActiveSheet();
activeSheet.name("Source Data");
activeSheet.setArray(0, 0, [
  [123, 34, 890],
  [899, 221, 990],
]);
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet engine.
- **SpreadJS Designer 15.0.0**: Interactive designer component.
- **SpreadJS ExcelIO 15.0.0**: File importing and exporting handlers.
- **TypeScript 4.1.2**: Script compile configurations.
- **SystemJS 0.19.22**: JavaScript module loading.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. The designer will display a sheet named "Source Data" populated with template numbers.
2. Click the **File** menu in the ribbon and select **Open**.
3. Select an Excel file from your computer.
4. A confirmation modal will appear: "Do you want to use File Append Mode?"
   - Click **OK**: All sheets in the opened file are appended to the active workbook tabs.
   - Click **Cancel**: The editor defaults to overwrite mode, replacing the current tabs with the opened file.
5. If appended, verify that the new worksheets appear in the sheet tab list at the bottom.

---

## Features & Recommendations

### Pros

- **Interactive Options**: Provides choices dynamically via prompt boxes.
- **Safety**: Appending prevents users from accidentally deleting their active worksheet configurations.
- **Lightweight Implementation**: Built using clean event intercepts and JSON copies.

### Limitations & Recommendations for Production

Consolidating workbooks can trigger complex layout conflicts. The basic implementation here has the following limitations:

- **Name Collision**: Sheets with identical names inside both workbooks will trigger rendering errors.
- **Cross-sheet Formulas**: Cell formula references referencing other sheets in the imported file may break.
- **Name Manager Conflicts**: Named ranges, tables, and chart indices may conflict.
- **Style Overlays**: Imported custom style definitions may not merge cleanly.

**Recommendations:**

- Write naming collision resolvers (e.g., auto-appending suffixes like `_1` to duplicate sheet names).
- Update formula parsing routines to correct sheets coordinates.
- Add conflict-check dialogs prior to copying sheets.
- See the detailed discussion and solutions on the GrapeCity Help Forum: [GrapeCity Chinese Forum Thread](https://gcdn.grapecity.com.cn/forum.php?mod=viewthread&tid=142037).

---

## Summary

This case study shows how to implement custom import actions in the SpreadJS Designer. Key takeaways:

1. Binding event listeners to the Designer's `FileLoading` event.
2. Copying data safely using a staging workspace.
3. Performing deep cloning using sheet `fromJSON`/`toJSON` methods.
4. Managing resource and reference conflicts.

This approach is highly useful for report assemblers, document consolidators, and data review tools where users merge multiple file logs into a single analysis dashboard.
