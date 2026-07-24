# Add an "Insert Multiple Rows" Option to the Row Header Context Menu in SpreadJS

This example demonstrates how to customize the row header context menu in SpreadJS to implement a dynamic multi-row insertion feature. Users can right-click on the row headers and input the number of rows they want to insert, enabling quick and efficient batch insertions. This feature is built by extending SpreadJS's context menu system and command manager to deliver a flexible user interaction flow.

---

## Core Scenarios & Solutions

During spreadsheet data editing, users often need to insert multiple rows of data at once. The default context menu only allows inserting a single row at a time, making it highly tedious when inserting larger numbers of rows. This example solves this issue by:

- Allowing users to specify the number of rows to insert directly inside the row header context menu.
- Performing batch insertions in a single transaction to improve efficiency.
- Providing a clean, input-field-integrated interactive menu.

---

## Implementation Details

### 1. Add Custom Context Menu Item

Extend the context menu by appending a menu configuration object to the `spread.contextMenu.menuData` array:

```javascript
let insertRows = {
  text: "Insert Multiple Rows",
  name: "insertRows",
  command: "rowsCount",
  workArea: "rowHeader",
};
spread.contextMenu.menuData.push(insertRows);
```

**Key Parameters:**

- `text`: Display text for the menu option.
- `name`: Unique identifier for the menu option.
- `command`: Name of the command associated with this option.
- `workArea`: Configures the option to display exclusively in the row headers (`rowHeader`).

### 2. Register Custom Command

Register the batch insertion command inside the workbook's command manager:

```javascript
let insertRowsByCounts = {
  canUndo: false,
  execute: function (spread, options) {
    if (options.commandOptions) {
      var sheet = spread.getSheetFromName(options.sheetName);
      sheet.suspendPaint();
      sheet.addRows(options.activeRow, parseInt(options.commandOptions));
      sheet.resumePaint();
    }
  },
};
commandManager.register(
  "rowsCount",
  insertRowsByCounts,
  null,
  false,
  false,
  false,
  false,
);
```

- `suspendPaint()` and `resumePaint()` are utilized to bundle worksheet updates, optimizing batch rendering.
- `addRows()` inserts the specified number of rows at the selection index.
- `commandOptions` contains the input value containing the number of rows.

### 3. Build Custom MenuView

Extend the standard `MenuView` to support a numeric input field inside the menu selection block:

```javascript
function CustomMenuView() {}
CustomMenuView.prototype = new GC.Spread.Sheets.ContextMenu.MenuView();

CustomMenuView.prototype.createMenuItemElement = function (menuItemData) {
  let self = this;
  if (menuItemData.name === "insertRows") {
    let containers =
      GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(
        self,
        menuItemData,
      );
    let supMenuItemContainer = containers[0];
    let inputBlock = createInput();
    supMenuItemContainer.appendChild(inputBlock);
    return supMenuItemContainer;
  } else {
    let menuItemView =
      GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(
        self,
        menuItemData,
      );
    return menuItemView;
  }
};
```

Override `getCommandOptions` to extract the value of the numeric input field:

```javascript
CustomMenuView.prototype.getCommandOptions = function (
  menuItemData,
  host,
  event,
) {
  if (menuItemData && menuItemData.name === "insertRows") {
    let ele = document.getElementsByClassName("inputBlock")[0];
    return ele.value;
  }
};
```

### 4. Create and Configure HTML Input Element

Create a numeric input element with event handlers to manage menu selections:

```javascript
function createInput() {
  var inputBlock = document.createElement("input");
  inputBlock.className = "inputBlock";
  inputBlock.style = "width: 40px; margin-left: 10px;";
  inputBlock.type = "number";
  inputBlock.defaultValue = 3;
  inputBlock.min = 1;
  inputBlock.onclick = function (ev) {
    if (ev.target) {
      ev.stopPropagation(); // Prevent dropdown menu closing on clicks
    }
  };
  inputBlock.onkeydown = function (ev) {
    if (ev.key === "Enter") {
      this.parentNode.click(); // Trigger click on parent menu item
      ev.stopPropagation();
    }
  };
  return inputBlock;
}
```

- `stopPropagation()` is called on click events to prevent input field selection from dismissing the context menu prematurely.
- Key-down event listener intercepts the **Enter** key, automatically executing the insertion command.

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet framework.
- **SystemJS**: Module loader.
- **TypeScript 4.1.2**: Typed language support.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Load the page to display a grid with 10 rows.
2. Right-click on any row header header cell (e.g., row index 6).
3. Select the **Insert Multiple Rows** option in the context menu.
4. Input a number in the input box (default is 3).
5. Click the menu option text or press **Enter** to insert the specified number of rows below the active row.

---

## Features & Recommendations

### Pros

- **Higher Efficiency**: Batch insert multiple rows at once.
- **Interactive UI**: Native text input integration makes selecting parameters straightforward.
- **Performance Optimized**: Uses `suspendPaint()`/`resumePaint()` to avoid rendering lags during batch operations.
- **Clean Structure**: Extends core context menu patterns natively.

### Limitations & Recommendations for Production

- **Undo Disabled**: The command disables undo actions (`canUndo: false`). Implement custom undo callbacks in production if users need to revert row insertions.
- **Input Validation**: Check input bounds (e.g. restrict maximum inputs to 100 rows) to prevent resource depletion on heavy insertions.
- **Insert Columns**: Apply the same design to column headers to support batch column insertion.

---

## Summary

This case study shows how to customize context menus in SpreadJS. Key learning points:

1. Modifying the context menu configuration array (`menuData`).
2. Registering commands using the Command Manager.
3. Subclassing `MenuView` to insert custom HTML templates into standard context menus.
4. Catching events in custom inputs to manage parent menu triggers.
5. Bundling operations inside paint cycles.

This approach is highly useful for designing customized data grids, spreadsheet editors, and collaborative project tables requiring granular row and column insertions.
