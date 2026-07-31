# Custom Dropdown Multi-Select Cells in SpreadJS

This example demonstrates how to implement a custom dropdown multi-select cell type in SpreadJS. By inheriting from `GC.Spread.Sheets.CellTypes.Text` and integrating the third-party multi-select component **xm-select**, users can choose multiple options within a single cell. Double-clicking the cell opens a dropdown list, and selected options are written to the cell as a comma-separated string.

This pattern is suitable for applications requiring multiple category flags, user role assignments, or multi-tag selections within cell grids.

---

## Core Scenarios & Solutions

- **Multi-select Support**: SpreadJS's default dropdown lists only allow single selections. This solution extends the cell types to accommodate multiple item selections.
- **Enhanced UI UX**: Integrates **xm-select** to provide a polished selection layout with checkboxes, select-all toggles, and tag bubbles.
- **Data & Display Separation**: Saves selection indices as an array inside cell `Tag` metadata while displaying the comma-separated labels in the cell `Value`.

---

## Implementation Details

### 1. Configure the Custom Cell Class

Subclass `GC.Spread.Sheets.CellTypes.Text` to establish the `DropdownMultiSelect` cell type:

```javascript
function DropdownMultiSelect() {}
DropdownMultiSelect.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

Apply this custom cell type to your target cells:

```javascript
sheet.setCellType(1, 1, new DropdownMultiSelect());
```

### 2. Create the Editor Container

Override the `createEditorElement` lifecycle method to return a wrapper div that serves as the mount point for the xm-select widget:

```javascript
DropdownMultiSelect.prototype.createEditorElement = function () {
  let div = document.createElement("div");
  let $div = $(div);
  $div.attr("id", "xm-select-container");
  return div;
};
```

### 3. Initialize and Activate the Editor

Override `activateEditor` to initialize the xm-select widget when a user double-clicks the cell. The initialization logic:

1. Splits the cell's current text by comma to identify previously selected values.
2. Maps these text labels back to their corresponding data values.
3. Instantiates the xm-select element with the resolved initial state.

```javascript
DropdownMultiSelect.prototype.activateEditor = function (
  editorContext,
  cellStyle,
  cellRect,
) {
  if (editorContext) {
    let $editor = $(editorContext);
    GC.Spread.Sheets.CellTypes.Base.prototype.activateEditor.apply(
      this,
      arguments,
    );
    $editor.attr("gcUIElement", "gcEditingInput");

    // Parse active cell content to find checked tags
    let index = [];
    let disList = trimSpace(
      sheet
        .getText(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex())
        .split(","),
    );
    for (let js = 0; js < selectList.length; ++js) {
      if (disList.indexOf(selectList[js].name) !== -1) {
        index.push(selectList[js].value);
      }
    }

    // Render xm-select
    xmSelect.render({
      el: "#xm-select-container",
      autoRow: true,
      direction: "down",
      language: "zn",
      data: selectList,
      initValue: index,
      pageSize: 3,
      toolbar: {
        show: true,
        list: ["ALL"],
      },
      on: function (data) {
        let arr = data.arr;
        let nameStr = "";
        let indexList = [];
        for (let i = 0; i < arr.length; ++i) {
          nameStr += arr[i].name + ",";
          indexList.push(arr[i].value);
        }
        nameStr = nameStr.substr(0, nameStr.length - 1);

        // Write indices to cell Tag
        sheet.setTag(
          sheet.getActiveRowIndex(),
          sheet.getActiveColumnIndex(),
          indexList,
        );
        // Write labels to cell Value
        sheet.setValue(
          sheet.getActiveRowIndex(),
          sheet.getActiveColumnIndex(),
          nameStr,
        );
      },
    });
  }
};
```

### 4. Data Storage Architecture

To keep the grid state organized, this demo uses a dual-storage strategy:

- **Display Layer**: Call `setValue` to write a comma-separated string of the selected option names to the cell (e.g. `"MUL1,MUL2"`).
- **Data Layer**: Call `setTag` to store the selected indices as an array inside the cell tag metadata (e.g. `[0, 1]`).

This design lets you display human-readable labels to users while keeping numeric database IDs available in cell tags.

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet engine.
- **xm-select 0.0.3**: Dropdown multi-select component.
- **jQuery 3.7.1**: DOM manipulations and event bindings.
- **layui 2.6.2**: UI style framework.
- **SystemJS 0.19.22**: JavaScript module loading.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. Cell `A2` will prompt you to: "Double click B2 to test ➡️".
2. Double-click cell `B2` to open the multi-select dropdown.
3. Check multiple options in the list.
4. Click outside the dropdown panel or press Enter to save your selection.
5. The selected items will display in the cell, separated by commas (e.g. `"MUL1,MUL2,MUL3"`).
6. Double-click cell `B2` again to verify that your previously selected options remain checked.

---

## Features & Recommendations

### Pros

- **Multi-select Support**: Allows selecting multiple items within a single cell, extending standard dropdown limitations.
- **Polished UI**: Integrates **xm-select** to provide search filters, select-all options, and clean layouts.
- **Metadata Management**: Storing data values in cell tags and display text in cell values separates display logic from data processing.

### Recommendations for Production

- **Bundle Size**: xm-select depends on jQuery and Layui styles. Review the impact on your project's bundle size.
- **Performance**: For large sheets with many multi-select cells, instantiate editors lazily on-demand when editing starts instead of pre-rendering them.
- **Dynamic Options**: Fetch dropdown options dynamically from database APIs instead of using hardcoded lists.

---

## Key Code Snippets

### Data Formatting Utilities

Remove empty, null, or undefined indices from selection arrays:

```javascript
function trimSpace(array) {
  for (let i = 0; i < array.length; i++) {
    if (
      array[i] === "" ||
      array[i] === null ||
      typeof array[i] === "undefined"
    ) {
      array.splice(i, 1);
      i = i - 1;
    }
  }
  return array;
}
```

### Editor Dimension Layouts

Override `updateEditor` to position and scale the custom editor container:

```javascript
DropdownMultiSelect.prototype.updateEditor = function (
  editorContext,
  cellStyle,
  cellRect,
) {
  if (editorContext) {
    let $editor = $(editorContext);
    $editor.css("width", cellRect.width);
    return { height: 300 };
  }
};
```

---

## Summary

This case study shows how to implement custom cell editors in SpreadJS. Key takeaways:

1. Extending built-in cell types by inheriting from `CellTypes.Text`.
2. Mounting external widgets inside the `createEditorElement` container.
3. Handling editor initialization and saving states inside `activateEditor`.
4. Formatting cell dimensions with `updateEditor`.
5. Separating display text from data IDs using values and tags.

This approach can be adapted to integrate other custom editor components, such as date range selectors, color pickers, or rich text editors.
