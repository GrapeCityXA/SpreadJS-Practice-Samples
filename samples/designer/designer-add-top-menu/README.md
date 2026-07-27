# Add a Custom Top-Level Ribbon Tab in SpreadJS Designer

This example demonstrates how to append a custom top-level menu (Ribbon Tab) to the SpreadJS Designer. By extending the designer's default configuration configurations, developers can insert custom menu tabs onto the top function ribbon bar and register customized action commands on the child buttons.

This demo creates a ribbon tab named "Operations" containing two customized buttons, "Load" and "Upload", detailing the entire process from configuration definition and command registration to UI rendering.

---

## Core Scenarios & Solutions

In enterprise development, the standard configuration items inside SpreadJS Designer may not satisfy specific business requirements. This sample addresses the following development needs:

- **Adding Specialized Shortcuts**: Inserting business-specific entries inside the ribbon tab without overwriting default menus.
- **Integrating Custom Logic**: Linking custom procedures (e.g. template lookups, backend uploads) directly into the Designer toolbar.
- **Maintaining Layout Consistency**: Copying the native design language of SpreadJS Designer to make custom buttons look natural.

---

## Implementation Details

### 1. Clone Default Configuration

Retrieve the default configurations object of the Designer, performing a deep clone to prevent polluting global scopes:

```javascript
let designerConfig = JSON.parse(
  JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig),
);
```

Using `JSON.parse(JSON.stringify())` guarantees that our local extensions do not affect other Designer instances.

### 2. Define Custom Tab Structures

Define the new Ribbon Tab config object containing the identifier, tab text, and button array:

```javascript
let customerRibbon = {
  id: "operate",
  text: "Operations",
  buttonGroups: [],
};
```

- `id`: The unique key mapping the tab.
- `text`: Label displayed on the tab header.
- `buttonGroups`: Array referencing the child button groups inside this tab.

### 3. Configure Button Groups

Define layout directions and list target command IDs within the button group:

```javascript
let ribbonFileConfig = {
  label: "File Operations",
  thumbnailClass: "ribbon-thumbnail-spreadsettings",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["getTemplates", "uploadFile"],
      },
    ],
  },
};
```

- `label`: Title of the button group.
- `thumbnailClass`: CSS class representing the thumbnail layout.
- `commandGroup.children`: Arranges the layout directions (vertical/horizontal) and specifies which command IDs belong to the child block.

### 4. Register Custom Commands

Configure command execution callbacks and register them in the config object's `commandMap`:

```javascript
let ribbonFileCommands = {
  getTemplates: {
    iconClass: "ribbon-button-welcome",
    text: "Load",
    commandName: "getTemplates",
    execute: async function (context) {
      alert("Load clicked");
    },
  },
  uploadFile: {
    iconClass: "ribbon-button-welcome",
    text: "Upload",
    commandName: "uploadFile",
    execute: async function (context) {
      alert("Upload clicked");
    },
  },
};

designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, ribbonFileCommands);
```

Each command block defines:

- `iconClass`: CSS class indicating button graphics.
- `text`: Label text below or next to the icon.
- `commandName`: Identifier of the command.
- `execute`: Async callback execution function, receiving a `context` parameter containing the designer and workbook instances.

### 5. Assemble Configurations and Instantiate Designer

Push the button group configuration into the custom tab, add the tab into the ribbon list, and initialize the designer:

```javascript
customerRibbon.buttonGroups.push(ribbonFileConfig);
designerConfig.ribbon.push(customerRibbon);

let designer = new GC.Spread.Sheets.Designer.Designer(
  "designer-container",
  designerConfig,
);
```

### 6. Customize Button Graphics

Load button background images using standard CSS definitions:

```css
.ribbon-button-welcome {
  background-image: url("./welcome.png");
  background-size: 35px 35px;
}
```

---

## Technology Stack

- **SpreadJS 15.0.0**: Core spreadsheet engine.
- **SpreadJS Designer 15.0.0**: Interactive designer component.
- **SystemJS**: Module loading framework.
- **TypeScript 4.1.2**: Script build compilation compiler configurations.

---

## How to Run

### Installation & Execution

```bash
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Load the page in your browser. The SpreadJS Designer loads automatically.
2. In the top ribbon tab bar, locate the custom **Operations** tab.
3. Click the tab. The **File Operations** button group will be displayed containing two options.
4. Click **Load** or **Upload** to verify that their respective test alert dialogs display.

---

## Features & Recommendations

### Pros

- **Declarative Configuration**: Design entire tab layouts using standard JSON structures without modifying internal core code.
- **Highly Extensible**: Insert arbitrary quantities of tabs, buttons, submenus, and action commands.
- **Style Cohesion**: Custom elements merge seamlessly with the built-in UI layout.
- **Async command handling**: Execute async callbacks inside command execution handlers to run backend operations.

### Recommendations for Production

- **Utilize Workbook Context**: Access active workbook operations inside the callback by calling `context.getWorkbook()`.
- **Organize Commands**: Group similar actions into separate button groups to keep the toolbar layout clean.
- **Invoke Designer APIs**: Access designer instance APIs by calling `context.getDesigner()`.
- **Code Separation**: Keep action callback implementations in separate modular scripts to improve codebase maintainability.

---

## Key Code Snippets

### Core Tab Insertion Pipeline

```javascript
// 1. Clone configuration
let designerConfig = JSON.parse(
  JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig),
);

// 2. Define custom tab
let customerRibbon = {
  id: "operate",
  text: "Operations",
  buttonGroups: [],
};

// 3. Define group layout
let ribbonFileConfig = {
  label: "File Operations",
  thumbnailClass: "ribbon-thumbnail-spreadsettings",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["getTemplates", "uploadFile"],
      },
    ],
  },
};

// 4. Define command map callbacks
let ribbonFileCommands = {
  getTemplates: {
    iconClass: "ribbon-button-welcome",
    text: "Load",
    commandName: "getTemplates",
    execute: async function (context) {
      alert("Load clicked");
    },
  },
  uploadFile: {
    iconClass: "ribbon-button-welcome",
    text: "Upload",
    commandName: "uploadFile",
    execute: async function (context) {
      alert("Upload clicked");
    },
  },
};

// 5. Register commands
designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, ribbonFileCommands);

// 6. Merge tab definitions
customerRibbon.buttonGroups.push(ribbonFileConfig);
designerConfig.ribbon.push(customerRibbon);

// 7. Initialize Designer
let designer = new GC.Spread.Sheets.Designer.Designer(
  "designer-container",
  designerConfig,
);
```

---

## Summary

This case study shows how to extend the SpreadJS Designer. Key takeaways:

1. Exploring and extending the `DesignerConfig` configuration structure.
2. Defining and mapping custom commands inside the `commandMap`.
3. Constructing Ribbon layouts using button groups.
4. Setting up custom button icons via CSS.

This scheme is highly useful for integrating document directories, backend template vaults, or file loaders into the spreadsheet editor.
