# Prohibit Paste and Direct Edit on Cells with List Validation in SpreadJS

This example demonstrates how to restrict pasting and editing in specific cells using Data Validation in SpreadJS. Specifically, column A is configured with List Validation. When a user tries to paste data or directly edit these cells, the action is intercepted and cancelled, protecting data integrity.

This approach is useful for scenarios requiring strict data entry rules, such as forms with predefined dropdown selections, preventing users from bypassing dropdown lists by pasting values.

---

## Core Scenarios & Solutions

In web spreadsheets, certain columns need strict validation rules, such as list dropdowns. To prevent users from pasting invalid values and bypassing the dropdown constraints, we implement the following:

- **Prohibit Clipboard Pasting**: Intercept paste operations targeting validated cells.
- **Prohibit Direct Cell Editing**: Block users from typing values directly, forcing them to use the dropdown list.
- **Data Standardization**: Guarantee that cells only accept predefined option sets.

---

## Implementation Details

### 1. Intercept Clipboard Paste Actions

Listen to the `ClipboardPasting` event. Before the paste completes, check if any cell in the target range contains list validation. If it does, cancel the operation:

```javascript
sheet.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
  let range = args.cellRange;
  let { row, col, rowCount, colCount } = range;
  for (let i = row; i < rowCount + row; i++) {
    for (let j = col; j < colCount + col; j++) {
      // Check if the cell has a validator of type 3 (List Validation)
      if (
        sheet.getDataValidator(i, j) &&
        sheet.getDataValidator(i, j).type() == 3
      ) {
        args.cancel = true; // Intercept and cancel paste
        return;
      }
    }
  }
});
```

**Key Points:**

- Iterates through the targeted cell range.
- Checks `sheet.getDataValidator(i, j).type() === 3`, representing list validation.
- Sets `args.cancel = true` to abort the paste process.

### 2. Block Direct Editing

Listen to the `EditStarting` event. When editing begins, check if the cell is configured with list validation. If it is, cancel the edit:

```javascript
sheet.bind(GC.Spread.Sheets.Events.EditStarting, function (sender, args) {
  let { row, col } = args;

  // Cancel editing if the cell has a List Validator
  if (
    sheet.getDataValidator(row, col) &&
    sheet.getDataValidator(row, col).type() == 3
  ) {
    args.cancel = true;
  }
});
```

This prevents users from typing values directly into the cell while still allowing them to click the dropdown arrow to select an option.

### 3. Establish Validation Rules

In this data schema, column A has validation rules pre-configured in its JSON configuration, referencing cells `G5:G7` on Sheet2 (which contain "Apple", "Banana", and "Pear"):

```javascript
"validations": [{
    "type": 3,  // List Validation type
    "condition": {
        "conType": 12,
        "ignoreBlank": true,
        "formula": "Sheet2!$G$5:$G$7"
    },
    "ranges": "A:A"  // Applied to the entire column A
}]
```

---

## Technology Stack

- **@grapecity-software/spread-sheets**: 15.0.0 (Core Engine).
- **SystemJS**: 0.19.22 (Module Loader).
- **TypeScript**: 4.1.2.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open the page in your browser. Column A is configured with list validation rules.
2. Copy values from another cell and try to paste them into column A. The action will be blocked.
3. Double-click a cell in column A. Direct editing will be blocked.
4. Try editing or pasting into other columns (like column B) to verify they remain editable.

---

## Features & Recommendations

### Pros

- **Data Integrity**: Prevents users from bypassing dropdown validations using clipboard commands.
- **Unobtrusive UX**: Silently intercepts invalid actions without interrupting the user.
- **Granular Controls**: Filters actions based on specific validation types (`type()`).

### Recommendations for Production

- **Provide Visual Feedback**: Alert the user (e.g., using a toast message) when a paste or edit action is blocked.
- **Support More Validation Types**: Extend the logic to other data types, such as number ranges or date rules.
- **Role-based Access Control**: Allow specific authorized user roles to paste values.

---

## Key Code Snippets

### Inspect Data Validation Types

```javascript
// Get validation rule of the target cell
let validator = sheet.getDataValidator(row, col);

// Check if the validator exists and is a List Validator (type === 3)
if (validator && validator.type() === 3) {
  // Intercept action
}
```

### Abort Event Defaults

```javascript
// Abort the active event
args.cancel = true;
```

---

## Summary

This case study shows how to intercept user actions based on validation rules in SpreadJS. Key takeaways:

1. Intercepting paste actions using `ClipboardPasting`.
2. Intercepting direct edits using `EditStarting`.
3. Reading cell validation rules using `getDataValidator()`.
4. Aborting default events conditionally.

This pattern is highly useful for data entry forms and structured templates requiring standardized inputs.
