# Bind Multiple Tables in the Same Row in SpreadJS

This example demonstrates how to create multiple Tables on the same row in SpreadJS and bind different datasets to them. Normally, when multiple Tables reside on the same row, binding data directly can cause cell coordinate overlaps or layout distortions due to dynamic row insertion. This example resolves layout conflicts by dynamically resizing the Table row ranges before executing data bindings.

---

## Core Scenarios & Solutions

When using SpreadJS's Table data binding features, if multiple Tables are located on the same row, you may encounter the following layout issues:

- When data is bound to a Table, it dynamically inserts rows, causing coordinate collisions with adjacent Tables on the same row.
- If multiple Tables are bound to datasets of different lengths, they cannot adjust their row ranges automatically.
- Direct data binding can cause Tables to overlap, leading to corrupted data views.

This example solves this issue by pre-calculating dataset lengths, resizing the Tables using `tables.resize()`, and then binding the dataset paths.

---

## Implementation Details

### 1. Initialize Tables and Map Column Bindings

Create two Tables on row index 6, configure the themes, and define the column field mappings:

```javascript
// Add two Tables on row index 6
var table = sheet.tables.add(
  "tableRecords_1",
  6,
  6,
  1,
  3,
  spreadNS.Tables.TableThemes.light6,
);
var table2 = sheet.tables.add(
  "tableRecords_2",
  6,
  1,
  1,
  4,
  spreadNS.Tables.TableThemes.light6,
);

// Disable automatic column generation
table.autoGenerateColumns(false);
table2.autoGenerateColumns(false);

// Map columns for table
var tableColumn1 = new spreadNS.Tables.TableColumn(1);
tableColumn1.name("Field 1");
tableColumn1.dataField("f1");
// ... configure other columns
table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);

// Map columns for table2
var c1 = new spreadNS.Tables.TableColumn(1);
c1.name("Column 1");
c1.dataField("c1");
// ... configure other columns
table2.bindColumns([c1, c2, c3, c4]);
```

### 2. Wrap Datasets with CellBindingSource

Wrap your data object inside a `CellBindingSource` to support nested paths:

```javascript
var dbData = {
  bindPath_table1: [
    {
      f1: 1,
      f2: 2,
      f3: 3,
    },
    {
      f1: "a",
      f2: "b",
      f3: "c",
    },
  ],
  bindPath_table2: [
    {
      c1: 1,
      c2: 2,
      c3: 3,
      c4: 4,
    },
    {
      c1: "a",
      c2: "b",
      c3: "c",
      c4: "d",
    },
  ],
};

var dataSource = new spreadNS.Bindings.CellBindingSource(dbData);
sheet.setDataSource(dataSource);
```

### 3. Resize Tables and Execute Bindings

Core Solution: Before binding data paths, read the dataset array lengths, calculate the required row sizes, resize the Tables, and bind the data paths:

```javascript
$("#bind").click(function () {
  // Read dataset lengths
  let len1 = dbData.bindPath_table1.length;
  let len2 = dbData.bindPath_table2.length;

  // Resize table
  let range1 = table.range();
  range1.rowCount = len1 + 1; // +1 includes the header row
  sheet.tables.resize(table, range1);

  // Resize table2
  let range2 = table2.range();
  range2.rowCount = len2 + 1;
  sheet.tables.resize(table2, range2);

  // Set binding paths after resizing
  table2.bindingPath("bindPath_table2");
  table.bindingPath("bindPath_table1");
});
```

### 4. Create Custom Header Layouts

Hide the default Table header rows and use merged cells on row index 5 to create custom headers:

```javascript
// Hide row 6 (Table default header row)
sheet.setRowVisible(6, false);

// Design custom headers on row index 5
sheet.addSpan(5, 6, 1, 3); // Merge cells for table
sheet.addSpan(5, 1, 1, 4); // Merge cells for table2
sheet
  .getCell(5, 6)
  .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
  .value("table");
sheet
  .getCell(5, 1)
  .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
  .value("table2");
```

---

## Technology Stack

- **@grapecity-software/spread-sheets**: 15.0.0 (Core Engine).
- **jQuery**: 3.6.1.
- **SystemJS**: 0.19.22.
- **TypeScript**: 4.1.2.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. You will see two empty Table structures (table and table2) placed on the same row.
2. Click the **Bind** (or "绑定") button.
3. Observe both Tables populate their respective datasets. Row counts adapt to the data source size, and there are no cell overlaps.

---

## Features & Recommendations

### Pros

- **Prevents Overlapping**: Solves layout collision issues when placing multiple data-bound Tables side-by-side.
- **Dynamic Size Allocation**: Adapts row bounds dynamically matching dataset sizes.
- **Nested Schema Support**: Leverages `CellBindingSource` to map fields located in nested paths.
- **Custom Headers**: Hides default header bands to allow customized layouts.

### Recommendations for Production

- **Automated Calculations**: Instead of requiring a button click, execute the resizing calculations immediately after the data source is loaded.
- **Live Update Bindings**: Add listeners to the dataset array to recalculate Table dimensions dynamically when items are appended or removed.
- **Universal Resize Module**: Write a helper method to dynamically resize and bind any arbitrary list of Tables on the same row.

---

## Summary

This case study shows how to manage coordinate allocations when placing multiple Tables on the same row. Key lessons:

1. Binding structured datasets to Tables.
2. Managing paths using `CellBindingSource`.
3. Resizing Tables programmatically using `tables.resize()`.
4. Staging operations: resize layout first, then bind database paths.
5. Setting up custom Table header layouts.

This pattern is highly useful for comparing datasets side-by-side, such as financial statements, comparative sales reports, and multi-factor analytics.
