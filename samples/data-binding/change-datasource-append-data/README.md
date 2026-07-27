# Change and Append Data Sources in SpreadJS Tables

This example demonstrates how to dynamically manage data source bindings for Tables in SpreadJS. By leveraging `CellBindingSource` to enable bidirectional data binding, it showcases two core operations: replacing the entire dataset bound to a Table, and appending new records to an existing dataset. The example sets up a Table with automatic calculation formulas, allowing users to update the spreadsheet contents in real time via button interactions.

This design is suitable for scenarios requiring dynamic data updates, such as live monitoring dashboards, real-time reporting tables, and incremental data loading systems.

---

## Core Scenarios & Solutions

- **Dynamic Data Source Swapping**: Fully swapping out the dataset bound to a Table without rebuilding the Table structure.
- **Incremental Data Appending**: Appending new rows to an existing dataset, causing the Table to automatically expand.
- **UI-Data Syncing**: Utilizing data-binding frameworks to ensure grid views redraw automatically when the underlying JSON payload changes.
- **Automatic Calculations**: Automatically recalculating formulas in calculated columns and summary footer rows when data shifts.

---

## Implementation Details

### 1. Wrap Datasets with CellBindingSource

SpreadJS Table binding requires wrapping raw data inside a `CellBindingSource` object to support two-way bindings and automated state updates:

```javascript
// Raw dataset configuration
var dataSource = {
  bindPath_table2: [
    {
      c1: 1,
      c2: 2,
      c3: 3,
      c4: 4,
    },
    {
      c1: Math.floor(Math.random() * 50),
      c2: Math.floor(Math.random() * 50),
      c3: Math.floor(Math.random() * 50),
      c4: Math.floor(Math.random() * 50),
    },
  ],
};

// Wrap with CellBindingSource
var dataSource1 = new spreadNS.Bindings.CellBindingSource(dataSource);

// Bind the wrapped data source to the worksheet
sheet.setDataSource(dataSource1);
```

The `CellBindingSource` monitors mutations in the data object and triggers grid refreshes automatically.

### 2. Configure Column Bindings and Formulas

Define Table columns, map them to data attributes, and configure calculated columns and footer total formulas:

```javascript
// Add a Table
var table2 = sheet.tables.add(
  "tableRecords_2",
  6,
  1,
  1,
  5,
  spreadNS.Tables.TableThemes.light6,
);
table2.showFooter(true);
table2.autoGenerateColumns(false);

// Define columns and map to data keys
var c1 = new spreadNS.Tables.TableColumn(1);
c1.name("Column 1");
c1.dataField("c1");
// ... configure columns 2 through 4

// Add column 5 as a summary column
var c5 = new spreadNS.Tables.TableColumn(5);
c5.name("Total");

// Bind columns to the Table
table2.bindColumns([c1, c2, c3, c4, c5]);

// Bind the Table to a path in the data source
table2.bindingPath("bindPath_table2");

// Configure row-level formulas (summing columns 1 through 4)
table2.setColumnDataFormula(
  4,
  "=[@Column 1]+[@Column 2]+[@Column 3]+[@Column 4]",
);

// Configure footer formulas (summing totals)
table2.setColumnFormula(4, "=SUBTOTAL(109,[Total])");
```

**Key Points:**

- `autoGenerateColumns(false)` disables automatic columns to allow manual mappings.
- `bindingPath()` points the Table to a specific property inside the data source.
- `setColumnDataFormula()` configures formulas for data rows.
- `setColumnFormula()` configures formulas for footer rows.

### 3. Swap Data Sources Dynamically

Modify the property reference inside the raw data object and call `bindingPath()` to trigger a repaint:

```javascript
$("#bind").click(function () {
  // Replace the data source property
  dataSource.bindPath_table2 = bindPath_table;

  // Refresh bindings
  table2.bindingPath("bindPath_table2");
});
```

This replaces the data contents completely, and the Table automatically resizes row bounds to match the new dataset size.

### 4. Append Data Automatically

Push new elements onto the data array and refresh the path binding:

```javascript
$("#add").click(function () {
  // Push new record
  dataSource.bindPath_table2.push({
    c1: Math.floor(Math.random() * 100),
    c2: Math.floor(Math.random() * 10),
    c3: Math.floor(Math.random() * 20),
    c4: Math.floor(Math.random() * 50),
  });

  // Refresh bindings
  table2.bindingPath("bindPath_table2");
});
```

The Table appends a new row at the bottom and copies formulas onto it.

---

## Technology Stack

- **SpreadJS 15.0.0**: Core spreadsheet engine.
- **jQuery 3.6.1**: Event triggers.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Script build compiler setups.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. You will see a Table loaded with 4 value columns and 1 sum column.
2. Click **Swap Table Datasource** (or "替换 table 数据源"). The data inside the Table will swap to a new dataset.
3. Click **Append Table Datasource** (or "追加 table 数据源"). The Table will append a new row of randomized values at the bottom.
4. Verify that the sum column and footer summary recalculate automatically.

---

## Features & Recommendations

### Pros

- **Decoupled Architecture**: Keeps grid views synced with raw JSON records without manual cell-by-cell manipulation.
- **Flexible Modes**: Supports swapping entire datasets and appending records.
- **Self-evaluating Cells**: Formulates row additions and footer summaries dynamically.

### Recommendations for Production

- **Batch Updates**: Appending records row-by-row and calling `bindingPath()` inside a loop can cause performance lags. For large operations, push all rows to the array first, then trigger `bindingPath()` once.
- **Validation**: Validate the format and constraints of objects before pushing them onto the bound array.
- **Backend Integrations**: Connect REST APIs or WebSockets to append or refresh data dynamically.

---

## Key Code Snippets

### Data Source Schema

```javascript
var dataSource = {
  // Nested array binding structure
  bindPath_table2: [
    { c1: 1, c2: 2, c3: 3, c4: 4 },
    { c1: 10, c2: 20, c3: 30, c4: 40 },
  ],
};
```

### Table Formulas Configuration

```javascript
// Row formula: Total = Col 1 + Col 2 + Col 3 + Col 4
table2.setColumnDataFormula(
  4,
  "=[@Column 1]+[@Column 2]+[@Column 3]+[@Column 4]",
);

// Footer formula: calculate sum of the Total column using SUBTOTAL
table2.setColumnFormula(4, "=SUBTOTAL(109,[Total])");
```

- `[@ColumnName]` references values in the active row.
- `SUBTOTAL(109, ...)` sums values, ignoring hidden rows.

---

## Summary

This case study shows how to bind and refresh Table datasets in SpreadJS. Key takeaways:

1. Wrapping data structures inside a `CellBindingSource`.
2. Setting column definitions and property field mappings.
3. Replacing or extending bound arrays.
4. Setting up row and footer formulas.

This pattern is highly useful for dashboards, real-time analytics sheets, and structured input systems.
