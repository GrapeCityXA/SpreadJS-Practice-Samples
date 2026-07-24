# Efficient Big Data Loading in SpreadJS

This example demonstrates how to load and render large-scale datasets efficiently in SpreadJS. By generating 100,000 mock records (each containing 20 fields), we show performance optimization techniques for handling big data in a web-based spreadsheet. Key topics include pausing/resuming worksheet rendering, binding structured data sources, applying batch cell styles, and configuring row filters. This solution is ideal for web applications showing huge tabular datasets, such as data analytics dashboards, reporting consoles, and data import previews.

---

## Core Scenarios & Solutions

- **Rendering Lags with Large Datasets**: Directly loading tens of thousands of rows of data into a spreadsheet can cause page freezing or browser crashes. A proper rendering control strategy is required.
- **Efficient Batch Styling**: Styling cell by cell triggers multiple redraw cycles, which hurts performance. Batch styles must be applied efficiently.
- **Data Filtering**: Large datasets require client-side filtering capabilities, allowing users to locate target data quickly.
- **Row Changes Monitoring**: Real-time monitoring of row alterations (such as row deletions) is needed to synchronize data with backend databases or logs.

---

## Implementation Details

### 1. Optimize Rendering with suspendPaint/resumePaint

When performing massive data updates or styling operations, pause worksheet rendering to avoid triggering layout calculation loops on every single write. Resume rendering once all operations are complete to update the spreadsheet in a single redraw cycle:

```javascript
$("#click").click(function () {
  spread.suspendPaint(); // Pause rendering
  sheet.setDataSource(datasource); // Bind the data source
  for (var i = 0; i < datasource.length; i++) {
    sheet.getCell(i, 0).backColor(datasource[i].color); // Apply batch styles
  }
  var range = new GC.Spread.Sheets.Range(-1, 0, -1, sheet.getColumnCount());
  var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
  sheet.rowFilter(rowFilter); // Attach row filter
  spread.resumePaint(); // Resume rendering to redraw all changes at once
});
```

### 2. Generate Mock Datasets

Create 100,000 mock records on the fly. Each record contains an index ID, 18 random numeric values (`c1` through `c18`), and a color property to simulate real-world transactional datasets:

```javascript
var datasource = [];
for (var i = 0; i < 100000; i++) {
  var temp = {};
  temp.id = i;
  temp.c1 = Math.random();
  temp.c2 = Math.random();
  // ... fields c3 through c18
  if (i % 4 == 0) {
    temp.color = "red";
  } else if (i % 4 == 1) {
    temp.color = "blue";
  } else if (i % 4 == 2) {
    temp.color = "yellow";
  } else if (i % 4 == 3) {
    temp.color = "green";
  }
  datasource.push(temp);
}
```

### 3. Data Source Binding and Styling

Use the `setDataSource()` method to bind the data array to the worksheet. Loop through records to paint the first column cells with matching backgrounds based on the record's color value:

```javascript
sheet.setDataSource(datasource);
for (var i = 0; i < datasource.length; i++) {
  sheet.getCell(i, 0).backColor(datasource[i].color);
}
```

### 4. Enable Row Filtering

Instantiate a `HideRowFilter` to enable built-in drop-down filter menus on the column headers:

```javascript
var range = new GC.Spread.Sheets.Range(-1, 0, -1, sheet.getColumnCount());
var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);
```

### 5. Listen to Row Deletions

Bind the `RowChanging` event listener to capture when rows are deleted, permitting developers to log the changes or send synchronization APIs to the backend:

```javascript
sheet.bind(GC.Spread.Sheets.Events.RowChanging, function (e, info) {
  if (info.propertyName === "deleteRows") {
    var deleteRow = sheet.getArray(info.row, 0, 1, sheet.getColumnCount());
    console.log("deletedRows: " + deleteRow);
  }
});
```

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet component.
- **jQuery 3.6.1**: Simplified DOM operations and event handling.
- **SystemJS 0.19.22**: JavaScript module loader.
- **TypeScript 4.1.2**: Scripting configurations.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Upon opening the page, an empty spreadsheet and a **click** button are displayed.
2. Click the **click** button. The page generates and binds 100,000 data rows to the worksheet.
3. Once loaded, cells in the first column will be colored (red, blue, yellow, or green) corresponding to the generated data.
4. Click the dropdown filters in the column headers to filter data.
5. Try deleting any row. The deleted row data will be printed in the browser console.

---

## Features & Recommendations

### Pros

- **High-Performance Rendering**: Using `suspendPaint()`/`resumePaint()` allows loading and styling 100,000 rows in seconds.
- **Memory Optimization**: SpreadJS uses virtual scrolling to render cells only in the viewport, which reduces browser memory utilization.
- **Excel-like Interaction**: Provides built-in sorting, filtering, and deletion support out of the box.
- **Robust Event System**: Easy integration with change-listeners to trace user editing behaviors.

### Limitations & Recommendations for Production

- **Client-side Generation Latency**: Generating 100,000 rows in raw JS loops blocks the client thread for 1-2 seconds. We recommend fetching paginated data from a backend server in production.
- **Cell Styling Bottleneck**: Setting background colors cell-by-cell inside a loop can be slow. Consider using **Conditional Formatting rules** instead.
- **Enhancement Suggestions**:
  - Implement virtualized loading (lazy load from server as the user scrolls).
  - Add data export functions (CSV or Excel formats).
  - Embed chart visualizations to summarize big data.

---

## Key Code Snippets

### Setting Up Workspace Boundaries

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();
sheet.setRowCount(50000); // Configure initial sheet row count
sheet.setColumnCount(30); // Configure initial sheet column count
```

### Performance Optimization Pattern

```javascript
spread.suspendPaint(); // Suspend sheet updates before bulk actions
// ... Execute massive cell modifications/insertions here ...
spread.resumePaint(); // Resume sheet updates to repaint at once
```

---

## Summary

This case study shows best practices for handling high-volume datasets in SpreadJS. Key takeaways:

1. Utilizing `suspendPaint()` and `resumePaint()` to optimize bulk operations.
2. Speeding up data binding via `setDataSource()`.
3. Activating spreadsheet filtering using `HideRowFilter`.
4. Capturing user interactions using workbook event handlers.
5. Sizing row and column counts correctly to load high volumes.

This pattern is useful for web applications containing extensive grids, such as business intelligence dashboards, large file parsing previews, and telemetry analyzers.
