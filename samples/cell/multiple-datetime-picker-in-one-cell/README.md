# Integrate Multiple Date Pickers in a Single Cell in SpreadJS

This example demonstrates how to integrate two independent date picker buttons inside a single cell in SpreadJS using the **jQuery UI Datepicker** component. Users can click different buttons within the cell to choose two distinct dates, which are then saved as a space-separated string within the same cell.

This design is suitable for scenarios requiring multiple dates inside one cell, such as start/end date ranges or comparison dates.

---

## Core Scenarios & Solutions

- **Multi-value Cell Inputs**: Standard cell editors only capture a single input value. Using `cellButtons` allows managing two independent date values within one cell.
- **Third-party UI Integration**: Integrates the jQuery UI Datepicker within SpreadJS to deliver a mature, user-friendly calendar UI.
- **Dynamic Positioning**: Solves positioning constraints by calculating the cell's offset coordinates on the viewport, ensuring calendar panels display precisely next to the clicked button.

---

## Implementation Details

### 1. Configure Cell Buttons

Use the `cellButtons` style property in SpreadJS to render two buttons inside a cell, each triggering a date selection routine:

```javascript
let style = new GC.Spread.Sheets.Style();

style.cellButtons = [
  {
    caption: "Date 1",
    command: function (sheet, row, col) {
      let cellRect = sheet.getCellRect(row, col);
      currentCell = { row, col, index: 0 };
      showDatepicker(cellRect);
    },
  },
  {
    caption: "Date 2",
    command: function (sheet, row, col) {
      let cellRect = sheet.getCellRect(row, col);
      currentCell = { row, col, index: 1 };
      showDatepicker(cellRect);
    },
  },
];
spread.getActiveSheet().setStyle(0, 0, style);
```

Each button's `command` callback records the cell coordinates and the index identifier (0 or 1) representing which date is being selected.

### 2. Configure jQuery UI Datepicker

Configure jQuery UI's Datepicker with a custom `onSelect` callback. When selected, the date string is inserted into the cell array, joined by a space character, and written back to the cell value:

```javascript
jQuery.datepicker.setDefaults({
  onSelect: (date) => {
    let { row, col } = currentCell;
    let value = spread.getActiveSheet().getValue(row, col);
    if (!value) {
      spread.getActiveSheet().setValue(row, col, " ");
    }
    value = spread.getActiveSheet().getValue(row, col);
    let arr = value.split(" ");
    arr[currentCell.index] = date;
    spread.getActiveSheet().setValue(row, col, arr.join(" "));
    $(dateInput).datepicker("hide");
    $(dateInput).datepicker("destroy");
    document.querySelector("body").removeChild(dateInput);
  },
});
```

### 3. Dynamically Position the Calendar

Create a temporary input element and mount the date picker at the calculated screen coordinates:

```javascript
function showDatepicker(cellRect) {
  document.querySelectorAll(".date-input").forEach((ele) => {
    ele.remove();
  });
  dateInput = document.createElement("input");
  dateInput.classList = ["date-input"];
  dateInput.style.top = cellRect.y + vpRect.top + "px";
  dateInput.style.left = cellRect.x + vpRect.left + "px";
  document.querySelector("body").appendChild(dateInput);
  $(dateInput).datepicker();
  $(dateInput).datepicker("show");
}
```

By querying `getCellRect`, the script retrieves the cell's offset coordinates relative to the spreadsheet and aligns the picker using absolute positioning.

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet engine.
- **jQuery 3.6.3**: Event handling and DOM selectors.
- **jQuery UI 1.13.2**: Datepicker component.
- **TypeScript 4.1.2**: Script configurations.
- **SystemJS**: Module loader.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser. Note that you must be connected to the internet since jQuery and jQuery UI assets load via CDN.

### Steps to Test

1. Open the page in your browser. You will see cell `A1` (row index 0, column index 0) containing two buttons: **Date 1** and **Date 2**.
2. Click **Date 1** to open the calendar picker and select a date.
3. Click **Date 2** to open the calendar picker and select a second date.
4. The cell will display both chosen dates separated by a space character (e.g. `01/15/2026 02/20/2026`).
5. Click either button again to update its value.

---

## Features & Recommendations

### Pros

- **Multi-value Cell Management**: Breaks standard cell value limitations, allowing users to enter and display two independent values inside one cell.
- **Mature Calendar Component**: Reuses standard jQuery UI Datepicker configurations to provide a clean user experience.
- **Accurate Positioning**: Cell offset calculations prevent calendar overlays from rendering out of alignment.

### Limitations & Recommendations for Production

- **Delimited Data**: Saving dates as space-separated text can make parsing difficult. For production, consider serializing values as a JSON string.
- **Hard-coded Buttons**: The buttons are hardcoded inside style configurations. Update the logic to dynamically inject buttons based on data schemas.

**Enhancements:**

- Format dates and support custom delimiters.
- Add range validation checking (e.g., ensure "Date 2" is not earlier than "Date 1").
- Package this logic into a custom `CellType` subclass to make it reusable across multiple worksheets.

---

## Summary

This case study shows how to integrate third-party UI widgets within SpreadJS using `cellButtons` and dynamic DOM overlays. Key lessons:

1. Configuring cell buttons inside styles.
2. Integrating jQuery UI date pickers.
3. Calculating cell boundary coordinates relative to the viewport.
4. Parsing and storing multiple values inside a single cell value.

This pattern is highly useful for entering flight schedules, reservation intervals, event planning slots, and financial comparisons.
