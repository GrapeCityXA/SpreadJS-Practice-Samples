# Enable Data Binding Panel by Default in SpreadJS Designer

This example demonstrates how to enable the data binding sidebar by default in the SpreadJS Designer and pre-load a custom Field List. By programmatically setting a data binding template in JSON Schema format and automatically switching to design mode, users can directly use the pre-defined fields for data binding operations without having to configure the field structure manually.

This feature is suitable for scenarios requiring standardized data binding templates for users, such as report design tools and data collection systems. It simplifies the user workflow and improves development efficiency.

---

## Core Scenarios & Solutions

- **Simplify Data Binding Configurations**: By pre-loading field lists, users do not need to define data structures manually. They can drag and drop fields directly into cells to bind them.
- **Standardize Data Templates**: Provide unified data binding templates for different business scenarios, ensuring data structure consistency.
- **Improve User Experience**: Automatically open design mode and the field list sidebar, reducing operational steps for the user.

---

## Implementation Details

### 1. Define JSON Schema Data Structure

Define the field structure for data binding in JSON Schema format, supporting basic types (text) and complex types (table/array):

```javascript
var bindingSchema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  properties: {
    Name: {
      dataFieldType: "text",
      type: "string",
    },
    Resume: {
      dataFieldType: "table",
      type: "array",
      items: {
        type: "object",
        properties: {
          Time: { type: "string" },
          Company: { type: "string" },
        },
      },
    },
  },
  type: "object",
};
```

This Schema defines two fields:

- `Name`: A text type field.
- `Resume`: A table type field containing nested child fields `Time` and `Company`.

### 2. Inject Field List into the Designer

Inject the JSON Schema into the Designer's field list using the `setData` method:

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");

// Set the field list
designer.setData("treeNodeFromJson", JSON.stringify(bindingSchema));
```

`treeNodeFromJson` is the internal data key used by the Designer to store the field list. Once configured, the fields will automatically display in the sidebar.

### 3. Automatically Switch to Design Mode

Execute the `DesignMode` command to automatically open design mode and display the data binding sidebar:

```javascript
let designModeCommand = GC.Spread.Sheets.Designer.getCommand(
  GC.Spread.Sheets.Designer.CommandNames.DesignMode,
);
designModeCommand.execute(designer);
```

### 4. Retrieve Field List Data

Read the current field list configuration using the `getData` method:

```javascript
console.log(
  JSON.parse(
    designer.getData("treeNodeFromJson") ||
      designer.getData("oldTreeNodeFromJson") ||
      designer.getData("updatedTreeNode"),
  ),
);
```

The Designer supports three data keys:

- `treeNodeFromJson`: The initially configured field list.
- `oldTreeNodeFromJson`: The field list from previous versions.
- `updatedTreeNode`: The updated field list after user modifications.

---

## Technology Stack

- **SpreadJS 15.0.0**: Core spreadsheet component.
- **SpreadJS Designer 15.0.0**: Spreadsheet designer component.
- **SystemJS**: Module loader.
- **TypeScript 4.1.2**: Development scripting language.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Load the page in your browser. The Designer will automatically launch and enter design mode.
2. The pre-defined field list (Name, Resume) will appear in the right-hand sidebar.
3. Drag and drop the fields into cells to bind them.
4. For table fields (Resume), expand them to view child fields (Time, Company).
5. Switch to preview mode to verify the binding layout.

---

## Features & Recommendations

### Pros

- **Out of the box**: Field lists and design mode are configured automatically upon page load.
- **Flexible Data Schema**: Adheres to the JSON Schema standard, supporting nested data structures.
- **High Extensibility**: Adjust field configurations easily by modifying the `bindingSchema` structure.

### Recommendations for Production

- Load the field list dynamically from a backend API instead of hardcoding it in JS files.
- Add field validation rules (e.g. required attributes, format checkers).
- Support multiple field templates so users can select the template appropriate for their business context.

---

## Summary

This case study demonstrates how to programmatically pre-configure the data binding field list in the SpreadJS Designer and auto-launch design mode. Key learning points:

1. Defining data binding structures using JSON Schema.
2. Managing Designer internal data state via `setData` and `getData`.
3. Controlling Designer states using command execution patterns.
4. Implementing automated user interface workflows.
