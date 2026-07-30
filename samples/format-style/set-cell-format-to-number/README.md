# Validate Numeric Formats on String Cells in SpreadJS

This example demonstrates how to set cell number formats in SpreadJS and implements an auto-validation check that alerts users when they try to apply numeric formatters to text-typed cells. By listening to cell change events, the script detects the cell value type. If a user sets a formatter on a string-typed cell, a warning is displayed.

This solution helps prevent formatting errors that can occur when users apply numeric formatting to text data.

---

## Core Scenarios & Solutions

In spreadsheet applications, developers often face formatting errors, such as:

- Users applying numeric formats to string-typed cells, which does not render correctly.
- Lack of real-time validation checks for cell styles and data type updates.
- Insufficient visual guidance for correct cell formatting operations.

By implementing event listening and data type checks, this example helps developers build robust validation systems.

---

## Implementation Details

### 1. Initialize Workbook Settings

Set up the locale configuration, initialize the workbook container, and add sample values:

```javascript
GC.Spread.Common.CultureManager.culture("zh-cn");
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getActiveSheet();

sheet.setValue(1, 3, 99);
sheet.setActiveCell(1, 3);
sheet.setColumnWidth(3, 120);
```

This sets the locale to Chinese, creates a workbook instance, writes the number `99` into cell `D2` (row index 1, column index 3), sets it as the active cell, and resizes the column width.

### 2. Listen to Cell Changes

Listen to the `CellChanged` event. When a cell's formula or style info changes, trigger a check:

```javascript
spread.bind(GC.Spread.Sheets.Events.CellChanged, function (s, e) {
  document.getElementById("log").innerHTML = JSON.stringify(e.propertyName);
  if (e.propertyName === "formula" || e.propertyName === "[styleinfo]") {
    setTimeout(function () {
      checkCellFormat(e.sheet, e.row, e.col);
    }, 10);
  }
});
```

Using a 10-millisecond `setTimeout` delay ensures the cell value and formatting style have completely updated before running the check.

### 3. Check Cell Value and Format Types

Read the cell value and formatter properties. If the cell value is a string and a formatter is present, alert the user:

```javascript
function checkCellFormat(sheet, row, col) {
  var cell = sheet.getCell(row, col),
    value = cell.value(),
    formatter = cell.formatter();
  if (typeof value === "string" && formatter) {
    alert(
      "Do not apply numeric formatting to string-typed cells. If you need to format it, convert the text to a numeric value first.",
    );
  }
}
```

This checks the data type using `typeof` and verifies formatting configurations using `formatter()`.

### 4. Apply Cell Formats Programmatically

The demo includes a button that formats the active cell to five decimal places:

```javascript
document.getElementById("setFormatter").addEventListener("click", function () {
  var sheet = spread.getActiveSheet();
  var cell = sheet.getCell(
    sheet.getActiveRowIndex(),
    sheet.getActiveColumnIndex(),
  );
  cell.formatter("0.00000");
});
```

---

## Technology Stack

- **SpreadJS 15.0.0**: Core spreadsheet components.
- **SystemJS 0.19.22**: JavaScript module loading.
- **TypeScript 4.1.2**: Script compile tools.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. Cell `D2` is preloaded with the value `99`.
2. Click the **Set Cell Formatter** (or "点我设置单元格数据格式") button. The value will be formatted to five decimal places (`99.00000`).
3. Enter a string (e.g. `"test"`) into any other cell.
4. Select the cell containing the string and click the **Set Cell Formatter** button.
5. An alert warning will appear: "Do not apply numeric formatting to string-typed cells. If you need to format it, convert the text to a numeric value first."

---

## Features & Recommendations

### Pros

- **Real-time Checks**: Tracks cell styling updates instantly.
- **Smart Detection**: Detects value data types to prevent formatting errors.
- **Simple Logic**: Uses a clean implementation that is easy to maintain.

### Recommendations for Production

- **Limited Type Checks**: This basic demo only checks string types, ignoring other formats like dates or boolean flags.
- **Alert Modals**: Using native browser `alert()` popups can disrupt user workflows.

**Enhancements:**

- Use toast alerts or inline warning banners instead of native `alert()` popups.
- Expand the check logic to support more validation formats for different data types.
- Auto-cast string-typed numeric characters (e.g. `"123"`) to numbers when a format is applied.

---

## Summary

This case study shows how to validate and format cell values in SpreadJS. Key takeaways:

1. Listening to cell mutations using `CellChanged`.
2. Accessing formatting rules using the `formatter` API.
3. Checking value types using JavaScript's native `typeof` operator.
4. Using timer delays to handle async event cycles.

This pattern is highly useful for data entry forms and templates where you need to prevent users from applying incompatible styles to text fields.
