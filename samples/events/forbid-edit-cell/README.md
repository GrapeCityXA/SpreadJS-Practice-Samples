# Disable Cell Editing in SpreadJS

This document provides a guide on how to configure cells to prevent editing in SpreadJS.

Like Microsoft Excel, disabling cell editing in SpreadJS requires two states to evaluate to `true` simultaneously:

1. The cell must be **Locked** (`locked = true`).
2. The worksheet must be **Protected** (`isProtected = true`).

---

## 5 Ways to Disable Cell Editing

### 1. Disable Editing Across All Cells

Since SpreadJS cells are locked by default, you can protect the entire sheet with a single option configuration:

```javascript
// Enable worksheet protection
sheet.options.isProtected = true;
```

### 2. Lock Most Cells and Unlock a Selected Few

To make only specific ranges editable while protecting the rest of the sheet, set the style's `locked` property to `false` on those ranges:

```javascript
// Define an editable style (pink background)
var style = new GC.Spread.Sheets.Style();
style.locked = false; // Unlocked cells remain editable when sheet protection is active
style.backColor = "pink";

// Allow editing in row index 1, column index 1, and cell D6
sheet.setStyle(1, -1, style, GC.Spread.Sheets.SheetArea.viewport);
sheet.setStyle(-1, 1, style, GC.Spread.Sheets.SheetArea.viewport);
sheet.setStyle(5, 3, style, GC.Spread.Sheets.SheetArea.viewport);

// Enable sheet protection
sheet.options.isProtected = true;
```

_Note: Passing `-1` as an index value applies the style to the entire row or column._

### 3. Unlock Most Cells and Lock a Selected Few

To allow editing everywhere except for a few specific ranges (e.g. locking header row index 0), unlock the sheet defaults and lock the target ranges:

```javascript
// Unlock sheet style defaults
var defaultStyle = new GC.Spread.Sheets.Style();
defaultStyle.locked = false;
sheet.setDefaultStyle(defaultStyle, GC.Spread.Sheets.SheetArea.viewport);

// Lock row index 0 (header row)
var style = new GC.Spread.Sheets.Style();
style.locked = true;
style.backColor = "red";
sheet.setStyle(0, -1, style);

// Enable sheet protection
sheet.options.isProtected = true;
```

#### Note: Styling Priorities

Applying the `locked` property using `setStyle` can sometimes fail after importing JSON spreadsheets because of styling priorities. Cell-level styles have higher priority than row or column styles (`Cell > Row > Column`).

To bypass this and apply properties directly, use `getRange().locked()` instead:

```javascript
sheet.options.isProtected = true;
spread.suspendPaint();

// Lock row index 0
sheet.getRange(0, 0, 1, sheet.getColumnCount()).locked(true);
// Unlock the rest of the rows
sheet
  .getRange(1, 0, sheet.getRowCount() - 1, sheet.getColumnCount())
  .locked(false);

spread.resumePaint();
```

---

## 4. Prohibit Direct Input While Keeping Other Operations Active

In SpreadJS V18, you can prohibit direct inline edits while leaving other cell interactions active using the `allowEditInCell` style property:

![allowEditInCell Option](https://gccndocumentsitestorage.blob.core.chinacloudapi.cn/document-site-files/images/d2fe542f-9aa3-4dd5-9fb7-3daa9c6afcf4/image.a561e5.png?verticalAlign=top&width=400)

```javascript
let style = new GC.Spread.Sheets.Style();
style.allowEditInCell = false;
```

---

## 5. Implement Custom Interaction Rules Using Event Handlers

Users can modify cells in several ways: keyboard inputs, drag-fills, drag-drops, clipboard pastes, or pressing the `Delete` key. You can intercept and block these actions by listening to their corresponding events.

For example, you can block keyboard inputs by canceling the `EditStarting` event:

```javascript
sheet.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
  args.cancel = true; // Aborts editing
});
```

Here is a reusable `AuthController` class that lets you configure custom permission checks for multiple actions (editing, pasting, drag-dropping, drag-filling, and deleting):

```javascript
import * as GC from "@grapecity-software/spread-sheets";

export default function AuthController() {}

/**
 * Register permission checks on the workbook.
 * @param {object} spread - SpreadJS Workbook instance
 * @param {object} sheet - SpreadJS Worksheet instance
 * @param {function} allowCallBack - Callback function returning false to block actions
 */
AuthController.prototype.register = function (spread, sheet, allowCallBack) {
  // Intercept keyboard editing
  sheet.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
    if (allowCallBack && !allowCallBack(args.row, args.col, "EditStarting")) {
      args.cancel = true;
    }
  });

  // Intercept clipboard paste
  spread.bind(
    GC.Spread.Sheets.Events.ClipboardPasting,
    function (sender, args) {
      if (args.sheet !== sheet) {
        return;
      }
      for (
        let row = args.cellRange.row;
        row < args.cellRange.row + args.cellRange.rowCount;
        row++
      ) {
        for (
          let col = args.cellRange.col;
          col < args.cellRange.col + args.cellRange.colCount;
          col++
        ) {
          if (allowCallBack && !allowCallBack(row, col, "ClipboardPasting")) {
            args.cancel = true;
            return;
          }
        }
      }
    },
  );

  // Intercept drag-drop actions
  sheet.bind(GC.Spread.Sheets.Events.DragDropBlock, function (e, args) {
    for (let row = args.toRow; row < args.toRow + args.rowCount; row++) {
      for (let col = args.toCol; col < args.toCol + args.colCount; col++) {
        if (allowCallBack && !allowCallBack(row, col, "DragDropBlock")) {
          args.cancel = true;
          return;
        }
      }
    }
  });

  // Intercept drag-fill actions
  sheet.bind(GC.Spread.Sheets.Events.DragFillBlock, function (e, args) {
    for (
      let row = args.fillRange.row;
      row < args.fillRange.row + args.fillRange.rowCount;
      row++
    ) {
      for (
        let col = args.fillRange.col;
        col < args.fillRange.col + args.fillRange.colCount;
        col++
      ) {
        if (allowCallBack && !allowCallBack(row, col, "DragFillBlock")) {
          args.cancel = true;
          return;
        }
      }
    }
  });

  // Intercept the Delete key command
  let command = {
    canUndo: true,
    execute: function (context, options, isUndo) {
      let Commands = GC.Spread.Sheets.Commands;
      if (isUndo) {
        Commands.undoTransaction(context, options);
        return true;
      } else {
        let row = context.getActiveSheet().getActiveRowIndex();
        let col = context.getActiveSheet().getActiveColumnIndex();
        if (allowCallBack && !allowCallBack(row, col, "DeleteCommand")) {
          return true;
        }
        Commands.startTransaction(context, options);
        context.getActiveSheet().setValue(row, col, null);
        Commands.endTransaction(context, options);
        return true;
      }
    },
  };

  spread.commandManager().register("banDeleteKey", command);
  spread
    .commandManager()
    .setShortcutKey(
      "banDeleteKey",
      GC.Spread.Commands.Key.del,
      false,
      false,
      false,
      false,
    );
};
```

### Example Usage:

To block direct keyboard edits in Column A and block clipboard pasting in Column B:

```javascript
let authController = new AuthController();
authController.register(spread, sheet, function (row, col, type) {
  if (col === 0) {
    return type !== "EditStarting"; // Disable keyboard editing in column A
  } else if (col === 1) {
    return type !== "ClipboardPasting"; // Disable pasting in column B
  } else {
    return true; // Allow all other actions
  }
});
```
