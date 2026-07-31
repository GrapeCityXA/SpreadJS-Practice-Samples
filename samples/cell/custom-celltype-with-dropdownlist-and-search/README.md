# Dropdown Multi-Select with Search in SpreadJS

This example demonstrates how to implement a custom dropdown multi-select cell type with search filtering in SpreadJS. Double-clicking the cell opens a custom editor container where users can perform fuzzy queries on items, select multiple values (using `Ctrl` clicks), and save selections as a comma-separated string inside the cell.

This design is suitable for scenarios requiring multi-tag selectors or category filters from large item lists.

---

## Core Scenarios & Solutions

- **Multi-select Support**: Extends cell editing features to support selecting multiple options at once.
- **Search Filters**: Allows filtering large lists dynamically using search query matching.
- **Customized UI Layout**: Configures custom styling and heights for the dropdown popup to match application branding.
- **Data Persistence**: Integrates cell value mapping to restore selections when reopening the editor.

---

## Implementation Details

### 1. Extend the Base Cell Type

Subclass `GC.Spread.Sheets.CellTypes.Base` to create the custom cell type `MySelector`:

```javascript
function MySelector() {
  this.typeName = "MySelector";
}
MySelector.prototype = new GC.Spread.Sheets.CellTypes.Base();
```

### 2. Configure the Editor Layout

Override `createEditorElement` to build the editor container, including an `<input>` field for search queries and a `<select>` list for multi-selection:

```javascript
MySelector.prototype.createEditorElement = function () {
  // Parent container
  var container = document.createElement("div");
  container.setAttribute("gcUIElement", "gcEditingInput");
  container.style.backgroundColor = "white";
  container.style.display = "flex";
  container.style.minHeight = "200px";
  container.style.flexDirection = "column";

  // Search input
  var searchInput = document.createElement("input");
  searchInput.placeholder = "Search items...";
  container.appendChild(searchInput);

  // Multiple selection list
  var list = document.createElement("select");
  list.multiple = true;
  var listItems = [
    { text: "Apple", value: "apple" },
    { text: "Banana", value: "banana" },
    // ... more items
  ];
  listItems.forEach((item) => {
    var listItem = document.createElement("option");
    listItem.textContent = item.text;
    listItem.value = item.value;
    list.appendChild(listItem);
  });
  container.appendChild(list);

  return container;
};
```

### 3. Filter Options Dynamically

Bind a listener to the search input's `input` event to filter the select options:

```javascript
searchInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const options = list.options;
  for (let i = 0; i < options.length; i++) {
    const optionText = options[i].textContent.toLowerCase();
    if (optionText.includes(searchValue)) {
      options[i].style.display = "block";
    } else {
      options[i].style.display = "none";
    }
  }
});
```

### 4. Format Selection Strings

Listen to changes on the select list, extract the selected options, and display them in the search input as a comma-separated string:

```javascript
list.addEventListener("change", function () {
  const selectedOptions = Array.from(this.selectedOptions);
  const selectedTexts = [];
  selectedOptions.forEach((option) => {
    selectedTexts.push(option.value);
  });
  searchInput.value = selectedTexts.join(", ");
});
```

### 5. Read and Write Cell Values

Implement `getEditorValue` and `setEditorValue` to sync values between the editor and the cell:

```javascript
MySelector.prototype.getEditorValue = function (editorContext) {
  return { value: editorContext.children[0].value };
};

MySelector.prototype.setEditorValue = function (editorContext, value) {
  editorContext.children[0].value = value ? value.value : null;
  // Restore selection highlights in the dropdown list
  if (value && value.value) {
    var inputContent = value.value.split(", ");
    var selectList = editorContext.children[1];
    Array.from(selectList.options).forEach((item) => {
      if (inputContent.includes(item.value)) {
        item.selected = true;
      }
    });
  }
};
```

---

## Technology Stack

- **SpreadJS 17.0.8**: Core spreadsheet engine.
- **SpreadJS Designer 17.0.8**: Built-in editor components.
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

1. Open the page in your browser. Double-click cell `B2` to enter edit mode.
2. Type a query (e.g. `"ap"`) in the input box to filter options.
3. Hold `Ctrl` and select multiple items in the list.
4. The selected values will display in the input box, separated by commas.
5. Press `Tab` or click another cell to save your selection.

---

## Features & Recommendations

### Pros

- **Interactive Filtering**: Filter large lists dynamically using fuzzy queries.
- **Multi-select Handling**: Supports choosing multiple items within a single cell.
- **Optimal Heights**: Configures custom styling and heights for the dropdown popup to improve the user experience.

### Recommendations for Production

- **Dynamic Data Sources**: Fetch dropdown options asynchronously from backend endpoints instead of using hardcoded lists.
- **Improved Filtering**: Update the search logic to support pinyin search or regular expressions.
- **Select All / Clear Buttons**: Add helper buttons to quickly select all or clear selections.
- **Performance**: Use virtual scrolling techniques if the dropdown contains thousands of items to avoid DOM rendering lags.

---

## Key Code Snippets

### Set Editor Dimensions

```javascript
MySelector.prototype.updateEditor = function (
  editorContext,
  cellStyle,
  cellRect,
) {
  if (editorContext) {
    editorContext.style.width = cellRect.width + "px";
    editorContext.style.height = 200;
    return { height: 200 };
  }
};
```

### Key Event Handling

```javascript
MySelector.prototype.isReservedKey = function (e) {
  // Preserve the Tab key behavior to exit edit mode
  return (
    e.keyCode === GC.Spread.Commands.Key.tab &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey
  );
};
```

### Apply Custom Cell Type

```javascript
sheet.setColumnWidth(1, 200);
sheet.setCellType(1, 1, new MySelector());
```

---

## Summary

This case study shows how to implement custom cell types in SpreadJS. Key takeaways:

1. Subclassing base cell types using `CellTypes.Base`.
2. Initializing custom containers inside the `createEditorElement` method.
3. Filtering select lists dynamically based on search inputs.
4. Controlling editor boundaries using `updateEditor`.
5. Managing keyboard navigation inside the editor.

This approach can be adapted to integrate other custom editor components, such as cascading selectors, date range pickers, or rich text editors.
