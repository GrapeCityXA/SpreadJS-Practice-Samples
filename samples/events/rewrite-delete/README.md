# Override Delete Key Behavior in SpreadJS

This example demonstrates how to override the default deletion behavior of the Delete (Del) key in SpreadJS. By leveraging custom commands and shortcut key bindings, developers can capture and display cell values before they are removed. This solution is ideal for scenarios requiring transaction logging, data auditing, or confirmation dialogs before data is erased.

---

## Core Scenarios & Solutions

In typical applications, directly clearing cell data might lead to irreversible loss or auditing gaps. This example addresses these issues by:

- **Pre-deletion Data Capture**: Accessing cell values within the selection area before the delete operation is finalized.
- **Audit Logging**: Providing a basis for logging changes or supporting future rollback scenarios.
- **Accidental Deletion Prevention**: Warning users about what content they are clearing to avoid accidental data loss.

---

## Implementation Details

### 1. Create a Custom Command Object

Implement a command configuration object that contains your custom deletion routine:

```javascript
var command = {
  canUndo: false,
  execute: function (context, options, isUndo) {
    var Commands = GC.Spread.Sheets.Commands;
    if (isUndo) {
      Commands.undoTransaction(context, options);
      return true;
    } else {
      Commands.startTransaction(context, options);
      var selection = sheet.getSelections()[0];
      var r = selection.row;
      var c = selection.col;
      var rc = selection.rowCount;
      var cc = selection.colCount;
      // Retrieve cell/range values before clearing
      var arr = sheet.getArray(r, c, rc, cc);
      console.log(arr);
      alert("Content to be deleted: " + JSON.stringify(arr));
      // Execute sheet clear operation
      sheet.clear(
        r,
        c,
        rc,
        cc,
        GC.Spread.Sheets.SheetArea.viewport,
        GC.Spread.Sheets.StorageType.data,
      );

      Commands.endTransaction(context, options);
      return true;
    }
  },
};
```

**Key Parameter Definitions:**

- `canUndo`: Defined as `false`, showing that undo actions are disabled for this transaction.
- `execute`: The core execution function that handles reading the selection grid and running the clear command.

### 2. Register command and Bind to DEL Key

Register your custom configuration object in the workbook's command manager, then bind it to the keyboard's Delete key:

```javascript
spread.commandManager().register("deleteCommand", command);
spread
  .commandManager()
  .setShortcutKey(
    "deleteCommand",
    GC.Spread.Commands.Key.del,
    false,
    false,
    false,
    false,
  );
```

- `register()`: Registers the command under the key identifier `"deleteCommand"`.
- `setShortcutKey()`: Maps the keyboard's Delete key to the custom command. The last four parameters denote helper modifiers: `Ctrl`, `Shift`, `Alt`, and `Meta` keys respectively.

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet library.
- **TypeScript 4.1.2**: Scripting language support.
- **SystemJS 0.19.22**: JavaScript module loader.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Click any spreadsheet cell (or select a range of cells) and enter some text/values.
2. Press the **Delete** (or Del) key on your keyboard.
3. Observe the browser alert displaying the values of the cells you selected.
4. Dismiss the alert to see the cell contents cleared.

---

## Features & Recommendations

### Pros

- **Enhanced Auditing**: Read and record cell states before deletion, improving system accountability.
- **Extensible Commands**: Easily insert server logging hooks or permission checks within the `execute` method.
- **User-friendly Guard**: Alerts users, helping prevent accidental sheet modifications.
- **Multi-cell support**: Works seamlessly on both individual cells and bulk cell selections.

### Limitations & Recommendations for Production

- **Undo Limitation**: Standard undo actions (`Ctrl+Z`) are currently disabled (`canUndo: false`).
- **Standard Alerts**: Using `alert()` blocks the browser main thread and affects UX.

**Recommendations:**

1. **Enable Undo**: Set `canUndo: true` and write matching undo transactions.
2. **Custom Modals**: Replace native alerts with stylish UI modals.
3. **Database Syncing**: Send pre-deletion payloads to your backend database via HTTP calls for auditing.
4. **Role Permissions**: Limit the Delete command activation based on user editing permissions.

---

## Key Code Snippets

### Extract Data from Selected Range

```javascript
var selection = sheet.getSelections()[0];
var r = selection.row;
var c = selection.col;
var rc = selection.rowCount;
var cc = selection.colCount;
var arr = sheet.getArray(r, c, rc, cc);
```

`getArray()` returns a two-dimensional array representing cell contents in the specified range.

### Clearing Data

```javascript
sheet.clear(
  r,
  c,
  rc,
  cc,
  GC.Spread.Sheets.SheetArea.viewport,
  GC.Spread.Sheets.StorageType.data,
);
```

**Parameters for `clear()`:**

- First four parameters: row index, column index, row count, and column count.
- `SheetArea.viewport`: Restricts the operation to the spreadsheet's viewport.
- `StorageType.data`: Clears only data values, preserving formulas and cell styling.

---

## Summary

This case study shows how to leverage SpreadJS's command framework. Key lessons:

1. Registering commands using the Command Manager.
2. Constructing customized commands.
3. Overriding default keys using `setShortcutKey`.
4. Wrapping tasks in execution transactions (`startTransaction` / `endTransaction`).
5. Extracting and clearing sheet values in bulk.

This pattern is highly useful for corporate environments needing data auditing, action logs, or validation steps before data is deleted.
