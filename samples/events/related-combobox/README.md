# Implement Cascading Dropdowns in SpreadJS

This example demonstrates how to implement cascading (linked) dropdown lists (ComboBoxes) in SpreadJS. When a user selects an option in the parent dropdown, the available options in the child dropdown are updated dynamically based on the parent's value. The demo simulates a Teacher-Course assignment scenario: selecting a teacher dynamically refreshes the available subjects list taught by that teacher.

---

## Core Scenarios & Solutions

In actual business scenarios, cascading selection features are highly common:

- Address selection (Country-State-City).
- Catalog classification (Category-Subcategory).
- Faculty scheduling (Teacher-Course).
- Inventory listing (Brand-Model).

By listening to the cell value change events, this sample dynamically updates the options of the child dropdown to provide a simple and efficient cascading input experience.

---

## Implementation Details

### 1. Create Dropdown Cell Types

Instantiate dropdown objects using `GC.Spread.Sheets.CellTypes.ComboBox()` and populate the selectable options using `items()`. Each item contains a display label `text` and an underlying coordinate `value`:

```javascript
let combo1 = new GC.Spread.Sheets.CellTypes.ComboBox();
combo1.items([
  {
    text: "Mr. Zhang",
    value: "MrZhang",
  },
  {
    text: "Mr. Wang",
    value: "MrWang",
  },
  {
    text: "Mr. Li",
    value: "MrLi",
  },
]);
combo1.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);
sheet.setCellType(3, 2, combo1, GC.Spread.Sheets.SheetArea.viewport);
```

**Key Actions:**

- Set `editorValueType()` to `value` so that cells store the item's key value rather than its display text.
- Apply the cell type to cell `C4` (row index 3, column index 2) using `setCellType()`.

### 2. Capture Value Changes to Update Child Options

Bind a callback to the `ValueChanged` event. Check if the changed cell coordinates correspond to the parent dropdown. Based on its new value, load appropriate options into the child dropdown:

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
  let row = info.row;
  let col = info.col;
  if (row == 3 && col == 2) {
    let value = info.newValue;
    if (value == "MrZhang") {
      combo2.items([
        {
          text: "English",
          value: "English",
        },
        {
          text: "Chinese",
          value: "Chinese",
        },
        {
          text: "Mathematics",
          value: "Mathematics",
        },
      ]);
      sheet.setValue(3, 3, "English");
    }
    // Additional teacher subjects mappings...
  }
});
```

**Key Steps:**

1. Check if the modified cell is the target parent cell (`C4`).
2. Fetch the newly selected key via `info.newValue`.
3. Re-populate the child dropdown (`combo2`) item array based on the value.
4. Call `setValue()` on the child cell to automatically pick a default value.

---

## Technology Stack

- **SpreadJS 19.0.3**: Core spreadsheet components.
- **SystemJS 0.19.22**: JavaScript module loading framework.
- **TypeScript 4.1.2**: Type compiler environment.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. Cells `C4` and `D4` are configured as dropdown fields.
2. Click the dropdown arrow on cell `C4` and select a teacher:
   - Select **Mr. Zhang**: Cell `D4` displays English, Chinese, and Mathematics.
   - Select **Mr. Wang**: Cell `D4` displays History, Geography, and Politics.
   - Select **Mr. Li**: Cell `D4` displays P.E., Music, and Fine Arts.
3. Verify that the selectable list in cell `D4` changes in real time corresponding to your selection in cell `C4`.

---

## Features & Recommendations

### Pros

- **Simple Implementation**: Handles cascading logic easily by binding to a single event handler.
- **Instant Response**: Updates the child options immediately when cell values mutate.
- **Flexible Extensions**: Scalable to support multi-level cascades (3 levels or more).
- **Default Selections**: Prevents inconsistent states by automatically defaulting to a valid option.

### Limitations & Recommendations for Production

- **Hard-coded Mappings**: Mappings are hardcoded inside the event callback. For production systems, it is recommended to drive options dynamically using configuration objects or database records.
- **Validation**: Ensure sheet validation rules are added to prevent entering invalid combinations.
- **Remote APIs**: Consider executing async HTTP requests inside the event handler to fetch child options from remote web servers.

---

## Key Code Snippets

### Complete Cascading Event Handler

```javascript
// Listen for cell updates in C4 to refresh dropdown options in D4
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
  let row = info.row;
  let col = info.col;
  if (row == 3 && col == 2) {
    let value = info.newValue;
    if (value == "MrZhang") {
      combo2.items([
        {
          text: "English",
          value: "English",
        },
        {
          text: "Chinese",
          value: "Chinese",
        },
        {
          text: "Mathematics",
          value: "Mathematics",
        },
      ]);
      sheet.setValue(3, 3, "English");
    }
    if (value == "MrWang") {
      combo2.items([
        {
          text: "History",
          value: "History",
        },
        {
          text: "Geography",
          value: "Geography",
        },
        {
          text: "Politics",
          value: "Politics",
        },
      ]);
      sheet.setValue(3, 3, "History");
    }
    if (value == "MrLi") {
      combo2.items([
        {
          text: "P.E.",
          value: "PE",
        },
        {
          text: "Music",
          value: "Music",
        },
        {
          text: "Fine Arts",
          value: "FineArts",
        },
      ]);
      sheet.setValue(3, 3, "PE");
    }
  }
});
```

---

## Summary

This case study shows how to implement dropdown dependencies in SpreadJS. Key learning points:

1. How to create and configure `ComboBox` CellTypes.
2. Hooking callbacks to the `ValueChanged` event listener.
3. Updating item arrays dynamically inside cells.
4. Setting up `editorValueType` configurations.

This design is highly suitable for complex online forms, data entry grids, and workflow planning sheets that require validation and input controls.
