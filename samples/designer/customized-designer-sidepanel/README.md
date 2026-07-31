# Custom Sidebar Panels in SpreadJS Designer

This example demonstrates how to create custom sidebar panels in SpreadJS Designer, showcasing an Audit Trail implementation. By adding a custom button to the Ribbon toolbar, users can toggle the visibility of the audit panel on the right. The panel contents update dynamically based on the active cell coordinates, showing contextual information.

---

## Core Scenarios & Solutions

In enterprise applications, developers often need to integrate custom business panels within SpreadJS Designer, such as:

- **Audit Trail**: Tracking and displaying cell edit history.
- **Data Validation**: Displaying validation rules and error logs for the selected cell.
- **Contextual Metadata**: Presenting business records linked to the active selection.
- **Business Add-ons**: Providing specialized calculators or utilities for sheet editing.

This example provides a solution for expanding the Designer UI, registering custom sidebars, and communicating with the spreadsheet workbook.

---

## Implementation Details

### 1. Register a Custom Ribbon Button

Add a custom button to the default Ribbon toolbar configuration to control the panel's visibility:

```javascript
var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
  Welcome: {
    title: "Audit",
    text: "Audit Trail",
    iconClass: "ribbon-button-upload",
    bigButton: "false",
    commandName: "Audit",
    execute: async (context, propertyName) => {
      // Toggle the sidebar state variable
      if (context.getData("CData")) {
        context.setData("CData", false);
      } else {
        context.setData("CData", true);
      }
    },
  },
};

config.ribbon[0].buttonGroups.unshift({
  label: "Custom Features",
  thumbnailClass: "welcome",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["Welcome"],
      },
    ],
  },
});
```

This button toggles the `CData` state variable, which determines whether the sidebar panel is shown or hidden.

### 2. Define the Custom UI Template

Use the Designer's template system to declare the sidebar's layout structure:

```javascript
var auditTemplate = {
  templateName: "auditOptionTemplate",
  content: [
    {
      type: "TextBlock",
      style: "margin:10px;font-size: 20px;font-weight: lighter;color: #08892c",
      text: "Audit Trail",
    },
    {
      type: "Container",
      children: [
        {
          type: "ColumnSet",
          margin: "5px 0px",
          children: [
            {
              type: "Column",
              width: "100px",
              children: [
                {
                  type: "TextBlock",
                  style: "color: #08892c",
                  text: "1",
                },
              ],
            },
            {
              type: "Column",
              width: "110px",
              children: [
                {
                  type: "TextBlock",
                  bindingPath: "text1",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

GC.Spread.Sheets.Designer.registerTemplate(
  "auditOptionTemplate",
  auditTemplate,
);
```

Templates use declarative JSON structures and support dynamic data bindings via `bindingPath`.

### 3. Handle Sidebar Data Bindings

Define the sidebar's command object. Implement the `getState` method to return updated values when sheet states change:

```javascript
export var sidePanelsAuditCommands = {
  auditOptionPanel: {
    commandName: "auditOptionPanel",
    enableContext: "AllowEditObject",
    visibleContext: "CData ", // Shows panel when CData is true
    execute: function (context, propertyName) {
      var sheet = context.Spread.getActiveSheet();
    },
    getState: function (context) {
      let sheet = context.Spread.getActiveSheet();
      var column = sheet.getActiveColumnIndex();
      var row = sheet.getActiveRowIndex();

      // Determine what text to display based on selected coordinates
      var text1 = row === 0 && column === 0 ? "system1" : "";
      var text2 = row === 0 && column === 1 ? "system2" : "";

      const pictureStatus = {
        text1: text1,
        text2: text2,
      };
      return pictureStatus;
    },
  },
};
```

`getState` is automatically invoked when sheet selections change. The returned properties bind directly to the templates' `bindingPath` targets.

### 4. Configure the Sidebar Panel

Map the command to the UI template and configure the panel's layout dimensions:

```javascript
export var sidePanelsAuditConfig = {
  position: "right",
  width: "315px",
  command: "auditOptionPanel",
  uiTemplate: "auditOptionTemplate",
  showCloseButton: true,
};

// Register in the config object
Object.assign(config.commandMap, sidePanelsAuditCommands);
config.sidePanels.push(sidePanelsAuditConfig);
```

---

## Technology Stack

- **SpreadJS Designer 16.0.1**: Built-in designer elements.
- **SpreadJS 19.0.3**: Core spreadsheet components.
- **SystemJS**: JavaScript module loading.
- **TypeScript 4.1.2**: Script build compiler configurations.

---

## How to Run

### Installation & Execution

```bash
# Install dependencies
npm install
```

Open `index.html` directly in your browser.

### Steps to Test

1. Open `index.html` in your browser.
2. Wait for the Designer to finish loading.
3. Click the **Audit Trail** button in the top-left toolbar.
4. Verify that the audit panel opens on the right side of the screen.
5. Click cell `A1` (should display "system1" in the panel) and cell `B1` (should display "system2").
6. Click other cells to verify the panel updates dynamically.

---

## Features & Recommendations

### Pros

- **Deep Designer Integration**: The custom panel styled consistently with default UI components.
- **Reactive Data Binding**: `getState` manages state changes automatically without direct DOM manipulation.
- **Modular Architecture**: Keeps commands, UI templates, and configurations separated for better maintainability.

### Recommendations for Production

- **Connect APIs**: Update `getState` to fetch actual cell edit logs from database API endpoints.
- **Add Interactive Inputs**: Integrate interactive controls (like button inputs or action triggers) into templates to let users modify states.
- **Multiple Panels**: Register multiple sidebar panels and control their visibility using different state variables in `visibleContext`.

---

## Key Code Snippets

### Main Initialization Setup

Combine all custom rules and inject them during configuration:

```javascript
// 1. Register toolbar command mapping
config.commandMap = {
  Welcome: {
    /* ... */
  },
};

// 2. Add Ribbon button group
config.ribbon[0].buttonGroups.unshift({
  /* ... */
});

// 3. Register sidebar command mappings
Object.assign(config.commandMap, sidePanelsAuditCommands);

// 4. Register sidebar panel configurations
config.sidePanels.push(sidePanelsAuditConfig);

// 5. Instantiate the Designer
let designer = new GC.Spread.Sheets.Designer.Designer(
  "designer-container",
  config,
);
```

---

## Summary

This case study shows how to extend the SpreadJS Designer UI using declarative configurations. Key takeaways:

1. Modifying the `DesignerConfig` structure.
2. Registering toolbar actions in the `commandMap`.
3. Creating templates using declarative JSON schemas.
4. Binding dynamic data using `getState`.

This pattern is highly useful for integrating audit panels, helper tools, and business workflows directly inside the spreadsheet editor.
