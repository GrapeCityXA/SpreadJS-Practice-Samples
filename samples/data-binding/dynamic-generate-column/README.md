# Dynamically Generate Columns Based on Data Structures in SpreadJS

This example demonstrates how to dynamically generate spreadsheet columns in SpreadJS based on the structure of your data source. When the dataset contains an arbitrary or varying number of sub-items (e.g., scoring data from multiple, non-fixed companies), the system dynamically analyzes the records, inserts the appropriate number of columns, and copies templates, styles, and data bindings. This approach is highly suitable for scenarios requiring flexible column generation, such as multi-dimensional evaluation sheets or dynamic reporting grids.

---

## Core Scenarios & Solutions

- **Variable Sub-items (Dynamic Column Count)**: Business data contains varying quantities of sub-items (e.g., scores for a varying number of companies) that must generate corresponding column layouts on the fly.
- **Template-based Styling**: New columns must preserve the exact same styles, numeric formats, and cell configurations as the template columns.
- **Data Flattening**: Nested arrays in JSON objects (such as a nested `company` list) must be mapped to flat key-value pairs to fit SpreadJS's flat data binding mechanism.
- **Automatic Table Expansion**: Dynamically added columns must sync with the worksheet Table coordinates, automatically resizing Table ranges and column bindings.

---

## Implementation Details

### 1. Label Template Columns Using Tags

Mark target columns that should serve as templates using the cell's `tag` property:

```javascript
// Label dynamic columns inside the template JSON configuration
"columnDataArray": [
  null, null, null,
  { "style": "__builtInStyle11" },
  { "style": "__builtInStyle11" },
  { "style": "__builtInStyle2", "tag": "dynamicColumn" },  // Label template columns
  { "style": "__builtInStyle2", "tag": "dynamicColumn" },
  { "style": "__builtInStyle2" }
]
```

### 2. Analyze Datasets and Insert Columns

Locate the columns flagged as template indicators, calculate the number of additional columns needed based on sub-item counts, and invoke `addColumns()`:

```javascript
// Find indices of columns tagged with "dynamicColumn"
let cols = [];
let startColIndex = 0;
for (let i = 0; i < sheet.getColumnCount(); i++) {
  if (sheet.getTag(-1, i) == "dynamicColumn") {
    if (startColIndex === 0) {
      startColIndex = i;
    }
    cols.push(i);
  }
}

// Add columns corresponding to the quantity of companies
let companies = data.table[0].gongsi;
let addColCount = 0;
for (let i = 0; i < companies.length - 1; i++) {
  sheet.addColumns(range.col + range.colCount, cols.length);
  addColCount += cols.length;
}
```

### 3. Copy Template Styling to New Columns

Execute a `clipboardPaste` command to clone template styling, formats, and configurations onto the new columns:

```javascript
spread.commandManager().execute({
  cmd: "clipboardPaste",
  sheetName: sheet.name(),
  fromSheet: sheet,
  fromRanges: [new GC.Spread.Sheets.Range(1, 5, 2, 2)], // Source templates
  pastedRanges: [new GC.Spread.Sheets.Range(1, 5 + 2, 2, addColCount)], // Target columns
  isCutting: false,
  pasteOption: GC.Spread.Sheets.ClipboardPasteOptions.all,
});
```

### 4. Flatten Nested Data Structures

Convert hierarchical array structures into flat key-value attributes inside the JSON object to accommodate SpreadJS's `CellBindingSource` requirements:

```javascript
// Map nested company arrays to flat keys
data.table.forEach(function (item) {
  for (let i = 0; i < item.gongsi.length; i++) {
    item["gongsi_" + item.gongsi[i].name + "_pingjia"] = item.gongsi[i].pingjia;
    item["gongsi_" + item.gongsi[i].name + "_quanzhong"] =
      item.gongsi[i].quanzhong;
  }
});
```

### 5. Configure Table Column Bindings

Set the `dataField` values for the dynamically appended columns to link them to the flattened data keys:

```javascript
for (let i = range.col, j = 0; i < range.col + range.colCount; i++) {
  if (table.getColumnDataField(i).length == 0) {
    j = j == 0 ? i : j;
    table.setColumnDataField(i, columns[i - j - range.col]);
  }
}
```

### 6. Performance Optimization

Enclose batch updates within suspension brackets to prevent performance drops from rendering cycles and formula evaluations:

```javascript
spread.suspendPaint(); // Suspend repainting
spread.suspendCalcService(false); // Suspend formula calculations
sheet.suspendDirty(); // Suspend dirty flag evaluations

// ... Perform batch insertions, style pasting, and data bindings ...

sheet.resumeDirty();
spread.resumePaint();
spread.resumeCalcService(true);
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **jQuery 3.1.1**: Event triggers.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Typed configurations.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. You will see a pre-designed spreadsheet containing base fields (index, type, department, factor, weight) and two columns serving as templates.
2. Click the **Bind** (or "绑定") button.
3. The script analyzes the data source to determine the company count (3 companies in this demo).
4. The grid automatically inserts 4 new columns (2 template columns duplicated 2 times).
5. Style configurations are copied onto the new columns.
6. Column headers are renamed with company names.
7. Data binding is resolved, and cell values are populated.
8. Duplicate values in "Type" and "Department" columns are merged automatically.

---

## Features & Recommendations

### Pros

- **High Adaptability**: Layouts adjust dynamically at runtime depending on database records without requiring manual grid rebuilds.
- **Style Consistency**: Copying with `clipboardPaste` ensures all borders, colors, and decimal formats match the templates.
- **Render Tuning**: Bundling transactions prevents paint flashes and browser freezing.
- **Targeted Operations**: Using `tag` identifiers provides a decoupled mapping technique.

### Recommendations for Production

- **Dynamic Template Lookups**: Instead of hardcoding template indices, locate them programmatically by scanning for columns containing `"dynamicColumn"` tags.
- **Handling Uneven Rows**: Ensure the data flattening loop gracefully handles cases where some rows contain more sub-items than others.
- **Advanced Enhancements**:
  - Add animations or indicators for large file operations.
  - Implement column removal actions and bindings reset.

---

## Summary

This case study shows how to build dynamic grid structures in SpreadJS. Key takeaways:

1. Labeling cell properties using `tag` markers.
2. Resizing Tables and columns using `addColumns` and `tables.resize`.
3. Bulk copying styling using `clipboardPaste` transactions.
4. Mapping hierarchal JSON sources to flat tables.
5. Managing performance using paint suspension blocks.

This architecture is useful for building dashboards, customizable financial grids, and multi-factor evaluation sheets.
