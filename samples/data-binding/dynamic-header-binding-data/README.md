# Dynamically Add Headers

This example demonstrates how to dynamically add table headers and bind data in a SpreadJS worksheet. Through two button operations, users can dynamically insert new columns (such as non-taxable income columns) into an existing salary table structure and bind a data source to the table. This allows for flexible management of headers and data. It is suitable for scenarios where table structures need to be adjusted dynamically at runtime, such as generating payrolls in human resource management systems.

---

## Core Scenarios & Solutions

- **Dynamic Table Structure Adjustment**: Dynamically insert new columns at runtime based on business requirements without redesigning the entire worksheet structure.
- **Complex Header Management**: Create multi-level headers with merged cells to support complex data visualization requirements.
- **Decoupled Data and Header Binding**: Manage data sources and header structures independently using the Table API and data binding mechanism.

---

## Implementation Details

### 1. Initialize Header Structure

Create a multi-level header with merged cells to display basic employee information and salary components:

```javascript
// Center-align headers
sheet.getRange(0, -1, 2, -1).hAlign(GC.Spread.Sheets.HorizontalAlign.center);
sheet.getRange(0, -1, 2, -1).vAlign(GC.Spread.Sheets.VerticalAlign.center);

// Render initial headers
sheet.setValue(0, 0, "ID");
sheet.setValue(0, 1, "Name");
sheet.setValue(0, 2, "Department");
sheet.setValue(0, 3, "Salary");
sheet.setValue(1, 3, "Base Salary");
sheet.setValue(1, 4, "Job Allowance");
sheet.setValue(1, 5, "Subtotal");

// Merge cells to create multi-level headers
sheet.addSpan(0, 0, 2, 1); // ID column spans 2 rows
sheet.addSpan(0, 1, 2, 1); // Name column spans 2 rows
sheet.addSpan(0, 2, 2, 1); // Department column spans 2 rows
sheet.addSpan(0, 3, 1, 3); // "Salary" spans 3 columns
```

### 2. Dynamically Add Columns and Headers

Use the `addColumns` method to insert columns at a specific index, and `addSpan` to merge header cells:

```javascript
$("#addColumnHeader").click(function () {
  // Insert 4 columns at index 3
  sheet.addColumns(3, 4);

  // Set headers for the new columns
  sheet.setValue(0, 3, "Non-Taxable Income");
  sheet.setValue(1, 3, "Reimbursement");
  sheet.setValue(1, 4, "Lunch Allowance");
  sheet.setValue(1, 5, "Travel Allowance");
  sheet.setValue(1, 6, "Subtotal");

  // Merge "Non-Taxable Income" header cells
  sheet.addSpan(0, 3, 1, 4);
});
```

### 3. Data Binding and Table Column Mapping

Use SpreadJS's Table API and `CellBindingSource` to bind data. The key is using the `bindColumns` method to map data fields to table columns:

```javascript
$("#binddata").click(function () {
  // Define the data source
  var data = {
    datasource: [
      {
        id: "1",
        name: "Pencil",
        department: "admin",
        basepay: 2000,
        jobpay: 5000,
        subtotal: 7000,
        reimbursement: 200,
        allowance1: 400,
        allowance2: 400,
        total: 1000,
      },
    ],
  };

  // Add a table (starting at row 2, column 0, with 2 rows and 10 columns)
  var table = sheet.tables.add("tableRecords", 2, 0, 2, 10);
  table.autoGenerateColumns(false); // Disable auto-generating columns

  // Define column mapping order (the order must match the header columns exactly)
  var names = [
    "id",
    "name",
    "department",
    "reimbursement",
    "allowance1",
    "allowance2",
    "total",
    "basepay",
    "jobpay",
    "subtotal",
  ];

  // Create TableColumn objects and bind them to data fields
  var tableColumns = [];
  names.forEach(function (data, index) {
    var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
    tableColumn.name(names[index]);
    tableColumn.dataField(data);
    tableColumns.push(tableColumn);
  });

  table.bindColumns(tableColumns);
  table.bindingPath("datasource");

  // Bind the data source
  var source = new GC.Spread.Sheets.Bindings.CellBindingSource(data);
  sheet.setDataSource(source);

  // Hide the built-in header row of the table
  table.showHeader(false);
  sheet.deleteRows(2, 1);
});
```

---

## Technology Stack

- **SpreadJS 15.0.0**: The core spreadsheet component.
- **jQuery 3.6.1**: Simplified DOM manipulation and event handling.
- **SystemJS**: JavaScript module loader.

---

## How to Run

### Installation & Execution

```bash
npm install
# Open index.html using a local development server (e.g. Live Server)
```

### Steps to Test

1. Load the page to see the initial salary table structure (ID, Name, Department, Salary, and its subcomponents).
2. Click **Add Dynamic Header** to insert "Non-Taxable Income" and its subcomponents between the "Department" and "Salary" columns.
3. Click **Bind Data** to populate the sheet with sample records.
4. Verify that the values are correctly filled into the respective columns matching the pre-defined column mapping.

---

## Features & Recommendations

### Pros

- **Flexible Column Management**: Inserts columns dynamically at runtime without reinstantiating the workbook.
- **Advanced Header Merging**: Creates complex structures easily using `addSpan`.
- **Decoupled Column Mapping**: Separates data structures from layout structure using `TableColumn` mappings for improved maintainability.

### Limitations & Recommendations for Production

- **Hard-coded Mapping Order**: The `names` array order is manually hardcoded. For production, it's recommended to wrap this inside a configuration object.
- **Single Record Limitation**: The current demo shows a single record. You can extend this to load and bind multi-row datasets dynamically.
- **Hard-coded Position Index**: The insertion index for `addColumns` is hardcoded. It is better to query the sheet headers to find insertion indices programmatically based on column header names.

---

## Key Code Snippets

### Inserting Columns Dynamically

```javascript
// Insert columns and configure their headers
sheet.addColumns(3, 4); // Inserts 4 columns at index 3
sheet.setValue(0, 3, "Non-Taxable Income");
sheet.addSpan(0, 3, 1, 4); // Merges the header cell
```

### Mapping Data Fields to Table Columns

```javascript
// The order of elements in the names array determines the target column index
var names = [
  "id",
  "name",
  "department",
  "reimbursement",
  "allowance1",
  "allowance2",
  "total",
  "basepay",
  "jobpay",
  "subtotal",
];

names.forEach(function (data, index) {
  var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
  tableColumn.name(names[index]);
  tableColumn.dataField(data); // Bind the column to the datasource key
  tableColumns.push(tableColumn);
});
```

---

## Summary

This example illustrates the core capabilities of SpreadJS in dynamic table structures. You can learn:

1. How to adjust sheet structure dynamically via `addColumns` and `addSpan`.
2. How to map data fields to table columns using the Table API's `bindColumns`.
3. How to bind a structured JSON data source using `CellBindingSource`.
4. Best practices for designing multi-level headers and merged cells.

This design is highly suitable for enterprise scenarios (e.g., customizable reporting grids and data import wizards) where spreadsheet layouts depend on user permissions, configurations, or dynamic business rules.
