# Auto-Copy Styles on Row Insertion in SpreadJS

This example demonstrates how to automatically copy cell styles from adjacent rows when inserting new rows in SpreadJS. By listening to the `RowChanged` event, the system copies style properties from the row below the insertion point to the newly inserted rows, keeping the sheet design consistent.

This feature is useful for maintaining table layouts with alternating row colors, cell buttons, custom borders, and other styles.

---

## Core Scenarios & Solutions

In spreadsheet applications, users often insert new rows to enter new data. By default, newly inserted rows are blank and unstyled, which breaks the visual continuity of the spreadsheet. This example addresses the following:

- **Style Breaks**: Prevents background colors, borders, and other styles from being interrupted when inserting new rows.
- **Manual Formatting Overhead**: Removes the need for users to manually format newly inserted rows.
- **Formatting Consistency**: Keeps complex layouts (like alternating zebra stripes or inline cell buttons) consistent.

---

## Implementation Details

### 1. Initialize Sample Sheet Styles

Set up sample row background colors and inline cell buttons to demonstrate the style copying effect:

```javascript
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();

// Color specific rows
sheet
  .getRange(
    1,
    0,
    1,
    sheet.getColumnCount(),
    GC.Spread.Sheets.SheetArea.viewport,
  )
  .backColor("pink");
sheet
  .getRange(
    2,
    0,
    1,
    sheet.getColumnCount(),
    GC.Spread.Sheets.SheetArea.viewport,
  )
  .backColor("blue");
sheet
  .getRange(
    3,
    0,
    1,
    sheet.getColumnCount(),
    GC.Spread.Sheets.SheetArea.viewport,
  )
  .backColor("yellow");
sheet
  .getRange(
    sheet.getRowCount() - 1,
    0,
    1,
    sheet.getColumnCount(),
    GC.Spread.Sheets.SheetArea.viewport,
  )
  .backColor("pink");

// Add dropdown button controls to the first column of the first three rows
const cellButtons = [
  {
    imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
    command: "openDateTimePicker",
    useButtonStyle: false,
  },
];
sheet.getRange(1, 0, 3, 1).cellButtons(cellButtons);
```

### 2. Listen to Row Changes and Copy Styles

Listen to the `RowChanged` event to detect row insertions and copy style properties programmatically:

```javascript
sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (sender, info) {
  console.log(info);
  if (info.propertyName === "addRows") {
    info.sheet.copyTo(
      info.row + info.count,
      0,
      info.row,
      0,
      info.count,
      sheet.getColumnCount(),
      GC.Spread.Sheets.CopyToOptions.style,
    );
  }
});
```

**Implementation Details:**

- Checks `info.propertyName === "addRows"` to verify if the event was triggered by inserting rows.
- Calls `copyTo()` to duplicate styles from the row immediately below the insertion point.
- `copyTo()` parameters:
  - `info.row + info.count`: Source row index (the row shifted down by the insertion).
  - `0`: Source column start index.
  - `info.row`: Target row index (the newly inserted row).
  - `0`: Target column start index.
  - `info.count`: Number of rows to copy.
  - `sheet.getColumnCount()`: Total number of columns to copy styles across.
  - `GC.Spread.Sheets.CopyToOptions.style`: Copy style properties only, ignoring cell values.

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Script build compiler configurations.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. The spreadsheet will display rows colored pink, blue, and yellow.
2. Select a row, right-click, and choose **Insert** (or use keyboard shortcuts).
3. The newly inserted row will copy the background color style from the row below it.
4. If you insert a row within the first three rows, the cell button styles will also be copied to the new row.

---

## Features & Recommendations

### Pros

- **Automated Formatting**: Extends row styles automatically, improving user workflows.
- **Complete Style Cloning**: Copies all style properties, including background colors, borders, font weights, and cell buttons.
- **Performance**: Isolates style updates to prevent layout reflow lags.
- **Pure Style Copying**: Uses `CopyToOptions.style` to copy styles only, leaving cell values blank.

### Recommendations for Production

- **Custom Source Mapping**: This basic logic copy styles from the row below. Update the logic to detect surrounding styles (e.g. copying from the row above if inserting at the end of a range) to match user intent.
- **Context-aware Copying**: Determine whether to copy styles based on cell context (e.g. whether the row is inside a table, header, or summary area).
- **Copy Other Attributes**: Extend the `CopyToOptions` parameters to copy cell formulas or data validations if needed.

---

## Key Code Snippets

### Core Row Changed Event Handler

```javascript
sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (sender, info) {
  console.log(info);
  // Check if the change is a row insertion
  if (info.propertyName === "addRows") {
    // Copy styles from the row below the inserted range to the new rows
    // info.row: start index of the inserted rows
    // info.count: number of rows inserted
    info.sheet.copyTo(
      info.row + info.count,
      0, // Source: row below the inserted range
      info.row,
      0, // Target: start of the inserted range
      info.count, // Number of rows to copy
      sheet.getColumnCount(), // Copy across all columns
      GC.Spread.Sheets.CopyToOptions.style, // Style only
    );
  }
});
```

---

## Summary

This case study shows how to automate styling during row insertions in SpreadJS. Key takeaways:

1. Tracking sheet updates using the `RowChanged` event.
2. Copying styles programmatically using `copyTo`.
3. Selecting style-only copies with `CopyToOptions.style`.
4. Reading event properties (`info.row` and `info.count`) to target specific cell ranges.

This pattern is highly useful for data entry systems, invoice builders, and templates requiring consistent layouts.
