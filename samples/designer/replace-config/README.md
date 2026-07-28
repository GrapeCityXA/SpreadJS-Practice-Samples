# Customize Built-in Dialog Templates in SpreadJS Designer

This example demonstrates how to modify built-in dialogs in SpreadJS Designer by configuring custom templates. Specifically, we customize the standard "Find" dialog by changing its window title and hiding specific feature options (such as the "Replace" controls). This solution is suitable for applications requiring simplified editor interfaces or customized user experiences.

---

## Core Scenarios & Solutions

In enterprise development, developers often need to adjust the built-in behaviors of SpreadJS Designer to fit business specifications. Common scenarios include:

- Simplifying dialog interfaces to hide unused configuration parameters.
- Renaming dialog headers to match corporate terminology or translation preferences.
- Restricting user actions to prevent configuration errors.

By leveraging the template registration API, developers can customize built-in UI components flexibly without editing the library source code.

---

## Implementation Details

### 1. Retrieve the Default Dialog Template

Call the `GC.Spread.Sheets.Designer.getTemplate()` method to load the definition layout of a built-in dialog:

```javascript
let findDialogTemplate = GC.Spread.Sheets.Designer.getTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate,
);
```

### 2. Modify Template Attributes

Alter properties on the template object. This example renames the dialog title and removes the second element from the layout array to hide the "Replace" panel:

```javascript
// Modify the dialog window title
findDialogTemplate.title = "Custom Find Name";

// Remove the second child element from the content layout (index 1) to hide the replace panel
findDialogTemplate.content[0].children.splice(1, 1);
```

### 3. Register the Custom Template

Overwrite the default template in the Designer using the `GC.Spread.Sheets.Designer.registerTemplate()` method:

```javascript
GC.Spread.Sheets.Designer.registerTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate,
  findDialogTemplate,
);
```

> [!IMPORTANT]
> You must register custom templates before instantiating the Designer, otherwise the changes will not be applied to the UI.

---

## Technology Stack

- **SpreadJS v15.0.0**: Core spreadsheet components.
- **SpreadJS Designer v15.0.0**: Built-in designer elements.
- **SystemJS**: Module loading engine.
- **TypeScript v4.1.2**: Script compile tools.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` using a local web server (e.g. Live Server).

### Steps to Test

1. Open `index.html` in your browser.
2. Press `Ctrl + F` to launch the Find dialog.
3. Observe that the dialog title displays as **Custom Find Name**.
4. Verify that the "Replace" tab is hidden from view.

---

## Features & Recommendations

### Pros

- **Non-invasive Customization**: Modify built-in dialog properties without editing vendor source files.
- **Flexible UI Layouts**: Adjust, remove, or insert widgets inside template arrays.
- **Improved Code Maintainability**: Clean separation between standard designer components and custom styles.

### Recommendations for Production

- **Inspect Template Objects**: Examine the target template structure using browser developer tools to locate the correct array indices.
- **Modular Customizations**: Package template configurations inside dedicated initialization files and run them before calling `new Designer()`.
- **Expand Layouts**: Customize other editor prompts (e.g., formatting options, column insertion popups) using the same pattern.

---

## Key Code Snippets

### Full Template Customization Flow

```javascript
// 1. Fetch built-in template
let findDialogTemplate = GC.Spread.Sheets.Designer.getTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate,
);

// 2. Modify properties
findDialogTemplate.title = "Custom Find Name";
findDialogTemplate.content[0].children.splice(1, 1);

// 3. Register template before instantiating the Designer
GC.Spread.Sheets.Designer.registerTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate,
  findDialogTemplate,
);

// 4. Instantiate the Designer
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
```

---

## Summary

This case study shows how to extend and customize default configurations in SpreadJS Designer. Key lessons:

1. Fetching templates using `getTemplate`.
2. Overwriting templates using `registerTemplate` before initialization.
3. Modifying nested properties inside layout arrays to hide or adapt UI components.

This pattern is highly useful for designing clean spreadsheet interfaces, restricted cell editors, and corporate-styled toolbars.
