# Programmatic Multi-Column Filtering in SpreadJS

This example demonstrates how to implement programmatic multi-column filtering in SpreadJS using custom button triggers. The sample creates a spreadsheet containing two columns of data: "Region" and "City". When the user clicks the "filter" button, the system applies filtering rules to both columns simultaneously, showing only rows that match both "Region = North" and "City = TianJin".

This design is suitable for business applications that require dynamic row filtering based on user input or pre-defined configurations rather than manual column header interactions.

---

## Core Scenarios & Solutions

- **Automated Data Filtering**: Allows developers to filter table rows programmatically without requiring users to click column header dropdown menus.
- **Joint Filtering Conditions**: Applies unique conditions to multiple columns at the same time.
- **Custom Matching Rules**: Uses `Condition` formatting objects to establish precise matching criteria (such as exact text matches, string inclusions, or numeric boundaries).
- **Smooth Layout Refreshes**: Invalidates cell layout structures and forces sheet repaints, updating the grid instantly.

---

## Implementation Details

### 1. Initialize the Row Filter

Instantiate a `HideRowFilter` object and specify the row and column coordinate boundaries for filtering:

```javascript
var range = new GC.Spread.Sheets.Range(1, 0, 6, 2);
var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);
```

This specifies a range starting at row index 1, column index 0, spanning 6 rows and 2 columns, and binds the filter to the worksheet.

### 2. Define Rule Conditions

Create `Condition` objects representing the text comparison rules for each column:

```javascript
var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition,
  {
    compareType:
      GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
    expected: "North",
  },
);
var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
  GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition,
  {
    compareType:
      GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
    expected: "TianJin",
  },
);
```

These rules validate values in column 0 (Region) and column 1 (City) respectively.

### 3. Apply Filters and Refresh Layouts

Map the filter conditions to their respective column indices, execute the filter actions, and refresh the sheet layout:

```javascript
rowFilter.addFilterItem(0, condition1); // Map condition 1 to column index 0
rowFilter.addFilterItem(1, condition2); // Map condition 2 to column index 1
rowFilter.filter(0); // Apply filter to column index 0
rowFilter.filter(1); // Apply filter to column index 1
sheet.invalidateLayout();
sheet.repaint();
```

Calling `invalidateLayout()` and `repaint()` ensures the UI updates to show only the filtered rows.

---

## Technology Stack

- **SpreadJS 15.0.0**: Core spreadsheet components.
- **jQuery 3.6.1**: Simplified DOM operations and event handling.
- **SystemJS**: Module loading engine.
- **TypeScript 4.1.2**: Script build compiler configurations.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. A table showing Region and City values will load.
2. Click the **filter** button at the top.
3. The table automatically hides rows that do not match the criteria, displaying only the row containing "North" and "TianJin" (row 5).

---

## Features & Recommendations

### Pros

- **Full Code Control**: Control filter rules programmatically, removing the need for manual header dropdown menu selections.
- **Multi-column Operations**: Combine filters across multiple columns to refine search results.
- **Versatile Rule Matching**: Leverage the `Condition` API to handle numeric range lookups, string pattern checks, or custom date boundaries.
- **Instant Response**: Cells that do not match the criteria are hidden immediately, updating sheet views in real time.

### Recommendations for Production

- **Hard-coded Parameters**: In this basic demo, search queries are hardcoded. Update the logic to fetch inputs dynamically from drop-down menus or text boxes in your application.
- **Filter Removal**: Add a **Clear Filter** button that calls `rowFilter.unfilter()` to restore all hidden rows.
- **Advanced Logic**: Combine multiple rules within a single column using `OR` or custom Javascript filters.

---

## Key Code Snippets

### Filtering Configurations and Button Action Bindings

```javascript
// Define range bounds and map filter instance
var range = new GC.Spread.Sheets.Range(1, 0, 6, 2);
var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);

// Bind action to button
$("#filter").click(function () {
  // Define Region condition (column index 0)
  var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition,
    {
      compareType:
        GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
      expected: "North",
    },
  );

  // Define City condition (column index 1)
  var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition,
    {
      compareType:
        GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
      expected: "TianJin",
    },
  );

  // Add conditions and execute filter operations
  rowFilter.addFilterItem(0, condition1);
  rowFilter.addFilterItem(1, condition2);
  rowFilter.filter(0);
  rowFilter.filter(1);

  // Refresh sheet views
  sheet.invalidateLayout();
  sheet.repaint();
});
```

---

## Summary

This case study shows how to implement programmatic row filtering in SpreadJS. Key takeaways:

1. Initializing and configuring `HideRowFilter` elements.
2. Defining filtering rules using the `Condition` API.
3. Adding and executing rules using `addFilterItem` and `filter`.
4. Updating the UI with `invalidateLayout` and `repaint`.

This pattern is highly useful for query forms, dashboard lookups, and data tables where rows need to be filtered automatically based on user selections.
