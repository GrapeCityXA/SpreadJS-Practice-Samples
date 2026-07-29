# Display Edit Icons in Row Headers in SpreadJS

This example demonstrates how to implement a visual feedback feature in SpreadJS: when a user modifies the contents of a cell within a row, the row header automatically displays an edit icon to mark that the row has been changed. This visual cue helps users track data modifications in real time, making it highly useful for data entry, reviewing, and auditing.

---

## Core Scenarios & Solutions

In web applications, users need a clear indication of which rows have been modified. Standard tables lack built-in visual markers, making it difficult to keep track of changed rows. By displaying custom font icons in the row headers, this example addresses the following:

- **Clear Visual Feedback**: Provides immediate visual cues indicating edited rows.
- **Improved Auditing**: Helps reviewers locate modified data rows instantly.
- **Accurate Data Entry**: Prevents duplicate edits or missed rows during bulk data entry.

---

## Implementation Details

### 1. Disable Default Row Header Auto-Text

By default, SpreadJS displays row numbers in the row headers. Disable this auto-text behavior to make room for custom icons:

```javascript
sheet.options.rowHeaderAutoText = GC.Spread.Sheets.HeaderAutoText.blank;
```

Setting `rowHeaderAutoText` to `blank` clears the row numbers.

### 2. Listen to Cell Value Changes

Bind a listener to the `ValueChanged` event. When a user edits a cell, retrieve the row index and write the icon code to the corresponding row header cell:

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
  let { row } = info;
  sheet.setValue(
    row,
    0,
    String.fromCharCode("0xe735"),
    GC.Spread.Sheets.SheetArea.rowHeader,
  );
  sheet
    .getCell(row, 0, GC.Spread.Sheets.SheetArea.rowHeader)
    .font("12px iconfont");
});
```

**Key Points:**

- `info` provides the index of the edited row.
- `String.fromCharCode("0xe735")` converts the Unicode value into the icon character.
- `SheetArea.rowHeader` targets the row header cell for updates.
- Setting the cell font to `iconfont` ensures the character renders correctly as an icon.

### 3. Handle Added Rows

To maintain consistency when users insert new rows, listen to the `RowChanged` event:

```javascript
sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (e, info) {
  if (info.propertyName === "addRows") {
    sheet.setValue(
      info.row,
      0,
      String.fromCharCode("0xe735"),
      GC.Spread.Sheets.SheetArea.rowHeader,
    );
    sheet
      .getCell(info.row, 0, GC.Spread.Sheets.SheetArea.rowHeader)
      .font("12px iconfont");
  }
});
```

Checking `info.propertyName === 'addRows'` detects newly added rows and applies the icon to the new row header.

### 4. Integrate Font Icons (iconfont)

The example uses an external iconfont library. The font is registered in the HTML and CSS:

**HTML:**

```html
<link rel="stylesheet" type="text/css" href="iconfont.css" />
<span class="icon iconfont" style="visibility:hidden;height:0">&#xe735;</span>
```

**CSS:**

```css
@font-face {
  font-family: "iconfont";
  src: url("./iconfont.ttf?t=1677470565442") format("truetype");
}

.icon-bianji3:before {
  content: "\e735";
}
```

The Unicode `\e735` maps to a pencil icon within the true-type font file.

---

## Technology Stack

- **SpreadJS 16.0.1**: Core spreadsheet components.
- **SystemJS**: Module loading engine.
- **TypeScript 4.1.2**: Script build compiler configurations.
- **iconfont**: Icon library.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. A blank sheet will load.
2. Cell `A1` contains the prompt: "Enter a value in any cell to test the effect."
3. Edit any cell and press Enter.
4. The corresponding row header will immediately display a pencil edit icon.
5. Edit cells in other rows; their headers will also update with the icon.
6. Insert a new row and enter data to verify that the new row header displays the icon.

---

## Features & Recommendations

### Pros

- **Instant Update**: The icon displays immediately after values change.
- **Clean Interface**: Uses vector icons instead of text labels.
- **Simple implementation**: The logic is implemented in less than 20 lines of code.
- **Extensible**: Swap Unicode values to display different icons or statuses.

### Recommendations for Production

- **Static State**: The icon does not clear automatically, making it difficult to distinguish between "edited" and "saved" states.
- **No Persistence**: The icons are temporary and clear upon refreshing the browser.
- **No Undo Support**: Undoing an edit does not remove the icon.

**Enhancements:**

- Clear or change the icon (e.g. to a green checkmark) after triggering a save operation.
- Implement clear actions to let users remove icons manually or automatically.
- Store row statuses in the grid data model to persist icons across user sessions.

---

## Key Code Snippets

### Full Core Script Implementation

```javascript
import * as GC from "@grapecity/spread-sheets";

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

// Disable default row numbers
sheet.options.rowHeaderAutoText = GC.Spread.Sheets.HeaderAutoText.blank;

// Listen to cell modifications
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
  let { row } = info;
  sheet.setValue(
    row,
    0,
    String.fromCharCode("0xe735"),
    GC.Spread.Sheets.SheetArea.rowHeader,
  );
  sheet
    .getCell(row, 0, GC.Spread.Sheets.SheetArea.rowHeader)
    .font("12px iconfont");
});

// Listen to added rows
sheet.bind(GC.Spread.Sheets.Events.RowChanged, function (e, info) {
  if (info.propertyName === "addRows") {
    sheet.setValue(
      info.row,
      0,
      String.fromCharCode("0xe735"),
      GC.Spread.Sheets.SheetArea.rowHeader,
    );
    sheet
      .getCell(info.row, 0, GC.Spread.Sheets.SheetArea.rowHeader)
      .font("12px iconfont");
  }
});
```

---

## Summary

This case study shows how to customize row headers in SpreadJS. Key takeaways:

1. Customizing row header cell contents.
2. Handling cell value changes with the `ValueChanged` event.
3. Importing and applying custom font icons.
4. Using `SheetArea` options to interact with header cells.

This approach is highly useful for tracking modifications in data entry systems, auditing panels, and editing dashboards.
